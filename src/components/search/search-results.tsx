"use client";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { motion, AnimatePresence } from "framer-motion";
import { Users, TrendingUp, Trophy, Calendar, ChevronRight, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";

type SearchResult = {
  id: number;
  name?: string;
  slug?: string;
  type: "player" | "score";
};

type Match = {
  match_id: number;
  event_name: string;
  player_a: string;
  player_b: string;
  year: number;
  start_time: string;
};

interface SearchResultsProps {
  searchResults: SearchResult[];
  selectedResult: SearchResult | null;
  matches: Match[];
  isLoadingMatches: boolean;
  searchType: "player" | "score" | null;
  onResultSelect: (result: SearchResult) => void;
}

export const SearchResults: React.FC<SearchResultsProps> = ({
  searchResults = [],
  selectedResult,
  matches = [],
  isLoadingMatches,
  searchType,
  onResultSelect,
}) => {
  const router = useRouter();

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05
      }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  return (
    <div className="space-y-6">
      <AnimatePresence mode="wait">
        {searchResults.length > 0 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.3 }}
          >
            <Card className="bg-gray-900/40 backdrop-blur-xl border-gray-700/50 shadow-2xl">
              <CardHeader className="bg-gradient-to-r from-gray-800/50 to-gray-900/50 backdrop-blur-sm rounded-t-lg">
                <CardTitle className="flex items-center text-white">
                  <div className="p-2 bg-green-400/10 rounded-lg mr-3">
                    <TrendingUp className="w-5 h-5 text-green-400" />
                  </div>
                  Search Results
                  <Badge 
                    variant="secondary" 
                    className="ml-3 bg-green-400/20 text-green-400 border-green-400/30"
                  >
                    {searchType === "player" ? "Players" : "Scores"}
                  </Badge>
                </CardTitle>
                <CardDescription className="text-gray-300">
                  Found {searchResults.length} {searchType === "player" ? "players" : "score patterns"}
                </CardDescription>
              </CardHeader>
              <CardContent className="p-4">
                <motion.div 
                  variants={container}
                  initial="hidden"
                  animate="show"
                  className="grid gap-3"
                >
                  {searchResults.map((result) => (
                    <motion.div
                      key={result.id}
                      variants={item}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <div
                        className={`relative p-4 rounded-xl cursor-pointer transition-all duration-300 group overflow-hidden ${
                          selectedResult?.id === result.id
                            ? "bg-gradient-to-r from-green-400/20 to-green-400/10 border border-green-400/50"
                            : "bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 hover:bg-gray-700/50 hover:border-gray-600/50"
                        }`}
                        onClick={() => onResultSelect(result)}
                      >
                        <div className="absolute inset-0 bg-gradient-to-r from-green-400/0 to-green-400/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                        
                        <div className="relative flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <div className={`p-2 rounded-lg ${
                              result.type === "player" 
                                ? "bg-blue-400/10" 
                                : "bg-purple-400/10"
                            }`}>
                              {result.type === "player" ? (
                                <Users className="w-5 h-5 text-blue-400" />
                              ) : (
                                <TrendingUp className="w-5 h-5 text-purple-400" />
                              )}
                            </div>
                            <span className="font-medium text-white">
                              {result.name || result.slug}
                            </span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Badge 
                              variant="outline" 
                              className="text-xs border-gray-600 text-gray-300"
                            >
                              {result.type}
                            </Badge>
                            <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-green-400 transition-colors" />
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </motion.div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence mode="wait">
        {selectedResult && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            <Card className="bg-gray-900/40 backdrop-blur-xl border-gray-700/50 shadow-2xl">
              <CardHeader className="bg-gradient-to-r from-gray-800/50 to-gray-900/50 backdrop-blur-sm rounded-t-lg">
                <CardTitle className="flex items-center text-white">
                  <div className={`p-2 rounded-lg mr-3 ${
                    selectedResult.type === "player" 
                      ? "bg-blue-400/10" 
                      : "bg-purple-400/10"
                  }`}>
                    {selectedResult.type === "player" ? (
                      <Users className="w-5 h-5 text-blue-400" />
                    ) : (
                      <TrendingUp className="w-5 h-5 text-purple-400" />
                    )}
                  </div>
                  {selectedResult.name || selectedResult.slug}
                </CardTitle>
                <CardDescription className="text-gray-300">
                  {selectedResult.type === "player" 
                    ? "Player profile and match history"
                    : "Matches with this scoreline"
                  }
                </CardDescription>
              </CardHeader>
              <CardContent className="p-6">
                {selectedResult.type === "player" ? (
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-center py-8"
                  >
                    <div className="p-4 bg-blue-400/10 rounded-full w-20 h-20 mx-auto mb-4 flex items-center justify-center">
                      <Users className="w-10 h-10 text-blue-400" />
                    </div>
                    <p className="text-gray-300 mb-6">
                      Player details and match history coming soon!
                    </p>
                    <Button 
                      variant="outline" 
                      onClick={() => router.push("/explore")}
                      className="border-green-400 text-green-400 hover:bg-green-400 hover:text-black transition-all duration-300"
                    >
                      Explore Data Visualization
                    </Button>
                  </motion.div>
                ) : (
                  <div>
                    {isLoadingMatches ? (
                      <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="text-center py-8"
                      >
                        <Loader2 className="w-8 h-8 text-green-400 animate-spin mx-auto mb-4" />
                        <p className="text-gray-300">Loading matches...</p>
                      </motion.div>
                    ) : matches.length > 0 ? (
                      <div>
                        <div className="flex items-center justify-between mb-4">
                          <h3 className="text-lg font-semibold text-white">
                            Matches ({matches.length})
                          </h3>
                          <Badge 
                            variant="secondary" 
                            className="bg-purple-400/20 text-purple-400 border-purple-400/30"
                          >
                            {selectedResult.slug}
                          </Badge>
                        </div>
                        <Separator className="bg-gray-700/50 mb-4" />
                        <motion.div 
                          variants={container}
                          initial="hidden"
                          animate="show"
                          className="space-y-3 max-h-96 overflow-y-auto pr-2"
                        >
                          {matches.map((match) => (
                            <motion.div
                              key={match.match_id}
                              variants={item}
                              whileHover={{ scale: 1.02 }}
                              className="p-4 bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700/50 hover:border-gray-600/50 transition-all duration-300"
                            >
                              <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center">
                                  <div className="p-1.5 bg-yellow-400/10 rounded-lg mr-2">
                                    <Trophy className="w-4 h-4 text-yellow-400" />
                                  </div>
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
                            </motion.div>
                          ))}
                        </motion.div>
                      </div>
                    ) : (
                      <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="text-center py-8"
                      >
                        <div className="p-4 bg-purple-400/10 rounded-full w-20 h-20 mx-auto mb-4 flex items-center justify-center">
                          <TrendingUp className="w-10 h-10 text-purple-400" />
                        </div>
                        <p className="text-gray-300">No matches found for this scoreline.</p>
                      </motion.div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};