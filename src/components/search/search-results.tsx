"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { SearchResult } from "@/lib/types/search-types";
import { AnimatePresence, motion } from "framer-motion";
import { TrendingUp, Users } from "lucide-react";
import { useRouter } from "next/navigation";

interface SearchResultsProps {
  searchResults: SearchResult[];
  selectedResult: SearchResult | null;
  onResultSelect: (result: SearchResult) => void;
}

export const SearchResults: React.FC<SearchResultsProps> = ({
  searchResults = [],
  selectedResult,
  onResultSelect,
}) => {
  const router = useRouter();

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05,
      },
    },
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 },
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
                </CardTitle>
                <CardDescription className="text-gray-300">
                  Found {searchResults.length} results
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
                            <div className="p-2 rounded-lg bg-blue-400/10">
                              <Users className="w-5 h-5 text-blue-400" />
                            </div>
                            <span className="font-medium text-white">
                              {result.name || result.slug}
                            </span>
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
                  <div className="p-2 rounded-lg mr-3 bg-blue-400/10">
                    <Users className="w-5 h-5 text-blue-400" />
                  </div>
                  {selectedResult.name || selectedResult.slug}
                </CardTitle>
                <CardDescription className="text-gray-300">
                  Player profile and match history
                </CardDescription>
              </CardHeader>
              <CardContent className="p-6">
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
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
