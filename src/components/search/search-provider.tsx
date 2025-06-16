"use client";

import { SearchMappingContext } from "@/lib/search/search-context";
import { KeywordType } from "@/lib/search/search-parser";
import { useQuery } from "@tanstack/react-query";
import { createContext, useContext, useEffect } from "react";

interface SearchData {
  players: Array<{
    id: number;
    name: string;
    value: string;
    country: number;
    sex: string;
  }>;
  tournaments: Array<{
    id: number;
    name: string;
    value: string;
    surface_type_id: number;
    country_id: number;
  }>;
  countries: Array<{
    id: number;
    name: string;
    value: string;
    code: string;
    continent: string;
  }>;
  surfaces: Array<{ id: number; name: string; value: string }>;
  rounds: Array<{ id: number; name: string; value: string }>;
  years: Array<{ id: number; name: string; value: string }>;
}

interface SearchContextType {
  searchData: SearchData;
  isLoading: boolean;
  getDataForKeyword: (keyword: KeywordType) => Array<{
    id: number;
    name: string;
    value: string;
    [key: string]: unknown;
  }>;
}

const SearchContext = createContext<SearchContextType | null>(null);

async function fetchAllSuggestions(): Promise<SearchData> {
  const endpoints = [
    { key: "players", type: "players" },
    { key: "tournaments", type: "tournaments" },
    { key: "countries", type: "countries" },
    { key: "surfaces", type: "surfaces" },
    { key: "rounds", type: "rounds" },
    { key: "years", type: "years" },
  ];

  const results = await Promise.all(
    endpoints.map(async ({ type }) => {
      const response = await fetch(
        `/api/v1/search/suggestions?type=${type}&limit=100`
      );
      if (!response.ok) throw new Error(`Failed to fetch ${type}`);
      return response.json();
    })
  );

  return {
    players: results[0].items || [],
    tournaments: results[1].items || [],
    countries: results[2].items || [],
    surfaces: results[3].items || [],
    rounds: results[4].items || [],
    years: results[5].items || [],
  };
}

export function SearchProvider({ children }: { children: React.ReactNode }) {
  const { data: searchData, isLoading } = useQuery({
    queryKey: ["search-data-preload"],
    queryFn: fetchAllSuggestions,
    staleTime: 10 * 60 * 1000, // 10 minutes
    refetchOnWindowFocus: false,
    refetchOnMount: false,
  });

  // Load mappings when data is available
  useEffect(() => {
    if (searchData) {
      SearchMappingContext.loadMappingsFromData(searchData);
    }
  }, [searchData]);

  const getDataForKeyword = (
    keyword: KeywordType
  ): Array<{
    id: number;
    name: string;
    value: string;
    [key: string]: unknown;
  }> => {
    if (!searchData) return [];

    switch (keyword) {
      case "player":
      case "opponent":
        return searchData.players;
      case "tournament":
        return searchData.tournaments;
      case "country":
        return searchData.countries;
      case "surface":
        return searchData.surfaces;
      case "round":
        return searchData.rounds;
      case "year":
        return searchData.years;
      default:
        return [];
    }
  };

  return (
    <SearchContext.Provider
      value={{
        searchData: searchData || {
          players: [],
          tournaments: [],
          countries: [],
          surfaces: [],
          rounds: [],
          years: [],
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
