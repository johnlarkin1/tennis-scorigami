'use client';

import { useState, useEffect, useRef } from 'react';
import * as d3 from 'd3';
import { useTheme } from 'next-themes';

const TOTAL_SETS = 5;
const POSSIBLE_SCORES = [
  '0-0',
  '1-0',
  '2-0',
  '3-0',
  '4-0',
  '5-0',
  '6-0',
  '7-0',
  '6-1',
  '7-5',
  '7-6',
  '6-2',
  '6-4',
  '6-3', // Common tennis scores
];

interface TennisMatch {
  id: number;
  player1: string;
  player2: string;
  tournament: string;
  date: string;
  scores: string[];
}

const matchesData: TennisMatch[] = [
  {
    id: 1,
    player1: 'Federer',
    player2: 'Nadal',
    tournament: 'French Open',
    date: '2023-07-01',
    scores: ['6-4', '6-4', '6-4'],
  },
  {
    id: 2,
    player1: 'Djokovic',
    player2: 'Federer',
    tournament: 'Australian Open',
    date: '2023-01-29',
    scores: ['7-5', '6-7', '7-5', '6-4', '6-3'],
  },
  // More matches...
];

export default function ScorigamiTreeVisualization() {
  const [selectedScore, setSelectedScore] = useState<string | null>(null);
  const [filteredMatches, setFilteredMatches] = useState<TennisMatch[]>([]);
  const svgRef = useRef<SVGSVGElement>(null);
  const { resolvedTheme } = useTheme();

  useEffect(() => {
    renderRings();
  }, [selectedScore, resolvedTheme]);

  const renderRings = () => {
    const width = 800;
    const height = 800;
    const radius = Math.min(width, height) / 2 - 60;
    const ringRadius = radius / TOTAL_SETS;

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    const g = svg
      .attr('width', width)
      .attr('height', height)
      .attr('viewBox', `-400 -400 800 800`)
      .append('g')
      .attr('transform', `translate(${0},${0})`);

    for (let setIndex = 0; setIndex < TOTAL_SETS; setIndex++) {
      const setRadius = ringRadius * (setIndex + 1);

      POSSIBLE_SCORES.forEach((score, i) => {
        const angle = (i / POSSIBLE_SCORES.length) * 2 * Math.PI;
        const x = setRadius * Math.cos(angle);
        const y = setRadius * Math.sin(angle);

        const matchExists = matchesData.some((match) => match.scores[setIndex] === score);

        g.append('circle')
          .attr('cx', x)
          .attr('cy', y)
          .attr('r', 12)
          .attr('fill', matchExists ? (resolvedTheme === 'dark' ? '#4CAF50' : '#1E90FF') : '#e0e0e0')
          .attr('stroke', matchExists ? '#333' : 'none')
          .attr('class', 'score-node')
          .style('cursor', matchExists ? 'pointer' : 'default')
          .on('click', () => {
            if (matchExists) {
              setSelectedScore(score);
              setFilteredMatches(matchesData.filter((match) => match.scores[setIndex] === score));
            }
          });

        g.append('text')
          .attr('x', x)
          .attr('y', y + 4)
          .attr('text-anchor', 'middle')
          .attr('fill', resolvedTheme === 'dark' ? '#fff' : '#333')
          .attr('font-size', '10px')
          .text(score);
      });
    }
  };

  return (
    <div className='p-4 bg-gray-100 dark:bg-gray-900 min-h-screen'>
      <h1 className='text-3xl font-bold mb-6 text-center text-gray-800 dark:text-gray-100'>
        Tennis Set Score Visualization
      </h1>
      <div className='flex flex-col md:flex-row bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden'>
        <div className='w-full md:w-3/4 h-[600px] border-b md:border-b-0 md:border-r border-gray-200 dark:border-gray-700'>
          <svg ref={svgRef} className='w-full h-full' />
        </div>
        <div className='w-full md:w-1/4 p-6 bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-gray-400'>
          {selectedScore ? (
            <div>
              <h2 className='text-2xl font-bold mb-4 text-gray-800 dark:text-gray-200'>
                Matches with Score: {selectedScore}
              </h2>
              <ul className='space-y-2'>
                {filteredMatches.map((match) => (
                  <li key={match.id} className='p-2 bg-gray-200 dark:bg-gray-700 rounded-lg'>
                    <p>
                      <strong className='text-gray-700 dark:text-gray-400'>
                        {match.player1} vs {match.player2}
                      </strong>
                    </p>
                    <p className='text-sm text-gray-600 dark:text-gray-400'>
                      {match.tournament} - {match.date}
                    </p>
                  </li>
                ))}
              </ul>
            </div>
          ) : (
            <p className='text-gray-600 dark:text-gray-400 italic'>Click on a score to view matches.</p>
          )}
        </div>
      </div>
    </div>
  );
}
