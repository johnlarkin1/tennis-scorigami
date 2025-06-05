// src/app/api/tournaments.ts
import { db } from "@/db";
import { eventType, tournament } from "@/db/schema";
import { eq, or } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    const tournaments = await db
      .select({
        tournament_id: tournament.tournament_id,
        name: tournament.name,
        event_type_id: tournament.event_type_id,
        event_type: eventType.event_type,
        event_abbr: eventType.event_abbr,
      })
      .from(tournament)
      .innerJoin(
        eventType,
        eq(tournament.event_type_id, eventType.event_type_id)
      )
      .where(
        or(
          eq(eventType.event_abbr, "G"),
          eq(eventType.event_abbr, "M"),
          eq(eventType.event_abbr, "A")
        )
      );

    const filteredTournaments = tournaments.filter(
      (t) => t.event_abbr && ["G", "M", "A"].includes(t.event_abbr)
    );

    const groupedTournaments = filteredTournaments.reduce(
      (acc, t) => {
        const eventAbbr = t.event_abbr;
        if (!eventAbbr) return acc;
        if (!acc[eventAbbr]) {
          acc[eventAbbr] = {
            event_type: t.event_type,
            event_abbr: eventAbbr,
            tournaments: [],
          };
        }
        acc[eventAbbr].tournaments.push({
          tournament_id: t.tournament_id,
          name: t.name,
          event_type_id: t.event_type_id,
        });
        return acc;
      },
      {} as Record<string, any>
    );

    // Sort the grouped tournaments by priority and name
    const sortedGroups = Object.values(groupedTournaments).sort((a, b) => {
      const order = { G: 1, M: 2, A: 3 };
      return (
        order[a.event_abbr as keyof typeof order] -
        order[b.event_abbr as keyof typeof order]
      );
    });

    // Sort tournaments within each group by name
    sortedGroups.forEach((group) => {
      group.tournaments.sort((a: any, b: any) => a.name.localeCompare(b.name));
    });

    return NextResponse.json(sortedGroups);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
