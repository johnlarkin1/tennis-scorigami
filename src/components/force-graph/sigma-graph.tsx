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
import { useCallback, useEffect, useRef, useState, useMemo } from "react";
import { scaleLinear } from "d3-scale";

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

// Graph constants
const ROOT_ID = 0;

// Legend component for 2D sigma graph
const Legend = ({
  colorMode,
  maxDepth,
  hasUnscoredNodes,
}: {
  colorMode: string;
  maxDepth: number;
  hasUnscoredNodes: boolean;
}) => {
  if (colorMode === "category") {
    return (
      <div className="absolute top-4 right-4 bg-gray-800/90 rounded-lg p-4 backdrop-blur-sm max-w-xs shadow-lg z-10">
        <h3 className="text-white text-sm font-semibold mb-3">Score Levels</h3>
        {Array.from({ length: Math.min(maxDepth + 1, 6) }, (_, i) => (
          <div key={i} className="flex items-center gap-2 mb-2">
            <div
              className="w-4 h-4 rounded-full"
              style={{ backgroundColor: DEPTH_COLORS[i] || "#666" }}
            />
            <span className="text-gray-300 text-xs font-medium">
              Depth {i}
              {i === 0 ? " (love-all)" : ""}
            </span>
          </div>
        ))}
        {hasUnscoredNodes && (
          <div className="mt-3 pt-3 border-t border-gray-700">
            <div className="flex items-center gap-2 mb-1">
              <div
                className="w-4 h-4 rounded-full"
                style={{ backgroundColor: NEVER_OCCURRED_COLOR }}
              />
              <span className="text-gray-300 text-xs">Never occurred</span>
            </div>
          </div>
        )}
      </div>
    );
  } else {
    return (
      <div className="absolute top-4 right-4 bg-gray-800/90 rounded-lg p-4 backdrop-blur-sm shadow-lg z-10">
        <h3 className="text-white text-sm font-semibold mb-3">
          Occurrence Frequency
        </h3>
        <div className="text-gray-400 text-xs mb-3">
          Color intensity shows how often each score occurs
        </div>
        <div className="flex items-center gap-2 mb-1">
          <div
            className="w-4 h-4 rounded-full"
            style={{ backgroundColor: "hsl(220,80%,30%)" }}
          />
          <span className="text-gray-300 text-xs">High frequency</span>
        </div>
        <div className="flex items-center gap-2 mb-1">
          <div
            className="w-4 h-4 rounded-full"
            style={{ backgroundColor: "hsl(220,80%,60%)" }}
          />
          <span className="text-gray-300 text-xs">Medium frequency</span>
        </div>
        <div className="flex items-center gap-2 mb-1">
          <div
            className="w-4 h-4 rounded-full"
            style={{ backgroundColor: "hsl(220,80%,90%)" }}
          />
          <span className="text-gray-300 text-xs">Low frequency</span>
        </div>
        {hasUnscoredNodes && (
          <div className="mt-3 pt-3 border-t border-gray-700">
            <div className="flex items-center gap-2 mb-1">
              <div
                className="w-4 h-4 rounded-full"
                style={{ backgroundColor: NEVER_OCCURRED_COLOR }}
              />
              <span className="text-gray-300 text-xs">Never occurred</span>
            </div>
          </div>
        )}
      </div>
    );
  }
};

// Banner to highlight unscored sequences
const UnscoredBanner = ({ visible }: { visible: boolean }) => {
  if (!visible) return null;

  return (
    <div className="absolute bottom-8 right-3 bg-gradient-to-r from-red-900/90 to-red-800/80 text-white px-4 py-3 rounded-lg shadow-lg backdrop-blur-sm max-w-xs z-10 border border-red-700/50">
      <h3 className="font-bold mb-1 flex items-center">
        <span className="text-red-400 mr-2">🔍</span>
        Find Unscored Sequences
      </h3>
      <p className="text-sm text-gray-200">
        Look for red nodes to discover score sequences that have never been
        recorded in tennis history.
      </p>
    </div>
  );
};

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
  const sigmaRef = useRef<import("sigma").default | null>(null);
  const graphRef = useRef<Graph | null>(null);

  const [selectedTournament] = useAtom(selectedTournamentAtom);
  const [colorMode] = useAtom(graphColorModeAtom);
  const [showLabels] = useAtom(showLabelsAtom);

  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<{ nodes: NodeDTO[]; edges: EdgeDTO[] }>({
    nodes: [],
    edges: [],
  });

  // Check if there are any unscored nodes
  const hasUnscoredNodes = useMemo(() => {
    return data.nodes.some((node) => !node.played && node.id !== ROOT_ID);
  }, [data.nodes]);

  // Compute max depth for legend
  const maxDepth = useMemo(() => {
    return Math.max(...data.nodes.map((n) => n.depth), 0);
  }, [data.nodes]);

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

        // Process and enhance data
        let nodes = rawNodes.slice();
        let edges = rawEdges.slice();

        // Add love-all root node if missing
        if (!nodes.some((n) => n.depth === 0)) {
          nodes = [
            {
              id: ROOT_ID,
              slug: "love-all",
              played: true,
              depth: 0,
              occurrences: 1,
              norm: 1,
            },
            ...nodes,
          ];
          // Connect root to all depth-1 nodes
          const rootEdges = nodes
            .filter((n) => n.depth === 1)
            .map((n) => ({ frm: ROOT_ID, to: n.id }));
          edges = [...rootEdges, ...edges];
        }

        setData({ nodes, edges });
      } catch (error) {
        console.error("Failed to fetch graph data:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchGraph();
  }, [selectedYear, selectedSex, selectedSets, selectedTournament]);

  // Depth-based occurrence scales for gradient mode
  const depthScales = useMemo(() => {
    const scales: Record<number, ReturnType<typeof scaleLinear>> = {};
    const nodesByDepth = data.nodes.reduce(
      (acc, node) => {
        if (!acc[node.depth]) acc[node.depth] = [];
        acc[node.depth].push(node);
        return acc;
      },
      {} as Record<number, NodeDTO[]>
    );

    Object.entries(nodesByDepth).forEach(([depth, nodes]) => {
      const maxOccurrence = Math.max(...nodes.map((n) => n.occurrences));
      scales[parseInt(depth)] = scaleLinear()
        .domain([0, maxOccurrence])
        .range([0.2, 1]);
    });

    return scales;
  }, [data.nodes]);

  // Node color function
  const getNodeColor = useCallback(
    (node: NodeDTO) => {
      // Root node gets special treatment
      if (node.id === ROOT_ID) return DEPTH_COLORS[0];

      // Highlight nodes that have never occurred
      if (!node.played || node.occurrences === 0) {
        return NEVER_OCCURRED_COLOR;
      }

      if (colorMode === "category") {
        return DEPTH_COLORS[node.depth] || "#666";
      } else {
        // Color by occurrence intensity within depth
        const scale = depthScales[node.depth];
        if (scale) {
          const intensity = scale(node.occurrences);
          const lightness = 90 - intensity * 60;
          return `hsl(220, 80%, ${lightness}%)`;
        }
        return `hsl(220, 80%, 50%)`;
      }
    },
    [colorMode, depthScales]
  );

  // Initialize and update Sigma graph
  useEffect(() => {
    if (!containerRef.current || data.nodes.length === 0) return;

    // Dynamically import Sigma to avoid SSR issues
    import("sigma").then((SigmaModule) => {
      const Sigma = SigmaModule.default;

      // Create new graph
      const graph = new Graph();

      // Add nodes with improved sizing
      data.nodes.forEach((node) => {
        let size;
        if (node.id === ROOT_ID) {
          size = 12; // Make root node larger
        } else {
          // Scale node size based on occurrences and importance
          const baseSize = Math.max(node.norm * 60, 2);
          const occurrenceBonus = Math.log(node.occurrences + 1) * 1.5;
          size = Math.max(4, baseSize + occurrenceBonus);
        }

        // Skip nodes with empty slugs
        if (!node.slug || node.slug.trim() === "") {
          console.warn("Skipping node with empty slug:", node);
          return;
        }

        graph.addNode(node.id.toString(), {
          label: showLabels ? node.slug : "",
          size,
          color: getNodeColor(node),
          x: 0, // Will be set by layout algorithm
          y: 0, // Will be set by layout algorithm
          originalNode: node,
        });
      });

      // Add edges with improved styling
      data.edges.forEach((edge) => {
        // Only add edge if both nodes exist (might have been filtered out due to empty slugs)
        if (
          graph.hasNode(edge.frm.toString()) &&
          graph.hasNode(edge.to.toString())
        ) {
          // Make edges more visible with depth-based coloring
          const fromNode = data.nodes.find((n) => n.id === edge.frm);
          const toNode = data.nodes.find((n) => n.id === edge.to);
          const maxDepth = Math.max(fromNode?.depth || 0, toNode?.depth || 0);
          const brightness = 30 + maxDepth * 8;

          graph.addEdge(edge.frm.toString(), edge.to.toString(), {
            color: `hsl(200, 50%, ${brightness}%)`,
            size: 0.5 + maxDepth * 0.2,
          });
        }
      });

      // Apply radial layout based on depth
      // First, get nodes by depth
      const nodesByDepth: Record<number, string[]> = {};
      graph.forEachNode((node, attributes) => {
        const depth = attributes.originalNode.depth;
        if (!nodesByDepth[depth]) nodesByDepth[depth] = [];
        nodesByDepth[depth].push(node);
      });

      // Position nodes in concentric circles based on depth
      const centerX = 0;
      const centerY = 0;
      const radiusStep = 150; // Distance between layers

      Object.entries(nodesByDepth).forEach(([depth, nodes]) => {
        const depthNum = parseInt(depth);
        const radius = depthNum * radiusStep;

        if (depthNum === 0) {
          // Root node at center
          graph.setNodeAttribute(nodes[0], "x", centerX);
          graph.setNodeAttribute(nodes[0], "y", centerY);
        } else {
          // Arrange nodes in a circle at this depth
          const angleStep = (2 * Math.PI) / nodes.length;
          nodes.forEach((node, i) => {
            const angle = i * angleStep;
            const x = centerX + radius * Math.cos(angle);
            const y = centerY + radius * Math.sin(angle);
            graph.setNodeAttribute(node, "x", x);
            graph.setNodeAttribute(node, "y", y);
          });
        }
      });

      // Apply force layout to refine positions while maintaining radial structure
      const settings = forceAtlas2.inferSettings(graph);
      forceAtlas2.assign(graph, {
        iterations: 50,
        settings: {
          ...settings,
          strongGravityMode: false,
          gravity: 0.01,
          scalingRatio: 5,
          slowDown: 5,
          outboundAttractionDistribution: false,
          adjustSizes: true,
          barnesHutOptimize: true,
          linLogMode: true,
        },
      });

      // Clear previous sigma instance
      if (sigmaRef.current) {
        sigmaRef.current.kill();
      }

      // Create sigma instance with enhanced settings
      const sigma = new Sigma(graph, containerRef.current, {
        renderLabels: showLabels,
        renderEdgeLabels: false,
        defaultNodeColor: "#666",
        defaultEdgeColor: "#333",
        labelFont: "Arial",
        labelSize: 12,
        labelWeight: "bold",
        zIndex: true,
        enableEdgeClickEvents: false,
        enableEdgeWheelEvents: false,
        enableEdgeHoverEvents: false,
        nodeReducer: (node, data) => {
          const res = { ...data };
          if (data.highlighted) {
            res.label = data.originalNode?.slug || "";
            res.size = data.size * 1.2;
            res.zIndex = 1;
          }
          return res;
        },
      });

      // Handle node clicks with confetti for discoveries
      sigma.on("clickNode", (event) => {
        const nodeData = graph.getNodeAttributes(event.node);
        const originalNode = nodeData.originalNode as NodeDTO;

        if (!originalNode) {
          console.error(
            "No original node data found for clicked node:",
            event.node
          );
          return;
        }

        if (originalNode.id === ROOT_ID) return; // Don't open modal for root

        if (!originalNode.played || originalNode.occurrences === 0) {
          // Launch confetti for discoveries
          import("canvas-confetti").then((confettiModule) => {
            const confetti = confettiModule.default;
            confetti({
              particleCount: 100,
              spread: 70,
              origin: { y: 0.6 },
            });
          });

          setDiscoveredNode(originalNode);
          setDiscoveryModalOpen(true);
        } else {
          setSelectedSequenceId(originalNode.id);
        }
      });

      // Add hover effects with tooltip
      let hoverTimeout: NodeJS.Timeout;
      const tooltip = document.createElement("div");
      tooltip.style.position = "absolute";
      tooltip.style.pointerEvents = "none";
      tooltip.style.backgroundColor = "rgba(0, 0, 0, 0.9)";
      tooltip.style.color = "white";
      tooltip.style.padding = "8px 12px";
      tooltip.style.borderRadius = "4px";
      tooltip.style.fontSize = "14px";
      tooltip.style.zIndex = "1000";
      tooltip.style.display = "none";
      tooltip.style.maxWidth = "300px";
      document.body.appendChild(tooltip);

      sigma.on("enterNode", (event) => {
        const node = event.node;
        const nodeData = graph.getNodeAttributes(node);
        const originalNode = nodeData.originalNode as NodeDTO;

        if (!originalNode) return;

        graph.setNodeAttribute(node, "highlighted", true);

        // Show tooltip
        clearTimeout(hoverTimeout);
        const { x, y } = sigma.graphToViewport(nodeData.x, nodeData.y);
        const containerRect = containerRef.current!.getBoundingClientRect();

        tooltip.innerHTML = `
        <div style="font-weight: bold; margin-bottom: 4px;">${originalNode.slug}</div>
        <div style="font-size: 12px; color: #ccc;">
          Depth: ${originalNode.depth}<br/>
          Occurrences: ${originalNode.occurrences}<br/>
          ${originalNode.played ? "Status: Played" : '<span style="color: #dc2626;">Status: Never occurred</span>'}
        </div>
      `;

        tooltip.style.left = `${containerRect.left + x + 10}px`;
        tooltip.style.top = `${containerRect.top + y - 10}px`;
        tooltip.style.display = "block";

        sigma.refresh();
      });

      sigma.on("leaveNode", (event) => {
        const node = event.node;
        graph.setNodeAttribute(node, "highlighted", false);

        // Hide tooltip after a small delay
        hoverTimeout = setTimeout(() => {
          tooltip.style.display = "none";
        }, 100);

        sigma.refresh();
      });

      // Clean up tooltip on unmount
      sigma.on("kill", () => {
        tooltip.remove();
      });

      sigmaRef.current = sigma;
      graphRef.current = graph;

      // Center and zoom the graph to fit
      setTimeout(() => {
        const camera = sigma.getCamera();
        camera.setState({ x: 0.5, y: 0.5, ratio: 1 });
        sigma.refresh();
      }, 100);
    });

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
        className="w-full h-full rounded-lg"
        style={{
          minHeight: "600px",
          background:
            "radial-gradient(circle at center, #1a2332 0%, #0f172a 100%)",
        }}
      />

      {/* Legend */}
      <Legend
        colorMode={colorMode}
        maxDepth={maxDepth}
        hasUnscoredNodes={hasUnscoredNodes}
      />

      {/* Unscored banner */}
      <UnscoredBanner visible={hasUnscoredNodes} />

      {/* Controls info */}
      <div className="absolute bottom-3 left-3 text-white text-sm p-2 rounded shadow-lg backdrop-blur-sm">
        <p>Click on a node to see matches</p>
        <p>Scroll to zoom • Drag to pan</p>
      </div>

      {/* Modals */}
      {discoveryModalOpen && discoveredNode && (
        <DiscoveryModal
          isOpen={discoveryModalOpen}
          onClose={() => setDiscoveryModalOpen(false)}
          node={discoveredNode}
        />
      )}

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
