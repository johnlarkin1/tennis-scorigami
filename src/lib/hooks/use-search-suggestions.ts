"use client";

import { KeywordType } from "@/lib/search/search-parser";
import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";

interface SuggestionItem {
  id: string | number;
  name: string;
  value: string;
  suggested?: boolean;
}

interface SuggestionsResponse {
  type: string;
  items: SuggestionItem[];
}

export function useSearchSuggestions(
  type: KeywordType | null,
  query: string,
  enabled = true
) {
  return useQuery<SuggestionsResponse>({
    queryKey: ["search-suggestions", type, query],
    queryFn: async () => {
      if (!type) return { type: "", items: [] };

      const params = new URLSearchParams({
        type,
        q: query,
        limit: "50",
      });

      const response = await fetch(`/api/v1/search/suggestions?${params}`);
      if (!response.ok) throw new Error("Failed to fetch suggestions");

      return response.json();
    },
    enabled: enabled && !!type,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

export function useFuzzySearch(items: SuggestionItem[], query: string) {
  return useMemo(() => {
    if (!query || !items.length) return items;

    const lowerQuery = query.toLowerCase();

    // Simple fuzzy search implementation
    const scored = items.map((item) => {
      const name = item.name.toLowerCase();
      const value = item.value.toLowerCase();

      let score = 0;

      // Exact match
      if (name === lowerQuery || value === lowerQuery) {
        score = 100;
      }
      // Starts with
      else if (name.startsWith(lowerQuery) || value.startsWith(lowerQuery)) {
        score = 80;
      }
      // Contains
      else if (name.includes(lowerQuery) || value.includes(lowerQuery)) {
        score = 60;
      }
      // Fuzzy match (all characters present in order)
      else {
        let queryIndex = 0;
        for (const char of name) {
          if (char === lowerQuery[queryIndex]) {
            queryIndex++;
            if (queryIndex === lowerQuery.length) {
              score = 40;
              break;
            }
          }
        }
      }

      return { item, score };
    });

    return scored
      .filter(({ score }) => score > 0)
      .sort((a, b) => {
        // Sort by score, then by suggested status
        if (b.score !== a.score) return b.score - a.score;
        if (a.item.suggested && !b.item.suggested) return -1;
        if (!a.item.suggested && b.item.suggested) return 1;
        return 0;
      })
      .map(({ item }) => item);
  }, [items, query]);
}
