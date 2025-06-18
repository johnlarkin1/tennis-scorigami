"use client";

import { motion } from "framer-motion";
import { SearchResult } from "@/lib/types/search-types";
import { MatchCard } from "../components/match-card";

interface CardsViewProps {
  matches: SearchResult[];
  onResultSelect: (result: SearchResult) => void;
  selectedResult: SearchResult | null;
}

export function CardsView({
  matches,
  onResultSelect,
  selectedResult,
}: CardsViewProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.4 }}
      className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6"
    >
      {matches.map((result, index) => (
        <MatchCard
          key={result.id}
          result={result}
          index={index}
          onSelect={onResultSelect}
          isSelected={selectedResult?.id === result.id}
        />
      ))}
    </motion.div>
  );
}
