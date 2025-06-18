"use client";

import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { SearchResult } from "@/lib/types/search-types";
import { AnimatePresence, motion } from "framer-motion";
import { Clock, Download, Grid3X3, List } from "lucide-react";
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
  hasMore?: boolean;
  isLoading?: boolean;
}

export const SearchResults: React.FC<SearchResultsProps> = ({
  searchResults = [],
  selectedResult,
  onResultSelect,
  hasMore = false,
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
            {searchResults.length > 0 && (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <span>
                      <Button
                        size="sm"
                        variant="outline"
                        disabled
                        className="bg-gray-800 border-gray-700 opacity-50 cursor-not-allowed"
                      >
                        <Download className="h-4 w-4 mr-1" />
                        Export
                      </Button>
                    </span>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Coming soon</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
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
      {hasMore && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="flex justify-center mt-8"
        >
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <span>
                  <Button
                    variant="outline"
                    disabled
                    className="bg-gray-800/50 border-gray-700 opacity-50 cursor-not-allowed"
                  >
                    Pagination coming soon
                  </Button>
                </span>
              </TooltipTrigger>
              <TooltipContent>
                <p>Coming soon</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </motion.div>
      )}
    </motion.div>
  );
};
