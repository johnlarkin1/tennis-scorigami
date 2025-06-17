"use client";

import {
  selectedSetsAtom,
  selectedSexAtom,
  selectedYearAtom,
} from "@/components/graph/controls/graph-controls";
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

// Dynamically import SigmaGraphStream for 5-set matches
const SigmaGraphStream = dynamic(
  () =>
    import("@/components/graph/sigma-graph-stream").then(
      (mod) => mod.SigmaGraph
    ),
  { ssr: false }
);

const UnfurlSigmaGraph2D: React.FC = () => {
  const [selectedSets] = useAtom(selectedSetsAtom);
  const [selectedSex] = useAtom(selectedSexAtom);
  const [selectedYear] = useAtom(selectedYearAtom);

  // Use streaming approach for 5-set matches
  const GraphComponent = selectedSets === 5 ? SigmaGraphStream : SigmaGraph;

  console.log(
    `[UnfurlSigmaGraph2D] selectedSets: ${selectedSets}, using: ${selectedSets === 5 ? "SigmaGraphStream" : "SigmaGraph"}`
  );

  return (
    <GraphComponent
      selectedSets={selectedSets}
      selectedSex={selectedSex || ""}
      selectedYear={selectedYear || ""}
      className="w-full h-full"
      hideLegend={true}
    />
  );
};

export default UnfurlSigmaGraph2D;
