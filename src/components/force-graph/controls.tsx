"use client";

import {
  dropdownContentClass,
  dropdownItemClass,
  dropdownTriggerClass,
} from "@/components/lib/force-graph/styles";
import { TournamentDropdown } from "@/components/scorigami/controls/tournament-dropdown";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { YEARS } from "@/constants";
import { selectedTournamentAtom } from "@/store/tournament";
import { SexType } from "@/types/tree-control-types";
import { motion } from "framer-motion";
import { atom, useAtom } from "jotai";
import {
  AlertCircle,
  Calendar,
  Hash,
  Layers,
  Network,
  Paintbrush,
  Tag,
  Users,
} from "lucide-react";
import * as React from "react";
import { useEffect } from "react";

// Force graph atoms - keeping them but removing some controls
export const graphDensityAtom = atom(50);
export const graphLayoutAtom = atom<"3d" | "2d">("3d");
export const nodeStrengthAtom = atom(50);
export const graphColorModeAtom = atom<"category" | "gradient">("category");
export const showLabelsAtom = atom(false);
export const showEdgesAtom = atom(true);

// Filter controls
export const selectedYearAtom = atom<string>("All Years");
export const selectedSexAtom = atom<SexType>("Men and Women");
export const selectedSetsAtom = atom<3 | 5>(3);

// Tournament-specific set mappings - check if it's a Grand Slam by event_abbr
const isGrandSlamTournament = (tournament: { event_type?: { event_abbr?: string } }) => {
  return tournament?.event_type?.event_abbr === "G";
};

type ForceGraphControlsProps = {
  className?: string;
};

export const ForceGraphControls: React.FC<ForceGraphControlsProps> = ({
  className,
}) => {
  // Graph type and layout controls
  const [graphLayout, setGraphLayout] = useAtom(graphLayoutAtom);
  const [colorMode, setColorMode] = useAtom(graphColorModeAtom);
  const [showLabels, setShowLabels] = useAtom(showLabelsAtom);

  // Filter controls
  const [selectedYear, setSelectedYear] = useAtom(selectedYearAtom);
  const [selectedSex, setSelectedSex] = useAtom(selectedSexAtom);
  const [selectedSets, setSelectedSets] = useAtom(selectedSetsAtom);
  const [selectedTournament] = useAtom(selectedTournamentAtom);

  // When gender changes, ensure women can only have 3 sets
  useEffect(() => {
    if (selectedSex === "Women" && selectedSets === 5) {
      setSelectedSets(3);
    }
  }, [selectedSex, selectedSets, setSelectedSets]);

  // When sets change to 5, force 2D layout due to browser performance limitations
  useEffect(() => {
    if (selectedSets === 5 && graphLayout === "3d") {
      setGraphLayout("2d");
    }
  }, [selectedSets, graphLayout, setGraphLayout]);

  // When tournament changes, automatically set the appropriate number of sets
  useEffect(() => {
    if (selectedTournament && selectedTournament.name !== "All Tournaments") {
      // For Grand Slam tournaments, men play best of 5
      const isGrandSlam = isGrandSlamTournament(selectedTournament);
      if (isGrandSlam && selectedSex !== "Women") {
        setSelectedSets(5);
      } else {
        setSelectedSets(3); // All other tournaments use best of 3
      }
    }
  }, [selectedTournament, selectedSex, setSelectedSets]);

  // Check if 5 sets should be disabled based on current selection
  const isFiveSetsDisabled =
    selectedSex === "Women" ||
    (selectedTournament.name !== "All Tournaments" &&
      !isGrandSlamTournament(selectedTournament));

  return (
    <div className={`${className} space-y-6`}>
      <div>
        <h2 className="text-xl font-bold text-white mb-4">
          Visualization Options
        </h2>

        {/* Graph Layout */}
        <div className="mb-6">
          <h3 className="text-md font-bold text-white mb-3 border-l-2 border-gray-600 pl-2">
            Graph Layout
          </h3>
          <div className="grid grid-cols-2 gap-2">
            <motion.button
              onClick={() => setGraphLayout("2d")}
              className="relative flex items-center justify-center py-2 rounded-lg bg-gray-900 border border-gray-700 overflow-hidden"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              {graphLayout === "2d" && (
                <motion.div
                  className="absolute inset-0 bg-blue-600 rounded-lg"
                  layoutId="activeButtonBg"
                  initial={false}
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                />
              )}
              <Network
                className={`mr-2 h-5 w-5 relative z-10 ${graphLayout === "2d" ? "text-white" : "text-gray-300"}`}
              />
              <span
                className={`relative z-10 ${graphLayout === "2d" ? "text-white" : "text-gray-300"}`}
              >
                2D View
              </span>
            </motion.button>
            <motion.button
              onClick={() => {
                if (selectedSets !== 5) setGraphLayout("3d");
              }}
              disabled={selectedSets === 5}
              className={`relative flex items-center justify-center py-2 rounded-lg bg-gray-900 border border-gray-700 overflow-hidden ${
                selectedSets === 5 ? "opacity-50 cursor-not-allowed" : ""
              }`}
              whileHover={selectedSets !== 5 ? { scale: 1.02 } : {}}
              whileTap={selectedSets !== 5 ? { scale: 0.98 } : {}}
            >
              {graphLayout === "3d" && (
                <motion.div
                  className="absolute inset-0 bg-blue-600 rounded-lg"
                  layoutId="activeButtonBg"
                  initial={false}
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                />
              )}
              <Layers
                className={`mr-2 h-5 w-5 relative z-10 ${graphLayout === "3d" ? "text-white" : "text-gray-300"}`}
              />
              <span
                className={`relative z-10 ${graphLayout === "3d" ? "text-white" : "text-gray-300"}`}
              >
                3D View
              </span>
            </motion.button>
          </div>
          {selectedSets === 5 && (
            <div className="text-amber-400 text-sm flex items-center mt-2">
              <AlertCircle className="h-4 w-4 mr-1 flex-shrink-0" />
              <span>3D view disabled for Best of 5 due to complexity</span>
            </div>
          )}
        </div>

        {/* Node Coloring */}
        <div className="mb-6">
          <h3 className="text-md font-bold text-white mb-3 border-l-2 border-gray-600 pl-2">
            Node Coloring
          </h3>
          <div className="grid grid-cols-2 gap-2">
            <motion.button
              onClick={() => setColorMode("category")}
              className="relative flex items-center justify-center py-2 rounded-lg bg-gray-900 border border-gray-700 overflow-hidden"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              {colorMode === "category" && (
                <motion.div
                  className="absolute inset-0 bg-blue-600 rounded-lg"
                  layoutId="activeColorBg"
                  initial={false}
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                />
              )}
              <Hash
                className={`mr-2 h-5 w-5 relative z-10 ${colorMode === "category" ? "text-white" : "text-gray-300"}`}
              />
              <span
                className={`relative z-10 ${colorMode === "category" ? "text-white" : "text-gray-300"}`}
              >
                Category Based
              </span>
            </motion.button>

            <motion.button
              onClick={() => setColorMode("gradient")}
              className="relative flex items-center justify-center py-2 rounded-lg bg-gray-900 border border-gray-700 overflow-hidden"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              {colorMode === "gradient" && (
                <motion.div
                  className="absolute inset-0 bg-blue-600 rounded-lg"
                  layoutId="activeColorBg"
                  initial={false}
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                />
              )}
              <Paintbrush
                className={`mr-2 h-5 w-5 relative z-10 ${colorMode === "gradient" ? "text-white" : "text-gray-300"}`}
              />
              <span
                className={`relative z-10 ${colorMode === "gradient" ? "text-white" : "text-gray-300"}`}
              >
                Gradient
              </span>
            </motion.button>
          </div>
        </div>

        {/* Show Labels Toggle */}
        <div className="mb-6">
          <h3 className="text-md font-bold text-white mb-3 border-l-2 border-gray-600 pl-2">
            Node Labels
          </h3>
          <div className="grid grid-cols-2 gap-2">
            <motion.button
              onClick={() => setShowLabels(true)}
              className="relative flex items-center justify-center py-2 rounded-lg bg-gray-900 border border-gray-700 overflow-hidden"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              {showLabels && (
                <motion.div
                  className="absolute inset-0 bg-blue-600 rounded-lg"
                  layoutId="activeLabelsBg"
                  initial={false}
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                />
              )}
              <Tag
                className={`mr-2 h-5 w-5 relative z-10 ${showLabels ? "text-white" : "text-gray-300"}`}
              />
              <span
                className={`relative z-10 ${showLabels ? "text-white" : "text-gray-300"}`}
              >
                Show Labels
              </span>
            </motion.button>

            <motion.button
              onClick={() => setShowLabels(false)}
              className="relative flex items-center justify-center py-2 rounded-lg bg-gray-900 border border-gray-700 overflow-hidden"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              {!showLabels && (
                <motion.div
                  className="absolute inset-0 bg-blue-600 rounded-lg"
                  layoutId="activeLabelsBg"
                  initial={false}
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                />
              )}
              <Tag
                className={`mr-2 h-5 w-5 relative z-10 ${!showLabels ? "text-white" : "text-gray-300"}`}
              />
              <span
                className={`relative z-10 ${!showLabels ? "text-white" : "text-gray-300"}`}
              >
                Hide Labels
              </span>
            </motion.button>
          </div>
        </div>
      </div>

      {/* Match Filters */}
      <div className="pt-4 border-t border-gray-700">
        <h2 className="text-xl font-bold text-white mb-4">Match Filters</h2>

        <div className="space-y-5">
          {/* Tournament Dropdown */}
          <div>
            <label className="block text-sm font-bold text-white mb-2 border-l-2 border-gray-600 pl-2">
              Tournament
            </label>
            <TournamentDropdown />
          </div>

          {/* Year Select */}
          <div>
            <label className="block text-sm font-bold text-white mb-2 border-l-2 border-gray-600 pl-2">
              Year
            </label>
            <Select onValueChange={setSelectedYear} value={selectedYear}>
              <SelectTrigger className={dropdownTriggerClass}>
                <Calendar className="mr-2 h-4 w-4 text-green-400" />
                <SelectValue
                  placeholder="Year"
                  className="text-white text-center"
                />
              </SelectTrigger>
              <SelectContent className={dropdownContentClass}>
                <SelectItem value="All Years" className={dropdownItemClass}>
                  All Years
                </SelectItem>
                {YEARS.map((year) => (
                  <SelectItem
                    key={year.value}
                    value={year.value}
                    className={dropdownItemClass}
                  >
                    {year.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Division Select */}
          <div>
            <label className="block text-sm font-bold text-white mb-2 border-l-2 border-gray-600 pl-2">
              Division
            </label>
            <Select
              onValueChange={(value) => setSelectedSex(value as SexType)}
              value={selectedSex}
            >
              <SelectTrigger className={dropdownTriggerClass}>
                <Users className="mr-2 h-4 w-4 text-green-400" />
                <SelectValue
                  placeholder="Division"
                  className="text-white text-center"
                />
              </SelectTrigger>
              <SelectContent className={dropdownContentClass}>
                <SelectItem value="Men and Women" className={dropdownItemClass}>
                  Men and Women
                </SelectItem>
                <SelectItem value="Men" className={dropdownItemClass}>
                  Men
                </SelectItem>
                <SelectItem value="Women" className={dropdownItemClass}>
                  Women
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Match Format */}
          <div>
            <label className="block text-sm font-bold text-white mb-2 border-l-2 border-gray-600 pl-2">
              Match Format
            </label>
            <Select
              onValueChange={(value) => setSelectedSets(Number(value) as 3 | 5)}
              value={selectedSets.toString()}
              disabled={isFiveSetsDisabled}
            >
              <SelectTrigger
                className={`${dropdownTriggerClass} ${isFiveSetsDisabled ? "opacity-70" : ""}`}
              >
                <Hash className="mr-2 h-4 w-4 text-green-400" />
                <SelectValue
                  placeholder="Sets"
                  className="text-white text-center"
                />
              </SelectTrigger>
              <SelectContent className={dropdownContentClass}>
                <SelectItem value="3" className={dropdownItemClass}>
                  Best of 3 Sets
                </SelectItem>
                <SelectItem
                  value="5"
                  className={`${dropdownItemClass} ${isFiveSetsDisabled ? "opacity-50" : ""}`}
                  // disabled={isFiveSetsDisabled}
                  disabled={true}
                >
                  Best of 5 Sets
                </SelectItem>
              </SelectContent>
            </Select>
            {isFiveSetsDisabled && (
              <div className="text-amber-400 text-sm flex items-center mt-2">
                <AlertCircle className="h-4 w-4 mr-1 flex-shrink-0" />
                <span>
                  {selectedSex === "Women"
                    ? "Women's matches are best of 3 sets"
                    : selectedTournament.name !== "All Tournaments"
                      ? "This tournament uses best of 3 sets format"
                      : ""}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
