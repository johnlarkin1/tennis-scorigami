// import { supabase } from "@/supabase/client";
// import { SetScoreResponse } from "@/types/set-score";
// import { NextRequest, NextResponse } from "next/server";
// import { QueryData } from "@supabase/supabase-js";

// const rawQuery = supabase
//   .from("set_score")
//   .select(`
//     match (
//       match_id,
//       match_start_time,
//       match_end_time,
//       match_duration,
//       external_id,
//       event (
//         event_id,
//         name,
//         location,
//         event_start_date,
//         event_end_date,
//         event_year,
//         length,
//         surface_type:surface_type(surface_type_id, surface_type),
//         event_type:event_type(event_type_id, event_type)
//       ),
//       player_a:player!match_player_a_id_fkey(player_id, full_name, country:country(country_id, country_name)),
//       player_b:player!match_player_b_id_fkey(player_id, full_name, country:country(country_id, country_name)),
//       winner:player!match_winner_id_fkey(player_id, full_name)
//     ),
//     set_number,
//     player_a_score,
//     player_b_score,
//     tie_break_points_a,
//     tie_break_points_b
//   `);

// type MatchDetailQuery = QueryData<typeof rawQuery>;

// export async function GET(
//   req: NextRequest,
//   { params }: { params: { setNumber: string } },
// ) {
//   const { setNumber } = params;
//   const { searchParams } = new URL(req.url);
//   const playerAScore = searchParams.get("player_a_score");
//   const playerBScore = searchParams.get("player_b_score");

//   if (!setNumber) {
//     return NextResponse.json({ error: "Set number is required" }, {
//       status: 400,
//     });
//   }

//   try {
//     let query = rawQuery
//       .eq("set_number", setNumber);

//     // Optionally filter by player scores
//     if (playerAScore && playerBScore) {
//       query = query
//         .eq("player_a_score", playerAScore)
//         .eq("player_b_score", playerBScore);
//     }

//     const { data, error } = await query;

//     if (error) {
//       console.error("Error fetching set scores:", error);
//       return NextResponse.json({ error: error.message }, { status: 500 });
//     }

//     const matchDetails: MatchDetailQuery = data;
//     return NextResponse.json(matchDetails);
//   } catch (error: any) {
//     console.error("Error fetching set scores:", error);
//     return NextResponse.json({ error: error.message }, { status: 500 });
//   }
// }

import { supabase } from "@/supabase/client";
import { NextRequest, NextResponse } from "next/server";
import { QueryData } from "@supabase/supabase-js";
import { AggregatedMatchScore } from "@/types/set-score";

// We are calling the Supabase RPC to get the aggregated match scores
export async function GET(
  req: NextRequest,
  { params }: { params: { setNumber: string } },
) {
  const { setNumber } = params;
  const { searchParams } = new URL(req.url);
  const playerAScore = searchParams.get("player_a_score");
  const playerBScore = searchParams.get("player_b_score");

  // Validate required params
  if (!setNumber) {
    return NextResponse.json({ error: "Set number is required" }, {
      status: 400,
    });
  }

  try {
    // Call the custom RPC function we created in the database
    const { data, error } = await supabase.rpc("get_aggregated_match_scores");

    if (error) {
      console.error("Error fetching aggregated match scores:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Optionally filter by player scores on the client-side if needed
    let filteredData = data;

    if (playerAScore && playerBScore) {
      filteredData = data.filter(
        (match: any) =>
          match.player_a_scores.includes(Number(playerAScore)) &&
          match.player_b_scores.includes(Number(playerBScore)),
      );
    }

    return NextResponse.json(filteredData as AggregatedMatchScore[]);
  } catch (error: any) {
    console.error("Error fetching match scores:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
