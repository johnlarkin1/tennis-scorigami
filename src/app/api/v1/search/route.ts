// src/app/api/v1/search/route.ts
import { db } from "@/db";
import { player, scoreLine, scoreSequence } from "@/db/schema";
import { bad } from "@/lib/errors";
import { eq, ilike } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const q = new URL(req.url).searchParams.get("q")?.trim();
  if (!q) return bad("q is required");

  // Looks like a score pattern?
  if (/[\d]-[\d]/.test(q)) {
    const rows = await db
      .select({
        id: scoreLine.score_id,
        slug: scoreSequence.slug,
      })
      .from(scoreLine)
      .innerJoin(
        scoreSequence,
        eq(scoreSequence.sequence_id, scoreLine.sequence_id)
      )
      .where(ilike(scoreSequence.slug, q.replace("*", "%") + "%"))
      .limit(20)
      .execute();

    return NextResponse.json({ type: "score", items: rows });
  }

  // Else search player names
  const rows = await db
    .select({ id: player.player_id, name: player.full_name })
    .from(player)
    .where(ilike(player.full_name, `%${q}%`))
    .orderBy(player.full_name)
    .limit(20)
    .execute();

  return NextResponse.json({ type: "player", items: rows });
}
