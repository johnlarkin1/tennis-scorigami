import {
  selectedSetsAtom,
  selectedSexAtom,
  selectedYearAtom,
} from "@/components/graph/controls/game-controls";
import type { EdgeDTO, NodeDTO } from "@/lib/types";
import { useGraphContext } from "@/providers/graph-provider";
import { selectedTournamentAtom } from "@/store/tournament";
import { convertSexFilter, convertYearFilter } from "@/utils/filter-converters";
import { useAtom } from "jotai";
import { useEffect } from "react";

const ROOT_ID = 0;

export const useGraphData = () => {
  const { setData, setLoading } = useGraphContext();

  const [selectedYear] = useAtom(selectedYearAtom);
  const [selectedSex] = useAtom(selectedSexAtom);
  const [selectedSets] = useAtom(selectedSetsAtom);
  const [selectedTournament] = useAtom(selectedTournamentAtom);

  useEffect(() => {
    async function fetchGraph() {
      setLoading(true);
      try {
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
        const { nodes: rawNodes, edges: rawEdges } =
          (await response.json()) as {
            nodes: NodeDTO[];
            edges: EdgeDTO[];
          };

        // Dedupe & sanitize edges
        const deduped = Array.from(
          new Map(rawEdges.map((e) => [`${e.frm}-${e.to}`, e])).values()
        );
        const nodeIds = new Set(rawNodes.map((n) => n.id));
        const valid = deduped.filter(
          (e) => nodeIds.has(e.frm) && nodeIds.has(e.to)
        );

        // Remap to graph format
        let nodes = rawNodes.slice();
        let links = valid.map((e) => ({ source: e.frm, target: e.to }));

        // Inject love-all root if not present
        if (!nodes.some((n) => n.depth === 0)) {
          nodes = [
            {
              id: ROOT_ID,
              slug: "love-all",
              played: false,
              depth: 0,
              occurrences: 0,
              norm: 0,
            },
            ...nodes,
          ];
          const rootLinks = nodes
            .filter((n) => n.depth === 1)
            .map((n) => ({ source: ROOT_ID, target: n.id }));
          links = [...rootLinks, ...links];
        }

        setData({ nodes, links });
      } catch (error) {
        console.error("Failed to fetch graph data:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchGraph();
  }, [
    selectedYear,
    selectedSex,
    selectedSets,
    selectedTournament,
    setData,
    setLoading,
  ]);
};
