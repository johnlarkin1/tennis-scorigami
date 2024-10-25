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
import { Tournament } from "./types/tournament";
import { defaultAllTournament } from "./components/atoms/tournament-atom";
import { SexType } from "./components/atoms/scorigami-options-atom";
import { InitialScore } from "./types/initial-score";

export const fetchMatches = async (
  setNumber: number,
  scoreSequence: { playerAScore: number; playerBScore: number }[], // Pass full score sequence so far
  tournament?: Tournament,
  eventYear?: string,
  eventGender?: SexType,
): Promise<AggregatedMatchScore[]> => {
  const params = new URLSearchParams();

  // If a score sequence is provided, encode it as a stringified JSON object
  if (scoreSequence.length > 0) {
    params.append("score_sequence", JSON.stringify(scoreSequence));
  }

  // Append tournament_id if provided
  if (tournament && tournament !== defaultAllTournament) {
    params.append("tournament_id", tournament.tournament_id.toString());
  }

  // Append event_year if provided and valid
  if (eventYear && !isNaN(+eventYear)) {
    params.append("event_year", eventYear);
  }

  // Map eventGender and append only if it maps to a valid value
  const mappedGender = eventGender ? mapSexTypeToApi(eventGender) : undefined;
  if (mappedGender) {
    params.append("event_gender", mappedGender);
  }

  try {
    const response = await fetch(
      `/api/scores/${setNumber}?${params.toString()}`,
    );
    if (!response.ok) {
      throw new Error(`Error fetching matches for set ${setNumber}`);
    }

    const data: AggregatedMatchScore[] = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching matches:", error);
    throw new Error("Unable to fetch matches");
  }
};

const mapSexTypeToApi = (sex: SexType): string | undefined => {
  switch (sex) {
    case "Men and Women":
      // returning undefined will have the query parameter omitted
      return undefined;
    case "Men":
      return "M";
    case "Women":
      return "F";
    default:
      return undefined;
  }
};

export const fetchInitialScores = async (
  tournament?: Tournament,
  eventYear?: string,
  eventGender?: SexType,
): Promise<InitialScore[]> => {
  const params = new URLSearchParams();

  // Append tournament_id if provided
  if (tournament && tournament !== defaultAllTournament) {
    params.append("tournament_id", tournament.tournament_id.toString());
  }

  // Append event_year if provided and valid
  if (eventYear && !isNaN(+eventYear)) {
    params.append("event_year", eventYear);
  }

  // Map eventGender and append only if it maps to a valid value
  const mappedGender = eventGender ? mapSexTypeToApi(eventGender) : undefined;
  if (mappedGender) {
    params.append("event_gender", mappedGender);
  }

  // Perform the API fetch call
  const response = await fetch(
    `/api/scores/initial-scores?${params.toString()}`,
  );

  if (!response.ok) {
    throw new Error("Failed to fetch matches");
  }
  const data: InitialScore[] = await response.json();
  return data;
};

export const fetchTournaments = async (): Promise<Tournament[]> => {
  const response = await fetch("/api/tournaments");
  if (!response.ok) {
    throw new Error("Failed to fetch tournaments");
  }
  const data: Tournament[] = await response.json();
  return data;
};
