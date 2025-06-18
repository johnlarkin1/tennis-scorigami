"use client";

import { Button } from "@/components/ui/button";
import { SearchResult } from "@/lib/types/search-types";
import { AnimatePresence, motion } from "framer-motion";
import {
  BookMarked,
  ChevronDown,
  Clock,
  Download,
  Grid3X3,
  List,
} from "lucide-react";
import { useMemo, useState } from "react";
import {
  CardsView,
  ListView,
  LoadingSkeletons,
  SortOption,
  TimelineView,
  ViewMode,
} from "./results";

interface SearchResultsProps {
  searchResults: SearchResult[];
  selectedResult: SearchResult | null;
  onResultSelect: (result: SearchResult) => void;
  isLoading?: boolean;
}

export const SearchResults: React.FC<SearchResultsProps> = ({
  searchResults = [],
  selectedResult,
  onResultSelect,
  isLoading = false,
}) => {
  const [viewMode, setViewMode] = useState<ViewMode>("cards");
  const [sortBy, setSortBy] = useState<SortOption>("relevance");

  const hasResults = searchResults.length > 0;

  const sortedResults = useMemo(() => {
    if (!searchResults.length) return [];

    const sorted = [...searchResults].sort((a, b) => {
      const matchA = a.match_data;
      const matchB = b.match_data;
      if (!matchA || !matchB) return 0;

      switch (sortBy) {
        case "date_desc":
          return (
            new Date(matchB.match_start_time || "").getTime() -
            new Date(matchA.match_start_time || "").getTime()
          );
        case "date_asc":
          return (
            new Date(matchA.match_start_time || "").getTime() -
            new Date(matchB.match_start_time || "").getTime()
          );
        case "tournament":
          return (matchA.event_name || "").localeCompare(
            matchB.event_name || ""
          );
        case "rarity":
          return (matchA.rarity_rank || 9999) - (matchB.rarity_rank || 9999);
        case "relevance":
        default:
          return 0;
      }
    });

    return sorted;
  }, [searchResults, sortBy]);

  if (isLoading) {
    return <LoadingSkeletons />;
  }

  if (!hasResults) {
    return null;
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6 }}
      className="space-y-6"
    >
      {/* Results Header */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-start">
        <div>
          <h2 className="text-xl sm:text-2xl font-semibold mb-2">
            Search Results
          </h2>
          <div className="flex flex-wrap items-center gap-4 text-sm text-gray-400">
            <span>{searchResults.length} matches found</span>
            {searchResults.filter((r) => r.match_data?.is_scorigami).length >
              0 && (
              <>
                <span>•</span>
                <span className="text-green-400">
                  {
                    searchResults.filter((r) => r.match_data?.is_scorigami)
                      .length
                  }{" "}
                  scorigami
                </span>
              </>
            )}
          </div>
        </div>

        {/* View Controls */}
        <div className="flex items-center gap-2">
          {/* Action Buttons */}
          <div className="flex items-center gap-2 mr-4">
            <Button
              size="sm"
              variant="outline"
              className="bg-gray-800 border-gray-700 hover:bg-gray-700"
            >
              <BookMarked className="h-4 w-4 mr-1" />
              Saved
            </Button>

            {searchResults.length > 0 && (
              <Button
                size="sm"
                variant="outline"
                className="bg-gray-800 border-gray-700 hover:bg-gray-700"
              >
                <Download className="h-4 w-4 mr-1" />
                Export
              </Button>
            )}
          </div>

          {/* Sort Dropdown */}
          <div className="relative">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortOption)}
              className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-green-500/50 appearance-none pr-8"
            >
              <option value="relevance">Relevance</option>
              <option value="date_desc">Newest First</option>
              <option value="date_asc">Oldest First</option>
              <option value="tournament">Tournament</option>
              <option value="rarity">Rarity</option>
            </select>
            <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
          </div>

          {/* View Mode Buttons */}
          <div className="flex border border-gray-700 rounded-lg overflow-hidden">
            {(["cards", "list", "timeline"] as ViewMode[]).map((mode) => {
              const Icon = {
                cards: Grid3X3,
                list: List,
                timeline: Clock,
              }[mode];

              return (
                <button
                  key={mode}
                  onClick={() => setViewMode(mode)}
                  className={`p-2 transition-colors ${
                    viewMode === mode
                      ? "bg-green-600 text-white"
                      : "bg-gray-800 text-gray-400 hover:text-white hover:bg-gray-700"
                  }`}
                  title={`${mode.charAt(0).toUpperCase() + mode.slice(1)} view`}
                >
                  <Icon className="h-4 w-4" />
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Results Content */}
      <AnimatePresence mode="wait">
        {viewMode === "cards" && (
          <CardsView
            key="cards"
            matches={sortedResults}
            onResultSelect={onResultSelect}
            selectedResult={selectedResult}
          />
        )}
        {viewMode === "list" && (
          <ListView
            key="list"
            matches={sortedResults}
            onResultSelect={onResultSelect}
            selectedResult={selectedResult}
          />
        )}
        {viewMode === "timeline" && (
          <TimelineView
            key="timeline"
            matches={sortedResults}
            onResultSelect={onResultSelect}
            selectedResult={selectedResult}
          />
        )}
      </AnimatePresence>

      {/* Pagination */}
      {searchResults.length > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="flex justify-center mt-8"
        >
          <Button
            variant="outline"
            className="bg-gray-800/50 hover:bg-gray-700/50 border-gray-700 hover:border-gray-600"
          >
            Load More Results
          </Button>
        </motion.div>
      )}
    </motion.div>
  );
};
