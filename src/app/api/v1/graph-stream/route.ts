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
const BATCH_SIZE = 5000; // Send 5k items per batch

const rootNode: NodeDTO = {
  id: ROOT_ID,
  slug: ROOT_SLUG,
  played: false,
  depth: 0,
  occurrences: 0,
  norm: 0,
};

function assertNoCycles(nodes: NodeDTO[], edges: EdgeDTO[]) {
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
      if (visiting.has(v)) throw new Error(`Cycle detected: ${u} → ${v}`);
      if (!visited.has(v)) dfs(v);
    }
    visiting.delete(u);
    visited.add(u);
  }
  for (const { id } of nodes) if (!visited.has(id)) dfs(id);
}

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const sets = Number(url.searchParams.get("sets") ?? "5");
  const sex = (url.searchParams.get("sex") ?? "all").toLowerCase();
  const yearRaw = url.searchParams.get("year") ?? "all";
  const tournRaw = url.searchParams.get("tournament") ?? "all";

  let year: number | null = null;
  if (yearRaw !== "all") {
    const y = Number(yearRaw);
    if (isNaN(y)) return bad("year must be a number or 'all'");
    year = y;
  }

  let tournament: number | null = null;
  if (tournRaw !== "all") {
    const t = Number(tournRaw);
    if (isNaN(t)) return bad("tournament must be a number or 'all'");
    tournament = t;
  }

  if (![3, 5].includes(sets)) return bad("sets must be 3 or 5");
  if (!["men", "women", "all"].includes(sex))
    return bad("gender must be men|women|all");
  if (sets === 5 && sex === "women")
    return bad("women only play best of 3 sets");

  // Determine views (same logic as original)
  type ViewKey = "3-men" | "3-women" | "3-all" | "5-men" | "5-women" | "5-all";
  const key = `${sets}-${sex}` as ViewKey;

  const detNodes: Record<ViewKey, string> = {
    "3-men": "mv_graph_nodes_3_men",
    "3-women": "mv_graph_nodes_3_women",
    "3-all": "mv_graph_nodes_3",
    "5-men": "mv_graph_nodes_5_men",
    "5-women": "mv_graph_nodes_5_women",
    "5-all": "mv_graph_nodes_5_men",
  };

  const detEdges: Record<ViewKey, string> = {
    "3-men": "mv_graph_edges_3_men",
    "3-women": "mv_graph_edges_3_women",
    "3-all": "mv_graph_edges_3",
    "5-men": "mv_graph_edges_5_men",
    "5-women": "mv_graph_edges_5_women",
    "5-all": "mv_graph_edges_5_men",
  };

  const allNodes: Record<ViewKey, string> = {
    "3-men": "mv_graph_nodes_3_men_all",
    "3-women": "mv_graph_nodes_3_women_all",
    "3-all": "mv_graph_nodes_3_all",
    "5-men": "mv_graph_nodes_5_men_all",
    "5-women": "mv_graph_nodes_5_women_all",
    "5-all": "mv_graph_nodes_5_men",
  };

  const allEdges: Record<ViewKey, string> = {
    "3-men": "mv_graph_edges_3_men_all",
    "3-women": "mv_graph_edges_3_women_all",
    "3-all": "mv_graph_edges_3_all",
    "5-men": "mv_graph_edges_5_men_all",
    "5-women": "mv_graph_edges_5_women_all",
    "5-all": "mv_graph_edges_5_men",
  };

  const useRollup = year === null && tournament === null;
  const nodesView = useRollup ? allNodes[key] : detNodes[key];
  const edgesView = useRollup ? allEdges[key] : detEdges[key];

  try {
    // Fetch nodes
    let rawNodes;
    if (useRollup) {
      rawNodes = await db
        .select({
          id: sql<number>`id`,
          slug: sql<string>`slug`,
          depth: sql<number>`depth`,
          played: sql<boolean>`played`,
          occurrences: sql<number>`occurrences`,
        })
        .from(sql.raw(`${allNodes[key]}`))
        .orderBy(sql`depth`)
        .execute();
    } else {
      rawNodes = await db
        .select({
          id: sql<number>`b.id`,
          slug: sql<string>`b.slug`,
          depth: sql<number>`b.depth`,
          played: sql<boolean>`COALESCE(f.played, FALSE)`,
          occurrences: sql<number>`COALESCE(f.occurrences, 0)`,
        })
        .from(
          sql.raw(`
          ${allNodes[key]} AS b
          LEFT JOIN (
            SELECT
              d.id,
              BOOL_OR(d.played)   AS played,
              SUM(d.occurrences)  AS occurrences
            FROM ${detNodes[key]} AS d
            INNER JOIN event AS e
              ON d.event_id = e.event_id
            WHERE
              ${year !== null ? `e.event_year = ${year}::int` : `TRUE`}
              AND ${tournament !== null ? `e.tournament_id = ${tournament}::int` : `TRUE`}
            GROUP BY d.id
          ) AS f
            ON f.id = b.id
        `)
        )
        .orderBy(sql`b.depth`)
        .execute();
    }

    // Normalize nodes
    const maxOcc = rawNodes.reduce((m, n) => Math.max(m, n.occurrences), 1);
    const nodes: NodeDTO[] = rawNodes.map((n) => ({
      ...n,
      norm: n.occurrences / maxOcc,
    }));

    // Add root node
    nodes.unshift(rootNode);

    // Fetch edges
    const rawEdges = await db
      .select({
        frm: sql<number>`frm`,
        to: sql<number>`"to"`,
      })
      .from(sql.raw(edgesView))
      .execute();

    // Add root edges
    const rootEdges: EdgeDTO[] = nodes
      .filter((n) => n.depth === 1)
      .map((n) => ({ frm: ROOT_ID, to: n.id }));

    const edges: EdgeDTO[] = [
      ...rootEdges,
      ...rawEdges.map((e) => ({ frm: e.frm, to: e.to })),
    ];

    // Validate no cycles
    assertNoCycles(nodes, edges);

    console.log(
      `[Streaming API] Sending ${nodes.length} nodes, ${edges.length} edges`
    );

    // Create streaming response
    const encoder = new TextEncoder();
    let controllerClosed = false;
    
    const stream = new ReadableStream({
      async start(controller) {
        try {
          // Helper function to safely enqueue data
          const safeEnqueue = (data: string) => {
            if (!controllerClosed) {
              try {
                controller.enqueue(encoder.encode(data));
              } catch (err) {
                console.warn("Failed to enqueue data:", err);
                controllerClosed = true;
              }
            }
          };

          // Send metadata
          safeEnqueue(
            JSON.stringify({
              type: "meta",
              totalNodes: nodes.length,
              totalEdges: edges.length,
              batchSize: BATCH_SIZE,
            }) + "\n"
          );

          // Send nodes in batches
          for (let i = 0; i < nodes.length && !controllerClosed; i += BATCH_SIZE) {
            const batch = nodes.slice(i, i + BATCH_SIZE);
            safeEnqueue(
              JSON.stringify({
                type: "node-batch",
                nodes: batch,
                startIndex: i,
                endIndex: Math.min(i + BATCH_SIZE, nodes.length),
              }) + "\n"
            );

            // Small delay to avoid overwhelming the client
            await new Promise((resolve) => setTimeout(resolve, 10));
          }

          // Send edges in batches
          for (let i = 0; i < edges.length && !controllerClosed; i += BATCH_SIZE) {
            const batch = edges.slice(i, i + BATCH_SIZE);
            safeEnqueue(
              JSON.stringify({
                type: "edge-batch",
                edges: batch,
                startIndex: i,
                endIndex: Math.min(i + BATCH_SIZE, edges.length),
              }) + "\n"
            );

            // Small delay
            await new Promise((resolve) => setTimeout(resolve, 10));
          }

          // Send completion signal
          if (!controllerClosed) {
            safeEnqueue(JSON.stringify({ type: "complete" }) + "\n");
          }
        } catch (error) {
          console.error("Streaming error:", error);
          if (!controllerClosed) {
            try {
              controller.error(error);
            } catch (err) {
              console.warn("Failed to signal error:", err);
            }
          }
        } finally {
          if (!controllerClosed) {
            try {
              controller.close();
              controllerClosed = true;
            } catch (err) {
              console.warn("Failed to close controller:", err);
            }
          }
        }
      },
      cancel() {
        // Handle stream cancellation
        controllerClosed = true;
        console.log("Stream cancelled by client");
      },
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "application/x-ndjson",
        "Cache-Control": "public, max-age=300",
      },
    });
  } catch (error) {
    console.error("Graph stream error:", error);
    return bad("Failed to stream graph data");
  }
}
