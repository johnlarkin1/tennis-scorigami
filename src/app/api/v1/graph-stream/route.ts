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

interface EdgeCluster {
  representative: EdgeDTO;
  count: number;
  importance: number;
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

  console.log(`[Graph Stream] Processing graph data with potential filtering`);

  if (![3, 5].includes(sets)) return bad("sets must be 3 or 5");
  if (!["men", "women", "all"].includes(sex))
    return bad("gender must be men|women|all");
  if (sets === 5 && sex === "women")
    return bad("women only play best of 3 sets");

  // Select appropriate views based on parameters
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
  const allNodesViews: Record<ViewKey, string> = {
    "3-men": "mv_graph_nodes_3_men_all",
    "3-women": "mv_graph_nodes_3_women_all",
    "3-all": "mv_graph_nodes_3_all",
    "5-men": "mv_graph_nodes_5_men_all",
    "5-women": "mv_graph_nodes_5_women_all",
    "5-all": "mv_graph_nodes_5_men_all",
  };
  const allEdgesViews: Record<ViewKey, string> = {
    "3-men": "mv_graph_edges_3_men_all",
    "3-women": "mv_graph_edges_3_women_all",
    "3-all": "mv_graph_edges_3_all",
    "5-men": "mv_graph_edges_5_men_all",
    "5-women": "mv_graph_edges_5_women_all",
    "5-all": "mv_graph_edges_5_men_all",
  };

  const useRollup = year === null && tournament === null;
  const nodesView = useRollup ? allNodesViews[key] : detNodes[key];
  const edgesView = useRollup ? allEdgesViews[key] : detEdges[key];

  // Log which views we're using
  console.log(`[Graph Stream] Using views: ${nodesView}, ${edgesView}`);
  console.log(
    `[Graph Stream] Parameters: sets=${sets}, sex=${sex}, year=${yearRaw}, tournament=${tournRaw}, useRollup=${useRollup}`
  );

  try {
    console.log(`[Graph Stream] Starting query for ${sets}-set ${sex} matches`);
    const startTime = Date.now();

    // Fetch nodes
    console.log(`[Graph Stream] Fetching nodes from ${nodesView}`);
    const nodeStartTime = Date.now();

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
        .from(sql.raw(`${allNodesViews[key]}`))
        .orderBy(sql`depth`, sql`occurrences DESC`)
        .execute();
    } else {
      // detailed: inline the LEFT JOIN of aggregated stats
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
          ${allNodesViews[key]} AS b
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
        .orderBy(sql`b.depth`, sql`COALESCE(f.occurrences, 0) DESC`)
        .execute();
    }

    console.log(
      `[Graph Stream] Nodes fetched in ${Date.now() - nodeStartTime}ms, count: ${rawNodes.length}`
    );

    // Normalize nodes
    const maxOcc = rawNodes.reduce((m, n) => Math.max(m, n.occurrences), 1);
    const nodes: NodeDTO[] = rawNodes.map((n) => ({
      ...n,
      norm: n.occurrences / maxOcc,
    }));

    // Add root node
    nodes.unshift(rootNode);

    // Fetch edges with filtering
    console.log(`[Graph Stream] Fetching edges from ${edgesView}`);
    const edgeStartTime = Date.now();

    let rawEdges;
    if (useRollup) {
      // Use pre-aggregated materialized view (no duplicates)
      rawEdges = await db
        .select({
          frm: sql<number>`frm`,
          to: sql<number>`"to"`,
        })
        .from(sql.raw(`${allEdgesViews[key]}`))
        .execute();
    } else {
      // Filter and aggregate edges to prevent duplicates
      rawEdges = await db
        .select({
          frm: sql<number>`d.frm`,
          to: sql<number>`d."to"`,
        })
        .from(
          sql.raw(`
          ${detEdges[key]} AS d
          INNER JOIN event AS e
            ON d.event_id = e.event_id
          WHERE
            ${year !== null ? `e.event_year = ${year}::int` : `TRUE`}
            AND ${tournament !== null ? `e.tournament_id = ${tournament}::int` : `TRUE`}
          GROUP BY d.frm, d."to"
        `)
        )
        .execute();
    }

    console.log(
      `[Graph Stream] Raw edges fetched in ${Date.now() - edgeStartTime}ms, count: ${rawEdges.length}`
    );

    if (rawEdges.length < 1000) {
      console.log(
        `[Graph Stream] WARNING: Very few edges found (${rawEdges.length}), this seems wrong for 125k nodes`
      );
    }

    // Add root edges
    const rootEdges: EdgeDTO[] = nodes
      .filter((n) => n.depth === 1)
      .map((n) => ({ frm: ROOT_ID, to: n.id }));

    const allEdges: EdgeDTO[] = [...rootEdges, ...rawEdges];

    // Skip positioning computation - let frontend handle it for now
    console.log(
      `[Graph Stream] Skipping backend positioning - using frontend layout`
    );

    // Just pass through nodes without positions
    const nodesWithPositions = nodes;

    console.log(
      `[Graph Stream] Using ${allEdges.length} edges (${rawEdges.length} from DB + ${rootEdges.length} root edges) ${useRollup ? "from materialized view" : "with filtering and deduplication"}`
    );

    console.log(
      `[Graph Stream] Total processing time: ${Date.now() - startTime}ms`
    );

    // Stream the data
    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        try {
          // Send metadata
          controller.enqueue(
            encoder.encode(
              JSON.stringify({
                type: "meta",
                totalItems: nodesWithPositions.length + allEdges.length,
                totalNodes: nodesWithPositions.length,
                totalEdges: allEdges.length,
              }) + "\n"
            )
          );

          // Send nodes with positions in larger batches for better performance
          const nodeBatchSize = 500; // Increased from 100 to 500
          for (let i = 0; i < nodesWithPositions.length; i += nodeBatchSize) {
            const batch = nodesWithPositions.slice(i, i + nodeBatchSize);
            controller.enqueue(
              encoder.encode(
                JSON.stringify({
                  type: "nodes",
                  data: batch,
                }) + "\n"
              )
            );
          }

          // Send edges in larger batches for better performance
          const edgeBatchSize = 2000; // Increased from 200 to 2000
          for (let i = 0; i < allEdges.length; i += edgeBatchSize) {
            const batch = allEdges.slice(i, i + edgeBatchSize);
            controller.enqueue(
              encoder.encode(
                JSON.stringify({
                  type: "edges",
                  data: batch,
                }) + "\n"
              )
            );
          }

          // Send completion marker
          controller.enqueue(
            encoder.encode(JSON.stringify({ type: "complete" }) + "\n")
          );

          controller.close();
        } catch (error) {
          console.error("[Graph Stream] Streaming error:", error);
          controller.error(error);
        }
      },
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "application/x-ndjson",
        "Cache-Control": "public, max-age=300",
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch (error) {
    console.error("Graph stream error:", error);
    return bad("Failed to stream graph data");
  }
}

// Edge filtering function removed - now rendering complete graph
