// src/app/api/v1/graph/route.ts
import { db } from "@/db";
import { bad } from "@/lib/errors";
import type { EdgeDTO, NodeDTO } from "@/lib/types";
import { sql } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";
export const revalidate = 300; // 5-minute ISR / CDN cache

/**
 * We manually add a "root" node to the graph, which is a dummy node that
 * represents all the nodes in the graph. This is because the graph is
 * directed and we need to ensure that there are no cycles.
 */
const ROOT_ID = 0; // pick an ID that never collides
const ROOT_SLUG = "love-all";

const rootNode: NodeDTO = {
  id: ROOT_ID,
  slug: ROOT_SLUG,
  played: false,
  depth: 0,
  occurrences: 0, // or you could sum all depth=1 occurrences
  norm: 0,
};

/**
 * Throws if it finds any directed cycle in edges.
 */
function assertNoCycles(nodes: NodeDTO[], edges: EdgeDTO[]) {
  // build adjacency list
  const adj = new Map<number, number[]>();
  for (const { frm, to } of edges) {
    if (frm === to) throw new Error(`Self-loop at node ${frm}`);
    adj.set(frm, (adj.get(frm) || []).concat(to));
  }

  const visiting = new Set<number>();
  const visited = new Set<number>();

  function dfs(u: number) {
    visiting.add(u);
    for (const v of adj.get(u) || []) {
      if (visiting.has(v)) {
        throw new Error(`Cycle detected: ${u} → ${v}`);
      }
      if (!visited.has(v)) dfs(v);
    }
    visiting.delete(u);
    visited.add(u);
  }

  for (const { id } of nodes) {
    if (!visited.has(id)) dfs(id);
  }
}

export async function GET(req: NextRequest) {
  /* 1) parse & validate */
  const url = new URL(req.url);
  const sets = Number(url.searchParams.get("sets") ?? "5");
  const sex = (url.searchParams.get("gender") ?? "all").toLowerCase();
  if (![3, 5].includes(sets)) return bad("sets must be 3 or 5");
  if (!["men", "women", "all"].includes(sex))
    return bad("gender must be men|women|all");
  if (sets === 5 && sex === "women")
    return bad("women only play best of 3 sets");

  /* 2) select your materialized views */
  type ViewKey = "3-men" | "3-women" | "3-all" | "5-men" | "5-women" | "5-all";
  const key = `${sets}-${sex}` as ViewKey;
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

  /* 3) fetch nodes */
  const rawNodes = (await db
    .select({
      id: sql<number>`id`,
      slug: sql<string>`slug`,
      depth: sql<number>`depth`,
      played: sql<boolean>`played`,
      occurrences: sql<number>`occurrences`,
    })
    .from(sql.raw(nodesView))
    .orderBy(sql`depth`)
    .execute()) as Array<{
    id: number;
    slug: string;
    depth: number;
    played: boolean;
    occurrences: number;
  }>;

  /* 4) compute norm */
  const maxOcc = rawNodes.reduce((m, n) => Math.max(m, n.occurrences), 1);
  const nodes: NodeDTO[] = rawNodes.map((n) => ({
    ...n,
    norm: n.occurrences / maxOcc,
  }));

  const rootEdges: EdgeDTO[] = nodes
    .filter((n) => n.depth === 1)
    .map((n) => ({ frm: ROOT_ID, to: n.id }));

  /* 5) fetch edges */
  const rawEdges = (await db
    .select({
      frm: sql<number>`frm`,
      to: sql<number>`"to"`, // quoted reserved word
    })
    .from(sql.raw(edgesView))
    .execute()) as Array<{ frm: number; to: number }>;
  const edges: EdgeDTO[] = rawEdges.map((e) => ({ frm: e.frm, to: e.to }));

  nodes.unshift(rootNode);
  edges.unshift(...rootEdges);

  /* 6) cycle-detect only */
  try {
    assertNoCycles(nodes, edges);
  } catch (err: any) {
    console.error(err.message);
    return bad(err.message);
  }
  /* 6.5) log node and edge counts */
  console.log(`[API] Graph data: ${nodes.length} nodes, ${edges.length} edges`);

  /* 7) return clean data */
  return NextResponse.json(
    { nodes, edges },
    {
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "public, max-age=60, stale-while-revalidate=240",
      },
    }
  );
}
