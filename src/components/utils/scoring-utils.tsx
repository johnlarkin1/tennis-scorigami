import { POSSIBLE_SCORES } from '@/constants';
import { InitialScore } from '@/types/initial-score';
import { TreeNode } from '@/types/tree-node';

export const buildTreeData = (scoreCounts: Map<string, number>, expandedNodes: string[]): TreeNode => {
  function buildNode(depth: number, path: string[] = []): TreeNode[] {
    if (depth > 5) return [];

    return POSSIBLE_SCORES.map((score) => {
      const currentPath = [...path, score];
      const sequence = currentPath.join(' ');
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
        children: isExpanded && occurred ? buildNode(depth + 1, currentPath) : [],
      };
    });
  }

  return {
    name: 'Love All',
    children: buildNode(1),
    attributes: {
      occurred: true,
      sequence: '',
      isClickable: true,
    },
  };
};

export const getOccurredScoresInitial = (initialScores: InitialScore[]): Map<string, number> => {
  const scoreCounts = new Map<string, number>();

  initialScores.forEach((score) => {
    const sequence = `${score.player_a_scores}-${score.player_b_scores}`;
    scoreCounts.set(sequence, (scoreCounts.get(sequence) || 0) + 1);
  });

  return scoreCounts;
};
