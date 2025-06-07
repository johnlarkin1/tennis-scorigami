// src/app/api/v1/graph-stream/route.ts
import { db } from "@/db";
import { bad } from "@/lib/errors";
import type { EdgeDTO, NodeDTO } from "@/lib/types";
import { sql } from "drizzle-orm";
import { NextRequest } from "next/server";

export const runtime = "nodejs";
export const revalidate = 300;

const ROOT_ID = 0;
const ROOT_SLUG = "love-all";
const rootNode: NodeDTO = {
  id: ROOT_ID,
  slug: ROOT_SLUG,
  played: false,
  depth: 0,
  occurrences: 0,
  norm: 0,
};

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const sets = Number(url.searchParams.get("sets") ?? "5");
  const sex = (url.searchParams.get("gender") ?? "all").toLowerCase();
  if (![3, 5].includes(sets)) return bad("sets must be 3 or 5");
  if (!["men", "women", "all"].includes(sex))
    return bad("gender must be men|women|all");
  if (sets === 5 && sex === "women")
    return bad("women only play best of 3 sets");

  // determine views
  type ViewKey = "3-men" | "3-women" | "3-all" | "5-men" | "5-women" | "5-all";
  // const key = `${sets}-${sex}` as ViewKey;
  const key = "5-men";
  const nodesViewMap: Record<ViewKey, string> = {
    "3-men": "mv_graph_nodes_3_men",
    "3-women": "mv_graph_nodes_3_women",
    "3-all": "mv_graph_nodes_3",
    "5-men": "mv_graph_nodes_5_men",
    "5-women": "mv_graph_nodes_5_women",
    "5-all": "mv_graph_nodes_5_men",
  };
  const edgesViewMap: Record<ViewKey, string> = {
    "3-men": "mv_graph_edges_3_men",
    "3-women": "mv_graph_edges_3_women",
    "3-all": "mv_graph_edges_3",
    "5-men": "mv_graph_edges_5_men",
    "5-women": "mv_graph_edges_5_women",
    "5-all": "mv_graph_edges_5_men",
  };
  const nodesView = nodesViewMap[key];
  const edgesView = edgesViewMap[key];

  // 1) load & normalize nodes
  const rawNodes = await db
    .select({
      id: sql<number>`id`,
      slug: sql<string>`slug`,
      depth: sql<number>`depth`,
      played: sql<boolean>`played`,
      occurrences: sql<number>`occurrences`,
    })
    .from(sql.raw(nodesView))
    .orderBy(sql`depth`)
    .execute();

  const maxOcc = rawNodes.reduce((m, n) => Math.max(m, n.occurrences), 1);
  const nodes: NodeDTO[] = rawNodes.map((n) => ({
    ...n,
    norm: n.occurrences / maxOcc,
  }));

  // 2) root‐to‐depth1 edges
  const rootEdges: EdgeDTO[] = nodes
    .filter((n) => n.depth === 1)
    .map((n) => ({ frm: ROOT_ID, to: n.id }));

  // 3) load edges
  const rawEdges = await db
    .select({ frm: sql<number>`frm`, to: sql<number>`"to"` })
    .from(sql.raw(edgesView))
    .execute();
  const edges: EdgeDTO[] = rawEdges.map((e) => ({ frm: e.frm, to: e.to }));

  // 4) inject root node & edges
  nodes.unshift(rootNode);
  edges.unshift(...rootEdges);

  // 5) cycle‐detect
  try {
    assertNoCycles(nodes, edges);
  } catch (err: any) {
    console.error(err.message);
    return bad(err.message);
  }

  // Log node and edge counts
  console.log(`[API] Graph data: ${nodes.length} nodes, ${edges.length} edges`);

  // 6) stream NDJSON
  const encoder = new TextEncoder();
  const totalNodes = nodes.length;
  const totalEdges = edges.length;
  const stream = new ReadableStream({
    start(ctrl) {
      // meta
      ctrl.enqueue(
        encoder.encode(
          JSON.stringify({ type: "meta", totalNodes, totalEdges }) + "\n"
        )
      );
      // nodes
      for (const n of nodes) {
        ctrl.enqueue(
          encoder.encode(JSON.stringify({ type: "node", ...n }) + "\n")
        );
      }
      // edges
      for (const e of edges) {
        ctrl.enqueue(
          encoder.encode(JSON.stringify({ type: "edge", ...e }) + "\n")
        );
      }
      // end marker
      ctrl.enqueue(encoder.encode(JSON.stringify({ type: "end" }) + "\n"));
      ctrl.close();
    },
  });

  return new Response(stream, {
    headers: { "Content-Type": "application/x-ndjson" },
  });
}

function assertNoCycles(nodes: NodeDTO[], edges: EdgeDTO[]) {
  const adj = new Map<number, number[]>();
  for (const { frm, to } of edges) {
    if (frm === to) throw new Error(`Self-loop at ${frm}`);
    adj.set(frm, (adj.get(frm) || []).concat(to));
  }
  const visiting = new Set<number>();
  const visited = new Set<number>();
  function dfs(u: number) {
    visiting.add(u);
    for (const v of adj.get(u) || []) {
      if (visiting.has(v)) throw new Error(`Cycle: ${u}→${v}`);
      if (!visited.has(v)) dfs(v);
    }
    visiting.delete(u);
    visited.add(u);
  }
  for (const { id } of nodes) if (!visited.has(id)) dfs(id);
}
