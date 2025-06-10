import type { EdgeDTO, NodeDTO } from "@/lib/types";
import type { MatchStatWithSamples } from "@/types/match-stats/response";
import type {
  SequenceInfo,
  SequenceMatch,
} from "@/types/sequence-matches/response";
import type { AggregatedMatchScore } from "@/types/set-score";
import type { Tournament, TournamentGroup } from "@/types/tournament";
import type { SexType } from "@/types/tree-control-types";
import {
  convertSetsFilter,
  convertSexFilter,
  convertTournamentFilter,
  convertYearFilter,
} from "@/utils/filter-converters";

// ===== GRAPH API ENDPOINTS =====

export interface GraphDataFetchParams {
  selectedYear?: string;
  selectedSex?: string;
  selectedSets: number;
  selectedTournament?: { tournament_id: number } | null;
}

export interface GraphDataResult {
  nodes: NodeDTO[];
  edges: EdgeDTO[];
}

/**
 * Fetch static graph data (nodes and edges)
 */
export async function fetchGraphData({
  selectedYear,
  selectedSex,
  selectedSets,
  selectedTournament,
}: GraphDataFetchParams): Promise<GraphDataResult> {
  const qs = new URLSearchParams({
    year: selectedYear ? convertYearFilter(selectedYear.toString()) : "",
    sex: convertSexFilter(selectedSex ?? ""),
    sets: selectedSets.toString(),
    tournament:
      selectedTournament && selectedTournament.tournament_id > 0
        ? selectedTournament.tournament_id.toString()
        : "all",
  });

  const response = await fetch(`/api/v1/graph?${qs}`);
  const { nodes: rawNodes, edges: rawEdges } = await response.json();

  // Process and enhance data
  let nodes = rawNodes.slice();
  let edges = rawEdges.slice();

  // Add love-all root node if missing
  const ROOT_ID = 0;
  if (!nodes.some((n: NodeDTO) => n.depth === 0)) {
    nodes = [
      {
        id: ROOT_ID,
        slug: "love-all",
        played: true,
        depth: 0,
        occurrences: 1,
        norm: 1,
      },
      ...nodes,
    ];
    // Connect root to all depth-1 nodes
    const rootEdges = nodes
      .filter((n: NodeDTO) => n.depth === 1)
      .map((n: NodeDTO) => ({ frm: ROOT_ID, to: n.id }));
    edges = [...rootEdges, ...edges];
  }

  return { nodes, edges };
}

/**
 * Fetch graph data via streaming (NDJSON)
 */
export async function fetchGraphStream(params: {
  year?: string;
  sex?: string;
  sets: number;
  tournament?: string;
  maxEdgesPerDepth?: number;
  minOccurrences?: number;
  signal?: AbortSignal;
}): Promise<Response> {
  const qs = new URLSearchParams();
  if (params.year) qs.set("year", params.year);
  if (params.sex) qs.set("sex", params.sex);
  qs.set("sets", params.sets.toString());
  if (params.tournament) qs.set("tournament", params.tournament);
  if (params.maxEdgesPerDepth)
    qs.set("maxEdgesPerDepth", params.maxEdgesPerDepth.toString());
  if (params.minOccurrences)
    qs.set("minOccurrences", params.minOccurrences.toString());

  return fetch(`/api/v1/graph-stream?${qs}`, {
    signal: params.signal,
  });
}

// ===== MATCH API ENDPOINTS =====

/**
 * Fetch matches by score ID (paginated)
 */
export async function fetchMatches(
  scoreId: number,
  limit = 50,
  cursor?: string
) {
  const params = new URLSearchParams();
  params.set("scoreId", scoreId.toString());
  params.set("limit", limit.toString());
  if (cursor) params.set("cursor", cursor);

  const res = await fetch(`/api/v1/matches?${params.toString()}`);
  const nextCursor = res.headers.get("X-Next-Cursor");
  if (!res.ok) throw new Error(`Failed to fetch matches: ${res.statusText}`);
  const data = await res.json();

  return { data, nextCursor };
}

/**
 * Fetch matches by sequence ID with filters
 */
export async function fetchMatchesBySequence(
  sequenceId: number,
  filters: {
    year?: string | null;
    sex?: string | null;
    tournament?: string | null;
    sets?: string | null;
  },
  page = 1,
  limit = 50
): Promise<{
  sequence: SequenceInfo;
  matches: SequenceMatch[];
  total: number;
}> {
  const params = new URLSearchParams();

  const yearValue = convertYearFilter(filters.year ?? null);
  const sexValue = convertSexFilter(filters.sex ?? null);
  const tournamentValue = convertTournamentFilter(filters.tournament ?? null);
  const setsValue = convertSetsFilter(filters.sets ?? null);

  if (yearValue) params.append("year", yearValue);
  if (sexValue) params.append("sex", sexValue);
  if (tournamentValue) params.append("tournament", tournamentValue);
  if (setsValue) params.append("sets", setsValue);

  params.append("page", page.toString());
  params.append("limit", limit.toString());

  const res = await fetch(
    `/api/v1/matches/by-sequence/${sequenceId}?${params}`
  );
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || "Failed to fetch matches");
  }

  return res.json();
}

/**
 * Fetch match statistics (never-occurred counts)
 */
export async function fetchMatchStats(): Promise<MatchStatWithSamples[]> {
  const res = await fetch("/api/v1/match-stats");
  if (!res.ok)
    throw new Error(`Failed to fetch match stats: ${res.statusText}`);
  return res.json();
}

// ===== SCORE API ENDPOINTS =====
const mapSexTypeToApi = (sex: SexType): string | undefined => {
  switch (sex) {
    case "Men and Women":
      return undefined;
    case "Men":
      return "M";
    case "Women":
      return "F";
    default:
      return undefined;
  }
};

/**
 * Fetch matches by set number and score sequence (legacy score endpoint)
 */
export async function fetchScoreMatches(
  setNumber: number,
  scoreSequence: { playerAScore: number; playerBScore: number }[],
  tournament?: Tournament,
  eventYear?: string,
  eventGender?: SexType
): Promise<AggregatedMatchScore[]> {
  const params = new URLSearchParams();

  if (scoreSequence.length > 0) {
    params.append("score_sequence", JSON.stringify(scoreSequence));
  }

  if (tournament && tournament.tournament_id > 0) {
    params.append("tournament_id", tournament.tournament_id.toString());
  }

  if (eventYear && !isNaN(+eventYear)) {
    params.append("event_year", eventYear);
  }

  const mappedGender = eventGender ? mapSexTypeToApi(eventGender) : undefined;
  if (mappedGender) {
    params.append("event_gender", mappedGender);
  }

  const response = await fetch(
    `/api/v1/scores/${setNumber}?${params.toString()}`
  );
  if (!response.ok) {
    throw new Error(`Error fetching matches for set ${setNumber}`);
  }

  return response.json();
}

// ===== TOURNAMENT API ENDPOINTS =====

/**
 * Fetch all tournaments
 */
export async function fetchTournaments(): Promise<Tournament[]> {
  const response = await fetch("/api/v1/tournaments");
  if (!response.ok) {
    throw new Error("Failed to fetch tournaments");
  }
  return response.json();
}

/**
 * Fetch tournament groups (grouped by event type)
 */
export async function fetchTournamentGroups(): Promise<TournamentGroup[]> {
  const response = await fetch("/api/v1/tournaments");
  if (!response.ok) {
    throw new Error("Failed to fetch tournament groups");
  }
  return response.json();
}
