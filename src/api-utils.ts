// import { AggregatedMatchScore, SetScoreResponse } from "./types/set-score";
// import { TennisMatch } from "./types/tennis-match";

// export async function fetchMatches(
//   setNumber: number,
//   playerAScore?: number,
//   playerBScore?: number,
// ): Promise<TennisMatch[]> {
//   const url = new URL(`/api/scores/${setNumber}`, window.location.origin);

//   // If player scores are provided, add them to the query params
//   if (playerAScore) {
//     url.searchParams.set("player_a_score", playerAScore.toString());
//   }
//   if (playerBScore) {
//     url.searchParams.set("player_b_score", playerBScore.toString());
//   }

//   try {
//     const response = await fetch(url.toString());
//     if (!response.ok) {
//       throw new Error(`Error fetching matches for set ${setNumber}`);
//     }

//     const data: AggregatedMatchScore[] = await response.json();

//     // Map the backend response to the `TennisMatch` structure
//     const mappedMatches: TennisMatch[] = data.map((match) => ({
//       id: match.match_id,
//       player1: match.player_a_full_name,
//       player2: match.player_b_full_name,
//       set1_score: match.player_a_score.toString() + "-" +
//         match.player_b_score.toString(),
//       set2_score: "",
//       set3_score: "",
//       tournament: match.match.event.name,
//       date: match.match.match_start_time,
//     }));

//     return mappedMatches;
//   } catch (error) {
//     console.error("Error fetching matches:", error);
//     throw new Error("Unable to fetch matches");
//   }
// }

import { AggregatedMatchScore } from "@/types/set-score";

export async function fetchMatches(
  setNumber: number,
  playerAScore?: number,
  playerBScore?: number,
): Promise<AggregatedMatchScore[]> {
  const url = new URL(`/api/scores/${setNumber}`, window.location.origin);

  // If player scores are provided, add them to the query params
  if (playerAScore) {
    url.searchParams.set("player_a_score", playerAScore.toString());
  }
  if (playerBScore) {
    url.searchParams.set("player_b_score", playerBScore.toString());
  }

  try {
    const response = await fetch(url.toString());
    if (!response.ok) {
      throw new Error(`Error fetching matches for set ${setNumber}`);
    }

    const data: AggregatedMatchScore[] = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching matches:", error);
    throw new Error("Unable to fetch matches");
  }
}
