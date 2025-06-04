"use client";

import {
  graphColorModeAtom,
  showLabelsAtom,
} from "@/components/force-graph/controls";
import { DiscoveryModal } from "@/components/force-graph/discovery-modal";
import { MatchDetailsModal } from "@/components/force-graph/match-details-modal";
import type { EdgeDTO, NodeDTO } from "@/lib/types";
import { selectedTournamentAtom } from "@/store/tournament";
import { convertSexFilter, convertYearFilter } from "@/utils/filter-converters";
import Graph from "graphology";
import forceAtlas2 from "graphology-layout-forceatlas2";
import { useAtom } from "jotai";
import { useCallback, useEffect, useRef, useState } from "react";
import Sigma from "sigma";

// Color constants
const DEPTH_COLORS: Record<number, string> = {
  0: "#FF3B30", // Vibrant Red
  1: "#FF9500", // Warm Orange
  2: "#FFD60A", // Bright Yellow
  3: "#30D158", // Spring Green
  4: "#5AC8FA", // Electric Cyan
  5: "#BF5AF2", // Electric Purple
};

const NEVER_OCCURRED_COLOR = "#dc2626"; // Bright red

type SigmaGraphProps = {
  selectedSets: 3 | 5;
  selectedSex: string;
  selectedYear: string;
  className?: string;
};

export const SigmaGraph: React.FC<SigmaGraphProps> = ({
  selectedSets,
  selectedSex,
  selectedYear,
  className,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const sigmaRef = useRef<Sigma | null>(null);
  const graphRef = useRef<Graph | null>(null);

  const [selectedTournament] = useAtom(selectedTournamentAtom);
  const [colorMode] = useAtom(graphColorModeAtom);
  const [showLabels] = useAtom(showLabelsAtom);

  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<{ nodes: NodeDTO[]; edges: EdgeDTO[] }>({
    nodes: [],
    edges: [],
  });

  // Modal state
  const [selectedSequenceId, setSelectedSequenceId] = useState<number | null>(
    null
  );
  const [discoveryModalOpen, setDiscoveryModalOpen] = useState(false);
  const [discoveredNode, setDiscoveredNode] = useState<NodeDTO | null>(null);

  // Fetch graph data
  useEffect(() => {
    async function fetchGraph() {
      setLoading(true);
      try {
        const qs = new URLSearchParams({
          year: selectedYear ? convertYearFilter(selectedYear.toString()) : "",
          sex: convertSexFilter(selectedSex ?? ""),
          sets: selectedSets.toString(),
          tournament:
            selectedTournament && selectedTournament.tournament_id > 0
              ? selectedTournament.tournament_id.toString()
              : "all",
        });

        const response = await fetch(`/api/v1/graph?${qs}`);
        const { nodes: rawNodes, edges: rawEdges } = await response.json();

        setData({ nodes: rawNodes, edges: rawEdges });
      } catch (error) {
        console.error("Failed to fetch graph data:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchGraph();
  }, [selectedYear, selectedSex, selectedSets, selectedTournament]);

  // Node color function
  const getNodeColor = useCallback(
    (node: NodeDTO) => {
      if (!node.played) return NEVER_OCCURRED_COLOR;

      if (colorMode === "category") {
        return DEPTH_COLORS[node.depth] || "#666";
      } else {
        // Gradient mode based on frequency
        const intensity = Math.max(0.2, node.norm);
        const hue = 220; // Blue hue
        const saturation = 80;
        const lightness = Math.round(30 + intensity * 60);
        return `hsl(${hue}, ${saturation}%, ${lightness}%)`;
      }
    },
    [colorMode]
  );

  // Initialize and update Sigma graph
  useEffect(() => {
    if (!containerRef.current || data.nodes.length === 0) return;

    // Create new graph
    const graph = new Graph();

    // Add nodes
    data.nodes.forEach((node) => {
      const size = Math.max(4, Math.sqrt(node.occurrences + 1) * 2);

      graph.addNode(node.id.toString(), {
        label: showLabels ? node.slug : "",
        size,
        color: getNodeColor(node),
        x: Math.random() * 1000,
        y: Math.random() * 1000,
        originalNode: node,
      });
    });

    // Add edges
    data.edges.forEach((edge) => {
      if (
        graph.hasNode(edge.frm.toString()) &&
        graph.hasNode(edge.to.toString())
      ) {
        graph.addEdge(edge.frm.toString(), edge.to.toString(), {
          color: "#666",
          size: 1,
        });
      }
    });

    // Apply force layout
    const settings = forceAtlas2.inferSettings(graph);
    forceAtlas2.assign(graph, {
      iterations: 50,
      settings: {
        ...settings,
        strongGravityMode: true,
        gravity: 0.05,
        scalingRatio: 10,
      },
    });

    // Clear previous sigma instance
    if (sigmaRef.current) {
      sigmaRef.current.kill();
    }

    // Create sigma instance
    const sigma = new Sigma(graph, containerRef.current, {
      renderLabels: showLabels,
      renderEdgeLabels: false,
      defaultNodeColor: "#666",
      defaultEdgeColor: "#333",
      labelFont: "Arial",
      labelSize: 12,
      labelWeight: "bold",
      zIndex: true,
    });

    // Handle node clicks
    sigma.on("clickNode", (event) => {
      const nodeData = graph.getNodeAttributes(event.node);
      const originalNode = nodeData.originalNode as NodeDTO;

      if (!originalNode.played) {
        setDiscoveredNode(originalNode);
        setDiscoveryModalOpen(true);
      } else {
        setSelectedSequenceId(originalNode.id);
      }
    });

    sigmaRef.current = sigma;
    graphRef.current = graph;

    // Cleanup
    return () => {
      if (sigmaRef.current) {
        sigmaRef.current.kill();
        sigmaRef.current = null;
      }
    };
  }, [data, getNodeColor, showLabels]);

  // Update node colors when color mode changes
  useEffect(() => {
    if (!graphRef.current) return;

    data.nodes.forEach((node) => {
      if (graphRef.current!.hasNode(node.id.toString())) {
        graphRef.current!.setNodeAttribute(
          node.id.toString(),
          "color",
          getNodeColor(node)
        );
      }
    });

    if (sigmaRef.current) {
      sigmaRef.current.refresh();
    }
  }, [colorMode, data.nodes, getNodeColor]);

  // Update labels when showLabels changes
  useEffect(() => {
    if (!graphRef.current) return;

    data.nodes.forEach((node) => {
      if (graphRef.current!.hasNode(node.id.toString())) {
        graphRef.current!.setNodeAttribute(
          node.id.toString(),
          "label",
          showLabels ? node.slug : ""
        );
      }
    });

    if (sigmaRef.current) {
      sigmaRef.current.refresh();
    }
  }, [showLabels, data.nodes]);

  return (
    <div className={`relative ${className}`}>
      {loading && (
        <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center z-10">
          <div className="text-white text-lg">Loading graph...</div>
        </div>
      )}

      <div
        ref={containerRef}
        className="w-full h-full bg-gray-900 rounded-lg"
        style={{ minHeight: "600px" }}
      />

      {/* Modals */}
      <DiscoveryModal
        isOpen={discoveryModalOpen}
        onClose={() => setDiscoveryModalOpen(false)}
        node={discoveredNode}
      />

      <MatchDetailsModal
        sequenceId={selectedSequenceId}
        onClose={() => setSelectedSequenceId(null)}
        filters={{
          year: selectedYear || "All Years",
          sex: selectedSex || "Men and Women",
          tournament:
            selectedTournament && selectedTournament.tournament_id > 0
              ? String(selectedTournament.tournament_id)
              : "All Tournaments",
          sets: selectedSets.toString(),
        }}
      />
    </div>
  );
};
