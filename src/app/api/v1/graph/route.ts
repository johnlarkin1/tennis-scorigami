// src/app/api/v1/graph/route.ts
import { db } from "@/db";
import { bad } from "@/lib/errors";
import type { EdgeDTO, NodeDTO } from "@/lib/types";
import { sql } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";
export const revalidate = 300; // Cache for 5 minutes

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const sets = Number(url.searchParams.get("sets") ?? 5);
  const gender = url.searchParams.get("gender");

  if (![3, 5].includes(sets)) return bad("sets must be 3 or 5");
  if (gender && !["men", "women"].includes(gender)) {
    return bad("gender must be men|women");
  }

  // Select the appropriate materialized view based on parameters
  let viewName: string;

  if (sets === 3) {
    if (gender === "men") {
      viewName = "mv_graph_sets_3_men";
    } else if (gender === "women") {
      viewName = "mv_graph_sets_3_women";
    } else {
      viewName = "mv_graph_sets_3";
    }
  } else {
    // sets === 5
    if (gender === "men") {
      viewName = "mv_graph_sets_5_men";
    } else if (gender === "women") {
      viewName = "mv_graph_sets_5_women";
    } else {
      viewName = "mv_graph_sets_5";
    }
  }

  // Log which view we're using for debugging
  console.log(`Using materialized view: ${viewName}`);

  // Query the materialized view - simplified query
  const rows = await db
    .select({
      id: sql<number>`id`,
      slug: sql<string>`slug`,
      played: sql<boolean>`played`,
      occurrences: sql<number>`occurrences`,
      child_id: sql<number | null>`child_id`,
    })
    .from(sql.raw(viewName))
    .execute();
  // Process the results
  let max = 1;
  const nodesMap = new Map<number, NodeDTO>();
  const edges: EdgeDTO[] = [];

  for (const row of rows) {
    if (!nodesMap.has(row.id)) {
      nodesMap.set(row.id, {
        id: row.id,
        slug: row.slug,
        played: row.played,
        norm: 0,
      });
    }

    const node = nodesMap.get(row.id)!;
    if (row.occurrences > max) max = row.occurrences;
    (node as any).occ = row.occurrences;

    if (row.child_id) {
      edges.push({ frm: row.id, to: row.child_id });
    }
  }

  // Calculate normalized values
  nodesMap.forEach((n) => {
    n.norm = ((n as any).occ || 0) / max;
    delete (n as any).occ;
  });

  // Return the response
  return NextResponse.json(
    {
      nodes: Array.from(nodesMap.values()),
      edges,
    },
    {
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "public, max-age=60, stale-while-revalidate=240",
      },
    }
  );
}

// src/app/api/v1/graph/route.ts
// import { db } from "@/db";
// import { bad } from "@/lib/errors";
// import type { EdgeDTO, NodeDTO } from "@/lib/types";
// import { sql } from "drizzle-orm";
// import { NextRequest, NextResponse } from "next/server";

// export const runtime = "nodejs";
// export const revalidate = 300;

// type Graph = { nodes: NodeDTO[]; edges: EdgeDTO[] };

// export async function GET(req: NextRequest) {
//   const url = new URL(req.url);
//   const sets = Number(url.searchParams.get("sets") ?? 5);
//   const gender = url.searchParams.get("gender");
//   if (![3, 5].includes(sets)) return bad("sets must be 3 or 5");
//   if (gender && !["men", "women"].includes(gender)) {
//     return bad("gender must be men|women");
//   }

//   const viewName =
//     `mv_graph_sets_${sets}` + (gender ? `_${gender}` : "") as
//       | "mv_graph_sets_3"
//       | "mv_graph_sets_3_men"
//       | "mv_graph_sets_3_women"
//       | "mv_graph_sets_5"
//       | "mv_graph_sets_5_men"
//       | "mv_graph_sets_5_women";

//   // 1) Tell TS what the row looks like via a generic
//   // 2) Use optional chaining + nullish-coalescing to default on empty
//   const result = await db.execute<{ graph: Graph }>(sql`
//     WITH data AS (
//       SELECT
//         id,
//         slug,
//         played,
//         child_id,
//         occurrences,
//         occurrences::float / MAX(occurrences) OVER () AS norm
//       FROM ${sql.raw(viewName)}
//     )
//     SELECT json_build_object(
//       'nodes', (
//         SELECT jsonb_agg(DISTINCT jsonb_build_object(
//           'id', id,
//           'slug', slug,
//           'played', played,
//           'norm', norm
//         )) FROM data
//       ),
//       'edges', (
//         SELECT jsonb_agg(
//           jsonb_build_object('frm', id, 'to', child_id)
//         ) FROM data WHERE child_id IS NOT NULL
//       )
//     ) AS graph;
//   `);

//   // extract the single row, fall back to empty graph if nothing returned
//   const graph = result.rows[0]?.graph ?? { nodes: [], edges: [] };

//   return NextResponse.json(graph, {
//     headers: {
//       "Content-Type": "application/json",
//       "Cache-Control": "public, max-age=60, stale-while-revalidate=240",
//     },
//   });
// }
