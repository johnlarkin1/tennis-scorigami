"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Search, X } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
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
import { SearchChip } from "./search-chip";
import { useSearchData } from "./search-provider";

interface Chip {
  id: string;
  type: KeywordType;
  value: string; // Display name
  entityId?: string | number; // Underlying database ID
  isValidSelection?: boolean; // Whether this was selected from dropdown
  isValid?: boolean; // Whether the current value is valid
}

interface SearchBarProps {
  query: string;
  setQuery: (q: string) => void;
  placeholder?: string;
  isSearching?: boolean;
}

export const SearchBar: React.FC<SearchBarProps> = ({
  query,
  setQuery,
  placeholder = "Search for players, tournaments, scores…  Try: player:Roddick",
  isSearching = false,
}) => {
  const [chips, setChips] = useState<Chip[]>([]);
  const [currentInput, setCurrentInput] = useState("");
  const [editingChipId, setEditingChipId] = useState<string | null>(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const [activeKeywordType, setActiveKeywordType] =
    useState<KeywordType | null>(null);
  const [selectedIndex, setSelectedIndex] = useState(-1);

  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const isInternalUpdate = useRef(false);
  const selectedItemRefs = useRef<(HTMLDivElement | null)[]>([]);

  const { getDataForKeyword } = useSearchData();

  // Validate a chip value against available suggestions
  const validateChipValue = (type: KeywordType, value: string): boolean => {
    if (!value.trim()) return false;

    // Simple fields that are always valid if they have content
    if (type === "score") return true;
    if (type === "sex") return true; // M/F single chars
    if (type === "year") return true; // Any year value
    if (type === "status") return true; // complete/incomplete values

    // Check if the value matches any suggestion
    const suggestions = getDataForKeyword(type);
    return (
      suggestions?.some(
        (item) =>
          item.name.toLowerCase() === value.toLowerCase() ||
          item.value.toLowerCase() === value.toLowerCase()
      ) || false
    );
  };

  // Get the current value being edited (either chip value or input value)
  const getCurrentEditValue = () => {
    if (editingChipId) {
      const chip = chips.find((c) => c.id === editingChipId);
      return chip?.value || "";
    }
    return currentInput;
  };

  // Get suggestions
  const dropdownQuery = getCurrentEditValue();
  const { data: fetchedSuggestions, isLoading } = useSearchSuggestions(
    activeKeywordType,
    dropdownQuery,
    showDropdown && !!activeKeywordType
  );

  const currentSuggestions =
    !dropdownQuery && activeKeywordType
      ? getDataForKeyword(activeKeywordType)
      : fetchedSuggestions?.items || [];

  // Always call useFuzzySearch to maintain hooks order
  const fuzzySearchResults = useFuzzySearch(currentSuggestions, dropdownQuery);

  // Only use fuzzy results if there's a query
  const fuzzyResults = dropdownQuery ? fuzzySearchResults : currentSuggestions;

  // Scroll selected item into view
  useEffect(() => {
    if (selectedIndex >= 0 && selectedItemRefs.current[selectedIndex]) {
      selectedItemRefs.current[selectedIndex]?.scrollIntoView({
        behavior: "smooth",
        block: "nearest",
      });
    }
  }, [selectedIndex]);

  // Sync with external query changes
  useEffect(() => {
    if (isInternalUpdate.current) {
      isInternalUpdate.current = false;
      return;
    }
    const parsed = parseSearchQuery(query);
    const newChips: Chip[] = parsed.keywords.map((k, idx) => {
      // Simple types that don't require ID validation
      const isSimpleType = ["score", "sex", "year", "status"].includes(k.type);

      return {
        id: `${k.type}-${idx}`,
        type: k.type,
        value: k.value,
        entityId: k.id,
        isValidSelection: !!k.id, // If we have an ID, it was a valid selection
        isValid: !!k.id || isSimpleType, // Valid if has ID or is simple type
      };
    });
    setChips(newChips);
    setCurrentInput(parsed.plainText);
  }, [query]);

  // Build and commit query
  const updateQuery = useCallback(() => {
    const chipParts = chips
      .filter((c) => c.value.trim() && c.isValid !== false) // Only include chips with values and that are valid
      .map((c) => {
        const prefix = KEYWORD_PREFIXES[c.type][0];
        // Use ID format if available: prefix#id:displayName
        if (c.entityId && c.isValidSelection) {
          return `${prefix}#${c.entityId}:${c.value}`;
        }
        // Fallback to text format
        return `${prefix}${c.value}`;
      });
    const fullQuery = [...chipParts, currentInput].filter(Boolean).join(" ");
    isInternalUpdate.current = true;
    setQuery(fullQuery);
  }, [chips, currentInput, setQuery]);

  // Check for keyword prefix in text
  const detectPrefix = (text: string) => {
    for (const [type, prefixes] of Object.entries(KEYWORD_PREFIXES)) {
      for (const prefix of prefixes) {
        if (text === prefix || text.endsWith(" " + prefix)) {
          return { type: type as KeywordType, prefix };
        }
      }
    }
    return null;
  };

  // Handle main input change
  const handleInputChange = (value: string) => {
    if (editingChipId) {
      // Update the chip being edited
      setChips((prev) =>
        prev.map((c) => {
          if (c.id === editingChipId) {
            const isValid = validateChipValue(c.type, value);
            return {
              ...c,
              value,
              isValidSelection: isValid,
              isValid,
            };
          }
          return c;
        })
      );
      // Don't update query while editing a chip - wait for completion
      return;
    }

    // Check if user typed a prefix
    const prefix = detectPrefix(value);
    if (prefix) {
      // Create new chip in edit mode
      const newChip: Chip = {
        id: `${prefix.type}-${Date.now()}`,
        type: prefix.type,
        value: "",
        isValid: true, // Start as valid, will be validated as user types
      };
      setChips((prev) => [...prev, newChip]);
      setEditingChipId(newChip.id);
      setActiveKeywordType(prefix.type);
      setShowDropdown(true);
      setCurrentInput("");
      setSelectedIndex(-1);
    } else {
      setCurrentInput(value);
      // Update query immediately as user types in the main input
      isInternalUpdate.current = true;
      const chipParts = chips
        .filter((c) => c.value.trim() && c.isValid !== false)
        .map((c) => {
          const prefix = KEYWORD_PREFIXES[c.type][0];
          if (c.entityId && c.isValidSelection) {
            return `${prefix}#${c.entityId}:${c.value}`;
          }
          return `${prefix}${c.value}`;
        });
      const fullQuery = [...chipParts, value].filter(Boolean).join(" ");
      setQuery(fullQuery);
    }
  };

  // Handle keyboard events
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!showDropdown || !editingChipId) {
      // Handle backspace to delete last chip
      if (
        e.key === "Backspace" &&
        !currentInput &&
        chips.length > 0 &&
        !editingChipId
      ) {
        e.preventDefault();
        const newChips = chips.slice(0, -1);
        setChips(newChips);
        // Immediately update query with the new chips
        const chipParts = newChips
          .filter((c) => c.value.trim() && c.isValid !== false)
          .map((c) => {
            const prefix = KEYWORD_PREFIXES[c.type][0];
            if (c.entityId && c.isValidSelection) {
              return `${prefix}#${c.entityId}:${c.value}`;
            }
            return `${prefix}${c.value}`;
          });
        const fullQuery = chipParts.filter(Boolean).join(" ");
        setQuery(fullQuery);
      }

      // Handle left arrow to edit last chip
      if (
        e.key === "ArrowLeft" &&
        e.currentTarget instanceof HTMLInputElement &&
        e.currentTarget.selectionStart === 0 &&
        chips.length > 0 &&
        !editingChipId
      ) {
        e.preventDefault();
        const lastChip = chips[chips.length - 1];
        startEditingChip(lastChip.id, "end");
      }
      return;
    }

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setSelectedIndex((prev) =>
          prev < fuzzyResults.length - 1 ? prev + 1 : prev
        );
        break;

      case "ArrowUp":
        e.preventDefault();
        setSelectedIndex((prev) => (prev > -1 ? prev - 1 : -1));
        break;

      case "Enter":
        e.preventDefault();
        if (selectedIndex >= 0) {
          selectSuggestion(fuzzyResults[selectedIndex]);
        } else if (fuzzyResults.length === 1) {
          selectSuggestion(fuzzyResults[0]);
        } else {
          completeEditing();
        }
        break;

      case "Escape":
        e.preventDefault();
        const chip = chips.find((c) => c.id === editingChipId);
        if (!chip?.value) {
          // Remove empty chip
          setChips((prev) => prev.filter((c) => c.id !== editingChipId));
        }
        completeEditing();
        break;

      case "ArrowRight":
        if (
          e.currentTarget instanceof HTMLInputElement &&
          e.currentTarget.selectionStart === e.currentTarget.value.length
        ) {
          e.preventDefault();
          completeEditing();
        }
        break;

      case "Backspace":
        if (!getCurrentEditValue() && editingChipId) {
          e.preventDefault();
          setChips((prev) => prev.filter((c) => c.id !== editingChipId));
          completeEditing();
        }
        break;
    }
  };

  // Select a suggestion
  const selectSuggestion = (suggestion: {
    name: string;
    value: string;
    id?: string | number;
  }) => {
    if (editingChipId) {
      // Update the chip with the selected suggestion
      const updatedChips = chips.map((c) =>
        c.id === editingChipId
          ? {
              ...c,
              value: suggestion.name,
              entityId: suggestion.id,
              isValidSelection: true,
              isValid: true,
            }
          : c
      );

      // Build the query with the updated chips
      const chipParts = updatedChips
        .filter((c) => c.value.trim() && c.isValid !== false)
        .map((c) => {
          const prefix = KEYWORD_PREFIXES[c.type][0];
          if (c.entityId && c.isValidSelection) {
            return `${prefix}#${c.entityId}:${c.value}`;
          }
          return `${prefix}${c.value}`;
        });
      const fullQuery = [...chipParts, currentInput].filter(Boolean).join(" ");

      // Update chips state
      setChips(updatedChips);

      // Close editing UI
      setEditingChipId(null);
      setActiveKeywordType(null);
      setShowDropdown(false);
      setSelectedIndex(-1);

      // Trigger search by directly calling setQuery without isInternalUpdate flag
      setQuery(fullQuery);

      setTimeout(() => inputRef.current?.focus(), 0);
    }
  };

  // Complete editing
  const completeEditing = () => {
    setEditingChipId(null);
    setActiveKeywordType(null);
    setShowDropdown(false);
    setSelectedIndex(-1);
    updateQuery();
    setTimeout(() => inputRef.current?.focus(), 0);
  };

  // Start editing a chip
  const startEditingChip = (
    chipId: string,
    cursorPosition: "start" | "end" = "start"
  ) => {
    const chip = chips.find((c) => c.id === chipId);
    if (chip) {
      setEditingChipId(chipId);
      setActiveKeywordType(chip.type);
      setShowDropdown(true);
      setSelectedIndex(-1);

      // Set cursor position after a brief delay to ensure the input is rendered
      setTimeout(() => {
        const chipInput = document.querySelector(
          `input[data-chip-id="${chipId}"]`
        ) as HTMLInputElement;
        if (chipInput) {
          chipInput.focus();
          if (cursorPosition === "end") {
            chipInput.setSelectionRange(
              chipInput.value.length,
              chipInput.value.length
            );
          } else {
            chipInput.setSelectionRange(0, 0);
          }
        }
      }, 0);
    }
  };

  // Remove a chip
  const removeChip = (chipId: string) => {
    const newChips = chips.filter((c) => c.id !== chipId);
    setChips(newChips);
    if (editingChipId === chipId) {
      setEditingChipId(null);
      setActiveKeywordType(null);
      setShowDropdown(false);
    }
    // Immediately update query with the new chips
    const chipParts = newChips
      .filter((c) => c.value.trim() && c.isValid !== false)
      .map((c) => {
        const prefix = KEYWORD_PREFIXES[c.type][0];
        if (c.entityId && c.isValidSelection) {
          return `${prefix}#${c.entityId}:${c.value}`;
        }
        return `${prefix}${c.value}`;
      });
    const fullQuery = [...chipParts, currentInput].filter(Boolean).join(" ");
    setQuery(fullQuery);
  };

  // Handle dropdown prefix click
  const handlePrefixClick = (type: KeywordType) => {
    const newChip: Chip = {
      id: `${type}-${Date.now()}`,
      type,
      value: "",
      isValid: true, // Start as valid, will be validated as user types
    };
    setChips((prev) => [...prev, newChip]);
    setEditingChipId(newChip.id);
    setActiveKeywordType(type);
    setShowDropdown(true);
    setCurrentInput("");
    setSelectedIndex(-1);
  };

  // Click outside handler
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node) &&
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Update query when chips change (but not when editing)
  // Remove this effect to prevent feedback loop - query updates are handled
  // explicitly when user actions occur (input change, chip removal, etc.)
  // The external query prop syncs to internal state via the other useEffect

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="relative w-full max-w-4xl mx-auto"
    >
      <div className="relative group">
        <div className="absolute inset-0 bg-gradient-to-r from-green-400/20 to-blue-400/20 rounded-3xl blur-xl group-hover:blur-2xl transition-all duration-300" />

        <div className="relative bg-gray-900/60 backdrop-blur-2xl border border-gray-700/70 rounded-3xl shadow-[0_0_40px_-10px_rgba(0,0,0,0.8)]">
          <div
            ref={containerRef}
            className="relative flex items-center flex-wrap gap-2 px-4 py-3 min-h-[60px]"
            onClick={(e) => {
              // If clicking on the container (not on a chip), complete editing
              if (editingChipId && e.target === e.currentTarget) {
                completeEditing();
              }
            }}
          >
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5 pointer-events-none" />

            <div className="flex items-center flex-wrap gap-2 flex-1 pl-8">
              {/* Render chips */}
              {chips.map((chip) => (
                <SearchChip
                  key={chip.id}
                  id={chip.id}
                  type={chip.type}
                  value={chip.value}
                  isEditing={editingChipId === chip.id}
                  isValid={chip.isValid !== false} // Default to true if undefined
                  onUpdate={(_, value) => handleInputChange(value)}
                  onRemove={() => removeChip(chip.id)}
                  onKeyDown={handleKeyDown}
                  onFocus={() => {
                    if (!editingChipId) startEditingChip(chip.id);
                  }}
                  onClick={() => {
                    if (!editingChipId) startEditingChip(chip.id);
                  }}
                />
              ))}

              {/* Main input */}
              <input
                ref={inputRef}
                type="text"
                value={currentInput}
                onChange={(e) => handleInputChange(e.target.value)}
                onKeyDown={handleKeyDown}
                onFocus={() => {
                  if (editingChipId) {
                    completeEditing();
                  }
                  if (getKeywordSuggestions(currentInput).length > 0) {
                    setShowDropdown(true);
                  }
                }}
                onClick={() => {
                  if (editingChipId) {
                    completeEditing();
                  }
                }}
                placeholder={
                  editingChipId
                    ? "Click here to finish editing..."
                    : chips.length
                      ? "Add more filters..."
                      : placeholder
                }
                className={`flex-1 min-w-[180px] bg-transparent text-white placeholder-gray-400 text-lg outline-none
                  ${editingChipId ? "opacity-50" : ""}`}
              />
            </div>

            {/* Clear button */}
            {(chips.length > 0 || currentInput) && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setChips([]);
                  setCurrentInput("");
                  setEditingChipId(null);
                  setActiveKeywordType(null);
                  setShowDropdown(false);
                  setQuery("");
                }}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </Button>
            )}

            {/* Loading spinner */}
            {isSearching && (
              <div className="absolute right-12 top-1/2 -translate-y-1/2">
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
                <div className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="text-white font-medium capitalize">
                      {activeKeywordType === "opponent"
                        ? "Players"
                        : `${activeKeywordType}s`}
                      {fuzzyResults.length === 1 && (
                        <span className="text-xs text-gray-400 ml-2">
                          (Press Enter to select)
                        </span>
                      )}
                    </h4>
                    {dropdownQuery && (
                      <Badge
                        variant="outline"
                        className="text-xs text-gray-400"
                      >
                        &ldquo;{dropdownQuery}&rdquo;
                      </Badge>
                    )}
                  </div>

                  {isLoading && dropdownQuery ? (
                    <div className="text-center py-6">
                      <div className="w-6 h-6 border-2 border-green-400 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                      <p className="text-gray-400 text-sm">
                        Loading {activeKeywordType}…
                      </p>
                    </div>
                  ) : (
                    <>
                      {fuzzyResults.slice(0, 20).map((item, idx) => (
                        <div
                          key={item.id}
                          ref={(el) => {
                            selectedItemRefs.current[idx] = el;
                          }}
                          onClick={() => selectSuggestion(item)}
                          className={`px-3 py-2 rounded-lg cursor-pointer transition-colors
                            ${
                              selectedIndex === idx ||
                              (fuzzyResults.length === 1 &&
                                selectedIndex === -1)
                                ? "bg-gray-700/60 text-white"
                                : "text-gray-300 hover:bg-gray-800/60"
                            }`}
                        >
                          <span>{item.name}</span>
                          {item.value !== item.name && (
                            <span className="text-xs text-gray-500 ml-2">
                              {item.value}
                            </span>
                          )}
                        </div>
                      ))}
                      {!fuzzyResults.length && (
                        <p className="text-center text-gray-500 py-6">
                          No matches
                        </p>
                      )}
                    </>
                  )}
                </div>
              ) : (
                <div className="p-4">
                  <h4 className="text-white font-medium mb-2">
                    Search keywords
                  </h4>
                  <div className="grid grid-cols-2 gap-2">
                    {Object.entries(KEYWORD_PREFIXES).map(
                      ([type, prefixes]) => (
                        <button
                          key={type}
                          onClick={() => handlePrefixClick(type as KeywordType)}
                          className="px-3 py-2 rounded-lg hover:bg-gray-800/60 text-gray-300 hover:text-white text-sm text-left"
                        >
                          <span className="text-green-400">{prefixes[0]}</span>
                          <span className="ml-1">
                            {type === "opponent" ? "player" : type}
                          </span>
                        </button>
                      )
                    )}
                  </div>
                </div>
              )}
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Helper text */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: query ? 1 : 0 }}
        className="mt-2 text-center"
      >
        <p className="text-xs text-gray-400">
          Tip – try <code className="bg-gray-800 px-1 rounded">player:</code>,{" "}
          <code className="bg-gray-800 px-1 rounded">tournament:</code>,{" "}
          <code className="bg-gray-800 px-1 rounded">score:</code>
        </p>
      </motion.div>
    </motion.div>
  );
};
