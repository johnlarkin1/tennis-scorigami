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
import { Award, ExternalLink, Eye, Flag, Trophy, Zap } from "lucide-react";
import {
  calculateAge,
  formatHandedness,
  formatHeight,
  formatWeight,
} from "../utils/formatters";
import { getSurfaceBorder, getSurfaceIcon } from "../utils/surface";

interface MatchCardProps {
  result: SearchResult;
  index: number;
  onSelect: (result: SearchResult) => void;
  isSelected: boolean;
}

export function MatchCard({
  result,
  index: _index,
  onSelect: _onSelect,
  isSelected,
}: MatchCardProps) {
  const match = result.match_data;
  if (!match) return null;

  const isWinnerPlayerA = match.winner_id === match.player_a_id;
  const surfaceBorder = getSurfaceBorder(match.surface_type ?? undefined);
  const surfaceIcon = getSurfaceIcon(match.surface_type ?? undefined);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.02, y: -4 }}
      className={`relative overflow-hidden rounded-xl border border-l-4 ${surfaceBorder} shadow-[0_0_20px_rgba(68,219,94,0.2),inset_0_0_20px_rgba(68,219,94,0.05)] bg-gray-900/50 backdrop-blur-sm hover:border-green-500/50 transition-all duration-300 group ${
        isSelected ? "border-green-500/70" : "border-gray-700"
      }`}
    >
      {/* Scorigami Badge */}
      {match.is_scorigami && (
        <div className="absolute top-3 right-3 z-10">
          <span className="bg-green-500/20 text-green-400 text-xs px-2 py-1 rounded-full border border-green-500/30 font-medium">
            SCORIGAMI
          </span>
        </div>
      )}

      <div className="relative p-6">
        {/* Tournament Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3 flex-1">
            <Trophy className="h-5 w-5 text-yellow-400" />
            <div className="flex items-center gap-2 flex-wrap">
              <div className="font-bold text-white text-lg">
                {match.tournament_name}
              </div>
              <span className="text-gray-400">•</span>
              <div className="text-gray-300 font-semibold">{match.year}</div>
              <span className="text-gray-400">•</span>
              <div className="text-gray-300 font-medium">
                {match.round_name || "Round"}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2 ml-4">
            <span className="text-xl">{surfaceIcon}</span>
            <div
              className={`font-bold text-lg capitalize ${
                match.surface_type?.toLowerCase() === "grass"
                  ? "text-green-300"
                  : match.surface_type?.toLowerCase() === "clay"
                    ? "text-orange-300"
                    : "text-blue-300"
              }`}
            >
              {match.surface_type || "Hard"}
            </div>
          </div>
        </div>

        {/* Players */}
        <div className="space-y-4 mb-6">
          {/* Player A */}
          <div
            className={`p-4 rounded-lg transition-colors ${
              isWinnerPlayerA
                ? "bg-green-500/10 border border-green-500/20"
                : "bg-gray-800/30"
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-3">
                <div
                  className={`w-3 h-3 rounded-full ${isWinnerPlayerA ? "bg-green-400" : "bg-gray-500"}`}
                />
                <div
                  className={`font-bold text-lg ${isWinnerPlayerA ? "text-green-400" : "text-gray-300"}`}
                >
                  {match.player_a_name}
                </div>
              </div>
              {isWinnerPlayerA && <Award className="h-5 w-5 text-green-400" />}
            </div>

            <div className="flex flex-wrap gap-2 text-xs">
              {match.player_a_country_code && (
                <span className="px-2 py-1 bg-gray-700 rounded font-medium">
                  <Flag className="w-3 h-3 inline mr-1" />
                  {match.player_a_country_code}
                </span>
              )}
              {match.player_a_seed && (
                <span className="px-2 py-1 bg-blue-500/20 text-blue-400 rounded font-medium">
                  Seed #{match.player_a_seed}
                </span>
              )}
              {calculateAge(
                match.player_a_date_of_birth ?? undefined,
                match.match_start_time ?? undefined
              ) && (
                <span className="px-2 py-1 bg-purple-500/20 text-purple-400 rounded font-medium">
                  Age{" "}
                  {calculateAge(
                    match.player_a_date_of_birth ?? undefined,
                    match.match_start_time ?? undefined
                  )}
                </span>
              )}
              {match.player_a_height_cm && (
                <span className="px-2 py-1 bg-indigo-500/20 text-indigo-400 rounded font-medium">
                  {formatHeight(match.player_a_height_cm)}
                </span>
              )}
              {match.player_a_weight_kg && (
                <span className="px-2 py-1 bg-pink-500/20 text-pink-400 rounded font-medium">
                  {formatWeight(match.player_a_weight_kg)}
                </span>
              )}
              {match.player_a_handedness && (
                <span className="px-2 py-1 bg-orange-500/20 text-orange-400 rounded font-medium">
                  {formatHandedness(match.player_a_handedness)}
                </span>
              )}
            </div>
          </div>

          {/* Player B */}
          <div
            className={`p-4 rounded-lg transition-colors ${
              !isWinnerPlayerA
                ? "bg-green-500/10 border border-green-500/20"
                : "bg-gray-800/30"
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-3">
                <div
                  className={`w-3 h-3 rounded-full ${!isWinnerPlayerA ? "bg-green-400" : "bg-gray-500"}`}
                />
                <div
                  className={`font-bold text-lg ${!isWinnerPlayerA ? "text-green-400" : "text-gray-300"}`}
                >
                  {match.player_b_name}
                </div>
              </div>
              {!isWinnerPlayerA && <Award className="h-5 w-5 text-green-400" />}
            </div>

            <div className="flex flex-wrap gap-2 text-xs">
              {match.player_b_country_code && (
                <span className="px-2 py-1 bg-gray-700 rounded font-medium">
                  <Flag className="w-3 h-3 inline mr-1" />
                  {match.player_b_country_code}
                </span>
              )}
              {match.player_b_seed && (
                <span className="px-2 py-1 bg-blue-500/20 text-blue-400 rounded font-medium">
                  Seed #{match.player_b_seed}
                </span>
              )}
              {calculateAge(
                match.player_b_date_of_birth ?? undefined,
                match.match_start_time ?? undefined
              ) && (
                <span className="px-2 py-1 bg-purple-500/20 text-purple-400 rounded font-medium">
                  Age{" "}
                  {calculateAge(
                    match.player_b_date_of_birth ?? undefined,
                    match.match_start_time ?? undefined
                  )}
                </span>
              )}
              {match.player_b_height_cm && (
                <span className="px-2 py-1 bg-indigo-500/20 text-indigo-400 rounded font-medium">
                  {formatHeight(match.player_b_height_cm)}
                </span>
              )}
              {match.player_b_weight_kg && (
                <span className="px-2 py-1 bg-pink-500/20 text-pink-400 rounded font-medium">
                  {formatWeight(match.player_b_weight_kg)}
                </span>
              )}
              {match.player_b_handedness && (
                <span className="px-2 py-1 bg-orange-500/20 text-orange-400 rounded font-medium">
                  {formatHandedness(match.player_b_handedness)}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Score */}
        <div className="bg-gray-900/80 rounded-lg p-4 mb-4 border border-gray-700/50 relative">
          <div className="text-center">
            <div className="text-xl font-mono font-bold text-green-400 mb-1">
              {match.score || match.raw_score || "Score Available"}
            </div>
            {match.is_retirement && (
              <div className="text-sm text-red-400 font-medium">Retirement</div>
            )}
          </div>
          <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-2 text-sm text-gray-400">
            <Zap className="h-4 w-4" />
            <span className="font-medium">Best of {match.best_of || 3}</span>
          </div>
        </div>

        {/* Action Buttons */}
        <TooltipProvider>
          <div
            className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  size="sm"
                  variant="outline"
                  className="flex-1 bg-gray-800 border-gray-700 text-xs cursor-default opacity-50 hover:bg-gray-800 hover:border-gray-700"
                  onClick={(e) => {
                    e.stopPropagation();
                    e.preventDefault();
                  }}
                >
                  <Eye className="h-3 w-3 mr-1" />
                  View Details
                </Button>
              </TooltipTrigger>
              <TooltipContent side="top">
                <p>Coming soon</p>
              </TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  size="sm"
                  variant="outline"
                  className="flex-1 bg-gray-800 border-gray-700 text-xs cursor-default opacity-50 hover:bg-gray-800 hover:border-gray-700"
                  onClick={(e) => {
                    e.stopPropagation();
                    e.preventDefault();
                  }}
                >
                  <ExternalLink className="h-3 w-3 mr-1" />
                  View in Graph
                </Button>
              </TooltipTrigger>
              <TooltipContent side="top">
                <p>Coming soon</p>
              </TooltipContent>
            </Tooltip>
          </div>
        </TooltipProvider>
      </div>

      {/* Hover Glow Effect */}
      <div className="absolute inset-0 bg-gradient-to-r from-green-500/5 via-transparent to-green-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
    </motion.div>
  );
}
