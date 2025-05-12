import { defaultAllTournament } from "@/store/tournament";
import { InitialScore } from "@/types/initial-score";
import { AggregatedMatchScore } from "@/types/set-score";
import { SexType } from "@/types/tree-control-types";
import { Tournament } from "../types/tournament";

export const fetchMatches = async (
  setNumber: number,
  scoreSequence: { playerAScore: number; playerBScore: number }[],
  tournament?: Tournament,
  eventYear?: string,
  eventGender?: SexType
): Promise<AggregatedMatchScore[]> => {
  const params = new URLSearchParams();

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
      `/api/v1/scores/${setNumber}?${params.toString()}`
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
  eventGender?: SexType
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
    `/api/v1/scores/initial-scores?${params.toString()}`
  );

  if (!response.ok) {
    throw new Error("Failed to fetch matches");
  }
  const data: InitialScore[] = await response.json();
  return data;
};

export const fetchTournaments = async (): Promise<Tournament[]> => {
  const response = await fetch("/api/v1/tournaments");
  if (!response.ok) {
    throw new Error("Failed to fetch tournaments");
  }
  const data: Tournament[] = await response.json();
  return data;
};
