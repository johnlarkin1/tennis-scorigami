"use client";

import { Input } from "@/components/ui/input";
import { Search, X } from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";

interface SearchBarProps {
  query: string;
  setQuery: (query: string) => void;
  placeholder?: string;
  isSearching?: boolean;
}

export const SearchBar: React.FC<SearchBarProps> = ({
  query,
  setQuery,
  placeholder = "Search for players or scores...",
  isSearching = false,
}) => {
  const handleClear = () => {
    setQuery("");
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="relative w-full max-w-4xl mx-auto"
    >
      <div className="relative group">
        <div className="absolute inset-0 bg-gradient-to-r from-green-400/20 to-blue-400/20 rounded-2xl blur-xl group-hover:blur-2xl transition-all duration-300" />
        
        <div className="relative bg-gray-900/40 backdrop-blur-xl border border-gray-700/50 rounded-2xl p-2 shadow-2xl">
          <div className="relative flex items-center">
            <Search className="absolute left-4 text-gray-400 w-5 h-5 pointer-events-none" />
            
            <Input
              type="text"
              placeholder={placeholder}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="pl-12 pr-12 py-4 bg-transparent border-none text-white placeholder-gray-400 text-lg focus:outline-none focus:ring-0 w-full"
            />
            
            {query && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleClear}
                className="absolute right-2 text-gray-400 hover:text-white transition-colors"
              >
                <X className="w-4 h-4" />
              </Button>
            )}
            
            {isSearching && (
              <div className="absolute right-12 top-1/2 transform -translate-y-1/2">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  className="w-5 h-5 border-2 border-green-400 border-t-transparent rounded-full"
                />
              </div>
            )}
          </div>
        </div>
      </div>
      
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: query ? 1 : 0 }}
        className="mt-2 text-center"
      >
        <p className="text-xs text-gray-400">
          Press Enter to search or use filters below
        </p>
      </motion.div>
    </motion.div>
  );
};