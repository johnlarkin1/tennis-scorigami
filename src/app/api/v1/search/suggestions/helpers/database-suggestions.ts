import { db } from "@/db";
import {
  country,
  event,
  match,
  matchRound,
  mvFilterOptions,
  player,
  surfaceType,
  tournament,
} from "@/db/schema";
import { asc, sql } from "drizzle-orm";
import { NextResponse } from "next/server";
import { buildSearchQuery } from "./query-builders";

export async function getPlayerSuggestions(q: string, limit: number) {
  // Create a CTE to get all distinct player IDs from matches with match counts
  const matchPlayers = db.$with("match_players").as(
    db
      .select({
        player_id: match.player_a_id,
        match_count: sql<number>`1`.as("match_count"),
      })
      .from(match)
      .where(sql`${match.player_a_id} IS NOT NULL`)
      .union(
        db
          .select({
            player_id: match.player_b_id,
            match_count: sql<number>`1`.as("match_count"),
          })
          .from(match)
          .where(sql`${match.player_b_id} IS NOT NULL`)
      )
  );

  // Create a CTE to aggregate match counts per player
  const playerMatchCounts = db.$with("player_match_counts").as(
    db
      .select({
        player_id: matchPlayers.player_id,
        total_matches: sql<number>`COUNT(*)`.as("total_matches"),
      })
      .from(matchPlayers)
      .groupBy(matchPlayers.player_id)
  );

  // Build base conditions for player filtering
  const baseConditions = sql`${player.full_name} IS NOT NULL
          AND ${player.first_name} IS NOT NULL 
          AND ${player.first_name} != ''
          AND ${player.last_name} IS NOT NULL
          AND ${player.last_name} != ''
          AND ${player.first_name} NOT ILIKE '%?%'
          AND ${player.last_name} NOT ILIKE '%?%'
          AND LENGTH(${player.first_name}) > 1
          AND LENGTH(${player.last_name}) > 1`;

  // Add search filter if query is provided
  const whereConditions = q
    ? sql`${baseConditions} AND ${player.full_name} ILIKE ${`%${q}%`}`
    : baseConditions;

  // Build the main query with CTEs - players with 50+ matches are "suggested"
  const query = db
    .with(matchPlayers, playerMatchCounts)
    .select({
      id: player.player_id,
      name: player.full_name,
      value: player.full_name,
      country: player.country_id,
      sex: player.sex,
      suggested:
        sql<boolean>`CASE WHEN ${playerMatchCounts.total_matches} >= 50 THEN true ELSE false END`.as(
          "suggested"
        ),
      match_count: playerMatchCounts.total_matches,
    })
    .from(player)
    .innerJoin(
      playerMatchCounts,
      sql`${player.player_id} = ${playerMatchCounts.player_id}`
    )
    .where(whereConditions)
    .orderBy(
      sql`CASE WHEN ${playerMatchCounts.total_matches} >= 50 THEN 0 ELSE 1 END`,
      sql`${playerMatchCounts.total_matches} DESC`,
      asc(player.full_name)
    )
    .limit(limit);

  const rows = await query.execute();

  return NextResponse.json({
    type: "player",
    items: rows,
  });
}

export async function getTournamentSuggestions(q: string, limit: number) {
  // Define Grand Slam and major tournament names for "suggested" status
  const majorTournaments = [
    "Wimbledon",
    "US Open",
    "French Open",
    "Australian Open",
    "Roland Garros",
    "ATP Finals",
    "WTA Finals",
    "Indian Wells",
    "Miami Open",
    "Monte Carlo",
    "Madrid",
    "Rome",
    "Canada",
    "Cincinnati",
    "Shanghai",
    "Paris",
  ];

  // Create a CTE to get tournaments with match counts
  const tournamentMatchCounts = db.$with("tournament_match_counts").as(
    db
      .select({
        tournament_id: event.tournament_id,
        total_matches: sql<number>`COUNT(DISTINCT ${match.match_id})`.as(
          "total_matches"
        ),
      })
      .from(event)
      .innerJoin(match, sql`${event.event_id} = ${match.event_id}`)
      .groupBy(event.tournament_id)
  );

  // Build base conditions for tournament filtering
  const baseConditions = sql`${tournament.name} IS NOT NULL`;

  // Add search filter if query is provided
  const whereConditions = q
    ? sql`${baseConditions} AND ${tournament.name} ILIKE ${`%${q}%`}`
    : baseConditions;

  // Create case statement for suggested tournaments
  const majorTournamentConditions = majorTournaments
    .map((name) => sql`${tournament.name} ILIKE ${`%${name}%`}`)
    .reduce((acc, condition, index) =>
      index === 0 ? condition : sql`${acc} OR ${condition}`
    );

  const suggestedCase = sql`CASE 
    WHEN (${majorTournamentConditions}) THEN true
    WHEN ${tournamentMatchCounts.total_matches} >= 100 THEN true
    ELSE false
  END`;

  // Build the main query with tournament match counts
  const query = db
    .with(tournamentMatchCounts)
    .select({
      id: tournament.tournament_id,
      name: tournament.name,
      value: tournament.name,
      surface_type_id: tournament.surface_type_id,
      country_id: tournament.country_id,
      suggested: suggestedCase.as("suggested"),
      match_count:
        sql<number>`COALESCE(${tournamentMatchCounts.total_matches}, 0)`.as(
          "match_count"
        ),
    })
    .from(tournament)
    .leftJoin(
      tournamentMatchCounts,
      sql`${tournament.tournament_id} = ${tournamentMatchCounts.tournament_id}`
    )
    .where(whereConditions)
    .orderBy(
      sql`CASE WHEN (${suggestedCase}) THEN 0 ELSE 1 END`,
      sql`COALESCE(${tournamentMatchCounts.total_matches}, 0) DESC`,
      asc(tournament.name)
    )
    .limit(limit);

  const rows = await query.execute();

  return NextResponse.json({
    type: "tournament",
    items: rows,
  });
}

export async function getCountrySuggestions(q: string, limit: number) {
  const query = buildSearchQuery({
    table: country,
    selectFields: {
      id: country.country_id,
      name: country.country_name,
      value: country.country_name,
      code: country.country_code,
      continent: country.continent,
    },
    searchColumn: country.country_name,
    orderByColumn: country.country_name,
    query: q,
    limit,
  });

  const rows = await query.execute();

  return NextResponse.json({
    type: "country",
    items: rows,
  });
}

export async function getSurfaceSuggestions(q: string, limit: number) {
  const query = buildSearchQuery({
    table: surfaceType,
    selectFields: {
      id: surfaceType.surface_type_id,
      name: surfaceType.surface_type,
      value: surfaceType.surface_type,
    },
    searchColumn: surfaceType.surface_type,
    orderByColumn: surfaceType.surface_type,
    query: q,
    limit,
  });

  const rows = await query.execute();

  return NextResponse.json({
    type: "surface",
    items: rows,
  });
}

export async function getRoundSuggestions(q: string, limit: number) {
  const query = buildSearchQuery({
    table: matchRound,
    selectFields: {
      id: matchRound.round_id,
      name: matchRound.round_name,
      value: matchRound.round_name,
    },
    searchColumn: matchRound.round_name,
    orderByColumn: matchRound.round_name,
    query: q,
    limit,
  });

  const rows = await query.execute();

  return NextResponse.json({
    type: "round",
    items: rows,
  });
}

export async function getYearSuggestions(q: string, limit: number) {
  const rows = await db
    .select({
      tournament_name: mvFilterOptions.tournamentName,
      years: mvFilterOptions.years,
    })
    .from(mvFilterOptions)
    .execute();

  const yearSet = new Set<number>();
  rows.forEach((row) => {
    if (row.years) {
      const years = Array.isArray(row.years) ? row.years : [row.years];
      years.forEach((year: number) => yearSet.add(year));
    }
  });

  let years = Array.from(yearSet).sort((a, b) => b - a);

  if (q) {
    years = years.filter((year) => year.toString().includes(q));
  }

  years = years.slice(0, limit);

  const items = years.map((year) => ({
    id: year,
    name: year.toString(),
    value: year.toString(),
  }));

  return NextResponse.json({
    type: "year",
    items,
  });
}
