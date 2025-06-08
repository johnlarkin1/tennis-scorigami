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
  // const year = url.searchParams.get("year") ?? "";
  // const tournament = url.searchParams.get("tournament") ?? "all";

  // No edge filtering - render complete graph for maximum detail
  console.log(
    `[Graph Stream] Edge filtering disabled - rendering complete graph`
  );

  if (![3, 5].includes(sets)) return bad("sets must be 3 or 5");
  if (!["men", "women", "all"].includes(sex))
    return bad("gender must be men|women|all");
  if (sets === 5 && sex === "women")
    return bad("women only play best of 3 sets");

  // Select appropriate view based on parameters
  // For now, use the hardcoded views as in the original
  // TODO: Update this when you have views for other parameter combinations
  const nodesView = "mv_graph_nodes_5_men_all";
  const edgesView = "mv_graph_edges_5_men_all";

  // Log which views we're using
  console.log(`[Graph Stream] Using views: ${nodesView}, ${edgesView}`);
  console.log(
    `[Graph Stream] Parameters: sets=${sets}, sex=${sex}, edge filtering=DISABLED`
  );

  try {
    console.log(`[Graph Stream] Starting query for ${sets}-set ${sex} matches`);
    const startTime = Date.now();

    // Fetch nodes
    console.log(`[Graph Stream] Fetching nodes from ${nodesView}`);
    const nodeStartTime = Date.now();

    const rawNodes = await db
      .select({
        id: sql<number>`id`,
        slug: sql<string>`slug`,
        depth: sql<number>`depth`,
        played: sql<boolean>`played`,
        occurrences: sql<number>`occurrences`,
      })
      .from(sql.raw(`${nodesView}`))
      .orderBy(sql`depth`, sql`occurrences DESC`)
      .execute();

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

    // Fetch all edges initially
    const rawEdges = await db
      .select({
        frm: sql<number>`frm`,
        to: sql<number>`"to"`,
      })
      .from(sql.raw(edgesView))
      .execute();

    console.log(
      `[Graph Stream] Raw edges fetched in ${Date.now() - edgeStartTime}ms, count: ${rawEdges.length}`
    );

    // Debug: Show some edge samples
    if (rawEdges.length > 0) {
      console.log(`[Graph Stream] Sample edges:`, rawEdges.slice(0, 5));
    }
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
    console.log(`[Graph Stream] Skipping backend positioning - using frontend layout`);
    
    // Just pass through nodes without positions
    const nodesWithPositions = nodes;

    // Create node map for quick lookup
    const nodeMap = new Map(nodesWithPositions.map((n) => [n.id, n]));
    
    console.log(
      `[Graph Stream] Using all ${allEdges.length} edges without filtering (${rawEdges.length} from DB + ${rootEdges.length} root edges)`
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
