// src/app/api/v1/matches/by-sequence/[id]/route.ts
import { db } from "@/db";
import {
  event,
  match,
  matchSequenceStat,
  player,
  scoreSequence,
} from "@/db/schema";
import { bad } from "@/lib/errors";
import { aliasedTable, and, count, desc, eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

export const revalidate = 300; // cache for 5m

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id: untypedId } = await context.params;
  const id = Number(untypedId);
  if (!id) return bad("Sequence ID is required");

  const url = new URL(req.url);
  const year = url.searchParams.get("year");
  const sex = url.searchParams.get("sex")?.toLowerCase();
  const tournament = url.searchParams.get("tournament");
  const limit = Math.min(Number(url.searchParams.get("limit") ?? 50), 50);
  const page = Math.max(1, Number(url.searchParams.get("page") ?? 1));
  const offset = (page - 1) * limit;

  const playerB = aliasedTable(player, "pb");

  try {
    // 1) verify the sequence exists
    const sequence = await db.query.scoreSequence.findFirst({
      where: eq(scoreSequence.sequence_id, id),
    });
    if (!sequence) return bad("Score sequence not found", 404);

    // 2) build dynamic filters
    const filters = [eq(matchSequenceStat.sequence_id, id)];
    if (year && year !== "all") {
      filters.push(eq(event.event_year, Number(year)));
    }
    if (sex && sex !== "all") {
      filters.push(eq(event.sex, sex === "men" ? "M" : "F"));
    }
    if (tournament && tournament !== "all") {
      filters.push(eq(event.tournament_id, Number(tournament)));
    }

    // 3) get TOTAL count before pagination
    const [{ total }] = await db
      .select({ total: count() })
      .from(matchSequenceStat)
      .innerJoin(match, eq(matchSequenceStat.match_id, match.match_id))
      .innerJoin(event, eq(event.event_id, match.event_id))
      .where(and(...filters))
      .execute();

    // 4) fetch just this page
    const matches = await db
      .select({
        match_id: match.match_id,
        event_name: event.name,
        event_year: event.event_year,
        player_a: player.full_name,
        player_b: playerB.full_name,
        player_a_id: match.player_a_id,
        player_b_id: match.player_b_id,
        winner_id: match.winner_id,
        sex: event.sex,
        match_start_time: match.match_start_time,
        score: match.score,
        position: matchSequenceStat.depth,
        best_of: matchSequenceStat.best_of,
      })
      .from(match)
      .innerJoin(
        matchSequenceStat,
        eq(matchSequenceStat.match_id, match.match_id)
      )
      .innerJoin(event, eq(event.event_id, match.event_id))
      .innerJoin(player, eq(player.player_id, match.player_a_id))
      .innerJoin(playerB, eq(playerB.player_id, match.player_b_id))
      .where(and(...filters))
      .orderBy(desc(event.event_year), desc(match.year))
      .limit(limit)
      .offset(offset)
      .execute();

    return NextResponse.json({
      sequence: {
        id: sequence.sequence_id,
        slug: sequence.slug,
        depth: sequence.depth,
        best_of: sequence.best_of,
      },
      matches,
      total,
    });
  } catch (error: any) {
    console.error("Error fetching matches by sequence:", error);
    return bad(`Failed to retrieve matches: ${error.message}`);
  }
}
