"use client";

import { Footer } from "@/components/layout/footer";
import { Header } from "@/components/layout/header";
import { QuickFilters } from "@/components/search/quick-filters";
import { SearchBar } from "@/components/search/search-bar";
import { SearchProvider } from "@/components/search/search-provider";
import { SearchResults } from "@/components/search/search-results";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { Search, Sparkles } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

type SearchResult = {
  id: number;
  name?: string;
  slug?: string;
  type: "player" | "score";
};

type SearchResponse = {
  type: "player" | "score";
  items: SearchResult[];
};

type Match = {
  match_id: number;
  event_name: string;
  player_a: string;
  player_b: string;
  year: number;
  start_time: string;
};

export default function SearchPage() {
  const [query, setQuery] = useState("");
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [matches, setMatches] = useState<Match[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isLoadingMatches, setIsLoadingMatches] = useState(false);
  const [selectedResult, setSelectedResult] = useState<SearchResult | null>(
    null
  );
  const [searchType, setSearchType] = useState<"player" | "score" | null>(null);

  // Debounced search
  useEffect(() => {
    if (!query.trim()) {
      setSearchResults([]);
      setMatches([]);
      setSelectedResult(null);
      setSearchType(null);
      return;
    }

    setIsSearching(true);
    const timeoutId = setTimeout(async () => {
      try {
        const response = await fetch(
          `/api/v1/search?q=${encodeURIComponent(query)}`
        );
        const data: SearchResponse = await response.json();
        setSearchResults(data.items);
        setSearchType(data.type);
      } catch (error) {
        console.error("Search error:", error);
        setSearchResults([]);
      } finally {
        setIsSearching(false);
      }
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [query]);

  // Load matches when a score result is selected
  const loadMatches = async (scoreId: number) => {
    setIsLoadingMatches(true);
    try {
      const response = await fetch(
        `/api/v1/matches?scoreId=${scoreId}&limit=50`
      );
      const data: Match[] = await response.json();
      setMatches(data);
    } catch (error) {
      console.error("Error loading matches:", error);
      setMatches([]);
    } finally {
      setIsLoadingMatches(false);
    }
  };

  const handleResultSelect = (result: SearchResult) => {
    setSelectedResult(result);
    if (result.type === "score") {
      loadMatches(result.id);
    } else {
      setMatches([]);
    }
  };

  const searchPlaceholder =
    "Search for players, tournaments, scores... Try: player:Roddick";

  const handleQuickFilter = (filterQuery: string) => {
    setQuery(filterQuery);
  };

  return (
    <SearchProvider>
      <div className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-900 to-black text-white flex flex-col">
        <Header />

        <main className="relative flex-1">
          {/* Background Effects */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute top-20 left-10 w-72 h-72 bg-green-400/10 rounded-full blur-3xl" />
            <div className="absolute bottom-20 right-10 w-96 h-96 bg-blue-400/10 rounded-full blur-3xl" />
          </div>

          <div className="relative container mx-auto px-4 py-8">
            {/* Page Header */}
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-center mb-12"
            >
              <div className="flex items-center justify-center mb-4">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{
                    duration: 20,
                    repeat: Infinity,
                    ease: "linear",
                  }}
                  className="p-3 bg-gradient-to-br from-green-400/20 to-green-400/10 rounded-2xl mr-4"
                >
                  <Search className="w-8 h-8 text-green-400" />
                </motion.div>
                <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-white via-gray-200 to-gray-400 bg-clip-text text-transparent">
                  Search Tennis Data
                </h1>
              </div>
              <p className="text-lg text-gray-300 max-w-3xl mx-auto leading-relaxed">
                Explore our comprehensive database of tennis matches, players,
                and scores.
                <span className="block mt-2 text-green-400 flex items-center justify-center">
                  <Sparkles className="w-4 h-4 mr-2" />
                  Discover unique scorelines and match histories
                </span>
              </p>
            </motion.div>

            {/* Search Bar */}
            <div className="mb-8">
              <SearchBar
                query={query}
                setQuery={setQuery}
                placeholder={searchPlaceholder}
                isSearching={isSearching}
              />
            </div>

            {/* Search Results */}
            <SearchResults
              searchResults={searchResults}
              selectedResult={selectedResult}
              matches={matches}
              isLoadingMatches={isLoadingMatches}
              searchType={searchType}
              onResultSelect={handleResultSelect}
            />

            {/* Quick Filters - Show when no query */}
            {!query.trim() && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
                className="mb-12"
              >
                <QuickFilters
                  onFilterSelect={handleQuickFilter}
                  currentQuery={query}
                />
              </motion.div>
            )}

            {/* Quick Links */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="mt-16 text-center"
            >
              <h2 className="text-2xl font-bold mb-6 bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                Explore More
              </h2>
              <div className="flex flex-wrap justify-center gap-4">
                <Link href="/explore">
                  <Button
                    variant="outline"
                    className="border-green-400/50 text-green-400 hover:bg-green-400/10 hover:border-green-400 backdrop-blur-sm transition-all duration-300"
                  >
                    Interactive Data Visualization
                  </Button>
                </Link>
                <Link href="/about">
                  <Button
                    variant="outline"
                    className="border-blue-400/50 text-blue-400 hover:bg-blue-400/10 hover:border-blue-400 backdrop-blur-sm transition-all duration-300"
                  >
                    Learn About Tennis Scorigami
                  </Button>
                </Link>
              </div>
            </motion.div>
          </div>
        </main>

        <Footer />
      </div>
    </SearchProvider>
  );
}
