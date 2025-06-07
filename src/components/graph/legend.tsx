import type { GraphData } from "@/providers/graph-provider";
import React, { useMemo } from "react";

// Color constants
const DEPTH_COLORS: Record<number, string> = {
  0: "#FF3B30",
  1: "#FF9500",
  2: "#FFD60A",
  3: "#30D158",
  4: "#5AC8FA",
  5: "#BF5AF2",
};

const NEVER_OCCURRED_COLOR = "#dc2626";

const FREQUENCY_LEGEND = [
  { label: "High frequency", color: "hsl(220,80%,30%)" },
  { label: "Medium frequency", color: "hsl(220,80%,60%)" },
  { label: "Low frequency", color: "hsl(220,80%,90%)" },
];

interface LegendProps {
  colorMode: string;
  maxDepth: number;
  data: GraphData;
}

export const Legend: React.FC<LegendProps> = ({
  colorMode,
  maxDepth,
  data,
}) => {
  // Calculate statistics per depth
  const depthStats = useMemo(() => {
    const stats: Record<
      number,
      { count: number; maxOccurrences: number; avgOccurrences: number }
    > = {};

    for (let depth = 0; depth <= maxDepth; depth++) {
      const nodesAtDepth = data.nodes.filter((n) => n.depth === depth);
      const occurrences = nodesAtDepth.map((n) => n.occurrences);

      stats[depth] = {
        count: nodesAtDepth.length,
        maxOccurrences: Math.max(...occurrences, 0),
        avgOccurrences:
          occurrences.length > 0
            ? occurrences.reduce((a, b) => a + b, 0) / occurrences.length
            : 0,
      };
    }

    return stats;
  }, [data, maxDepth]);

  if (colorMode === "category") {
    return (
      <div className="absolute top-4 right-4 bg-gray-800/90 rounded-lg p-4 backdrop-blur-sm max-w-xs shadow-lg z-10">
        <h3 className="text-white text-sm font-semibold mb-3">Score Levels</h3>
        {Array.from({ length: Math.min(maxDepth + 1, 5) }, (_, i) => (
          <div key={i} className="mb-3">
            <div className="flex items-center gap-2 mb-1">
              <div
                className="w-4 h-4 rounded-full"
                style={{ backgroundColor: DEPTH_COLORS[i] }}
              />
              <span className="text-gray-300 text-xs font-medium">
                Depth {i}
                {i === 0 ? " (love-all)" : ""}
              </span>
            </div>
            <div className="text-gray-400 text-xs ml-6">
              {depthStats[i]?.count || 0} scores
              {i > 0 && depthStats[i]?.maxOccurrences > 0 && (
                <span className="block">
                  Max: {depthStats[i].maxOccurrences} occurrences
                </span>
              )}
            </div>
          </div>
        ))}
        <div className="mt-3 pt-3 border-t border-gray-700">
          <div className="flex items-center gap-2 mb-1">
            <div
              className="w-4 h-4 rounded-full"
              style={{ backgroundColor: NEVER_OCCURRED_COLOR }}
            />
            <span className="text-gray-300 text-xs">Never occurred</span>
          </div>
        </div>
      </div>
    );
  } else {
    return (
      <div className="absolute top-4 right-4 bg-gray-800/90 rounded-lg p-4 backdrop-blur-sm shadow-lg z-10">
        <h3 className="text-white text-sm font-semibold mb-3">
          Occurrence Frequency
        </h3>
        <div className="text-gray-400 text-xs mb-3">
          Color intensity shows how often each score occurs
        </div>
        {FREQUENCY_LEGEND.map((item, i) => (
          <div key={i} className="flex items-center gap-2 mb-1">
            <div
              className="w-4 h-4 rounded-full"
              style={{ backgroundColor: item.color }}
            />
            <span className="text-gray-300 text-xs">{item.label}</span>
          </div>
        ))}
        <div className="mt-3 pt-3 border-t border-gray-700">
          <div className="flex items-center gap-2 mb-1">
            <div
              className="w-4 h-4 rounded-full"
              style={{ backgroundColor: NEVER_OCCURRED_COLOR }}
            />
            <span className="text-gray-300 text-xs">Never occurred</span>
          </div>
        </div>
      </div>
    );
  }
};
