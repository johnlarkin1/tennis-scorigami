// src/app/api/v1/search/route.ts
import { db } from "@/db";
import { mvMatchesByScore } from "@/db/schema";
import { bad } from "@/lib/errors";
import { SearchMapper } from "@/lib/search/search-mapper";
import { parseSearchQuery } from "@/lib/search/search-parser";
import { and, between, eq, ilike, inArray, or, sql } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const searchParams = new URL(req.url).searchParams;
  const q = searchParams.get("q")?.trim();
  const requestedLimit = Math.min(
    parseInt(searchParams.get("limit") || "100"),
    100
  );
  const fetchLimit = requestedLimit + 1; // Fetch one extra to check if there are more results

  if (!q) return bad("q is required");

  try {
    // Parse the search query for keywords
    const parsedQuery = parseSearchQuery(q);

    // Map keywords to database filters
    const mappedFilters = await SearchMapper.mapKeywordFilters(
      parsedQuery.keywords
    );

    // Search for matches using the filters
    const matchesResult = await searchMatches(
      mappedFilters,
      parsedQuery.plainText,
      fetchLimit
    );

    // Check if search returned an error
    if (!Array.isArray(matchesResult)) {
      return matchesResult; // Return the error response
    }

    // Check if there are more results than requested
    const hasMore = matchesResult.length > requestedLimit;
    const actualResults = hasMore
      ? matchesResult.slice(0, requestedLimit)
      : matchesResult;

    // Transform matches to SearchResult format
    const searchResults = actualResults.map((match) => ({
      id: match.match_id,
      name: `${match.player_a_name} vs ${match.player_b_name}`,
      slug: `${match.event_name} ${match.year}`,
      match_data: match,
    }));

    return NextResponse.json({
      type: "matches",
      query: q,
      count: searchResults.length,
      hasMore,
      items: searchResults,
      filters: mappedFilters,
    });
  } catch (error) {
    console.error("Search error:", error);
    return bad(
      "Search failed: " +
        (error instanceof Error ? error.message : String(error))
    );
  }
}

async function searchMatches(
  mappedFilters: unknown[],
  plainText: string,
  limit: number = 100
) {
  try {
    // Build WHERE conditions from mapped filters
    const conditions = [];

    for (const filterItem of mappedFilters) {
      const filter = filterItem as any; // Type assertion for the mapped filter object

      // Handle player vs opponent combination
      if (filter.field === "playerVsOpponent") {
        const [playerId, opponentId] = filter.value;
        conditions.push(
          or(
            and(
              eq(mvMatchesByScore.playerAId, playerId),
              eq(mvMatchesByScore.playerBId, opponentId)
            ),
            and(
              eq(mvMatchesByScore.playerAId, opponentId),
              eq(mvMatchesByScore.playerBId, playerId)
            )
          )
        );
        continue;
      }

      // Handle special "either player" fields
      if (filter.field === "playerEitherId") {
        conditions.push(
          or(
            eq(mvMatchesByScore.playerAId, filter.value),
            eq(mvMatchesByScore.playerBId, filter.value)
          )
        );
        continue;
      }

      if (filter.field === "playerEitherName") {
        conditions.push(
          or(
            ilike(mvMatchesByScore.playerAName, filter.value),
            ilike(mvMatchesByScore.playerBName, filter.value)
          )
        );
        continue;
      }

      // Handle scorigami search (never occurred scores) - not yet implemented
      if (filter.field === "scorigami") {
        continue;
      }

      // Handle status filter (boolean: true=complete, false=incomplete)
      if (filter.field === "status") {
        if (filter.value === "complete") {
          // true = complete matches only (exclude RET/W/O)
          conditions.push(
            and(
              sql`${mvMatchesByScore.score} NOT ILIKE '%RET%'`,
              sql`${mvMatchesByScore.score} NOT ILIKE '%W/O%'`,
              sql`${mvMatchesByScore.score} NOT ILIKE '%DEF%'`,
              sql`${mvMatchesByScore.score} NOT ILIKE '%unfinished%'`,
              sql`${mvMatchesByScore.score} NOT ILIKE '%abandoned%'`,
              sql`${mvMatchesByScore.score} NOT ILIKE '%walkover%'`
            )
          );
        } else if (filter.value === "incomplete") {
          // false = incomplete matches only (include only RET/W/O)
          conditions.push(
            or(
              sql`${mvMatchesByScore.score} ILIKE '%RET%'`,
              sql`${mvMatchesByScore.score} ILIKE '%W/O%'`,
              sql`${mvMatchesByScore.score} ILIKE '%DEF%'`,
              sql`${mvMatchesByScore.score} ILIKE '%unfinished%'`,
              sql`${mvMatchesByScore.score} ILIKE '%abandoned%'`,
              sql`${mvMatchesByScore.score} ILIKE '%walkover%'`
            )
          );
        }
        continue;
      }

      const fieldRef = getFieldReference(filter.field);
      if (fieldRef === undefined || fieldRef === null) {
        continue;
      }

      switch (filter.operator) {
        case "equals":
          conditions.push(eq(fieldRef as any, filter.value));
          break;

        case "ilike":
          conditions.push(ilike(fieldRef as any, filter.value));
          break;

        case "between":
          conditions.push(
            between(fieldRef as any, filter.value[0], filter.value[1])
          );
          break;

        case "in":
          if (Array.isArray(filter.value)) {
            conditions.push(inArray(fieldRef as any, filter.value));
          }
          break;

        case "regex":
          conditions.push(sql`${fieldRef as any} ~* ${filter.value}`);
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

    // Build the query with conditions (using enhanced materialized view with all fields)
    const query = db
      .select({
        // Basic match info
        match_id: mvMatchesByScore.matchId,
        score_id: mvMatchesByScore.scoreId,
        event_id: mvMatchesByScore.eventId,

        // Event details
        event_name: mvMatchesByScore.eventName,
        year: mvMatchesByScore.year,
        gender: mvMatchesByScore.gender,
        location: mvMatchesByScore.location,
        draw_size: mvMatchesByScore.drawSize,
        prize_money: mvMatchesByScore.prizeMoney,
        event_start_date: mvMatchesByScore.eventStartDate,
        event_end_date: mvMatchesByScore.eventEndDate,

        // Tournament info
        tournament_id: mvMatchesByScore.tournamentId,
        tournament_name: mvMatchesByScore.tournamentName,
        surface_type: mvMatchesByScore.surfaceType,
        established_year: mvMatchesByScore.establishedYear,

        // Match details
        match_duration: mvMatchesByScore.matchDuration,
        match_start_time: mvMatchesByScore.matchStartTime,
        match_end_time: mvMatchesByScore.matchEndTime,
        best_of: mvMatchesByScore.bestOf,
        score: mvMatchesByScore.score,
        round_id: mvMatchesByScore.roundId,
        round_name: mvMatchesByScore.roundName,
        round_abbr: mvMatchesByScore.roundAbbr,

        // Player A details
        player_a_id: mvMatchesByScore.playerAId,
        player_a_name: mvMatchesByScore.playerAName,
        player_a_first_name: mvMatchesByScore.playerAFirstName,
        player_a_last_name: mvMatchesByScore.playerALastName,
        player_a_country_id: mvMatchesByScore.playerACountryId,
        player_a_country_code: mvMatchesByScore.playerACountryCode,
        player_a_country_name: mvMatchesByScore.playerACountryName,
        player_a_date_of_birth: mvMatchesByScore.playerADateOfBirth,
        player_a_handedness: mvMatchesByScore.playerAHandedness,
        player_a_height_cm: mvMatchesByScore.playerAHeightCm,
        player_a_weight_kg: mvMatchesByScore.playerAWeightKg,

        // Player B details
        player_b_id: mvMatchesByScore.playerBId,
        player_b_name: mvMatchesByScore.playerBName,
        player_b_first_name: mvMatchesByScore.playerBFirstName,
        player_b_last_name: mvMatchesByScore.playerBLastName,
        player_b_country_id: mvMatchesByScore.playerBCountryId,
        player_b_country_code: mvMatchesByScore.playerBCountryCode,
        player_b_country_name: mvMatchesByScore.playerBCountryName,
        player_b_date_of_birth: mvMatchesByScore.playerBDateOfBirth,
        player_b_handedness: mvMatchesByScore.playerBHandedness,
        player_b_height_cm: mvMatchesByScore.playerBHeightCm,
        player_b_weight_kg: mvMatchesByScore.playerBWeightKg,

        // Winner/Loser info
        winner_id: mvMatchesByScore.winnerId,
        loser_id: mvMatchesByScore.loserId,
      })
      .from(mvMatchesByScore)
      .where(conditions.length > 0 ? and(...conditions) : sql`1=1`)
      .limit(limit);

    // Execute query
    const matches = await query.execute();

    // Return raw matches - transformation happens in main function
    return matches;
  } catch (error) {
    console.error("Match search error:", error);
    return bad("Match search failed");
  }
}

function getFieldReference(fieldPath: string) {
  // Map field paths to actual database column references from the enhanced materialized view
  const fieldMap: Record<string, unknown> = {
    // Player fields
    playerAId: mvMatchesByScore.playerAId,
    playerBId: mvMatchesByScore.playerBId,
    playerAName: mvMatchesByScore.playerAName,
    playerBName: mvMatchesByScore.playerBName,
    playerACountryId: mvMatchesByScore.playerACountryId,
    playerBCountryId: mvMatchesByScore.playerBCountryId,
    playerACountryCode: mvMatchesByScore.playerACountryCode,
    playerBCountryCode: mvMatchesByScore.playerBCountryCode,
    playerACountryName: mvMatchesByScore.playerACountryName,
    playerBCountryName: mvMatchesByScore.playerBCountryName,
    playerAHandedness: mvMatchesByScore.playerAHandedness,
    playerBHandedness: mvMatchesByScore.playerBHandedness,

    // Tournament/Event fields
    eventName: mvMatchesByScore.eventName,
    eventId: mvMatchesByScore.eventId,
    tournamentId: mvMatchesByScore.tournamentId,
    tournamentName: mvMatchesByScore.tournamentName,
    surfaceType: mvMatchesByScore.surfaceType,
    location: mvMatchesByScore.location,

    // Match details
    year: mvMatchesByScore.year,
    gender: mvMatchesByScore.gender,
    sex: mvMatchesByScore.gender,
    roundId: mvMatchesByScore.roundId,
    roundName: mvMatchesByScore.roundName,
    roundAbbr: mvMatchesByScore.roundAbbr,
    bestOf: mvMatchesByScore.bestOf,
    score: mvMatchesByScore.score,
    winnerId: mvMatchesByScore.winnerId,
    loserId: mvMatchesByScore.loserId,

    // Event details
    drawSize: mvMatchesByScore.drawSize,
    prizeMoney: mvMatchesByScore.prizeMoney,
    establishedYear: mvMatchesByScore.establishedYear,

    // Legacy field names for backwards compatibility
    player_a_id: mvMatchesByScore.playerAId,
    player_b_id: mvMatchesByScore.playerBId,
    tournament_id: mvMatchesByScore.tournamentId,
    event_id: mvMatchesByScore.eventId,
    round_id: mvMatchesByScore.roundId,
    surface_type_id: mvMatchesByScore.surfaceType,

    // JOIN-style field names mapped to materialized view fields
    "event.location": mvMatchesByScore.location,
    "match_round.round_name": mvMatchesByScore.roundName,
    "surface_type.surface_type": mvMatchesByScore.surfaceType,
  };

  return fieldMap[fieldPath];
}
