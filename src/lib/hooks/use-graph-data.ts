import {
  selectedSetsAtom,
  selectedSexAtom,
  selectedYearAtom,
} from "@/components/graph/controls/graph-controls";
import { fetchGraphData } from "@/lib/api-client";
import { useGraphContext } from "@/providers/graph-provider";
import { selectedTournamentAtom } from "@/store/tournament";
import { useAtom } from "jotai";
import { useEffect } from "react";

export const useGraphData = () => {
  const { setData, setLoading } = useGraphContext();

  const [selectedYear] = useAtom(selectedYearAtom);
  const [selectedSex] = useAtom(selectedSexAtom);
  const [selectedSets] = useAtom(selectedSetsAtom);
  const [selectedTournament] = useAtom(selectedTournamentAtom);

  useEffect(() => {
    async function loadGraphData() {
      setLoading(true);
      try {
        const { nodes, edges } = await fetchGraphData({
          selectedYear,
          selectedSex,
          selectedSets,
          selectedTournament,
        });

        // Dedupe & sanitize edges
        const deduped = Array.from(
          new Map(edges.map((e) => [`${e.frm}-${e.to}`, e])).values()
        );
        const nodeIds = new Set(nodes.map((n) => n.id));
        const valid = deduped.filter(
          (e) => nodeIds.has(e.frm) && nodeIds.has(e.to)
        );

        // Convert to links format for 3D graph
        const links = valid.map((e) => ({ source: e.frm, target: e.to }));

        setData({ nodes, edges: valid, links });
      } catch (error) {
        console.error("Failed to fetch graph data:", error);
      } finally {
        setLoading(false);
      }
    }

    loadGraphData();
  }, [
    selectedYear,
    selectedSex,
    selectedSets,
    selectedTournament,
    setData,
    setLoading,
  ]);
};
