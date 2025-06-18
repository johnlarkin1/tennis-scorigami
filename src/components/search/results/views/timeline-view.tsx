"use client";

import { motion } from "framer-motion";
import { SearchResult } from "@/lib/types/search-types";

interface TimelineViewProps {
  matches: SearchResult[];
  onResultSelect: (result: SearchResult) => void;
  selectedResult: SearchResult | null;
}

export function TimelineView({
  matches,
  onResultSelect,
  selectedResult,
}: TimelineViewProps) {
  const sortedByDate = [...matches].sort((a, b) => {
    const dateA = a.match_data?.match_start_time || "";
    const dateB = b.match_data?.match_start_time || "";
    return new Date(dateA).getTime() - new Date(dateB).getTime();
  });

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.4 }}
      className="space-y-6"
    >
      {sortedByDate.map((result, index) => {
        const match = result.match_data;
        if (!match) return null;

        const isWinnerPlayerA = match.winner_id === match.player_a_id;
        const winnerName = isWinnerPlayerA
          ? match.player_a_name
          : match.player_b_name;
        const loserName = !isWinnerPlayerA
          ? match.player_a_name
          : match.player_b_name;

        return (
          <motion.div
            key={result.id}
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            className="flex gap-6"
          >
            {/* Timeline indicator */}
            <div className="flex flex-col items-center">
              <div className="w-4 h-4 bg-green-500 rounded-full border-2 border-gray-900" />
              {index < sortedByDate.length - 1 && (
                <div className="w-px h-24 bg-gray-700 mt-2" />
              )}
            </div>

            {/* Match content */}
            <div
              className={`flex-1 bg-gray-900/50 backdrop-blur-sm border rounded-lg p-4 hover:border-green-500/50 transition-colors cursor-pointer ${
                selectedResult?.id === result.id
                  ? "border-green-500/70"
                  : "border-gray-700"
              }`}
              onClick={() => onResultSelect(result)}
            >
              <div className="flex justify-between items-start mb-3">
                <div>
                  <div className="text-sm text-gray-400 mb-1">
                    {match.match_start_time &&
                      new Date(match.match_start_time).toLocaleDateString()}
                  </div>
                  <div className="font-semibold text-lg">
                    {winnerName} def. {loserName}
                  </div>
                  <div className="text-gray-400 text-sm">
                    {match.event_name} • {match.round_name || "Round"}
                  </div>
                </div>
                {match.is_scorigami && (
                  <span className="bg-green-500/20 text-green-400 text-xs px-2 py-1 rounded-full border border-green-500/30">
                    SCORIGAMI
                  </span>
                )}
              </div>
              <div className="font-mono text-green-400 mb-2">
                {match.score || match.raw_score || "Score Available"}
              </div>
              <div className="flex gap-4 text-xs text-gray-400">
                <span>{match.surface_type || "Hard"}</span>
                <span>Best of {match.best_of || 3}</span>
              </div>
            </div>
          </motion.div>
        );
      })}
    </motion.div>
  );
}
