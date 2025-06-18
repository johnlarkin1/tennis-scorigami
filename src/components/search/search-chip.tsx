"use client";

import { KEYWORD_PREFIXES, KeywordType } from "@/lib/search/search-parser";
import { motion } from "framer-motion";
import { X } from "lucide-react";
import { useEffect, useRef } from "react";

interface SearchChipProps {
  id: string;
  type: KeywordType;
  value: string;
  isEditing: boolean;
  isValid?: boolean;
  onUpdate: (id: string, value: string) => void;
  onRemove: (id: string) => void;
  onKeyDown?: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  onFocus?: () => void;
  onClick?: () => void;
}

export const SearchChip: React.FC<SearchChipProps> = ({
  id,
  type,
  value,
  isEditing,
  isValid = true,
  onUpdate,
  onRemove,
  onKeyDown,
  onFocus,
  onClick,
}) => {
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (
      isEditing &&
      inputRef.current &&
      document.activeElement !== inputRef.current
    ) {
      inputRef.current.focus();
      // Move cursor to end only if this is a new edit session
      if (!value) {
        inputRef.current.setSelectionRange(0, 0);
      }
    }
  }, [isEditing, value]);

  const colorMap: Record<KeywordType, string> = {
    player: "from-blue-400 to-blue-500",
    opponent: "from-purple-400 to-purple-500",
    tournament: "from-green-400 to-green-500",
    surface: "from-yellow-400 to-yellow-500",
    round: "from-pink-400 to-pink-500",
    year: "from-cyan-400 to-cyan-500",
    sex: "from-indigo-400 to-indigo-500",
    score: "from-red-400 to-red-500",
    status: "from-teal-400 to-teal-500",
  };

  return (
    <motion.div
      layout
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      exit={{ scale: 0.8, opacity: 0 }}
      onClick={(_e) => {
        if (!isEditing && onClick) {
          onClick();
        }
        // Don't prevent default or stop propagation when editing
        // This allows normal input interaction
      }}
      className={`inline-flex items-center gap-1 px-2 py-1 rounded-lg text-sm
        bg-gradient-to-r ${colorMap[type]} text-black shadow-md
        ${isEditing ? `ring-2 ${isValid ? "ring-white/50" : "ring-red-500"}` : "cursor-pointer hover:opacity-80"}
        ${!isValid && !isEditing ? "ring-2 ring-red-400" : ""}
        transition-all`}
    >
      <span className="font-semibold">
        {KEYWORD_PREFIXES[type][0].replace(/:$/, "")}:
      </span>
      {isEditing ? (
        <input
          ref={inputRef}
          type="text"
          value={value}
          data-chip-id={id}
          onChange={(e) => onUpdate(id, e.target.value)}
          onKeyDown={onKeyDown}
          onFocus={onFocus}
          className="bg-transparent outline-none w-24 text-black placeholder-black/50"
          placeholder={type === "score" ? "e.g. 6-4 7-6" : "Type or select..."}
        />
      ) : (
        <span>{value || "empty"}</span>
      )}
      {!isEditing && value && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onRemove(id);
          }}
          className="ml-1 hover:bg-white/20 rounded p-0.5 transition-opacity opacity-60 hover:opacity-100"
        >
          <X className="w-3 h-3" />
        </button>
      )}
    </motion.div>
  );
};
