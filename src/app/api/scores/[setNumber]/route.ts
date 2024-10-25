import { supabase } from "@/supabase/client";
import { NextRequest, NextResponse } from "next/server";
import { AggregatedMatchScore } from "@/types/set-score";

// We are calling the Supabase RPC to get the aggregated match scores
export async function GET(
  req: NextRequest,
  props: { params: Promise<{ setNumber: string }> },
) {
  const params = await props.params;
  const { setNumber } = params;
  const { searchParams } = new URL(req.url);
  const scoreSequence = searchParams.get("score_sequence");
  const tournamentId = searchParams.get("tournament_id");
  const eventYear = searchParams.get("event_year");
  const eventGender = searchParams.get("event_gender");

  // Validate required params
  if (!setNumber) {
    return NextResponse.json({ error: "Set number is required" }, {
      status: 400,
    });
  }

  try {
    // Parse the score sequence (if provided)
    const parsedScoreSequence = scoreSequence ? JSON.parse(scoreSequence) : [];

    // Call the custom RPC function we created in the database
    const { data, error } = await supabase.rpc("get_aggregated_match_scores", {
      p_tournament_id: tournamentId ? Number(tournamentId) : undefined,
      p_event_year: eventYear ? Number(eventYear) : undefined,
      p_event_gender: eventGender ? eventGender : undefined,
    });

    if (error) {
      console.error("Error fetching aggregated match scores:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Convert setNumber to an integer and adjust for zero-based index
    const setIndex = Number(setNumber) - 1;

    // Optionally filter by score sequence on the server-side
    let filteredData = data;

    if (parsedScoreSequence.length > 0) {
      filteredData = data.filter((match: any) => {
        // Ensure all scores match the previous score sequence up to the current set
        return parsedScoreSequence.every((score: any, index: number) => {
          const validIndex = match.player_a_scores.length > index &&
            match.player_b_scores.length > index;

          return (
            validIndex &&
            match.player_a_scores[index] === score.playerAScore &&
            match.player_b_scores[index] === score.playerBScore
          );
        });
      });
    }

    return NextResponse.json(filteredData as AggregatedMatchScore[]);
  } catch (error: any) {
    console.error("Error fetching match scores:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
