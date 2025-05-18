// src/components/force-graph/match-details-modal.tsx
"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { SequenceInfo, SequenceMatch } from "@/types/sequence-matches/response";
import { format } from "date-fns";
import { CircleX, Loader2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";

interface MatchDetailsModalProps {
  sequenceId: number | null;
  onClose: () => void;
  filters: {
    year: string | null;
    sex: string | null;
    tournament: string | null;
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
        const params = new URLSearchParams();
        const yearValue = filters.year === "All Years" ? "all" : filters.year;
        const sexValue =
          filters.sex === "Men and Women" ? "all" : filters.sex?.toLowerCase();
        const tournamentValue =
          filters.tournament === "All Tournaments" ? "all" : filters.tournament;

        if (yearValue) params.append("year", yearValue);
        if (sexValue) params.append("sex", sexValue);
        if (tournamentValue) params.append("tournament", tournamentValue);

        params.append("page", page.toString());
        params.append("limit", limit.toString());

        const res = await fetch(
          `/api/v1/matches/by-sequence/${sequenceId}?${params}`
        );
        if (!res.ok) {
          const err = await res.json();
          throw new Error(err.error || "Failed to fetch matches");
        }

        const data = await res.json();
        setSequence(data.sequence);
        setTotal(data.total);

        // decide if there’s another page on the server
        const incoming: SequenceMatch[] = data.matches;
        setHasMore(incoming.length === limit);

        // append + dedupe
        setMatches((prev) => [
          ...prev,
          ...incoming.filter(
            (m) => !prev.some((p) => p.match_id === m.match_id)
          ),
        ]);
      } catch (err: any) {
        console.error(err);
        setError(err.message || "Failed to load match data");
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
            {initialLoading
              ? "Loading sequence data…"
              : sequence
                ? `Score Sequence: ${sequence.slug}`
                : "Sequence information"}
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

        {!initialLoading && !error && matches.length === 0 && (
          <div className="bg-gray-800 rounded-md p-6 text-center mb-4">
            <p className="text-gray-300 mb-2">
              No matches found with this score sequence.
            </p>
            <p className="text-gray-400 text-sm">Try adjusting your filters.</p>
          </div>
        )}

        {matches.length > 0 && (
          <div className="space-y-4">
            <div className="bg-gray-800 rounded-md p-4">
              <p className="text-lg text-gray-300">
                Found <span className="text-green-400 font-bold">{total}</span>{" "}
                matches
              </p>
            </div>

            <div className="space-y-3">
              {matches.map((match) => (
                <div
                  key={match.match_id}
                  className="bg-gray-800 border border-gray-700 rounded-md p-4 hover:bg-gray-750 transition-colors"
                >
                  <div className="flex justify-between mb-2">
                    <span className="text-green-400 font-medium">
                      {match.event_name}
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

                    <div className="bg-gray-900 px-3 py-2 rounded font-mono text-gray-300">
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
            <Loader2 className="h-6 w-6 text-green-500 animate-spin" />
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
