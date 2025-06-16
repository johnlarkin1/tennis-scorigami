"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  useFuzzySearch,
  useSearchSuggestions,
} from "@/lib/hooks/use-search-suggestions";
import {
  getKeywordSuggestions,
  KEYWORD_PREFIXES,
  KeywordType,
  parseSearchQuery,
} from "@/lib/search/search-parser";
import { AnimatePresence, motion } from "framer-motion";
import { Search, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useSearchData } from "./search-provider";

interface SearchBarProps {
  query: string;
  setQuery: (query: string) => void;
  placeholder?: string;
  isSearching?: boolean;
}

export const SearchBar: React.FC<SearchBarProps> = ({
  query,
  setQuery,
  placeholder = "Search for players, tournaments, scores... Try: player:Roddick",
  isSearching = false,
}) => {
  const [showDropdown, setShowDropdown] = useState(false);
  const [cursorPosition, setCursorPosition] = useState(0);
  const [activeKeywordType, setActiveKeywordType] =
    useState<KeywordType | null>(null);
  const [dropdownQuery, setDropdownQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Get preloaded search data
  const { getDataForKeyword } = useSearchData();

  // Get current keyword context at cursor position
  const getCurrentKeywordContext = (text: string, position: number) => {
    const beforeCursor = text.slice(0, position);
    const words = beforeCursor.split(/\s+/);
    const currentWord = words[words.length - 1] || "";

    // Check if we're typing a keyword prefix
    for (const [keywordType, prefixes] of Object.entries(KEYWORD_PREFIXES)) {
      for (const prefix of prefixes) {
        if (currentWord.startsWith(prefix)) {
          const valueAfterPrefix = currentWord.slice(prefix.length);
          return {
            keywordType: keywordType as KeywordType,
            prefix,
            value: valueAfterPrefix,
            isComplete: false,
            startPosition: beforeCursor.length - currentWord.length,
            endPosition: beforeCursor.length,
          };
        }
      }
    }

    // Check if we're in the middle of typing a keyword
    const keywordSuggestions = getKeywordSuggestions(currentWord);
    if (keywordSuggestions.length > 0) {
      return {
        keywordType: null,
        prefix: "",
        value: currentWord,
        isComplete: false,
        suggestions: keywordSuggestions,
        startPosition: beforeCursor.length - currentWord.length,
        endPosition: beforeCursor.length,
      };
    }

    return null;
  };

  // Get suggestions - use preloaded data if no query, otherwise fetch filtered data
  const { data: fetchedSuggestions, isLoading } = useSearchSuggestions(
    activeKeywordType,
    dropdownQuery,
    showDropdown && !!activeKeywordType // Remove the dropdownQuery requirement
  );

  // Use preloaded data when no query, fetched data when there's a query
  const currentSuggestions =
    !dropdownQuery && activeKeywordType
      ? getDataForKeyword(activeKeywordType) // Use preloaded data when just prefix is typed
      : fetchedSuggestions?.items || [];

  // Apply fuzzy search only if there's a query, otherwise show all suggestions
  const fuzzySearchResults = useFuzzySearch(currentSuggestions, dropdownQuery);
  const fuzzyResults = dropdownQuery ? fuzzySearchResults : currentSuggestions;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    const newCursorPosition = e.target.selectionStart || 0;

    setQuery(newValue);
    setCursorPosition(newCursorPosition);

    const context = getCurrentKeywordContext(newValue, newCursorPosition);

    if (context?.keywordType) {
      setActiveKeywordType(context.keywordType);
      setDropdownQuery(context.value);
      setShowDropdown(true);
    } else if (context?.suggestions) {
      setActiveKeywordType(null);
      setShowDropdown(true);
    } else {
      setShowDropdown(false);
      setActiveKeywordType(null);
      setDropdownQuery("");
    }
  };

  const handleSuggestionClick = (suggestion: {
    id: string | number;
    name: string;
    value: string;
  }) => {
    if (!inputRef.current) return;

    const text = query;
    const context = getCurrentKeywordContext(text, cursorPosition);

    if (context?.keywordType) {
      // Replace the entire keyword (prefix + value) with the selected suggestion
      const beforeKeyword = text.slice(0, context.startPosition);
      const afterKeyword = text.slice(context.endPosition);

      // Always use the display name for the UI
      const valueToInsert = suggestion.name || suggestion.value;
      const prefix = context.prefix;

      const newText = `${beforeKeyword}${prefix}${valueToInsert} ${afterKeyword.trim()}`;
      setQuery(newText);

      // Set cursor after the inserted text
      setTimeout(() => {
        if (inputRef.current) {
          const newPosition =
            beforeKeyword.length + prefix.length + valueToInsert.length + 1;
          inputRef.current.setSelectionRange(newPosition, newPosition);
          inputRef.current.focus();
        }
      }, 0);
    } else if (context?.suggestions) {
      // Add keyword prefix
      const beforeWord = text.slice(0, context.startPosition);
      const afterCursor = text.slice(context.endPosition);
      const keywordType = context.suggestions[0];
      const prefix = KEYWORD_PREFIXES[keywordType][0];
      const newText = `${beforeWord}${prefix} ${afterCursor}`;
      setQuery(newText);

      // Set cursor after the prefix and trigger dropdown
      setTimeout(() => {
        if (inputRef.current) {
          const newPosition = beforeWord.length + prefix.length;
          inputRef.current.setSelectionRange(newPosition, newPosition);
          setCursorPosition(newPosition);
          inputRef.current.focus();
          // Trigger context update to show dropdown
          handleInputChange({
            target: { value: newText, selectionStart: newPosition },
          } as React.ChangeEvent<HTMLInputElement>);
        }
      }, 0);
    }

    setShowDropdown(false);
  };

  const handleKeywordPrefixClick = (keywordType: KeywordType) => {
    const prefix = KEYWORD_PREFIXES[keywordType][0];
    const newText = query + (query && !query.endsWith(" ") ? " " : "") + prefix;
    setQuery(newText);

    setTimeout(() => {
      if (inputRef.current) {
        inputRef.current.focus();
        const newPosition = newText.length;
        inputRef.current.setSelectionRange(newPosition, newPosition);
      }
    }, 0);
  };

  const handleClear = () => {
    setQuery("");
    setShowDropdown(false);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setShowDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Parse query to show active keywords
  const parsedQuery = parseSearchQuery(query);

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
              ref={inputRef}
              type="text"
              placeholder={placeholder}
              value={query}
              onChange={handleInputChange}
              onFocus={() => {
                const context = getCurrentKeywordContext(query, cursorPosition);
                if (context) setShowDropdown(true);
              }}
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

          {/* Active keywords display */}
          {parsedQuery.keywords.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-2 px-4 pb-2">
              {parsedQuery.keywords
                .filter(
                  (keyword) => keyword.value && keyword.value.trim() !== ""
                ) // Only show keywords with values
                .map((keyword, index) => {
                  // Define colors for different keyword types
                  const colorMap: Record<KeywordType, string> = {
                    player: "bg-blue-400/20 text-blue-400 border-blue-400/30",
                    opponent:
                      "bg-purple-400/20 text-purple-400 border-purple-400/30",
                    tournament:
                      "bg-green-400/20 text-green-400 border-green-400/30",
                    country:
                      "bg-orange-400/20 text-orange-400 border-orange-400/30",
                    surface:
                      "bg-yellow-400/20 text-yellow-400 border-yellow-400/30",
                    round: "bg-pink-400/20 text-pink-400 border-pink-400/30",
                    year: "bg-cyan-400/20 text-cyan-400 border-cyan-400/30",
                    sex: "bg-indigo-400/20 text-indigo-400 border-indigo-400/30",
                    score: "bg-red-400/20 text-red-400 border-red-400/30",
                    has: "bg-emerald-400/20 text-emerald-400 border-emerald-400/30",
                    never: "bg-rose-400/20 text-rose-400 border-rose-400/30",
                    location: "bg-teal-400/20 text-teal-400 border-teal-400/30",
                  };

                  return (
                    <Badge
                      key={index}
                      variant="secondary"
                      className={
                        colorMap[keyword.type as KeywordType] ||
                        "bg-gray-400/20 text-gray-400 border-gray-400/30"
                      }
                    >
                      <span className="font-semibold">{keyword.type}:</span>{" "}
                      {keyword.value}
                    </Badge>
                  );
                })}
            </div>
          )}
        </div>
      </div>

      {/* Dropdown */}
      <AnimatePresence>
        {showDropdown && (
          <motion.div
            ref={dropdownRef}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute top-full left-0 right-0 mt-2 z-50"
          >
            <Card className="bg-gray-900/95 backdrop-blur-xl border-gray-700/50 shadow-2xl max-h-96 overflow-y-auto">
              {activeKeywordType ? (
                // Show suggestions for current keyword
                <div className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="text-white font-medium capitalize">
                      {activeKeywordType === "opponent"
                        ? "Players"
                        : `${activeKeywordType}s`}
                    </h4>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-gray-400">
                        Type to filter
                      </span>
                      {dropdownQuery && (
                        <Badge variant="outline" className="text-xs">
                          &quot;{dropdownQuery}&quot;
                        </Badge>
                      )}
                    </div>
                  </div>

                  {isLoading && dropdownQuery ? (
                    <div className="text-center py-4">
                      <div className="w-5 h-5 border-2 border-green-400 border-t-transparent rounded-full animate-spin mx-auto" />
                      <p className="text-gray-400 text-sm mt-2">
                        Loading {activeKeywordType}...
                      </p>
                    </div>
                  ) : fuzzyResults.length > 0 ? (
                    <>
                      <div className="space-y-1 max-h-64 overflow-y-auto">
                        {fuzzyResults.slice(0, 20).map((suggestion) => (
                          <div
                            key={suggestion.id}
                            onClick={() => handleSuggestionClick(suggestion)}
                            className={`px-3 py-2 rounded-lg hover:bg-gray-800/50 cursor-pointer transition-colors flex items-center justify-between group ${
                              suggestion.suggested
                                ? "bg-gradient-to-r from-green-500/10 to-blue-500/10 border border-green-500/20 text-white"
                                : "text-gray-200 hover:text-white"
                            }`}
                          >
                            <div className="flex items-center">
                              {suggestion.suggested ? (
                                <div className="w-2 h-2 bg-green-400 rounded-full mr-2 animate-pulse" />
                              ) : null}
                              <span className={suggestion.suggested ? "font-medium" : ""}>
                                {suggestion.name}
                              </span>
                              {suggestion.suggested ? (
                                <span className="ml-2 text-xs px-1.5 py-0.5 bg-green-400/20 text-green-400 rounded-full">
                                  Featured
                                </span>
                              ) : null}
                            </div>
                            {suggestion.value !== suggestion.name && (
                              <span className={`text-xs group-hover:text-gray-400 ${
                                suggestion.suggested ? "text-gray-300" : "text-gray-500"
                              }`}>
                                {suggestion.value}
                              </span>
                            )}
                          </div>
                        ))}
                      </div>
                      {fuzzyResults.length > 20 && (
                        <p className="text-gray-500 text-xs mt-2 text-center">
                          Showing first 20 of {fuzzyResults.length} results
                        </p>
                      )}
                    </>
                  ) : (
                    <div className="text-center py-4">
                      <p className="text-gray-400 text-sm">
                        {dropdownQuery
                          ? `No ${activeKeywordType}s found matching "${dropdownQuery}"`
                          : `Start typing to see ${activeKeywordType} suggestions`}
                      </p>
                    </div>
                  )}
                </div>
              ) : (
                // Show keyword prefix suggestions
                <div className="p-4">
                  <h4 className="text-white font-medium mb-2">
                    Search Keywords
                  </h4>
                  <div className="grid grid-cols-2 gap-2">
                    {Object.entries(KEYWORD_PREFIXES).map(
                      ([keywordType, prefixes]) => (
                        <div
                          key={keywordType}
                          onClick={() =>
                            handleKeywordPrefixClick(keywordType as KeywordType)
                          }
                          className="px-3 py-2 rounded-lg hover:bg-gray-800/50 cursor-pointer transition-colors text-gray-200 hover:text-white text-sm"
                        >
                          <span className="text-green-400">{prefixes[0]}</span>
                          <span className="text-gray-400 capitalize ml-1">
                            {keywordType === "opponent"
                              ? "player"
                              : keywordType}
                          </span>
                        </div>
                      )
                    )}
                  </div>
                </div>
              )}
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: query ? 1 : 0 }}
        className="mt-2 text-center"
      >
        <p className="text-xs text-gray-400">
          Use keywords like{" "}
          <code className="bg-gray-800 px-1 rounded">player:</code>,{" "}
          <code className="bg-gray-800 px-1 rounded">tournament:</code>,{" "}
          <code className="bg-gray-800 px-1 rounded">score:</code> for advanced
          search
        </p>
      </motion.div>
    </motion.div>
  );
};
