'use client';

import { useState, useRef } from 'react';
import { useTheme } from 'next-themes';
import { ThemeToggle } from '@/components/theme-toggle';
import { TreeControls } from '@/components/scorigami/controls/tree-controls';
import { ViewType } from '@/components/scorigami/controls/tree-control-types';
import { Header } from './header';
import { useTreeData } from './hooks/useTreeData';
import { TreeVisualization } from '@/components/scorigami/tree-visualization';
import { MatchDetails } from '@/components/match-details';
import { selectedSexAtom, selectedYearAtom } from './atoms/scorigami-options-atom';
import { selectedTournamentAtom } from './atoms/tournament-atom';
import { useAtom } from 'jotai';

export default function TennisScorigamiVisualization() {
  const [selectedNodePath, setSelectedNodePath] = useState<string[]>([]);
  const [expandedNodes, setExpandedNodes] = useState<string[]>([]);
  const [showGradient, setShowGradient] = useState<boolean>(false);
  const [showCount, setShowCount] = useState<boolean>(false);
  const [viewType, setViewType] = useState<ViewType>('horizontal');
  const { resolvedTheme } = useTheme();
  const treeContainer = useRef<HTMLDivElement>(null);

  const {
    treeData,
    matchesForSelectedNode,
    isInitialScoresLoading,
    isDetailedMatchesLoading,
    isInitialScoresError,
    isDetailedMatchesError,
  } = useTreeData({
    selectedNodePath,
    expandedNodes,
    setExpandedNodes,
    setSelectedNodePath,
  });

  return (
    <>
      <Header />
      <div className='p-4 bg-gray-100 dark:bg-gray-900 min-h-screen'>
        <TreeControls
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
            {isInitialScoresLoading ? (
              <p className='text-gray-700 dark:text-gray-300'>Loading initial scores...</p>
            ) : isInitialScoresError ? (
              <p className='text-red-600 dark:text-red-400'>Error loading initial scores!</p>
            ) : (
              treeData && (
                <TreeVisualization
                  treeData={treeData}
                  viewType={viewType}
                  resolvedTheme={resolvedTheme}
                  showGradient={showGradient}
                  showCount={showCount}
                  onNodeClick={(path) => setSelectedNodePath(path)}
                />
              )
            )}
          </div>
          <div className='w-full md:w-1/4 p-6 bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-gray-400 overflow-y-auto'>
            <MatchDetails
              selectedNodePath={selectedNodePath}
              matchesForSelectedNode={matchesForSelectedNode}
              isDetailedMatchesLoading={isDetailedMatchesLoading}
              isDetailedMatchesError={isDetailedMatchesError}
            />
          </div>
        </div>
        <ThemeToggle />
      </div>
    </>
  );
}
