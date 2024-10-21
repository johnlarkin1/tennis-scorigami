'use client';

import { useState, useEffect, useRef } from 'react';
import Tree from 'react-d3-tree';
import { useTheme } from 'next-themes';
import { ThemeToggle } from '@/components/theme-toggle';
import { POSSIBLE_SCORES, SLAMS, YEARS } from '@/constants';
import { TreeControls } from '@/components/scorigami/tree-controls';
import { ViewType } from '@/components/scorigami/tree-control-types';
import { fetchMatches } from '@/api-utils';
import { TreeNode } from '@/types/tree-node';
import { Header } from './header';
import { AggregatedMatchScore } from '@/types/set-score';

const containerStyles = {
  width: '100%',
  height: '100%',
};

export default function TennisScorigamiVisualization() {
  const [matches, setMatches] = useState<AggregatedMatchScore[]>([]);
  const [treeData, setTreeData] = useState<TreeNode | null>(null);
  const [selectedNodePath, setSelectedNodePath] = useState<string[]>([]);
  const [matchesForSelectedNode, setMatchesForSelectedNode] = useState<AggregatedMatchScore[]>([]); // Matches for the selected node
  const [filterSlam, setFilterSlam] = useState<string>('');
  const [filterYear, setFilterYear] = useState<string>('');
  const [showGradient, setShowGradient] = useState<boolean>(false);
  const [showCount, setShowCount] = useState<boolean>(false);
  const [viewType, setViewType] = useState<ViewType>('horizontal');
  const { resolvedTheme } = useTheme();
  const treeContainer = useRef<HTMLDivElement>(null);

  // Fetch aggregated match scores when the component mounts
  useEffect(() => {
    const loadMatches = async () => {
      try {
        const data = await fetchMatches(1);
        setMatches(data);
      } catch (error) {
        console.error('Error loading matches:', error);
      }
    };
    loadMatches();
  }, []);

  useEffect(() => {
    if (matches.length > 0) {
      const filteredMatches = applyFilters(matches);
      const occurredScores = getOccurredScores(filteredMatches);
      const data = buildTreeData(occurredScores);
      setTreeData(data);
    }
  }, [matches, filterSlam, filterYear, showGradient]);

  function applyFilters(matches: AggregatedMatchScore[]): AggregatedMatchScore[] {
    return matches.filter((match) => {
      const matchYear = new Date(match.match_start_time).getFullYear().toString();
      const matchSlam = filterSlam ? match.event_name === filterSlam : true;
      const matchYearMatch = filterYear ? matchYear === filterYear : true;
      return matchSlam && matchYearMatch;
    });
  }

  function getOccurredScores(matches: AggregatedMatchScore[]): Map<string, number> {
    const scoreCounts = new Map<string, number>();

    matches.forEach((match) => {
      const scores = match.player_a_scores.map((aScore, i) => `${aScore}-${match.player_b_scores[i]}`).filter(Boolean); // Create score sequence

      for (let i = 1; i <= scores.length; i++) {
        const sequence = scores.slice(0, i).join(' ');
        scoreCounts.set(sequence, (scoreCounts.get(sequence) || 0) + 1);
      }
    });

    return scoreCounts;
  }

  function buildTreeData(scoreCounts: Map<string, number>): TreeNode {
    function buildNode(depth: number, path: string[] = []): TreeNode[] {
      if (depth > 5) return [];

      return POSSIBLE_SCORES.map((score) => {
        const currentPath = [...path, score];
        const sequence = currentPath.join(' ');
        const count = scoreCounts.get(sequence) || 0;
        const occurred = count > 0;

        return {
          name: score,
          attributes: {
            occurred,
            sequence,
            count,
          },
          children: occurred ? buildNode(depth + 1, currentPath) : [],
        };
      });
    }

    return {
      name: 'Love All',
      children: buildNode(1),
      attributes: {
        occurred: true,
        sequence: '',
      },
    };
  }

  const onNodeClick = (nodeData: any) => {
    const sequence = nodeData.attributes?.sequence;
    if (sequence) {
      const path = sequence.split(' ');
      setSelectedNodePath(path);

      // Extract scores to compare against node path
      const matchingMatches = matches.filter((match) => {
        const matchScores = match.player_a_scores
          .map((aScore, i) => `${aScore}-${match.player_b_scores[i]}`)
          .filter(Boolean); // Create score sequence

        return path.every((score: string, index: number) => matchScores[index] === score);
      });

      setMatchesForSelectedNode(matchingMatches);
    }
  };

  const renderCustomNode = ({ nodeDatum, toggleNode, hierarchyPointNode }: any) => {
    const count = nodeDatum.attributes?.count || 0;
    const occurred = nodeDatum.attributes?.occurred;
    const isDarkMode = resolvedTheme === 'dark';

    const fillColor = occurred
      ? showGradient
        ? isDarkMode
          ? `rgba(0, 255, 0, ${Math.min(count / 10, 0.8)})`
          : `rgba(0, 128, 0, ${Math.min(count / 10, 0.8)})`
        : isDarkMode
        ? 'rgb(0, 200, 0)'
        : 'rgb(0, 128, 0)'
      : isDarkMode
      ? '#444'
      : '#ddd';

    const fontColor = isDarkMode ? '#fff' : '#000';
    const nodeSize = Math.max(20 - hierarchyPointNode.depth * 2, 5);

    return (
      <g>
        <circle
          r={nodeSize}
          fill={fillColor}
          onClick={() => {
            toggleNode();
            if (occurred) {
              onNodeClick(nodeDatum);
            }
          }}
        />
        <text
          fill={fontColor}
          x={hierarchyPointNode.children ? -10 : 10}
          dy={'.35em'}
          textAnchor={hierarchyPointNode.children ? 'end' : 'start'}
          style={{ fontSize: '12px' }}
        >
          {nodeDatum.name}
        </text>
        {showCount && count > 0 && (
          <text
            fill={fontColor}
            x={hierarchyPointNode.children ? -10 : 10}
            dy={'1.5em'}
            textAnchor={hierarchyPointNode.children ? 'end' : 'start'}
            style={{ fontSize: '10px' }}
          >
            {`(${count})`}
          </text>
        )}
      </g>
    );
  };

  return (
    <>
      <Header />
      <div className='p-4 bg-gray-100 dark:bg-gray-900 min-h-screen'>
        <TreeControls
          slams={SLAMS}
          years={YEARS}
          selectedSlam={filterSlam}
          setSelectedSlam={setFilterSlam}
          selectedYear={filterYear}
          setSelectedYear={setFilterYear}
          showGradient={showGradient}
          setShowGradient={setShowGradient}
          showCount={showCount}
          setShowCount={setShowCount}
          viewType={viewType}
          setViewType={setViewType}
        />
        <div
          className='flex flex-col md:flex-row bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden'
          style={{ height: 'calc(100vh - 250px)' }}
        >
          <div
            ref={treeContainer}
            className='w-full md:w-3/4 h-full border-b md:border-b-0 md:border-r border-gray-200 dark:border-gray-700 overflow-auto'
          >
            {treeData ? (
              <div style={containerStyles}>
                <Tree
                  data={treeData}
                  orientation={viewType === 'horizontal' ? 'horizontal' : 'vertical'}
                  pathFunc='diagonal'
                  translate={{ x: 100, y: 300 }}
                  collapsible={true}
                  zoomable={true}
                  nodeSize={{ x: 200, y: 100 }}
                  separation={{ siblings: 1, nonSiblings: 1 }}
                  renderCustomNodeElement={renderCustomNode}
                  rootNodeClassName='node__root'
                  branchNodeClassName='node__branch'
                  leafNodeClassName='node__leaf'
                  styles={{
                    links: {
                      stroke: resolvedTheme === 'dark' ? '#555' : '#ccc',
                      strokeWidth: 2,
                    },
                  }}
                />
              </div>
            ) : (
              <p className='text-gray-700 dark:text-gray-300'>Loading...</p>
            )}
          </div>
          <div className='w-full md:w-1/4 p-6 bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-gray-400 overflow-y-auto'>
            {selectedNodePath.length > 0 ? (
              <div>
                <h2 className='text-2xl font-bold mb-4 text-gray-800 dark:text-gray-200'>
                  Matches with Score Sequence: {selectedNodePath.join(' ')}
                </h2>
                {matchesForSelectedNode.length > 0 ? (
                  <ul className='space-y-4'>
                    {matchesForSelectedNode.map((match) => (
                      <li key={match.match_id} className='p-4 bg-gray-200 dark:bg-gray-700 rounded-lg'>
                        <p>
                          <strong className='text-gray-700 dark:text-gray-300'>
                            {match.player_a_full_name} vs {match.player_b_full_name}
                          </strong>
                        </p>
                        <p className='text-sm text-gray-600 dark:text-gray-400'>
                          {match.event_name} - {match.match_start_time}
                        </p>
                        <p className='mt-2'>
                          <strong>Scores:</strong>{' '}
                          {match.player_a_scores.map((aScore, i) => (
                            <span
                              key={i}
                              className={
                                selectedNodePath[i] === `${aScore}-${match.player_b_scores[i]}`
                                  ? 'text-green-600 dark:text-green-400 font-bold'
                                  : ''
                              }
                            >
                              {aScore}-{match.player_b_scores[i]}{' '}
                            </span>
                          ))}
                        </p>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className='text-gray-600 dark:text-gray-400 italic'>No matches found for this sequence.</p>
                )}
              </div>
            ) : (
              <p className='text-gray-600 dark:text-gray-400 italic'>Click on a node to view match details.</p>
            )}
          </div>
        </div>
        <ThemeToggle />
      </div>
    </>
  );
}
