'use client';

import { useState, useEffect, useRef } from 'react';
import { ThemeToggle } from 'components/ThemeToggle';
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
  match?: TennisMatch;
}

const stubbedMatches: TennisMatch[] = [
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
  {
    id: 2,
    player1: 'Djokovic',
    player2: 'Murray',
    set1_score: '6-4',
    set2_score: '5-7',
    set3_score: '6-4',
    set4_score: '6-4',
    tournament: 'US Open',
    date: '2023-09-01',
  },
  {
    id: 3,
    player1: 'Nadal',
    player2: 'Djokovic',
    set1_score: '6-4',
    set2_score: '4-6',
    set3_score: '6-4',
    set4_score: '5-7',
    set5_score: '7-5',
    tournament: 'French Open',
    date: '2023-06-01',
  },
  {
    id: 4,
    player1: 'Medvedev',
    player2: 'Zverev',
    set1_score: '7-6',
    set2_score: '6-4',
    set3_score: '7-5',
    tournament: 'Australian Open',
    date: '2023-01-15',
  },
  {
    id: 5,
    player1: 'Thiem',
    player2: 'Tsitsipas',
    set1_score: '6-4',
    set2_score: '6-4',
    set3_score: '6-7',
    set4_score: '7-6',
    tournament: 'ATP Finals',
    date: '2023-11-20',
  },
];

export default function EnhancedSetScoreVisualization(): JSX.Element {
  const [matches, setMatches] = useState<TennisMatch[]>([]);
  const [selectedMatch, setSelectedMatch] = useState<TennisMatch | null>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const { resolvedTheme, theme } = useTheme();

  useEffect(() => {
    setMatches(stubbedMatches);
  }, []);

  useEffect(() => {
    if (matches.length > 0) {
      renderTree(theme as 'light' | 'dark');
    }
  }, [matches, theme]);

  const buildTreeData = (matches: TennisMatch[]): TreeNode => {
    const root: TreeNode = { name: 'Love All' };

    matches.forEach((match) => {
      let currentNode = root;

      [match.set1_score, match.set2_score, match.set3_score, match.set4_score, match.set5_score]
        .filter(Boolean)
        .forEach((setScore, index) => {
          currentNode.children = currentNode.children || [];
          let child = currentNode.children.find((c) => c.name === setScore);
          if (!child) {
            child = { name: setScore };
            currentNode.children.push(child);
          }
          currentNode = child;

          if (index === 4 || !match[`set${index + 2}_score` as keyof TennisMatch]) {
            child.match = match;
          }
        });
    });

    return root;
  };

  const renderTree = (currentTheme: 'light' | 'dark') => {
    if (!svgRef.current) return;

    const width = svgRef.current.clientWidth;
    const height = svgRef.current.clientHeight;
    const cx = width * 0.5;
    const cy = height * 0.59;
    const radius = Math.min(width, height) / 2 - 60;

    d3.select(svgRef.current).selectAll('*').remove();

    const svg = d3
      .select(svgRef.current)
      .attr('width', width)
      .attr('height', height)
      .attr('viewBox', [-cx, -cy, width, height])
      .attr('style', 'width: 100%; height: 100%; font: 12px sans-serif;')
      .call(
        d3.zoom().on('zoom', (event) => {
          svg.attr('transform', event.transform);
        })
      )
      .append('g');

    const treeData = buildTreeData(matches);

    const tree = d3
      .tree<TreeNode>()
      .size([2 * Math.PI, radius])
      .separation((a, b) => (a.parent === b.parent ? 1 : 2) / a.depth);

    const root = tree(d3.hierarchy(treeData));

    const linkColor = currentTheme === 'dark' ? '#A0AEC0' : '#555';
    const nodeFillColor = currentTheme === 'dark' ? '#4CAF50' : '#4CAF50';
    const textColor = currentTheme === 'dark' ? '#FFFFFF' : '#000000';

    svg
      .append('g')
      .attr('fill', 'none')
      .attr('stroke', linkColor)
      .attr('stroke-opacity', 0.4)
      .attr('stroke-width', 1.5)
      .selectAll('path')
      .data(root.links())
      .join('path')
      .attr(
        'd',
        d3
          .linkRadial<d3.HierarchyPointLink<TreeNode>>()
          .angle((d) => d.x)
          .radius((d) => d.y)
      )
      .attr('stroke', (d) => (d.target.data.match ? nodeFillColor : linkColor));

    const node = svg
      .append('g')
      .selectAll('g')
      .data(root.descendants())
      .join('g')
      .attr('transform', (d) => `rotate(${(d.x * 180) / Math.PI - 90}) translate(${d.y},0)`);

    node
      .append('circle')
      .attr('fill', (d) => (d.data.match ? nodeFillColor : '#999'))
      .attr('r', 4)
      .style('cursor', (d) => (d.data.match ? 'pointer' : 'default'));

    node.selectAll('circle').on('click', (event, d) => {
      if (d.data.match) {
        setSelectedMatch(d.data.match);
      }
    });

    node
      .append('title')
      .text((d) => (d.data.match ? `${d.data.match.player1} vs ${d.data.match.player2}` : d.data.name));

    node
      .append('text')
      .attr('dy', '0.31em')
      .attr('x', (d) => (d.x < Math.PI === !d.children ? 6 : -6))
      .attr('text-anchor', (d) => (d.x < Math.PI === !d.children ? 'start' : 'end'))
      .attr('transform', (d) => (d.x >= Math.PI ? 'rotate(180)' : null))
      .attr('fill', textColor)
      .text((d) => d.data.name);
  };

  return (
    <div className='p-4 bg-gray-100 dark:bg-gray-900 min-h-screen'>
      <h1 className='text-3xl font-bold mb-6 text-center text-gray-800 dark:text-gray-100'>Tennis Scorigami</h1>
      <div className='flex flex-col md:flex-row bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden'>
        <div className='w-full md:w-3/4 h-[600px] border-b md:border-b-0 md:border-r border-gray-200 dark:border-gray-700'>
          <svg ref={svgRef} className='w-full h-full' />
        </div>
        <div className='w-full md:w-1/4 p-6 bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-gray-400'>
          {selectedMatch ? (
            <div>
              <h2 className='text-2xl font-bold mb-4 text-gray-800 dark:text-gray-200'>
                {selectedMatch.player1} vs {selectedMatch.player2}
              </h2>
              <p className='mb-2'>
                <strong className='text-gray-700 dark:text-gray-400'>Tournament:</strong> {selectedMatch.tournament}
              </p>
              <p className='mb-4'>
                <strong className='text-gray-700 dark:text-gray-400'>Date:</strong> {selectedMatch.date}
              </p>
              <h3 className='text-xl font-semibold mb-2 text-gray-800 dark:text-gray-300'>Score:</h3>
              <ul className='space-y-1'>
                <li>
                  <strong className='text-gray-700 dark:text-gray-400'>Set 1:</strong> {selectedMatch.set1_score}
                </li>
                <li>
                  <strong className='text-gray-700 dark:text-gray-400'>Set 2:</strong> {selectedMatch.set2_score}
                </li>
                <li>
                  <strong className='text-gray-700 dark:text-gray-400'>Set 3:</strong> {selectedMatch.set3_score}
                </li>
                {selectedMatch.set4_score && (
                  <li>
                    <strong className='text-gray-700 dark:text-gray-400'>Set 4:</strong> {selectedMatch.set4_score}
                  </li>
                )}
                {selectedMatch.set5_score && (
                  <li>
                    <strong className='text-gray-700 dark:text-gray-400'>Set 5:</strong> {selectedMatch.set5_score}
                  </li>
                )}
              </ul>
            </div>
          ) : (
            <p className='text-gray-600 dark:text-gray-400 italic'>Click on a green node to view match details.</p>
          )}
        </div>
      </div>
      <ThemeToggle />
    </div>
  );
}
