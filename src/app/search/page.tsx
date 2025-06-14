"use client";

import { Footer } from "@/components/layout/footer";
import { Header } from "@/components/layout/header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Search, Filter, Calendar, Trophy, Users, TrendingUp } from "lucide-react";
import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

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
  const [selectedResult, setSelectedResult] = useState<SearchResult | null>(null);
  const [searchType, setSearchType] = useState<"player" | "score" | null>(null);
  const router = useRouter();

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
        const response = await fetch(`/api/v1/search?q=${encodeURIComponent(query)}`);
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
      const response = await fetch(`/api/v1/matches?scoreId=${scoreId}&limit=50`);
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

  const searchPlaceholder = useMemo(() => {
    const examples = [
      "Search for players like 'Novak Djokovic'",
      "Search for scores like '6-4 6-3'",
      "Try 'Roger Federer' or '7-6 6-4'",
      "Search 'Rafael Nadal' or '6-0 6-1'"
    ];
    return examples[Math.floor(Math.random() * examples.length)];
  }, []);

  return (
    <div className="bg-gradient-to-b from-gray-900 via-gray-900 to-black text-white min-h-screen">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        {/* Page Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <Search className="w-8 h-8 text-green-400 mr-3" />
            <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-white to-gray-200 bg-clip-text text-transparent">
              Search Tennis Data
            </h1>
          </div>
          <p className="text-lg text-gray-300 max-w-2xl mx-auto">
            Search through our comprehensive database of tennis matches, players, and scores.
            Discover unique scorelines and explore match histories.
          </p>
        </div>

        {/* Search Input */}
        <Card className="bg-gray-800/50 border-gray-700 backdrop-blur-sm mb-8">
          <CardContent className="p-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <Input
                type="text"
                placeholder={searchPlaceholder}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="pl-10 bg-gray-900/50 border-gray-600 text-white placeholder-gray-400 text-lg py-3 focus:border-green-400 focus:ring-green-400"
              />
              {isSearching && (
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-green-400"></div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Search Results */}
        {searchResults.length > 0 && (
          <Card className="bg-gray-800/50 border-gray-700 backdrop-blur-sm mb-8">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Filter className="w-5 h-5 text-green-400 mr-2" />
                Search Results
                <Badge variant="secondary" className="ml-2 bg-green-400/20 text-green-400">
                  {searchType === "player" ? "Players" : "Scores"}
                </Badge>
              </CardTitle>
              <CardDescription>
                Found {searchResults.length} {searchType === "player" ? "players" : "score patterns"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-3">
                {searchResults.map((result) => (
                  <div
                    key={result.id}
                    className={`p-4 rounded-lg border cursor-pointer transition-all duration-200 ${
                      selectedResult?.id === result.id
                        ? "bg-green-400/10 border-green-400"
                        : "bg-gray-900/50 border-gray-600 hover:bg-gray-700/50 hover:border-gray-500"
                    }`}
                    onClick={() => handleResultSelect(result)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        {result.type === "player" ? (
                          <Users className="w-5 h-5 text-blue-400 mr-3" />
                        ) : (
                          <TrendingUp className="w-5 h-5 text-purple-400 mr-3" />
                        )}
                        <span className="font-medium text-white">
                          {result.name || result.slug}
                        </span>
                      </div>
                      <Badge variant="outline" className="text-xs">
                        {result.type}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Selected Result Details */}
        {selectedResult && (
          <Card className="bg-gray-800/50 border-gray-700 backdrop-blur-sm mb-8">
            <CardHeader>
              <CardTitle className="flex items-center">
                {selectedResult.type === "player" ? (
                  <Users className="w-5 h-5 text-blue-400 mr-2" />
                ) : (
                  <TrendingUp className="w-5 h-5 text-purple-400 mr-2" />
                )}
                {selectedResult.name || selectedResult.slug}
              </CardTitle>
              <CardDescription>
                {selectedResult.type === "player" 
                  ? "Player profile and match history"
                  : "Matches with this scoreline"
                }
              </CardDescription>
            </CardHeader>
            <CardContent>
              {selectedResult.type === "player" ? (
                <div className="text-center py-8">
                  <p className="text-gray-400 mb-4">
                    Player details and match history coming soon!
                  </p>
                  <Button 
                    variant="outline" 
                    onClick={() => router.push("/explore")}
                    className="border-green-400 text-green-400 hover:bg-green-400 hover:text-black"
                  >
                    Explore Data Visualization
                  </Button>
                </div>
              ) : (
                <div>
                  {isLoadingMatches ? (
                    <div className="text-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-400 mx-auto mb-4"></div>
                      <p className="text-gray-400">Loading matches...</p>
                    </div>
                  ) : matches.length > 0 ? (
                    <div>
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold text-white">
                          Matches ({matches.length})
                        </h3>
                        <Badge variant="secondary" className="bg-purple-400/20 text-purple-400">
                          {selectedResult.slug}
                        </Badge>
                      </div>
                      <Separator className="bg-gray-600 mb-4" />
                      <div className="space-y-3 max-h-96 overflow-y-auto">
                        {matches.map((match) => (
                          <div
                            key={match.match_id}
                            className="p-4 bg-gray-900/50 rounded-lg border border-gray-600 hover:border-gray-500 transition-colors"
                          >
                            <div className="flex items-center justify-between mb-2">
                              <div className="flex items-center">
                                <Trophy className="w-4 h-4 text-yellow-400 mr-2" />
                                <span className="font-medium text-white">
                                  {match.event_name}
                                </span>
                              </div>
                              <div className="flex items-center text-sm text-gray-400">
                                <Calendar className="w-4 h-4 mr-1" />
                                {match.year}
                              </div>
                            </div>
                            <div className="text-sm text-gray-300">
                              {match.player_a} vs {match.player_b}
                            </div>
                            {match.start_time && (
                              <div className="text-xs text-gray-500 mt-1">
                                {new Date(match.start_time).toLocaleDateString()}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <p className="text-gray-400">No matches found for this scoreline.</p>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Getting Started */}
        {!query.trim() && (
          <div className="grid md:grid-cols-2 gap-6">
            <Card className="bg-gray-800/50 border-gray-700 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center text-green-400">
                  <Users className="w-5 h-5 mr-2" />
                  Player Search
                </CardTitle>
                <CardDescription>
                  Search for professional tennis players to explore their match history
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm text-gray-300">
                  <p>• Search by full name: &ldquo;Roger Federer&rdquo;</p>
                  <p>• Partial names work too: &ldquo;Novak&rdquo;</p>
                  <p>• Case insensitive matching</p>
                </div>
                <Button 
                  variant="outline" 
                  className="mt-4 w-full border-green-400 text-green-400 hover:bg-green-400 hover:text-black"
                  onClick={() => setQuery("Roger Federer")}
                >
                  Try Example
                </Button>
              </CardContent>
            </Card>

            <Card className="bg-gray-800/50 border-gray-700 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center text-purple-400">
                  <TrendingUp className="w-5 h-5 mr-2" />
                  Score Search
                </CardTitle>
                <CardDescription>
                  Find matches with specific scorelines and explore tennis scorigami
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm text-gray-300">
                  <p>• Format: &ldquo;6-4 6-3&rdquo; or &ldquo;7-6 6-4&rdquo;</p>
                  <p>• Partial patterns: &ldquo;6-0&rdquo; or &ldquo;7-6&rdquo;</p>
                  <p>• Discover rare scorelines</p>
                </div>
                <Button 
                  variant="outline" 
                  className="mt-4 w-full border-purple-400 text-purple-400 hover:bg-purple-400 hover:text-black"
                  onClick={() => setQuery("6-0 6-0")}
                >
                  Try Example
                </Button>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Quick Links */}
        <div className="mt-12 text-center">
          <h2 className="text-2xl font-bold mb-4 text-white">Explore More</h2>
          <div className="flex flex-wrap justify-center gap-4">
            <Link href="/explore">
              <Button variant="outline" className="border-green-400 text-green-400 hover:bg-green-400 hover:text-black">
                Interactive Data Visualization
              </Button>
            </Link>
            <Link href="/about">
              <Button variant="outline" className="border-blue-400 text-blue-400 hover:bg-blue-400 hover:text-black">
                Learn About Tennis Scorigami
              </Button>
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}