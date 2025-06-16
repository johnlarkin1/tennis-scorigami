// src/app/api/v1/search/route.ts
import { db } from "@/db";
import {
  event,
  mvMatchesByScore,
  player,
  scoreLine,
  scoreSequence,
  tournament,
} from "@/db/schema";
import { bad } from "@/lib/errors";
import { SearchMapper } from "@/lib/search/search-mapper";
import { parseSearchQuery } from "@/lib/search/search-parser";
import { and, between, eq, ilike, or, sql } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const searchParams = new URL(req.url).searchParams;
  const q = searchParams.get("q")?.trim();
  const mode = searchParams.get("mode") || "unified"; // unified, matches, suggestions

  if (!q) return bad("q is required");

  try {
    // Parse the search query for keywords
    const parsedQuery = parseSearchQuery(q);

    // Always use keyword search - treat plain text as implicit search
    return await handleKeywordSearch(parsedQuery, mode);
  } catch (error) {
    console.error("Search error:", error);
    return bad("Search failed");
  }
}

async function handleKeywordSearch(parsedQuery: any, mode: string) {
  try {
    // Map keywords to database filters
    const mappedFilters = await SearchMapper.mapKeywordFilters(
      parsedQuery.keywords
    );

    if (mode === "matches") {
      return await searchMatches(mappedFilters, parsedQuery.plainText);
    }

    // For unified search with keywords, return structured results
    if (parsedQuery.keywords.length > 0) {
      const suggestions = await getKeywordSuggestions(
        mappedFilters,
        parsedQuery.plainText
      );
      return NextResponse.json({
        type: "keyword_search",
        keywords: parsedQuery.keywords,
        plainText: parsedQuery.plainText,
        suggestions,
      });
    }

    // For plain text search, return suggestions from different categories
    return await handlePlainTextSearch(parsedQuery.plainText);
  } catch (error) {
    console.error("Keyword search error:", error);
    return bad("Keyword search failed");
  }
}

async function searchMatches(mappedFilters: any[], plainText: string) {
  try {
    // Build WHERE conditions from mapped filters
    const conditions = [];

    for (const filter of mappedFilters) {
      switch (filter.operator) {
        case "equals":
          conditions.push(eq(getFieldReference(filter.field), filter.value));
          break;

        case "ilike":
          conditions.push(ilike(getFieldReference(filter.field), filter.value));
          break;

        case "between":
          conditions.push(
            between(
              getFieldReference(filter.field),
              filter.value[0],
              filter.value[1]
            )
          );
          break;

        case "in":
          conditions.push(
            sql`${getFieldReference(filter.field)} IN ${filter.value}`
          );
          break;

        case "regex":
          conditions.push(
            sql`${getFieldReference(filter.field)} ~ ${filter.value}`
          );
          break;
      }
    }

    // Add plain text search if provided
    if (plainText) {
      conditions.push(
        or(
          ilike(mvMatchesByScore.playerAName, `%${plainText}%`),
          ilike(mvMatchesByScore.playerBName, `%${plainText}%`),
          ilike(mvMatchesByScore.eventName, `%${plainText}%`)
        )
      );
    }

    // Build the query with conditions
    const query = db
      .select({
        match_id: mvMatchesByScore.matchId,
        score_id: mvMatchesByScore.scoreId,
        event_name: mvMatchesByScore.eventName,
        year: mvMatchesByScore.year,
        gender: mvMatchesByScore.gender,
        player_a_name: mvMatchesByScore.playerAName,
        player_b_name: mvMatchesByScore.playerBName,
        match_start_time: mvMatchesByScore.matchStartTime,
      })
      .from(mvMatchesByScore)
      .where(conditions.length > 0 ? and(...conditions) : sql`1=1`)
      .limit(50);

    // Execute query
    const matches = await query.execute();

    return NextResponse.json({
      type: "matches",
      count: matches.length,
      items: matches,
    });
  } catch (error) {
    console.error("Match search error:", error);
    return bad("Match search failed");
  }
}

async function getKeywordSuggestions(mappedFilters: any[], plainText: string) {
  // For now, return empty array - this could be enhanced to provide
  // intelligent suggestions based on the current filters
  return [];
}

function getFieldReference(fieldPath: string) {
  // Map field paths to actual database column references
  const fieldMap: Record<string, any> = {
    playerAId: mvMatchesByScore.playerAId,
    playerBId: mvMatchesByScore.playerBId,
    playerAName: mvMatchesByScore.playerAName,
    playerBName: mvMatchesByScore.playerBName,
    eventName: mvMatchesByScore.eventName,
    year: mvMatchesByScore.year,
    gender: mvMatchesByScore.gender,
    sex: mvMatchesByScore.gender,
    score: sql`score`, // Would need proper join to get score
    "event.location": sql`location`, // Would need proper join
    "surface_type.surface_type": sql`surface_type`, // Would need proper join
    "match_round.round_name": sql`round_name`, // Would need proper join

    // Legacy field names for backwards compatibility
    player_a_id: mvMatchesByScore.playerAId,
    player_b_id: mvMatchesByScore.playerBId,
    "player_a.full_name": mvMatchesByScore.playerAName,
    "player_b.full_name": mvMatchesByScore.playerBName,
    "tournament.name": mvMatchesByScore.eventName,
  };

  return fieldMap[fieldPath] || sql.raw(fieldPath);
}

async function handlePlainTextSearch(q: string) {
  const results: any = {
    type: "plain_text_search",
    query: q,
    results: {},
  };

  try {
    // Search for score patterns
    if (/[\d]-[\d]/.test(q)) {
      const scores = await db
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
        .limit(10)
        .execute();

      results.results.scores = scores;
    }

    // Search for players
    const players = await db
      .select({
        id: player.player_id,
        name: player.full_name,
        country_id: player.country_id,
        sex: player.sex,
      })
      .from(player)
      .where(ilike(player.full_name, `%${q}%`))
      .orderBy(player.full_name)
      .limit(10)
      .execute();

    results.results.players = players;

    // Search for tournaments
    const tournaments = await db
      .select({
        id: tournament.tournament_id,
        name: tournament.name,
        surface_type_id: tournament.surface_type_id,
        country_id: tournament.country_id,
      })
      .from(tournament)
      .where(ilike(tournament.name, `%${q}%`))
      .orderBy(tournament.name)
      .limit(10)
      .execute();

    results.results.tournaments = tournaments;

    // Search for events
    const events = await db
      .select({
        id: event.event_id,
        name: event.name,
        year: event.event_year,
        location: event.location,
        sex: event.sex,
      })
      .from(event)
      .where(or(ilike(event.name, `%${q}%`), ilike(event.location, `%${q}%`)))
      .orderBy(event.event_year, event.name)
      .limit(10)
      .execute();

    results.results.events = events;

    return NextResponse.json(results);
  } catch (error) {
    console.error("Plain text search error:", error);
    return NextResponse.json({
      type: "plain_text_search",
      query: q,
      results: {},
      error: "Search failed",
    });
  }
}
