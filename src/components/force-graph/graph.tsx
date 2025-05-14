"use client";

import { useAtom } from "jotai";
import { useEffect, useRef } from "react";

// Import atoms from controls
import { atom } from "jotai";
const graphLayoutAtom = atom<"3d" | "2d">("3d");
const showLabelsAtom = atom(true);
const graphColorModeAtom = atom<"category" | "gradient">("category");
const graphDensityAtom = atom(50);
const nodeStrengthAtom = atom(50);

// Import filter atoms from tree controls
import {
  selectedSexAtom,
  selectedYearAtom,
} from "@/store/scoreigami/tree-controls";

export const ForceGraph = () => {
  const containerRef = useRef<HTMLDivElement>(null);

  // Graph settings from atoms
  const [graphLayout] = useAtom(graphLayoutAtom);
  const [showLabels] = useAtom(showLabelsAtom);
  const [colorMode] = useAtom(graphColorModeAtom);
  const [graphDensity] = useAtom(graphDensityAtom);
  const [nodeStrength] = useAtom(nodeStrengthAtom);

  // Filters
  const [selectedYear] = useAtom(selectedYearAtom);
  const [selectedSex] = useAtom(selectedSexAtom);

  useEffect(() => {
    if (!containerRef.current) return;

    // This is where we would initialize and update the force graph
    // based on the current settings and filters

    console.log("Force Graph Settings:", {
      layout: graphLayout,
      showLabels,
      colorMode,
      density: graphDensity,
      strength: nodeStrength,
      filters: {
        year: selectedYear,
        sex: selectedSex,
      },
    });

    // Cleanup function
    return () => {
      // Clean up any graph instance on unmount
    };
  }, [
    graphLayout,
    showLabels,
    colorMode,
    graphDensity,
    nodeStrength,
    selectedYear,
    selectedSex,
  ]);

  return (
    <div className="w-full h-full bg-gray-800 relative">
      {/* Graph container */}
      <div ref={containerRef} className="w-full h-full"></div>

      {/* Placeholder content until the graph is implemented */}
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        {/* Simple loading spinner */}
        <div className="relative w-16 h-16 mb-4">
          <div className="absolute w-16 h-16 border-4 border-t-green-500 border-gray-700 rounded-full animate-spin"></div>
        </div>
        <p className="mt-4 text-gray-400 text-lg">3D Force Graph Coming Soon</p>
        <div className="mt-6 text-sm text-gray-500 max-w-md text-center">
          <p>Current settings:</p>
          <p>
            Layout: {graphLayout}, Density: {graphDensity}%, Labels:{" "}
            {showLabels ? "On" : "Off"}
          </p>
          <p>
            Filters: {selectedSex}, {selectedYear}
          </p>
        </div>
      </div>
    </div>
  );
};
