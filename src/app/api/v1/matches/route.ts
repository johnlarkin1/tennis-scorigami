// src/app/api/v1/matches/route.ts
import { db } from "@/db";
import { event, match, player } from "@/db/schema";
import { bad } from "@/lib/errors";
import { aliasedTable, and, eq, lt, sql } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const scoreId = Number(url.searchParams.get("scoreId"));
  const limit = Math.min(Number(url.searchParams.get("limit") ?? 50), 100);
  const cursor = url.searchParams.get("cursor");

  if (!scoreId) return bad("scoreId is required");

  const playerB = aliasedTable(player, "pb");

  const rows = await db
    .select({
      match_id: match.match_id,
      event_name: event.name,
      player_a: player.full_name,
      player_b: sql<string>`pb.full_name`,
      year: match.year,
      start_time: match.match_start_time,
    })
    .from(match)
    .innerJoin(event, eq(event.event_id, match.event_id))
    .innerJoin(player, eq(player.player_id, match.player_a_id))
    .innerJoin(playerB, eq(playerB.player_id, match.player_b_id))
    .where(
      and(
        eq(match.score_id, scoreId),
        cursor ? lt(match.match_id, Number(cursor)) : sql`true`
      )
    )
    .orderBy(sql`match.match_id desc`)
    .limit(limit + 1)
    .execute();

  const hasNext = rows.length > limit;
  const data = rows.slice(0, limit);
  const headers = hasNext
    ? { "X-Next-Cursor": String(data[data.length - 1].match_id) }
    : undefined;

  return NextResponse.json(data, { headers });
}
