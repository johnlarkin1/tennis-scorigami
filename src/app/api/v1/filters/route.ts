// src/app/api/v1/filters/route.ts
import { db } from "@/db";
import { event, tournament } from "@/db/schema";
import { sql } from "drizzle-orm";
import { NextResponse } from "next/server";

export async function GET() {
  const [tours, yrs] = await Promise.all([
    db.select().from(tournament).orderBy(tournament.name).execute(),
    db
      .select({ y: event.event_year })
      .from(event)
      .groupBy(event.event_year)
      .orderBy(sql`y desc`)
      .execute(),
  ]);

  return NextResponse.json({
    tournaments: tours.map((t) => ({ id: t.tournament_id, name: t.name })),
    years: yrs.map((r) => r.y).filter(Boolean),
  });
}
