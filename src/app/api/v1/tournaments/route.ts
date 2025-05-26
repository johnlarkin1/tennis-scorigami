// src/app/api/tournaments.ts
import { supabase } from "@/services/supabase/client";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    const { data: tournaments, error } = await supabase
      .from("tournament")
      .select(`
        tournament_id,
        name,
        surface_type_id,
        country_id,
        event_type_id,
        established_year,
        event_type!inner(event_abbr)
      `)
      .in('event_type.event_abbr', ['M', 'G'])
      .order('name');

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(tournaments);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
