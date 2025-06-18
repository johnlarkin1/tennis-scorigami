"use client";

import { SearchMappingContext } from "@/lib/search/search-context";
import { KeywordType } from "@/lib/search/search-parser";
import {
  SearchDataKeys,
  getDataKeyForKeywordType,
} from "@/lib/search/search-types";
import { useQuery } from "@tanstack/react-query";
import { createContext, useContext, useEffect } from "react";

type SearchData = SearchDataKeys;

interface SearchContextType {
  searchData: SearchData;
  isLoading: boolean;
  getDataForKeyword: (keyword: KeywordType) => Array<{
    id: number | string;
    name: string;
    value: string;
    [key: string]: unknown;
  }>;
}

const SearchContext = createContext<SearchContextType | null>(null);

async function fetchAllSuggestions(): Promise<SearchData> {
  const endpoints = [
    { key: "player", type: "player" },
    { key: "tournament", type: "tournament" },
    { key: "surface", type: "surface" },
    { key: "round", type: "round" },
    { key: "year", type: "year" },
    { key: "sex", type: "sex" },
    { key: "status", type: "status" },
  ];

  const results = await Promise.all(
    endpoints.map(async ({ type }) => {
      const response = await fetch(
        `/api/v1/search/suggestions?type=${type}&limit=200`
      );
      if (!response.ok) throw new Error(`Failed to fetch ${type}`);
      return response.json();
    })
  );

  return {
    player: results[0].items || [],
    tournament: results[1].items || [],
    surface: results[2].items || [],
    round: results[3].items || [],
    year: results[4].items || [],
    sex: results[5].items || [],
    status: results[6].items || [],
  } as SearchData;
}

export function SearchProvider({ children }: { children: React.ReactNode }) {
  const { data: searchData, isLoading } = useQuery({
    queryKey: ["search-data-preload"],
    queryFn: fetchAllSuggestions,
    staleTime: 10 * 60 * 1000, // 10 minutes
    gcTime: 30 * 60 * 1000, // 30 minutes
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchOnReconnect: false,
  });

  // Load mappings when data is available
  useEffect(() => {
    if (searchData) {
      // Only pass data with numeric IDs to the mapping context
      SearchMappingContext.loadMappingsFromData({
        players: searchData.player,
        tournaments: searchData.tournament,
        surfaces: searchData.surface.filter(
          (s) => typeof s.id === "number"
        ) as Array<{ id: number; name: string; value: string }>,
        rounds: searchData.round.filter(
          (r) => typeof r.id === "number"
        ) as Array<{ id: number; name: string; value: string }>,
        years: searchData.year.filter(
          (y) => typeof y.id === "number"
        ) as Array<{ id: number; name: string; value: string }>,
      });
    }
  }, [searchData]);

  const getDataForKeyword = (
    keyword: KeywordType
  ): Array<{
    id: number | string;
    name: string;
    value: string;
    [key: string]: unknown;
  }> => {
    if (!searchData) return [];

    const dataKey = getDataKeyForKeywordType(keyword);
    return searchData[dataKey] || [];
  };

  return (
    <SearchContext.Provider
      value={{
        searchData: searchData || {
          player: [],
          tournament: [],
          surface: [],
          round: [],
          year: [],
          sex: [],
          status: [],
        },
        isLoading,
        getDataForKeyword,
      }}
    >
      {children}
    </SearchContext.Provider>
  );
}

export function useSearchData() {
  const context = useContext(SearchContext);
  if (!context) {
    throw new Error("useSearchData must be used within a SearchProvider");
  }
  return context;
}
