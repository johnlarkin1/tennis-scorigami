import { KeywordType } from "@/lib/search/search-parser";
import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";

export interface SuggestionItem {
  id: string | number;
  name: string;
  value: string;
  suggested?: boolean;
  [key: string]: unknown;
}

export interface SuggestionsResponse {
  type: string;
  items: SuggestionItem[];
}

const SUGGESTION_CACHE_TIME = 5 * 60 * 1000; // 5 minutes
const SUGGESTION_STALE_TIME = 2 * 60 * 1000; // 2 minutes

async function fetchSuggestions(
  type: KeywordType,
  query: string = "",
  limit: number = 20
): Promise<SuggestionsResponse> {
  // Use the keyword type directly - backend now expects singular forms
  const apiType = type === "opponent" ? "player" : type;

  const params = new URLSearchParams({
    type: apiType,
    limit: limit.toString(),
  });

  if (query) {
    params.append("q", query);
  }

  const response = await fetch(`/api/v1/search/suggestions?${params}`);

  if (!response.ok) {
    throw new Error(`Failed to fetch ${type} suggestions`);
  }

  return response.json();
}

export function useSearchSuggestions(
  type: KeywordType | null,
  query: string = "",
  enabled: boolean = true
) {
  return useQuery({
    queryKey: ["search-suggestions", type, query],
    queryFn: () => fetchSuggestions(type!, query),
    enabled: enabled && !!type,
    staleTime: SUGGESTION_STALE_TIME,
    gcTime: SUGGESTION_CACHE_TIME,
    refetchOnWindowFocus: false,
  });
}

// Hook for pre-loading popular suggestions on app initialization
export function usePreloadSuggestions() {
  const popularTypes: KeywordType[] = [
    "player",
    "tournament",
    "surface",
    "sex",
  ];

  const queries = popularTypes.map((type) => ({
    queryKey: ["search-suggestions", type, ""],
    queryFn: () => fetchSuggestions(type),
    staleTime: SUGGESTION_STALE_TIME,
    gcTime: SUGGESTION_CACHE_TIME,
    refetchOnWindowFocus: false,
  }));

  return queries;
}

// Hook for fuzzy matching suggestions
export function useFuzzySearch(
  items: SuggestionItem[],
  query: string,
  keys: string[] = ["name", "value"]
) {
  return useMemo(() => {
    if (!query.trim()) {
      // When no query, sort suggested items first
      return [...items].sort((a, b) => {
        if (a.suggested && !b.suggested) return -1;
        if (!a.suggested && b.suggested) return 1;
        return 0;
      });
    }

    const lowercaseQuery = query.toLowerCase();

    return items
      .map((item) => {
        let score = 0;
        let matches = false;

        keys.forEach((key) => {
          const value = item[key]?.toString().toLowerCase() || "";

          if (value.includes(lowercaseQuery)) {
            matches = true;
            // Exact match gets highest score
            if (value === lowercaseQuery) {
              score += 100;
            }
            // Starts with query gets high score
            else if (value.startsWith(lowercaseQuery)) {
              score += 50;
            }
            // Contains query gets base score
            else {
              score += 10;
            }

            // Bonus for shorter strings (more relevant)
            score += Math.max(0, 50 - value.length);
          }
        });

        // Bonus for suggested items
        if (item.suggested) {
          score += 25;
        }

        return matches ? { ...item, _score: score } : null;
      })
      .filter(Boolean)
      .sort(
        (a, b) =>
          (b as SuggestionItem & { _score: number })._score -
          (a as SuggestionItem & { _score: number })._score
      ) as SuggestionItem[];
  }, [items, query, keys]);
}

// Hook for cached data that persists across page loads
export function useCachedSuggestions(type: KeywordType) {
  return useQuery({
    queryKey: ["cached-suggestions", type],
    queryFn: () => fetchSuggestions(type, "", 50), // Fetch more for caching
    staleTime: 10 * 60 * 1000, // 10 minutes
    gcTime: 30 * 60 * 1000, // 30 minutes
    refetchOnWindowFocus: false,
    refetchOnMount: false,
  });
}
