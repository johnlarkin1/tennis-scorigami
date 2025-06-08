import type { EdgeDTO, NodeDTO } from "@/lib/types";
import { convertSexFilter, convertYearFilter } from "@/utils/filter-converters";

const ROOT_ID = 0;

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