"use client";

import { Footer } from "@/components/layout/footer";
import { Header } from "@/components/layout/header";
import { SearchBar } from "@/components/search/search-bar";
import { SearchLanding } from "@/components/search/search-landing";
import { SearchProvider } from "@/components/search/search-provider";
import { SearchResults } from "@/components/search/search-results";
import { Button } from "@/components/ui/button";
import { useDebounce } from "@/lib/hooks/use-debounce";
import { useQueryParam } from "@/lib/hooks/use-query-param";
import { SearchResult } from "@/lib/types/search-types";
import { motion } from "framer-motion";
import { Search } from "lucide-react";
import Link from "next/link";
import { Suspense, useEffect, useState } from "react";

function SearchPageContent() {
  // URL is the single source of truth
  const [q, setQ] = useQueryParam("q");
  const debouncedQ = useDebounce(q, 500); // Increased debounce for API calls

  // Local state only for search results and loading state
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedResult, setSelectedResult] = useState<SearchResult | null>(
    null
  );

  // Search effect - runs when debounced query changes
  useEffect(() => {
    const trimmedQuery = debouncedQ.trim();

    if (!trimmedQuery) {
      setSearchResults([]);
      setSelectedResult(null);
      setIsSearching(false);
      return;
    }

    // Only search if query is at least 2 characters
    if (trimmedQuery.length < 2) {
      setSearchResults([]);
      setSelectedResult(null);
      setIsSearching(false);
      return;
    }

    const abortController = new AbortController();

    const performSearch = async () => {
      setIsSearching(true);
      try {
        const response = await fetch(
          `/api/v1/search?q=${encodeURIComponent(trimmedQuery)}`,
          { signal: abortController.signal }
        );

        if (!response.ok) throw new Error("Search failed");

        const data = await response.json();
        setSearchResults(data.items || []);
      } catch (error) {
        if (error instanceof Error && error.name !== "AbortError") {
          console.error("Search error:", error);
          setSearchResults([]);
        }
      } finally {
        setIsSearching(false);
      }
    };

    performSearch();

    return () => {
      abortController.abort();
    };
  }, [debouncedQ]);

  // Event handlers just write to the URL
  const handleSearchBarChange = (newQuery: string) => setQ(newQuery);
  const handleQuerySelect = (filterQuery: string) =>
    setQ(filterQuery, { push: true });
  const handleResultSelect = (result: SearchResult) =>
    setSelectedResult(result);

  const searchPlaceholder =
    "Dynamic keyword search! e.g. try searching for American hero with `player:Roddick`";

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
              className="text-center mb-8 sm:mb-12"
            >
              <div className="flex items-center justify-center mb-4">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{
                    duration: 20,
                    repeat: Infinity,
                    ease: "linear",
                  }}
                  className="p-2 sm:p-3 bg-gradient-to-br from-green-400/20 to-green-400/10 rounded-xl sm:rounded-2xl mr-3 sm:mr-4"
                >
                  <Search className="w-6 h-6 sm:w-8 sm:h-8 text-green-400" />
                </motion.div>
                <h1 className="text-2xl sm:text-4xl md:text-6xl font-bold bg-gradient-to-r from-white via-gray-200 to-gray-400 bg-clip-text text-transparent">
                  Search for Scorigamis
                </h1>
              </div>
            </motion.div>

            {/* Search Bar */}
            <div className="mb-8">
              <SearchBar
                query={q}
                setQuery={handleSearchBarChange}
                placeholder={searchPlaceholder}
                isSearching={isSearching}
              />
            </div>

            {/* Search Results */}
            <SearchResults
              searchResults={searchResults}
              selectedResult={selectedResult}
              onResultSelect={handleResultSelect}
            />

            {/* Search Landing - Show only when no search results */}
            {searchResults.length === 0 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
                className="mb-12"
              >
                <SearchLanding
                  onQuerySelect={handleQuerySelect}
                  currentQuery={q}
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

export default function SearchPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-900 to-black text-white flex flex-col">
          <Header />
          <main className="relative flex-1 flex items-center justify-center">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-400 mx-auto mb-4"></div>
              <p className="text-gray-400">Loading search...</p>
            </div>
          </main>
          <Footer />
        </div>
      }
    >
      <SearchPageContent />
    </Suspense>
  );
}
