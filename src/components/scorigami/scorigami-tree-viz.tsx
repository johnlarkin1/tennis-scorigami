"use client";

import { ThemeToggle } from "@/components/layout/theme-toggle";
import { TreeControls } from "@/components/scorigami/controls/tree-controls";
import { MatchDetails } from "@/components/scorigami/match-details";
import { TreeVisualization } from "@/components/scorigami/tree-visualization";
import { useTheme } from "next-themes";
import { useRef, useState } from "react";
import { useTreeData } from "../../lib/hooks/useTreeData";
import { Header } from "../layout/header";

export const TennisScorigamiVisualization = () => {
  const [selectedNodePath, setSelectedNodePath] = useState<string[]>([]);
  const [expandedNodes, setExpandedNodes] = useState<string[]>([]);
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
      <div className="p-4 bg-gray-100 dark:bg-gray-900 min-h-screen">
        <TreeControls />
        <div
          className="flex flex-col md:flex-row bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden"
          style={{ height: "calc(100vh - 250px)" }}
        >
          <div
            ref={treeContainer}
            className="w-full md:w-3/4 h-full border-b md:border-b-0 md:border-r border-gray-200 dark:border-gray-700 overflow-auto"
          >
            {isInitialScoresLoading ? (
              <p className="text-gray-700 dark:text-gray-300">
                Loading initial scores...
              </p>
            ) : isInitialScoresError ? (
              <p className="text-red-600 dark:text-red-400">
                Error loading initial scores!
              </p>
            ) : (
              treeData && (
                <TreeVisualization
                  treeData={treeData}
                  resolvedTheme={resolvedTheme ? resolvedTheme : "dark"}
                  onNodeClick={(path) => setSelectedNodePath(path)}
                />
              )
            )}
          </div>
          <div className="w-full md:w-1/4 p-6 bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-gray-400 overflow-y-auto">
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
};
