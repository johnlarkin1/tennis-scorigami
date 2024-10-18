'use client';

import { useState, useEffect, useRef } from 'react';
import * as d3 from 'd3';
import { useTheme } from 'next-themes';

interface TennisMatch {
  id: number;
  player1: string;
  player2: string;
  set1_score: string;
  set2_score: string;
  set3_score: string;
  set4_score?: string;
  set5_score?: string;
  tournament: string;
  date: string;
}

interface TreeNode {
  name: string;
  children?: TreeNode[];
  occurred?: boolean;
  _children?: TreeNode[];
  depth?: number;
  x?: number;
  y?: number;
}

const POSSIBLE_SCORES = [
  '6-0',
  '6-1',
  '6-2',
  '6-3',
  '6-4',
  '7-5',
  '7-6',
  '6-7',
  '5-7',
  '4-6',
  '3-6',
  '2-6',
  '1-6',
  '0-6',
];

export default function TennisScorigamiVisualization() {
  const [visualizationType, setVisualizationType] = useState<'radial' | 'horizontal'>('radial');
  const [treeData, setTreeData] = useState<TreeNode>();
  const [selectedNodePath, setSelectedNodePath] = useState<string[]>([]);
  const [matchesForSelectedNode, setMatchesForSelectedNode] = useState<TennisMatch[]>([]);
  const { resolvedTheme } = useTheme();

  useEffect(() => {
    fetchMatches().then((data) => setTreeData(data));
  }, []);

  useEffect(() => {
    if (matches.length > 0) {
      const occurredScores = getOccurredScores(matches);
      const treeData: TreeNode = {
        name: 'Love All',
        children: buildScoreTree(1, 5, occurredScores),
      };
      renderTree(treeData);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [matches, visualizationType]);

  async function fetchMatches(): Promise<TennisMatch[]> {
    // Replace this with your actual data fetching logic
    return [
      // Sample data
      {
        id: 1,
        player1: 'Federer',
        player2: 'Nadal',
        set1_score: '6-4',
        set2_score: '6-4',
        set3_score: '6-4',
        tournament: 'Wimbledon',
        date: '2023-07-01',
      },
      // Add more matches
    ];
  }

  function getOccurredScores(matches: TennisMatch[]): Set<string> {
    const occurredScores = new Set<string>();

    matches.forEach((match) => {
      const scores = [match.set1_score, match.set2_score, match.set3_score, match.set4_score, match.set5_score].filter(
        Boolean
      ) as string[];

      for (let i = 1; i <= scores.length; i++) {
        occurredScores.add(scores.slice(0, i).join(' '));
      }
    });

    return occurredScores;
  }

  function buildScoreTree(depth: number, maxDepth: number, matchScores: Set<string>, path: string[] = []): TreeNode[] {
    if (depth > maxDepth) return [];

    return POSSIBLE_SCORES.map((score) => {
      const currentPath = [...path, score];
      const occurred = matchScores.has(currentPath.join(' '));

      return {
        name: score,
        occurred,
        children: occurred ? undefined : buildScoreTree(depth + 1, maxDepth, matchScores, currentPath),
        _children: occurred ? [] : undefined,
      };
    });
  }

  function renderTree(data: TreeNode) {
    if (!svgRef.current) return;

    const width = 1000;
    const height = 800;

    d3.select(svgRef.current).selectAll('*').remove();

    const svg = d3
      .select(svgRef.current)
      .attr('width', width)
      .attr('height', height)
      .call(
        d3.zoom<SVGSVGElement, unknown>().on('zoom', (event) => {
          svgGroup.attr('transform', event.transform);
        })
      );

    const svgGroup = svg.append('g');

    const root = d3.hierarchy<TreeNode>(data);
    root.x0 = height / 2;
    root.y0 = 0;

    let i = 0;

    // Collapse after the second level
    root.children?.forEach(collapse);

    update(root);

    function update(source: d3.HierarchyPointNode<TreeNode>) {
      const duration = 750;

      // Compute the new tree layout.
      let treeLayout;
      if (visualizationType === 'radial') {
        treeLayout = d3.tree<TreeNode>().size([2 * Math.PI, Math.min(width, height) / 2 - 100]);
      } else {
        treeLayout = d3.tree<TreeNode>().size([height, width - 200]);
      }

      const nodes = root.descendants();
      const links = root.links();

      treeLayout(root);

      if (visualizationType === 'radial') {
        nodes.forEach((d: any) => {
          d.x = (d.x * 180) / Math.PI;
          d.y = d.y;
        });
      } else {
        nodes.forEach((d: any) => {
          d.x = d.x;
          d.y = d.y;
        });
      }

      /*** Nodes Section ***/
      const node = svgGroup.selectAll('g.node').data(nodes, (d: any) => d.id || (d.id = ++i));

      const nodeEnter = node
        .enter()
        .append('g')
        .attr('class', 'node')
        .attr('transform', (d) => {
          if (visualizationType === 'radial') {
            const angle = (source.x0 || 0) * (Math.PI / 180);
            const radius = source.y0 || 0;
            return `translate(${radius * Math.cos(angle)},${radius * Math.sin(angle)})`;
          } else {
            return `translate(${source.y0},${source.x0})`;
          }
        })
        .on('click', onNodeClick);

      nodeEnter
        .append('circle')
        .attr('r', 1e-6)
        .attr('fill', (d) => (d.data.occurred ? 'green' : 'black'));

      nodeEnter
        .append('text')
        .attr('dy', '.35em')
        .attr('x', (d) => {
          if (visualizationType === 'radial') {
            return d.x < 180 ? 10 : -10;
          } else {
            return d.children || d._children ? -13 : 13;
          }
        })
        .attr('text-anchor', (d) => {
          if (visualizationType === 'radial') {
            return d.x < 180 ? 'start' : 'end';
          } else {
            return d.children || d._children ? 'end' : 'start';
          }
        })
        .attr('transform', (d) => {
          if (visualizationType === 'radial') {
            return d.x >= 180 ? 'rotate(180)' : null;
          } else {
            return null;
          }
        })
        .text((d) => d.data.name);

      const nodeUpdate = nodeEnter.merge(node);

      nodeUpdate
        .transition()
        .duration(duration)
        .attr('transform', (d) => {
          if (visualizationType === 'radial') {
            const angle = d.x * (Math.PI / 180);
            const radius = d.y;
            return `translate(${radius * Math.cos(angle)},${radius * Math.sin(angle)})`;
          } else {
            return `translate(${d.y},${d.x})`;
          }
        });

      nodeUpdate.select('circle').attr('r', 5);

      node
        .exit()
        .transition()
        .duration(duration)
        .attr('transform', (d) => {
          if (visualizationType === 'radial') {
            const angle = (source.x || 0) * (Math.PI / 180);
            const radius = source.y || 0;
            return `translate(${radius * Math.cos(angle)},${radius * Math.sin(angle)})`;
          } else {
            return `translate(${source.y},${source.x})`;
          }
        })
        .remove();

      /*** Links Section ***/
      const link = svgGroup.selectAll('path.link').data(links, (d: any) => d.target.id);

      const linkEnter = link
        .enter()
        .insert('path', 'g')
        .attr('class', 'link')
        .attr('d', (d) => {
          const o = { x: source.x0 || 0, y: source.y0 || 0 };
          return diagonal(o, o);
        });

      const linkUpdate = linkEnter.merge(link);

      linkUpdate
        .transition()
        .duration(duration)
        .attr('d', (d) => diagonal(d.source, d.target));

      link
        .exit()
        .transition()
        .duration(duration)
        .attr('d', (d) => {
          const o = { x: source.x || 0, y: source.y || 0 };
          return diagonal(o, o);
        })
        .remove();

      // Store the old positions for transition.
      nodes.forEach((d) => {
        d.x0 = d.x;
        d.y0 = d.y;
      });

      function diagonal(s: any, d: any) {
        if (visualizationType === 'radial') {
          const sa = (s.x || 0) * (Math.PI / 180);
          const sr = s.y || 0;
          const ta = (d.x || 0) * (Math.PI / 180);
          const tr = d.y || 0;
          return `M${sr * Math.cos(sa)},${sr * Math.sin(sa)}L${tr * Math.cos(ta)},${tr * Math.sin(ta)}`;
        } else {
          return `M${s.y},${s.x}C${(s.y + d.y) / 2},${s.x} ${(s.y + d.y) / 2},${d.x} ${d.y},${d.x}`;
        }
      }
    }

    function onNodeClick(event: any, d: any) {
      if (d.children) {
        d._children = d.children;
        d.children = undefined;
      } else {
        d.children = d._children;
        d._children = undefined;
      }

      const path = d
        .ancestors()
        .reverse()
        .map((node: any) => node.data.name);
      path.shift(); // Remove the root node ('Love All')
      setSelectedNodePath(path);

      const matchingMatches = matches.filter((match) => {
        const matchScores = [
          match.set1_score,
          match.set2_score,
          match.set3_score,
          match.set4_score,
          match.set5_score,
        ].filter(Boolean);

        return path.every((score, index) => matchScores[index] === score);
      });

      setMatchesForSelectedNode(matchingMatches);

      update(d);
    }

    function collapse(d: any) {
      if (d.children) {
        d._children = d.children;
        d._children.forEach(collapse);
        d.children = undefined;
      }
    }
  }

  return (
    <div className='p-4 bg-gray-100 dark:bg-gray-900 min-h-screen'>
      <h1 className='text-3xl font-bold mb-6 text-center text-gray-800 dark:text-gray-100'>Tennis Scorigami</h1>
      <div className='flex justify-center mb-4'>
        <button
          className={`px-4 py-2 mx-2 rounded ${
            visualizationType === 'radial' ? 'bg-blue-500 text-white' : 'bg-gray-200'
          }`}
          onClick={() => setVisualizationType('radial')}
        >
          Radial View
        </button>
        <button
          className={`px-4 py-2 mx-2 rounded ${
            visualizationType === 'horizontal' ? 'bg-blue-500 text-white' : 'bg-gray-200'
          }`}
          onClick={() => setVisualizationType('horizontal')}
        >
          Horizontal View
        </button>
      </div>
      <div className='flex flex-col md:flex-row bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden'>
        <div className='w-full md:w-3/4 h-[600px] border-b md:border-b-0 md:border-r border-gray-200 dark:border-gray-700 overflow-auto'>
          <svg ref={svgRef} className='w-full h-full' />
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
                    <li key={match.id} className='p-4 bg-gray-200 dark:bg-gray-700 rounded-lg'>
                      <p>
                        <strong className='text-gray-700 dark:text-gray-400'>
                          {match.player1} vs {match.player2}
                        </strong>
                      </p>
                      <p className='text-sm text-gray-600 dark:text-gray-400'>
                        {match.tournament} - {match.date}
                      </p>
                      <p className='mt-2'>
                        <strong>Scores:</strong>{' '}
                        {[match.set1_score, match.set2_score, match.set3_score, match.set4_score, match.set5_score]
                          .filter(Boolean)
                          .map((score, index) => {
                            const isHighlighted = selectedNodePath[index] === score;
                            return (
                              <span key={index} className={isHighlighted ? 'text-green-600 font-bold' : ''}>
                                {score}{' '}
                              </span>
                            );
                          })}
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
    </div>
  );
}
