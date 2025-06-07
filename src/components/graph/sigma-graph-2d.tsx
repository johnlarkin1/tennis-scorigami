"use client";

import {
  selectedSetsAtom,
  selectedSexAtom,
  selectedYearAtom,
} from "@/components/graph/controls/game-controls";
import { useAtom } from "jotai";
import dynamic from "next/dynamic";
import React from "react";

// Dynamically import SigmaGraph to avoid SSR issues
const SigmaGraph = dynamic(
  () =>
    import("@/components/graph/sigma-graph").then((mod) => ({
      default: mod.SigmaGraph,
    })),
  { ssr: false }
);

const SigmaGraph2D: React.FC = () => {
  const [selectedSets] = useAtom(selectedSetsAtom);
  const [selectedSex] = useAtom(selectedSexAtom);
  const [selectedYear] = useAtom(selectedYearAtom);

  return (
    <SigmaGraph
      selectedSets={selectedSets}
      selectedSex={selectedSex || ""}
      selectedYear={selectedYear || ""}
      className="w-full h-full"
    />
  );
};

export default SigmaGraph2D;
