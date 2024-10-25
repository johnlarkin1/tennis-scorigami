// src/app/api/scores/initial-scores/route.ts
import { supabase } from "@/supabase/client";
import { InitialScore } from "@/types/initial-score";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const tournamentId = searchParams.get("tournament_id");
  const eventYear = searchParams.get("event_year");
  const eventGender = searchParams.get("event_year");

  try {
    const { data, error } = await supabase.rpc("get_initial_scores", {
      p_tournament_id: tournamentId ? Number(tournamentId) : undefined,
      p_event_year: eventYear ? Number(eventYear) : undefined,
      p_event_gender: eventGender ? eventGender : undefined,
    });

    if (error) {
      console.error("Error fetching initial scores:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json(data as InitialScore[]);
  } catch (error: any) {
    console.error("Error fetching initial scores:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
