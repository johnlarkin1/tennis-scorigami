"use client";

import {
  graphLayoutAtom,
  selectedSetsAtom,
  selectedSexAtom,
  selectedYearAtom,
} from "@/components/graph/controls";
import { DiscoveryModal } from "@/components/graph/discovery-modal";
import { GraphControls } from "@/components/graph/graph-controls";
import { useGraphData } from "@/lib/hooks/use-graph-data";
import { LoadingSpinner } from "@/components/graph/loading-spinner";
import { MatchDetailsModal } from "@/components/graph/match-details-modal";
import { UnscoredBanner } from "@/components/graph/unscored-banner";
import { useGraphContext } from "@/providers/graph-provider";
import { selectedTournamentAtom } from "@/store/tournament";
import { useAtom } from "jotai";
import React, { Fragment, lazy, Suspense } from "react";

// Lazy load visualization components to avoid SSR issues
const ForceGraph3D = lazy(() => import("@/components/graph/force-graph-3d"));
const SigmaGraph2D = lazy(() => import("@/components/graph/sigma-graph-2d"));

export const GraphVisualization: React.FC = () => {
  // Fetch graph data
  useGraphData();

  // Context values
  const {
    loading,
    hasUnscoredNodes,
    selectedSequenceId,
    setSelectedSequenceId,
    discoveryModalOpen,
    setDiscoveryModalOpen,
    discoveredNode,
  } = useGraphContext();

  // Atom values
  const [graphLayout] = useAtom(graphLayoutAtom);
  const [selectedSets] = useAtom(selectedSetsAtom);
  const [selectedYear] = useAtom(selectedYearAtom);
  const [selectedSex] = useAtom(selectedSexAtom);
  const [selectedTournament] = useAtom(selectedTournamentAtom);

  const handleCloseMatchModal = () => {
    setSelectedSequenceId(null);
  };

  const handleCloseDiscoveryModal = () => {
    setDiscoveryModalOpen(false);
  };

  return (
    <div className="relative w-full h-full overflow-hidden">
      {/* Loading overlay */}
      {loading && <LoadingSpinner />}

      {/* Main visualization */}
      {!loading && (
        <Fragment>
          <Suspense fallback={<LoadingSpinner />}>
            {graphLayout === "2d" ? <SigmaGraph2D /> : <ForceGraph3D />}
          </Suspense>

          <UnscoredBanner visible={hasUnscoredNodes} />
          <GraphControls />

          <div className="absolute bottom-2 right-3 text-xs text-gray-500">
            layout {graphLayout} | sets {selectedSets}
          </div>
        </Fragment>
      )}

      {/* Modals */}
      <MatchDetailsModal
        sequenceId={selectedSequenceId}
        onClose={handleCloseMatchModal}
        filters={{
          year: selectedYear || "All Years",
          sex: selectedSex || "Men and Women",
          tournament:
            selectedTournament?.name !== "All Tournaments" &&
            selectedTournament?.tournament_id
              ? String(selectedTournament.tournament_id)
              : "All Tournaments",
          sets: String(selectedSets),
        }}
      />

      {discoveryModalOpen && discoveredNode && (
        <DiscoveryModal
          node={discoveredNode}
          onClose={handleCloseDiscoveryModal}
        />
      )}
    </div>
  );
};
