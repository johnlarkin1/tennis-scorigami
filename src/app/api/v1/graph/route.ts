// src/app/api/v1/graph/route.ts
import { db } from "@/db";
import { bad } from "@/lib/errors";
import type { EdgeDTO, NodeDTO } from "@/lib/types/graph-types";
import { sql } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

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
  /* 1) parse + validate */
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

  /* 2) pick views */
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
    "5-all": "mv_graph_nodes_5_men_all",
  };
  const allEdges: Record<ViewKey, string> = {
    "3-men": "mv_graph_edges_3_men_all",
    "3-women": "mv_graph_edges_3_women_all",
    "3-all": "mv_graph_edges_3_all",
    "5-men": "mv_graph_edges_5_men_all",
    "5-women": "mv_graph_edges_5_women_all",
    "5-all": "mv_graph_edges_5_men_all",
  };

  const useRollup = year === null && tournament === null;
  const nodesView = useRollup ? allNodes[key] : detNodes[key];
  const edgesView = useRollup ? allEdges[key] : detEdges[key];

  /* 3) fetch nodes */
  let rawNodes;
  if (useRollup) {
    // View names come from hardcoded Record maps above, not user input — safe to use sql.raw()
    rawNodes = await db
      .select({
        id: sql<number>`id`,
        slug: sql<string>`slug`,
        depth: sql<number>`depth`,
        played: sql<boolean>`played`,
        occurrences: sql<number>`occurrences`,
      })
      .from(sql.raw(allNodes[key]))
      .orderBy(sql`depth`)
      .execute();
  } else {
    // View names are safe (hardcoded Record maps), but year/tournament are user
    // input — use Drizzle's sql tagged template for parameterized execution.
    const yearCondition =
      year !== null ? sql`e.event_year = ${year}::int` : sql`TRUE`;
    const tournCondition =
      tournament !== null
        ? sql`e.tournament_id = ${tournament}::int`
        : sql`TRUE`;

    rawNodes = await db
      .execute(
        sql`SELECT
              b.id,
              b.slug,
              b.depth,
              COALESCE(f.played, FALSE) AS played,
              COALESCE(f.occurrences, 0) AS occurrences
            FROM ${sql.raw(allNodes[key])} AS b
            LEFT JOIN (
              SELECT
                d.id,
                BOOL_OR(d.played)   AS played,
                SUM(d.occurrences)  AS occurrences
              FROM ${sql.raw(detNodes[key])} AS d
              INNER JOIN event AS e
                ON d.event_id = e.event_id
              WHERE ${yearCondition} AND ${tournCondition}
              GROUP BY d.id
            ) AS f ON f.id = b.id
            ORDER BY b.depth`
      )
      .then((r) =>
        r.rows.map((row) => ({
          id: row.id as number,
          slug: row.slug as string,
          depth: row.depth as number,
          played: row.played as boolean,
          occurrences: Number(row.occurrences),
        }))
      );
  }

  /* 4) normalize */
  const maxOcc = rawNodes.reduce((m, n) => Math.max(m, n.occurrences), 1);
  const nodes = rawNodes.map((n) => ({
    ...n,
    norm: n.occurrences / maxOcc,
  }));

  /* 5) root edges */
  const rootEdges = nodes
    .filter((n) => n.depth === 1)
    .map((n) => ({ frm: ROOT_ID, to: n.id }));

  /* 6) fetch + assemble edges */
  // View name comes from hardcoded Record map, not user input — safe to use sql.raw()
  const rawEdges = await db
    .selectDistinct({
      frm: sql<number>`frm`,
      to: sql<number>`"to"`,
    })
    .from(sql.raw(edgesView))
    .execute();

  const edges: EdgeDTO[] = [
    ...rootEdges,
    ...rawEdges.map((e) => ({ frm: e.frm, to: e.to })),
  ];

  /* 7) respond */
  nodes.unshift(rootNode);
  return NextResponse.json(
    { nodes, edges, progress: 1 },
    {
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "public, max-age=60, stale-while-revalidate=240",
      },
    }
  );
}
