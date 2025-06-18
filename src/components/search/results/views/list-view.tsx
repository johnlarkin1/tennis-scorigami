"use client";

import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { SearchResult } from "@/lib/types/search-types";
import { motion } from "framer-motion";
import { Award, ExternalLink, Eye } from "lucide-react";

interface ListViewProps {
  matches: SearchResult[];
  onResultSelect: (result: SearchResult) => void;
  selectedResult: SearchResult | null;
}

export function ListView({
  matches,
  onResultSelect,
  selectedResult,
}: ListViewProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.4 }}
      className="bg-gray-900/50 backdrop-blur-sm border border-gray-700 rounded-lg overflow-hidden"
    >
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-700">
              <th className="text-left p-4 text-sm font-medium text-gray-400">
                Match
              </th>
              <th className="text-left p-4 text-sm font-medium text-gray-400">
                Score
              </th>
              <th className="text-left p-4 text-sm font-medium text-gray-400">
                Tournament
              </th>
              <th className="text-left p-4 text-sm font-medium text-gray-400">
                Date
              </th>
              <th className="text-left p-4 text-sm font-medium text-gray-400">
                Surface
              </th>
              <th className="text-left p-4 text-sm font-medium text-gray-400">
                Round
              </th>
              <th className="text-center p-4 text-sm font-medium text-gray-400">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {matches.map((result, index) => {
              const match = result.match_data;
              if (!match) return null;

              const isWinnerPlayerA = match.winner_id === match.player_a_id;

              return (
                <motion.tr
                  key={result.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className={`border-b border-gray-800 hover:bg-gray-800/50 transition-colors cursor-pointer ${
                    selectedResult?.id === result.id ? "bg-green-500/10" : ""
                  }`}
                  onClick={() => onResultSelect(result)}
                >
                  <td className="p-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span
                          className={`font-medium ${
                            isWinnerPlayerA ? "text-green-400" : "text-gray-300"
                          }`}
                        >
                          {match.player_a_name}
                        </span>
                        {isWinnerPlayerA && (
                          <Award className="h-3 w-3 text-green-400" />
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <span
                          className={`font-medium ${
                            !isWinnerPlayerA
                              ? "text-green-400"
                              : "text-gray-300"
                          }`}
                        >
                          {match.player_b_name}
                        </span>
                        {!isWinnerPlayerA && (
                          <Award className="h-3 w-3 text-green-400" />
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="font-mono text-sm text-green-400">
                      {match.score || match.raw_score || "Available"}
                    </div>
                    {match.is_scorigami && (
                      <div className="text-xs text-green-400 mt-1">
                        Scorigami
                      </div>
                    )}
                  </td>
                  <td className="p-4 text-sm text-gray-300">
                    {match.tournament_name}
                  </td>
                  <td className="p-4 text-sm text-gray-400">{match.year}</td>
                  <td className="p-4 text-sm text-gray-400">
                    {match.surface_type || "Hard"}
                  </td>
                  <td className="p-4 text-sm text-gray-400">
                    {match.round_name || "Round"}
                  </td>
                  <td className="p-4">
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <div
                            className="flex gap-1 justify-center"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-8 w-8 p-0 cursor-default opacity-50 hover:bg-transparent"
                              onClick={(e) => {
                                e.stopPropagation();
                                e.preventDefault();
                              }}
                            >
                              <Eye className="h-3 w-3" />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-8 w-8 p-0 cursor-default opacity-50 hover:bg-transparent"
                              onClick={(e) => {
                                e.stopPropagation();
                                e.preventDefault();
                              }}
                            >
                              <ExternalLink className="h-3 w-3" />
                            </Button>
                          </div>
                        </TooltipTrigger>
                        <TooltipContent side="top">
                          <p>Coming soon</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </td>
                </motion.tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </motion.div>
  );
}
