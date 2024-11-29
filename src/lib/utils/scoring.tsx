import { POSSIBLE_SCORES } from "@/constants";
import { InitialScore } from "@/types/initial-score";
import { TreeNode } from "@/types/tree-node";

export const buildTreeData = (
  scoreCounts: Map<string, number>,
  expandedNodes: string[]
): TreeNode => {
  function buildNode(depth: number, path: string[] = []): TreeNode[] {
    if (depth > 5) return [];

    return POSSIBLE_SCORES.map((score) => {
      const currentPath = [...path, score];
      const sequence = currentPath.join(" ");
      const count = scoreCounts.get(sequence) || 0;
      const occurred = count > 0;
      const isExpanded = expandedNodes.includes(sequence);

      return {
        name: score,
        attributes: {
          occurred,
          sequence,
          count,
          isClickable: occurred && depth === 1, // Only first-level nodes are clickable initially
        },
        children:
          isExpanded && occurred ? buildNode(depth + 1, currentPath) : [],
      };
    });
  }

  return {
    name: "Love All",
    children: buildNode(1),
    attributes: {
      occurred: true,
      sequence: "",
      isClickable: true,
    },
  };
};

export const getOccurredScoresInitial = (
  initialScores: InitialScore[]
): Map<string, number> => {
  const scoreCounts = new Map<string, number>();

  initialScores.forEach((score) => {
    const sequence = `${score.player_a_scores}-${score.player_b_scores}`;
    scoreCounts.set(sequence, (scoreCounts.get(sequence) || 0) + 1);
  });

  return scoreCounts;
};

export const isMatchComplete = (scores: string[]): boolean => {
  if (!scores.length) return false;

  let playerAWins = 0;
  let playerBWins = 0;

  scores.forEach((score) => {
    const [scoreA, scoreB] = score.split("-").map(Number);
    if (scoreA > scoreB) playerAWins++;
    else if (scoreB > scoreA) playerBWins++;
  });

  // Check for match completion (best of 5 or best of 3)
  return (
    playerAWins >= 3 ||
    playerBWins >= 3 || // Best of 5 completion
    (scores.length >= 2 && (playerAWins >= 2 || playerBWins >= 2))
  ); // Best of 3 completion
};

// Function to parse set scores from sequence
export const parseSetScores = (sequence: string): string[] => {
  return sequence.split(" ").filter(Boolean);
};
