"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { SequenceInfo, SequenceMatch } from "@/types/sequence-matches/response";
import { fetchMatchesBySequence } from "@/lib/api-client";
import { format } from "date-fns";
import {
  Award,
  CircleX,
  Clock,
  Sparkles,
  Star,
  TrendingUp,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";

interface MatchDetailsModalProps {
  sequenceId: number | null;
  onClose: () => void;
  filters: {
    year: string | null;
    sex: string | null;
    tournament: string | null;
    sets: string | null;
  };
}

export function MatchDetailsModal({
  sequenceId,
  onClose,
  filters,
}: MatchDetailsModalProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sequence, setSequence] = useState<SequenceInfo | null>(null);
  const [matches, setMatches] = useState<SequenceMatch[]>([]);
  const [total, setTotal] = useState(0);

  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const containerRef = useRef<HTMLDivElement>(null);
  const limit = 50;

  const initialLoading = loading && page === 1;
  const loadingMore = loading && page > 1;

  // Check if this is a rare sequence (less than 5 occurrences)
  const isRareSequence = total > 0 && total < 5;

  // Since the API returns matches in descending order (newest first),
  // the last match in our array is the oldest. However, with pagination,
  // we only know it's the true first occurrence if we've loaded all matches.
  const hasLoadedAllMatches = matches.length === total || !hasMore;
  const firstMatch =
    hasLoadedAllMatches && matches.length > 0
      ? matches[matches.length - 1]
      : null;
  const firstMatchYear = firstMatch?.event_year ?? null;
  const currentYear = new Date().getFullYear();
  const isHistoricSequence =
    firstMatchYear && currentYear - firstMatchYear > 30;

  // Reset when modal opens or filters change
  useEffect(() => {
    if (!sequenceId) return;
    setPage(1);
    setMatches([]);
    setTotal(0);
    setHasMore(true);
  }, [sequenceId, filters]);

  // Fetch each page
  useEffect(() => {
    if (!sequenceId) return;

    const fetchMatches = async () => {
      setLoading(true);
      setError(null);

      try {
        const data = await fetchMatchesBySequence(
          sequenceId,
          {
            year: filters.year,
            sex: filters.sex,
            tournament: filters.tournament,
            sets: filters.sets,
          },
          page,
          limit
        );
        setSequence(data.sequence);
        setTotal(data.total);

        // decide if there's another page on the server
        const incoming: SequenceMatch[] = data.matches;
        setHasMore(incoming.length === limit);

        // append + dedupe
        setMatches((prev) => [
          ...prev,
          ...incoming.filter(
            (m) => !prev.some((p) => p.match_id === m.match_id)
          ),
        ]);
      } catch (err) {
        console.error(err);
        setError(
          err instanceof Error ? err.message : "Failed to load match data"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchMatches();
  }, [page, sequenceId, filters]);

  // Infinite‐scroll handler
  const onScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const { scrollTop, clientHeight, scrollHeight } = e.currentTarget;
    if (scrollHeight - scrollTop - clientHeight < 100 && !loading && hasMore) {
      setPage((p) => p + 1);
    }
  };

  // date formatting helper
  const formatDate = (dateString: string | null, year: number) => {
    if (!dateString) return `${year}`;
    try {
      return format(new Date(dateString), "MMM d, yyyy");
    } catch {
      return "Invalid date";
    }
  };

  if (!sequenceId) return null;

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent
        ref={containerRef}
        onScroll={onScroll}
        className="max-w-5xl mx-auto max-h-[80vh] overflow-y-auto bg-gray-900 border-gray-700 rounded-xl shadow-lg text-white p-6"
      >
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold flex items-center">
            {initialLoading ? (
              "Loading sequence data…"
            ) : sequence ? (
              <div className="flex items-center gap-2">
                <span>Score Sequence: {sequence.slug}</span>
                {isRareSequence && (
                  <span className="inline-flex items-center bg-amber-800/60 text-amber-300 text-sm px-2 py-1 rounded-md">
                    <Star className="h-4 w-4 mr-1" /> Rare Sequence
                  </span>
                )}
                {isHistoricSequence && (
                  <span className="inline-flex items-center bg-blue-800/60 text-blue-300 text-sm px-2 py-1 rounded-md">
                    <Clock className="h-4 w-4 mr-1" /> Historic
                  </span>
                )}
              </div>
            ) : (
              "Sequence information"
            )}
          </DialogTitle>
        </DialogHeader>

        {error && (
          <div className="bg-red-900/50 border border-red-500 rounded-md p-4 mb-4">
            <div className="flex items-center">
              <CircleX className="h-5 w-5 text-red-400 mr-2" />
              <p className="text-red-200">{error}</p>
            </div>
          </div>
        )}

        {initialLoading && !error && (
          <div className="flex justify-center py-8">
            <LoadingSpinner size={8} />
          </div>
        )}

        {!loading && !error && matches.length === 0 && total === 0 && (
          <div className="bg-gradient-to-br from-red-900/20 to-red-800/30 border border-red-700/50 rounded-md p-6 text-center mb-4">
            <Sparkles className="h-10 w-10 text-red-400 mx-auto mb-2" />
            <p className="text-red-200 text-lg font-medium mb-2">
              This may be an undiscovered sequence!
            </p>
            <p className="text-gray-300 mb-2">
              No matches found with this score sequence.
            </p>
            <p className="text-gray-400 text-sm">
              Try adjusting your filters or explore the graph for other rare
              sequences.
            </p>
          </div>
        )}

        {!initialLoading && matches.length > 0 && (
          <div className="space-y-4">
            <div
              className={`rounded-md p-5 ${
                isRareSequence
                  ? "bg-gradient-to-r from-amber-900/50 to-amber-800/30 border border-amber-700"
                  : isHistoricSequence
                    ? "bg-gradient-to-r from-blue-900/50 to-blue-800/30 border border-blue-700"
                    : "bg-gray-800"
              }`}
            >
              <div className="flex items-center justify-between">
                <p className="text-lg">
                  <span
                    className={`font-bold ${isRareSequence ? "text-amber-300" : isHistoricSequence ? "text-blue-300" : "text-green-400"}`}
                  >
                    {total}
                  </span>{" "}
                  <span className="text-gray-300">matches found</span>
                </p>

                {isRareSequence && (
                  <div className="flex items-center bg-amber-900/60 px-3 py-1 rounded-full">
                    <Award className="h-4 w-4 text-amber-300 mr-2" />
                    <span className="text-amber-200 text-sm">
                      Statistical Rarity!
                    </span>
                  </div>
                )}

                {isHistoricSequence && !isRareSequence && (
                  <div className="flex items-center bg-blue-900/60 px-3 py-1 rounded-full">
                    <TrendingUp className="h-4 w-4 text-blue-300 mr-2" />
                    <span className="text-blue-200 text-sm">
                      Historic Pattern
                    </span>
                  </div>
                )}
              </div>

              {isRareSequence && (
                <p className="text-amber-200/80 text-sm mt-2">
                  This sequence has only occurred in {total}{" "}
                  {total === 1 ? "match" : "matches"} in recorded tennis
                  history!
                </p>
              )}

              {isHistoricSequence && (
                <p className="text-blue-200/80 text-sm mt-2">
                  This sequence first appeared in {firstMatchYear} -{" "}
                  {currentYear - firstMatchYear} years ago!
                </p>
              )}
            </div>

            <div className="space-y-3">
              {matches.map((match) => (
                <div
                  key={match.match_id}
                  className={`${
                    isRareSequence
                      ? "bg-gradient-to-r from-gray-800 to-amber-900/10 border-amber-900/30"
                      : isHistoricSequence &&
                          match.match_id === firstMatch?.match_id
                        ? "bg-gradient-to-r from-gray-800 to-blue-900/10 border-blue-900/30"
                        : "bg-gray-800 border-gray-700"
                  } border rounded-md p-4 hover:bg-gray-750 transition-colors`}
                >
                  <div className="flex justify-between mb-2">
                    <span
                      className={`${
                        isRareSequence
                          ? "text-amber-400"
                          : isHistoricSequence &&
                              match.match_id === firstMatch?.match_id
                            ? "text-blue-400"
                            : "text-green-400"
                      } font-medium`}
                    >
                      {match.event_name}
                      {isHistoricSequence &&
                        match.match_id === firstMatch?.match_id && (
                          <span className="ml-2 text-xs bg-blue-900/60 text-blue-200 px-1.5 py-0.5 rounded">
                            First Occurrence
                          </span>
                        )}
                    </span>
                    <span className="text-gray-400">
                      {formatDate(match.match_start_time, match.event_year)}
                    </span>
                  </div>

                  <div className="flex justify-between items-center">
                    <div className="space-y-1">
                      <div className="font-medium flex items-center">
                        {match.player_a}
                        {match.winner_id === match.player_a_id && (
                          <span className="ml-2 text-xs bg-green-800 text-white px-1.5 py-0.5 rounded">
                            Winner
                          </span>
                        )}
                      </div>
                      <div className="font-medium flex items-center">
                        {match.player_b}
                        {match.winner_id === match.player_b_id && (
                          <span className="ml-2 text-xs bg-green-800 text-white px-1.5 py-0.5 rounded">
                            Winner
                          </span>
                        )}
                      </div>
                    </div>

                    <div
                      className={`${
                        isRareSequence
                          ? "bg-amber-950"
                          : isHistoricSequence &&
                              match.match_id === firstMatch?.match_id
                            ? "bg-blue-950"
                            : "bg-gray-900"
                      } px-3 py-2 rounded font-mono text-gray-300`}
                    >
                      {match.score || "Score not available"}
                    </div>
                  </div>

                  <div className="mt-2 text-xs text-gray-400">
                    {match.sex === "M" ? "Men's" : "Women's"} –{" "}
                    {match.event_year}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* bottom spinner only when truly loading another page */}
        {loadingMore && hasMore && (
          <div className="flex justify-center py-4">
            <LoadingSpinner size={6} />
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
