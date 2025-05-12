// src/app/api/v1/node/[id]/route.ts
import { db } from "@/db";
import { scoreLine, scoreSequence, scoreStat, sequenceEdge } from "@/db/schema";
import { bad } from "@/lib/errors";
import { and, eq, sql } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

const GENDER = { men: "M", women: "F" } as const;

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const id = Number(params.id);
  if (!id) return bad("id must be numeric");
  const gRaw = new URL(req.url).searchParams.get("gender");
  const g = gRaw ? GENDER[gRaw as keyof typeof GENDER] : null;
  if (gRaw && !g) return bad("gender must be men|women");

  const [row] = await db
    .select({
      seq: scoreSequence,
      played: scoreStat.played,
      occ: scoreStat.occurrences,
      neigh: sql<number[]>`array_agg(${sequenceEdge.child_id})`,
    })
    .from(scoreSequence)
    .leftJoin(
      sequenceEdge,
      eq(sequenceEdge.parent_id, scoreSequence.sequence_id)
    )
    .leftJoin(scoreLine, eq(scoreLine.sequence_id, scoreSequence.sequence_id))
    .leftJoin(
      scoreStat,
      and(
        eq(scoreStat.score_id, scoreLine.score_id),
        g ? eq(sql`event.sex`, g) : sql`true`
      )
    )
    .where(eq(scoreSequence.sequence_id, id))
    .groupBy(scoreSequence.sequence_id, scoreStat.played, scoreStat.occurrences)
    .execute();

  if (!row) return bad("node not found", 404);

  return NextResponse.json({
    id: row.seq.sequence_id,
    slug: row.seq.slug,
    depth: row.seq.depth,
    winner_sets: row.seq.winner_sets,
    loser_sets: row.seq.loser_sets,
    played: row.played ?? false,
    occurrences: row.occ ?? 0,
    neighbours: row.neigh?.filter(Boolean) ?? [],
  });
}
