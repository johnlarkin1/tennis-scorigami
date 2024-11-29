import { POSSIBLE_SCORES, REACT_QUERY_STALE_TIME_MIN } from "@/constants";
import { fetchInitialScores, fetchMatches } from "@/services/api-utils";
import {
  selectedSexAtom,
  selectedYearAtom,
} from "@/store/scoreigami/tree-controls";
import { selectedTournamentAtom } from "@/store/tournament";
import { InitialScore } from "@/types/initial-score";
import { AggregatedMatchScore } from "@/types/set-score";
import { TreeNode } from "@/types/tree-node";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { useAtom } from "jotai";
import { useEffect, useState } from "react";
import { buildTreeData, getOccurredScoresInitial } from "../utils/scoring";

type UseTreeDataProps = {
  selectedNodePath: string[];
  expandedNodes: string[];
  setExpandedNodes: React.Dispatch<React.SetStateAction<string[]>>;
  setSelectedNodePath: (path: string[]) => void;
};

export const useTreeData = ({
  selectedNodePath,
  expandedNodes,
  setExpandedNodes,
  setSelectedNodePath,
}: UseTreeDataProps) => {
  const [selectedTournament] = useAtom(selectedTournamentAtom);
  const [selectedYear] = useAtom(selectedYearAtom);
  const [selectedSex] = useAtom(selectedSexAtom);
  const [treeData, setTreeData] = useState<TreeNode | null>(null);
  const [matchesForSelectedNode, setMatchesForSelectedNode] = useState<
    AggregatedMatchScore[]
  >([]);

  const {
    data: initialScores = [],
    isLoading: isInitialScoresLoading,
    isError: isInitialScoresError,
  } = useQuery<InitialScore[]>({
    queryKey: ["initial-scores", selectedTournament, selectedYear],
    queryFn: () => fetchInitialScores(selectedTournament, selectedYear),
    staleTime: REACT_QUERY_STALE_TIME_MIN,
    placeholderData: [],
  });

  const {
    isLoading: isDetailedMatchesLoading,
    isError: isDetailedMatchesError,
  } = useQuery<AggregatedMatchScore[]>({
    queryKey: ["matches", selectedNodePath],
    queryFn: async () => {
      if (selectedNodePath.length > 0) {
        const setNumber = selectedNodePath.length;
        const scoreSequence = selectedNodePath.map((scoreString) => {
          const [playerAScore, playerBScore] = scoreString
            .split("-")
            .map(Number);
          return { playerAScore, playerBScore };
        });

        const matches = await fetchMatches(
          setNumber,
          scoreSequence,
          selectedTournament,
          selectedYear,
          selectedSex
        );
        setMatchesForSelectedNode(matches);

        // Aggregate next possible scores from the matches and expand the tree
        expandTreeWithNextScores(matches, setNumber);

        return matches;
      }
      setMatchesForSelectedNode([]);
      return [];
    },
    enabled: selectedNodePath.length > 0,
    staleTime: REACT_QUERY_STALE_TIME_MIN,
    placeholderData: keepPreviousData,
  });

  // Expand the tree with next possible scores
  const expandTreeWithNextScores = (
    matches: AggregatedMatchScore[],
    setNumber: number
  ) => {
    const nextScoresMap: Map<string, boolean> = new Map();

    // Aggregate the next possible scores and mark whether they occurred
    matches.forEach((match) => {
      if (match.player_a_scores.length > setNumber) {
        const nextAScore = match.player_a_scores[setNumber];
        const nextBScore = match.player_b_scores[setNumber];
        const nextScore = `${nextAScore}-${nextBScore}`;
        nextScoresMap.set(nextScore, true); // Mark score as "occurred"
      }
    });

    // Ensure all possible scores are represented
    POSSIBLE_SCORES.forEach((score) => {
      if (!nextScoresMap.has(score)) {
        nextScoresMap.set(score, false); // Mark score as "not occurred"
      }
    });

    // Update the tree data with these next scores
    setTreeData((prevTreeData) => {
      if (!prevTreeData) return prevTreeData;

      const updateTreeWithNextScores = (node: TreeNode): TreeNode => {
        const sequence = node.attributes?.sequence || "";

        if (sequence === selectedNodePath.join(" ")) {
          return {
            ...node,
            children: [...nextScoresMap.entries()].map(([score, occurred]) => ({
              name: score,
              attributes: {
                occurred, // This will be used to determine the color (green for occurred, grey for not occurred)
                sequence: `${sequence} ${score}`.trim(),
                isClickable: true,
              },
              children: [],
            })),
          };
        }

        return {
          ...node,
          children: node.children?.map(updateTreeWithNextScores),
        };
      };

      return updateTreeWithNextScores(prevTreeData);
    });
  };

  useEffect(() => {
    if (Array.isArray(initialScores) && initialScores.length > 0) {
      const occurredScores = getOccurredScoresInitial(initialScores);
      const data = buildTreeData(occurredScores, expandedNodes);
      setTreeData(data);
    }
  }, [initialScores, expandedNodes]);

  const handleNodeClick = (path: string[]) => {
    if (path.length < 5) {
      setSelectedNodePath(path);
    }
  };
  const toggleNodeExpansion = (sequence: string) => {
    setExpandedNodes((prev: string[]) =>
      prev.includes(sequence)
        ? prev.filter((node: string) => node !== sequence)
        : [...prev, sequence]
    );
  };

  return {
    treeData,
    matchesForSelectedNode,
    isInitialScoresLoading,
    isDetailedMatchesLoading,
    isInitialScoresError,
    isDetailedMatchesError,
    handleNodeClick,
    toggleNodeExpansion,
  };
};
