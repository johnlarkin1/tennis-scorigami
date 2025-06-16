import { db } from "@/db";
import {
  country,
  matchRound,
  mvFilterOptions,
  player,
  surfaceType,
  tournament,
} from "@/db/schema";
import { bad } from "@/lib/errors";
import { and, asc, ilike, sql } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const searchParams = new URL(req.url).searchParams;
  const type = searchParams.get("type");
  const q = searchParams.get("q")?.trim() || "";
  const limit = Math.min(parseInt(searchParams.get("limit") || "20"), 100);

  if (!type) {
    return bad("type parameter is required");
  }

  try {
    switch (type) {
      case "player":
        return await getPlayerSuggestions(q, limit);

      case "tournaments":
        return await getTournamentSuggestions(q, limit);

      case "countries":
        return await getCountrySuggestions(q, limit);

      case "surfaces":
        return await getSurfaceSuggestions(q, limit);

      case "rounds":
        return await getRoundSuggestions(q, limit);

      case "years":
        return await getYearSuggestions(q, limit);

      case "sex":
        return NextResponse.json({
          type: "sex",
          items: [
            { id: "M", name: "Men's", value: "M" },
            { id: "F", name: "Women's", value: "F" },
          ],
        });

      case "has":
        return NextResponse.json({
          type: "has",
          items: [
            { id: "tiebreak", name: "Tiebreak", value: "tiebreak" },
            { id: "bagel", name: "Bagel (6-0 set)", value: "bagel" },
            {
              id: "breadstick",
              name: "Breadstick (6-1 set)",
              value: "breadstick",
            },
            { id: "double_bagel", name: "Double Bagel", value: "double_bagel" },
            {
              id: "straight_sets",
              name: "Straight Sets",
              value: "straight_sets",
            },
            { id: "comeback", name: "Comeback Win", value: "comeback" },
          ],
        });

      case "never":
        return NextResponse.json({
          type: "never",
          items: [
            {
              id: "occurred",
              name: "Never Occurred (Scorigami)",
              value: "occurred",
            },
          ],
        });

      default:
        return bad(`Unsupported suggestion type: ${type}`);
    }
  } catch (error) {
    console.error("Error fetching suggestions:", error);
    return bad("Internal server error");
  }
}

async function getPlayerSuggestions(q: string, limit: number) {
  const baseQuery = db
    .select({
      id: player.player_id,
      name: player.full_name,
      value: player.full_name,
      country: player.country_id,
      sex: player.sex,
    })
    .from(player)
    .where(sql`${player.full_name} IS NOT NULL`)
    .orderBy(asc(player.full_name))
    .limit(limit);

  const query = q
    ? db
        .select({
          id: player.player_id,
          name: player.full_name,
          value: player.full_name,
          country: player.country_id,
          sex: player.sex,
        })
        .from(player)
        .where(
          and(
            sql`${player.full_name} IS NOT NULL`,
            ilike(player.full_name, `%${q}%`)
          )
        )
        .orderBy(asc(player.full_name))
        .limit(limit)
    : baseQuery;

  const rows = await query.execute();

  return NextResponse.json({
    type: "players",
    items: rows,
  });
}

async function getTournamentSuggestions(q: string, limit: number) {
  const baseQuery = db
    .select({
      id: tournament.tournament_id,
      name: tournament.name,
      value: tournament.name,
      surface_type_id: tournament.surface_type_id,
      country_id: tournament.country_id,
    })
    .from(tournament)
    .where(sql`${tournament.name} IS NOT NULL`)
    .orderBy(asc(tournament.name))
    .limit(limit);

  const query = q
    ? db
        .select({
          id: tournament.tournament_id,
          name: tournament.name,
          value: tournament.name,
          surface_type_id: tournament.surface_type_id,
          country_id: tournament.country_id,
        })
        .from(tournament)
        .where(
          and(
            sql`${tournament.name} IS NOT NULL`,
            ilike(tournament.name, `%${q}%`)
          )
        )
        .orderBy(asc(tournament.name))
        .limit(limit)
    : baseQuery;

  const rows = await query.execute();

  return NextResponse.json({
    type: "tournaments",
    items: rows,
  });
}

async function getCountrySuggestions(q: string, limit: number) {
  const baseQuery = db
    .select({
      id: country.country_id,
      name: country.country_name,
      value: country.country_name,
      code: country.country_code,
      continent: country.continent,
    })
    .from(country)
    .where(sql`${country.country_name} IS NOT NULL`)
    .orderBy(asc(country.country_name))
    .limit(limit);

  const query = q
    ? db
        .select({
          id: country.country_id,
          name: country.country_name,
          value: country.country_name,
          code: country.country_code,
          continent: country.continent,
        })
        .from(country)
        .where(
          and(
            sql`${country.country_name} IS NOT NULL`,
            ilike(country.country_name, `%${q}%`)
          )
        )
        .orderBy(asc(country.country_name))
        .limit(limit)
    : baseQuery;

  const rows = await query.execute();

  return NextResponse.json({
    type: "countries",
    items: rows,
  });
}

async function getSurfaceSuggestions(q: string, limit: number) {
  const baseQuery = db
    .select({
      id: surfaceType.surface_type_id,
      name: surfaceType.surface_type,
      value: surfaceType.surface_type,
    })
    .from(surfaceType)
    .where(sql`${surfaceType.surface_type} IS NOT NULL`)
    .orderBy(asc(surfaceType.surface_type))
    .limit(limit);

  const query = q
    ? db
        .select({
          id: surfaceType.surface_type_id,
          name: surfaceType.surface_type,
          value: surfaceType.surface_type,
        })
        .from(surfaceType)
        .where(
          and(
            sql`${surfaceType.surface_type} IS NOT NULL`,
            ilike(surfaceType.surface_type, `%${q}%`)
          )
        )
        .orderBy(asc(surfaceType.surface_type))
        .limit(limit)
    : baseQuery;

  const rows = await query.execute();

  return NextResponse.json({
    type: "surfaces",
    items: rows,
  });
}

async function getRoundSuggestions(q: string, limit: number) {
  const baseQuery = db
    .select({
      id: matchRound.round_id,
      name: matchRound.round_name,
      value: matchRound.round_name,
    })
    .from(matchRound)
    .where(sql`${matchRound.round_name} IS NOT NULL`)
    .orderBy(asc(matchRound.round_name))
    .limit(limit);

  const query = q
    ? db
        .select({
          id: matchRound.round_id,
          name: matchRound.round_name,
          value: matchRound.round_name,
        })
        .from(matchRound)
        .where(
          and(
            sql`${matchRound.round_name} IS NOT NULL`,
            ilike(matchRound.round_name, `%${q}%`)
          )
        )
        .orderBy(asc(matchRound.round_name))
        .limit(limit)
    : baseQuery;

  const rows = await query.execute();

  return NextResponse.json({
    type: "rounds",
    items: rows,
  });
}

async function getYearSuggestions(q: string, limit: number) {
  // Get available years from the materialized view
  const rows = await db
    .select({
      tournament_name: mvFilterOptions.tournamentName,
      years: mvFilterOptions.years,
    })
    .from(mvFilterOptions)
    .execute();

  // Extract unique years
  const yearSet = new Set<number>();
  rows.forEach((row) => {
    if (row.years) {
      // Handle both single values and arrays from the database
      const years = Array.isArray(row.years) ? row.years : [row.years];
      years.forEach((year: number) => yearSet.add(year));
    }
  });

  let years = Array.from(yearSet).sort((a, b) => b - a);

  // Filter by query if provided
  if (q) {
    years = years.filter((year) => year.toString().includes(q));
  }

  // Apply limit
  years = years.slice(0, limit);

  const items = years.map((year) => ({
    id: year,
    name: year.toString(),
    value: year.toString(),
  }));

  return NextResponse.json({
    type: "years",
    items,
  });
}
