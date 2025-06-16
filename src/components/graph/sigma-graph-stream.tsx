// Optimized SigmaGraph component with client-side layout
"use client";

import {
  graphColorModeAtom,
  showLabelsAtom,
} from "@/components/graph/controls/graph-controls";
import { DiscoveryModal } from "@/components/graph/discovery-modal";
import { GraphLoadingState } from "@/components/graph/graph-loading-state";
import { MatchDetailsModal } from "@/components/graph/match-details-modal";
import { fetchGraphStream } from "@/lib/api-client";
import type { EdgeDTO, NodeDTO } from "@/lib/types/graph-types";
import { selectedTournamentAtom } from "@/store/tournament";
import { convertSexFilter, convertYearFilter } from "@/utils/filter-converters";
import {
  createDepthScales,
  getNodeColor as getNodeColorUtil,
} from "@/utils/graph-utils";
import { createNodeBorderProgram } from "@sigma/node-border";
import Graph from "graphology";
import FA2Layout from "graphology-layout-forceatlas2/worker";
import { useAtom } from "jotai";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { isMobile } from "react-device-detect";
import type { default as Sigma } from "sigma";
import { EdgeArrowProgram } from "sigma/rendering";

import { DEPTH_COLORS, NEVER_OCCURRED_COLOR } from "@/constants/graph-colors";

// Constants
const CustomNodeBorderProgram = createNodeBorderProgram({});
const ROOT_ID = 0;

// Configuration for edge reduction
const GRAPH_CONFIG = {
  maxEdgesPerDepth: 150, // Limit edges per depth level
  minOccurrences: 3, // Minimum occurrences to show edge (unless unscored)
  performanceThresholds: {
    // Reduce quality for better performance on large graphs
    highNodeCount: 5000,
    extremeNodeCount: 10000,
    massiveNodeCount: 50000, // New threshold for 100k+ node graphs
  },
  rendering: {
    // Debounce/throttle timings
    hoverDebounce: 200, // Increased for massive graphs
    refreshDebounce: 300, // Increased for massive graphs
    animationDuration: 1000, // Ultra-fast for massive graphs
  },
};

// Types
type StreamMessage =
  | ({ type: "meta" } & {
      totalItems: number;
      totalNodes: number;
      totalEdges: number;
    })
  | { type: "nodes"; data: NodeDTO[] }
  | { type: "edges"; data: EdgeDTO[] }
  | { type: "complete" };

// Legend component (keeping your existing implementation)
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
      <div className="absolute top-4 right-4 bg-gray-800/90 rounded-lg p-4 backdrop-blur-sm max-w-xs shadow-lg z-10 border border-gray-700/50">
        <h3 className="text-white text-sm font-semibold mb-3">Score Levels</h3>
        {Array.from({ length: Math.min(maxDepth + 1, 6) }, (_, i) => (
          <div key={i} className="flex items-center gap-2 mb-2">
            <div
              className="w-4 h-4 rounded-full ring-1 ring-black"
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
                className="w-4 h-4 rounded-full ring-1 ring-red-900"
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
      <div className="absolute top-4 right-4 bg-gray-800/90 rounded-lg p-4 backdrop-blur-sm shadow-lg z-10 border border-gray-700/50">
        <h3 className="text-white text-sm font-semibold mb-3">
          Occurrence Frequency
        </h3>
        <div className="text-gray-400 text-xs mb-3">
          Color intensity shows how often each score occurs
        </div>
        {[
          { label: "High frequency", color: "hsl(220,80%,30%)" },
          { label: "Medium frequency", color: "hsl(220,80%,60%)" },
          { label: "Low frequency", color: "hsl(220,80%,90%)" },
        ].map((item, i) => (
          <div key={i} className="flex items-center gap-2 mb-1">
            <div
              className="w-4 h-4 rounded-full ring-1 ring-black"
              style={{ backgroundColor: item.color }}
            />
            <span className="text-gray-300 text-xs">{item.label}</span>
          </div>
        ))}
        {hasUnscoredNodes && (
          <div className="mt-3 pt-3 border-t border-gray-700">
            <div className="flex items-center gap-2 mb-1">
              <div
                className="w-4 h-4 rounded-full ring-1 ring-red-900"
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

const UnscoredBanner = ({ visible }: { visible: boolean }) => {
  if (!visible) return null;

  return (
    <div className="absolute bottom-8 right-3 bg-gradient-to-r from-red-900/90 to-red-800/80 text-white px-4 py-3 rounded-lg shadow-lg backdrop-blur-sm max-w-xs z-10 border border-red-700/50 animate-pulse">
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
  const layoutRef = useRef<FA2Layout | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  const [selectedTournament] = useAtom(selectedTournamentAtom);
  const [colorMode] = useAtom(graphColorModeAtom);
  const [showLabels] = useAtom(showLabelsAtom);

  const [loading, setLoading] = useState(false);
  const [loadingStatus, setLoadingStatus] = useState<
    | "connecting"
    | "loading-metadata"
    | "loading-nodes"
    | "loading-edges"
    | "rendering"
  >("connecting");
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [totalNodes, setTotalNodes] = useState<number | undefined>();
  const [totalEdges, setTotalEdges] = useState<number | undefined>();
  const [loadedNodes, setLoadedNodes] = useState<number | undefined>();
  const [loadedEdges, setLoadedEdges] = useState<number | undefined>();
  const [data, setData] = useState<{ nodes: NodeDTO[]; edges: EdgeDTO[] }>({
    nodes: [],
    edges: [],
  });

  const hasUnscoredNodes = useMemo(() => {
    return data.nodes.some((node) => !node.played && node.id !== ROOT_ID);
  }, [data.nodes]);

  const maxDepth = selectedSets;

  const [selectedSequenceId, setSelectedSequenceId] = useState<number | null>(
    null
  );
  const [discoveryModalOpen, setDiscoveryModalOpen] = useState(false);
  const [discoveredNode, setDiscoveredNode] = useState<NodeDTO | null>(null);

  // Depth-based occurrence scales
  const depthScales = useMemo(
    () => createDepthScales(data.nodes),
    [data.nodes]
  );

  const getNodeColor = useCallback(
    (node: NodeDTO) => getNodeColorUtil(node, colorMode, depthScales),
    [colorMode, depthScales]
  );

  // Fetch graph data with streaming
  useEffect(() => {
    async function loadGraphStreamData() {
      // Cancel previous request
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }

      const abortController = new AbortController();
      abortControllerRef.current = abortController;

      setLoading(true);
      setLoadingStatus("connecting");
      setLoadingProgress(0);
      setTotalNodes(undefined);
      setTotalEdges(undefined);
      setLoadedNodes(undefined);
      setLoadedEdges(undefined);
      setData({ nodes: [], edges: [] });

      try {
        const response = await fetchGraphStream({
          year: selectedYear ? convertYearFilter(selectedYear.toString()) : "",
          sex: convertSexFilter(selectedSex ?? ""),
          sets: selectedSets,
          tournament:
            selectedTournament && selectedTournament.tournament_id > 0
              ? selectedTournament.tournament_id.toString()
              : "all",
          maxEdgesPerDepth: GRAPH_CONFIG.maxEdgesPerDepth,
          minOccurrences: GRAPH_CONFIG.minOccurrences,
          signal: abortController.signal,
        });

        if (!response.body) {
          throw new Error("No response body");
        }

        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let buffer = "";

        const tempNodes: NodeDTO[] = [];
        const tempEdges: EdgeDTO[] = [];
        let streamTotalNodes = 0;
        let streamTotalEdges = 0;

        // Initial connection successful
        setLoadingStatus("loading-metadata");
        setLoadingProgress(5);

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split("\n");
          buffer = lines.pop() || "";

          for (const line of lines) {
            if (!line.trim()) continue;

            try {
              const message: StreamMessage = JSON.parse(line);

              switch (message.type) {
                case "meta":
                  streamTotalNodes = message.totalNodes;
                  streamTotalEdges = message.totalEdges;
                  setTotalNodes(streamTotalNodes);
                  setTotalEdges(streamTotalEdges);
                  setLoadingStatus("loading-nodes");
                  setLoadingProgress(10);
                  break;

                case "nodes":
                  tempNodes.push(...message.data);
                  setLoadedNodes(tempNodes.length);
                  const nodeProgress =
                    10 + (tempNodes.length / streamTotalNodes) * 40;
                  setLoadingProgress(nodeProgress);
                  if (tempNodes.length >= streamTotalNodes) {
                    setLoadingStatus("loading-edges");
                  }
                  break;

                case "edges":
                  tempEdges.push(...message.data);
                  setLoadedEdges(tempEdges.length);
                  const edgeProgress =
                    50 + (tempEdges.length / streamTotalEdges) * 40;
                  setLoadingProgress(edgeProgress);
                  break;

                case "complete":
                  console.log(
                    `[SigmaGraph Stream] Received ${tempNodes.length} nodes and ${tempEdges.length} edges`
                  );
                  setData({ nodes: tempNodes, edges: tempEdges });
                  setLoadingStatus("rendering");
                  setLoadingProgress(95);
                  break;
              }
            } catch (e) {
              console.error("Failed to parse stream message:", e);
            }
          }
        }
      } catch (error) {
        if (error instanceof Error && error.name !== "AbortError") {
          console.error("Failed to fetch graph data:", error);
          setLoading(false);
        }
      }
    }

    loadGraphStreamData();

    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [selectedYear, selectedSex, selectedSets, selectedTournament]);

  // Initialize and update Sigma graph with layout
  useEffect(() => {
    if (!containerRef.current || data.nodes.length === 0) return;

    // Cleanup previous layout worker
    if (layoutRef.current) {
      layoutRef.current.kill();
      layoutRef.current = null;
    }

    import("sigma").then(async (SigmaModule) => {
      const Sigma = SigmaModule.default || SigmaModule;

      const graph = new Graph({ multi: false, type: "directed" });

      // Get node count early for performance decisions
      const nodeCount = data.nodes.length;
      const isLargeGraph =
        nodeCount > GRAPH_CONFIG.performanceThresholds.highNodeCount;
      const isExtremeGraph =
        nodeCount > GRAPH_CONFIG.performanceThresholds.extremeNodeCount;
      const isMassiveGraph =
        nodeCount > GRAPH_CONFIG.performanceThresholds.massiveNodeCount;

      // Simple radial positioning by depth
      const positionNodes = () => {
        const centerX = 0;
        const centerY = 0;
        const radiusStep = 120;
        const positions: Record<string, { x: number; y: number }> = {};

        // Group nodes by depth
        const nodesByDepth: Record<number, NodeDTO[]> = {};
        data.nodes.forEach((node) => {
          if (!nodesByDepth[node.depth]) nodesByDepth[node.depth] = [];
          nodesByDepth[node.depth].push(node);
        });

        // Sort nodes within each depth by slug for consistent ordering
        Object.values(nodesByDepth).forEach((nodes) => {
          nodes.sort((a, b) => a.slug.localeCompare(b.slug));
        });

        // Position nodes level by level
        Object.entries(nodesByDepth).forEach(([depth, nodes]) => {
          const depthNum = parseInt(depth);
          const radius = depthNum * radiusStep;

          nodes.forEach((node, index) => {
            if (depthNum === 0) {
              // Root node at center
              positions[node.id.toString()] = { x: centerX, y: centerY };
            } else {
              // Distribute nodes evenly around circle
              const angle = (2 * Math.PI * index) / nodes.length;
              const x = centerX + radius * Math.cos(angle);
              const y = centerY + radius * Math.sin(angle);
              positions[node.id.toString()] = { x, y };
            }
          });
        });

        return positions;
      };

      const positions = positionNodes();

      // Add nodes with simple radial positions
      console.log(`[SigmaGraph] Adding ${data.nodes.length} nodes to graph`);
      data.nodes.forEach((node) => {
        const nodeId = node.id.toString();
        const pos = positions[nodeId] || { x: 0, y: 0 };

        let size;
        if (node.id === ROOT_ID) {
          size = 20; // Larger root node
        } else {
          // Maintain good sizes even for massive graphs
          const sizeMultiplier =
            nodeCount > GRAPH_CONFIG.performanceThresholds.massiveNodeCount
              ? 0.8 // Changed from 0.5 to 0.8
              : 1;

          const baseSize = Math.max(
            node.norm * (isMobile ? 30 : 60) * sizeMultiplier,
            2
          );
          const occurrenceBonus =
            Math.log(node.occurrences + 1) *
            (isMobile ? 0.6 : 1.5) *
            sizeMultiplier; // Increased from 1.5 to 2
          size = Math.max(isMobile ? 3 : 5, baseSize + occurrenceBonus);
        }

        const isUnscored = !node.played || node.occurrences === 0;
        const needsBorder = node.id === ROOT_ID || isUnscored;

        graph.addNode(nodeId, {
          label: node.slug,
          size,
          color: getNodeColor(node),
          borderColor:
            node.id === ROOT_ID
              ? "#ffffff"
              : isUnscored
                ? "rgba(220, 38, 38, 0.5)" // Semi-transparent red for unscored
                : "#000000",
          borderSize: node.id === ROOT_ID ? 3 : isUnscored ? 1.5 : 0,
          type: needsBorder ? "border" : "circle",
          x: pos.x,
          y: pos.y,
          originalNode: node,
        });
      });

      console.log(`[SigmaGraph] Graph now has ${graph.nodes().length} nodes`);

      // Add edges with smart reduction for massive graphs
      let edgesToRender = data.edges;

      // For massive graphs, intelligently reduce edges while keeping structure
      if (isMassiveGraph && data.edges.length > 50000) {
        console.log(
          `[SigmaGraph] Reducing edges from ${data.edges.length} for better performance`
        );

        // Create node lookup for importance scoring
        const nodeMap = new Map(data.nodes.map((n) => [n.id, n]));

        // Keep edges by importance: high occurrence nodes, unscored nodes, early depths
        edgesToRender = data.edges.filter((edge) => {
          const fromNode = nodeMap.get(edge.frm);
          const toNode = nodeMap.get(edge.to);

          if (!fromNode || !toNode) return false;

          // Always keep early depth edges (structure)
          if (Math.max(fromNode.depth, toNode.depth) <= 2) return true;

          // Keep edges to/from unscored nodes (discovery)
          if (!fromNode.played || !toNode.played) return true;

          // Keep edges with high occurrence nodes
          if (fromNode.occurrences > 100 || toNode.occurrences > 100)
            return true;

          // For deeper levels, only keep a sample
          return Math.random() < 0.1; // Keep 10% of remaining edges
        });

        console.log(`[SigmaGraph] Reduced edges to ${edgesToRender.length}`);
      }

      console.log(`[SigmaGraph] Adding ${edgesToRender.length} edges to graph`);

      // Note: nodeDepthMap not needed since we're using simplified black edges

      // Simplified edge properties for better performance
      const edgeColor = "#000000"; // Black edges for all graphs
      const edgeSize = isMassiveGraph ? 0.8 : 1; // Slightly thinner for massive graphs

      edgesToRender.forEach((edge) => {
        if (
          graph.hasNode(edge.frm.toString()) &&
          graph.hasNode(edge.to.toString())
        ) {
          // Black edges for all graphs
          graph.addEdge(edge.frm.toString(), edge.to.toString(), {
            color: edgeColor,
            size: edgeSize,
          });
        }
      });

      console.log(`[SigmaGraph] Graph now has ${graph.edges().length} edges`);

      // Clear previous sigma instance
      if (sigmaRef.current) {
        sigmaRef.current.kill();
      }

      // Create sigma instance
      // Performance settings already defined above

      console.log(
        `[SigmaGraph] Rendering ${nodeCount} nodes, isLargeGraph: ${isLargeGraph}, isExtremeGraph: ${isExtremeGraph}, isMassiveGraph: ${isMassiveGraph}`
      );

      const sigma = new Sigma(graph, containerRef.current as HTMLDivElement, {
        renderLabels:
          showLabels &&
          !isExtremeGraph &&
          !isMassiveGraph &&
          (!isMobile || showLabels), // Extra mobile check
        renderEdgeLabels: false,
        defaultNodeColor: "#666",
        defaultEdgeColor: "#000000",
        labelFont: "Inter, Arial, sans-serif",
        labelSize: isMobile ? 12 : 14, // Smaller labels on mobile
        labelWeight: "600",
        labelColor: { color: "#000000" },
        // Mobile performance optimizations
        ...(isMobile && {
          enableEdgeHoverEvents: false,
          enableEdgeClickEvents: false,
          allowInvalidContainer: true,
        }),
        defaultDrawNodeLabel: createLabelRenderer(showLabels),
        zIndex: !isMassiveGraph, // Disable z-index for massive graphs
        enableEdgeEvents: false,
        labelDensity: isMassiveGraph ? 0.01 : isLargeGraph ? 0.02 : 0.05,
        labelGridCellSize: isMassiveGraph ? 200 : isLargeGraph ? 120 : 80,
        labelRenderedSizeThreshold: isMassiveGraph ? 20 : isLargeGraph ? 12 : 8,
        nodeProgramClasses: {
          border: CustomNodeBorderProgram,
        },
        edgeProgramClasses: isMassiveGraph
          ? {}
          : {
              arrow: EdgeArrowProgram,
            },
        // Performance optimizations
        hideEdgesOnMove: isLargeGraph || isMassiveGraph,
        hideLabelsOnMove: true,
        // Skip node reducer entirely for large graphs to improve performance
        nodeReducer: undefined,
      });

      // Skip layout for massive graphs or use very fast settings
      if (!isMassiveGraph) {
        const layout = new FA2Layout(graph, {
          settings: {
            barnesHutOptimize: true,
            barnesHutTheta: isLargeGraph ? 1.5 : 0.5, // Even less accurate for large graphs
            strongGravityMode: false,
            gravity: isLargeGraph ? 0.1 : 0.05,
            scalingRatio: isLargeGraph ? 30 : 10,
            slowDown: isLargeGraph ? 3 : 10, // Very fast convergence
            outboundAttractionDistribution: true,
            adjustSizes: !isLargeGraph, // Skip for large graphs
            linLogMode: isLargeGraph,
            edgeWeightInfluence: 0.3,
          },
        });

        layoutRef.current = layout;
        layout.start();

        // Stop layout after a delay (very short for large graphs)
        const layoutDuration = isMassiveGraph
          ? 500 // Ultra-fast for massive graphs
          : isLargeGraph
            ? GRAPH_CONFIG.rendering.animationDuration
            : 5000;

        setTimeout(() => {
          if (layoutRef.current) {
            layoutRef.current.stop();
          }
        }, layoutDuration);
      }

      // Event handlers - skip hover for massive graphs
      if (!isMassiveGraph) {
        setupEventHandlers(sigma, graph, containerRef.current, {
          onNodeClick: (node: NodeDTO) => {
            if (node.id === ROOT_ID) return;

            if (!node.played || node.occurrences === 0) {
              handleUnscoredNodeClick(node);
            } else {
              setSelectedSequenceId(node.id);
            }
          },
        });
      } else {
        // For massive graphs, only set up click handler without hover effects
        sigma.on("clickNode", (...args: unknown[]) => {
          const event = args[0] as { node: string };
          try {
            const nodeData = graph.getNodeAttributes(event.node);
            const originalNode = nodeData.originalNode as NodeDTO;
            if (originalNode && originalNode.id !== ROOT_ID) {
              if (!originalNode.played || originalNode.occurrences === 0) {
                handleUnscoredNodeClick(originalNode);
              } else {
                setSelectedSequenceId(originalNode.id);
              }
            }
          } catch (error) {
            console.error("Error in clickNode handler:", error);
          }
        });

        // Add basic hover cursor effects for massive graphs
        sigma.on("enterNode", () => {
          if (containerRef.current) {
            containerRef.current.style.cursor = "pointer";
          }
        });

        sigma.on("leaveNode", () => {
          if (containerRef.current) {
            containerRef.current.style.cursor = "default";
          }
        });
      }

      sigmaRef.current = sigma;
      graphRef.current = graph;

      // Center camera after a short delay
      setTimeout(() => {
        sigma.getCamera().animatedReset({ duration: 500 });
        // Complete loading after rendering
        setLoadingProgress(100);
        setTimeout(() => {
          setLoading(false);
        }, 300);
      }, 1000);
    });

    return () => {
      if (layoutRef.current) {
        layoutRef.current.kill();
        layoutRef.current = null;
      }
      if (sigmaRef.current) {
        sigmaRef.current.kill();
        sigmaRef.current = null;
      }
    };
  }, [data, getNodeColor, showLabels]);

  // Update colors when color mode changes
  useEffect(() => {
    if (!graphRef.current || !sigmaRef.current) return;

    const sigma = sigmaRef.current;
    const graph = graphRef.current;

    data.nodes.forEach((node) => {
      if (graph.hasNode(node.id.toString())) {
        const newColor = getNodeColor(node);
        graph.setNodeAttribute(node.id.toString(), "color", newColor);
      }
    });

    sigma.refresh();
  }, [colorMode, data.nodes, getNodeColor]);

  // Helper functions
  const handleUnscoredNodeClick = (node: NodeDTO) => {
    import("canvas-confetti").then((confettiModule) => {
      const confetti = confettiModule.default || confettiModule;
      confetti({
        particleCount: 150,
        spread: 100,
        origin: { y: 0.4 },
        colors: ["#FF3B30", "#FF9500", "#FFD60A", "#30D158", "#5AC8FA"],
      });
    });

    setDiscoveredNode(node);
    setDiscoveryModalOpen(true);
  };

  return (
    <div className={`relative ${className}`}>
      {loading && (
        <GraphLoadingState
          status={loadingStatus}
          progress={loadingProgress}
          totalNodes={totalNodes}
          totalEdges={totalEdges}
          loadedNodes={loadedNodes}
          loadedEdges={loadedEdges}
        />
      )}

      <div
        ref={containerRef}
        className="w-full h-full rounded-lg shadow-2xl"
        style={{
          minHeight: "600px",
          background:
            "radial-gradient(ellipse at center, #1e293b 0%, #0f172a 50%, #020617 100%)",
          cursor: "default",
        }}
      />

      {/* Hide legend and banner on mobile */}
      {!isMobile && (
        <Legend
          colorMode={colorMode}
          maxDepth={maxDepth}
          hasUnscoredNodes={hasUnscoredNodes}
        />
      )}

      {!isMobile && <UnscoredBanner visible={hasUnscoredNodes} />}

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

// Helper function to create label renderer
function createLabelRenderer(showLabels: boolean) {
  return function drawLabel(
    context: CanvasRenderingContext2D,
    data: { x: number; y: number; size: number; label?: string | null },
    settings: { labelWeight: string; labelFont: string }
  ) {
    const size = data.size;
    const label = data.label;

    if (!label || !showLabels) return;

    const fontSize = Math.max(12, size / 2.5);
    context.font = `${settings.labelWeight} ${fontSize}px ${settings.labelFont}`;

    const textWidth = context.measureText(label).width;
    const boxPadding = 6;
    const boxWidth = textWidth + boxPadding * 2;
    const boxHeight = fontSize + boxPadding;
    const yOffset = size + 5;

    context.fillStyle = "rgba(255, 255, 255, 0.95)";
    context.strokeStyle = "rgba(0, 0, 0, 0.3)";
    context.lineWidth = 1.5;

    context.shadowColor = "rgba(0, 0, 0, 0.2)";
    context.shadowBlur = 4;
    context.shadowOffsetX = 0;
    context.shadowOffsetY = 2;

    const x = data.x - boxWidth / 2;
    const y = data.y + yOffset;
    const radius = 4;

    context.beginPath();
    context.moveTo(x + radius, y);
    context.lineTo(x + boxWidth - radius, y);
    context.quadraticCurveTo(x + boxWidth, y, x + boxWidth, y + radius);
    context.lineTo(x + boxWidth, y + boxHeight - radius);
    context.quadraticCurveTo(
      x + boxWidth,
      y + boxHeight,
      x + boxWidth - radius,
      y + boxHeight
    );
    context.lineTo(x + radius, y + boxHeight);
    context.quadraticCurveTo(x, y + boxHeight, x, y + boxHeight - radius);
    context.lineTo(x, y + radius);
    context.quadraticCurveTo(x, y, x + radius, y);
    context.closePath();

    context.fill();
    context.stroke();

    context.shadowColor = "transparent";
    context.shadowBlur = 0;
    context.shadowOffsetX = 0;
    context.shadowOffsetY = 0;

    context.fillStyle = "#000000";
    context.textAlign = "center";
    context.textBaseline = "middle";
    context.fillText(label, data.x, data.y + yOffset + boxHeight / 2);
  };
}

// Throttle function for performance
function throttle<T extends (...args: unknown[]) => unknown>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle = false;
  return function (this: unknown, ...args: Parameters<T>) {
    if (!inThrottle) {
      func.apply(this, args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
}

// Debounce function for performance
function debounce<T extends (...args: unknown[]) => unknown>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null;
  return function (this: unknown, ...args: Parameters<T>) {
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(() => {
      func.apply(this, args);
    }, wait);
  };
}

// Helper function to setup event handlers
function setupEventHandlers(
  sigma: Sigma,
  graph: Graph,
  container: HTMLDivElement | null,
  callbacks: {
    onNodeClick: (node: NodeDTO) => void;
  }
) {
  // Click handler
  sigma.on("clickNode", (...args: unknown[]) => {
    const event = args[0] as { node: string };
    try {
      const nodeData = graph.getNodeAttributes(event.node);
      const originalNode = nodeData.originalNode as NodeDTO;
      if (originalNode) {
        callbacks.onNodeClick(originalNode);
      }
    } catch (error) {
      console.error("Error in clickNode handler:", error);
    }
  });

  // Hover handlers with throttling
  const tooltip = createTooltip();
  let hoverTimeout: NodeJS.Timeout;
  const pendingHighlights = new Set<string>();
  const pendingUnhighlights = new Set<string>();

  // Skip hover highlights for very large graphs
  const nodeCount = graph.nodes().length;
  const skipHoverEffects =
    nodeCount > GRAPH_CONFIG.performanceThresholds.highNodeCount;

  // Batch refresh calls for better performance
  const debouncedRefresh = debounce(() => {
    if (skipHoverEffects) return; // Skip for large graphs

    // Apply all pending highlight changes
    pendingHighlights.forEach((nodeId) => {
      if (graph.hasNode(nodeId)) {
        graph.setNodeAttribute(nodeId, "highlighted", true);
      }
    });

    pendingUnhighlights.forEach((nodeId) => {
      if (graph.hasNode(nodeId)) {
        graph.setNodeAttribute(nodeId, "highlighted", false);
      }
    });

    pendingHighlights.clear();
    pendingUnhighlights.clear();

    // Single refresh for all changes
    sigma.refresh();
  }, GRAPH_CONFIG.rendering.refreshDebounce);

  const handleNodeEnter = throttle((...args: unknown[]) => {
    const event = args[0] as { node: string };
    try {
      const node = event.node;
      if (!graph.hasNode(node)) return;

      const nodeData = graph.getNodeAttributes(node);
      const originalNode = nodeData.originalNode as NodeDTO;

      if (!originalNode) return;

      // Change cursor to pointer
      if (container) {
        container.style.cursor = "pointer";
      }

      // Queue highlight change
      pendingHighlights.add(node);
      pendingUnhighlights.delete(node);

      clearTimeout(hoverTimeout);
      showTooltip(tooltip, sigma, node, originalNode);

      // Debounced refresh
      debouncedRefresh();
    } catch (error) {
      console.error("Error in enterNode handler:", error);
    }
  }, GRAPH_CONFIG.rendering.hoverDebounce);

  sigma.on("enterNode", handleNodeEnter);

  const handleNodeLeave = throttle((...args: unknown[]) => {
    const event = args[0] as { node: string };
    try {
      const node = event.node;
      if (!graph.hasNode(node)) return;

      // Reset cursor to default
      if (container) {
        container.style.cursor = "default";
      }

      // Queue unhighlight change
      pendingUnhighlights.add(node);
      pendingHighlights.delete(node);

      tooltip.style.opacity = "0";
      hoverTimeout = setTimeout(() => {
        tooltip.style.display = "none";
      }, 200);

      // Debounced refresh
      debouncedRefresh();
    } catch (error) {
      console.error("Error in leaveNode handler:", error);
    }
  }, GRAPH_CONFIG.rendering.hoverDebounce);

  sigma.on("leaveNode", handleNodeLeave);

  sigma.on("kill", () => {
    tooltip.remove();
  });
}

// Tooltip helpers
function createTooltip(): HTMLDivElement {
  const tooltip = document.createElement("div");
  tooltip.style.cssText = `
    position: absolute;
    pointer-events: none;
    background-color: rgba(0, 0, 0, 0.95);
    backdrop-filter: blur(10px);
    color: white;
    padding: 10px 14px;
    border-radius: 8px;
    font-size: 14px;
    z-index: 1000;
    display: none;
    max-width: 300px;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
    border: 1px solid rgba(255, 255, 255, 0.1);
    transition: opacity 0.2s ease-in-out;
  `;
  document.body.appendChild(tooltip);
  return tooltip;
}

function showTooltip(
  tooltip: HTMLDivElement,
  sigma: Sigma,
  nodeId: string,
  node: NodeDTO
) {
  const nodeDisplayData = sigma.getNodeDisplayData(nodeId);
  if (!nodeDisplayData) return;

  const container = sigma.getContainer();
  const containerRect = container.getBoundingClientRect();

  tooltip.innerHTML = `
    <div style="font-weight: 600; margin-bottom: 6px; font-size: 15px;">${node.slug}</div>
    <div style="font-size: 13px; color: #e5e5e5; line-height: 1.5;">
      <div style="display: flex; justify-content: space-between; margin-bottom: 2px;">
        <span style="color: #a3a3a3;">Depth:</span>
        <span style="font-weight: 500;">${node.depth}</span>
      </div>
      <div style="display: flex; justify-content: space-between; margin-bottom: 2px;">
        <span style="color: #a3a3a3;">Occurrences:</span>
        <span style="font-weight: 500;">${node.occurrences.toLocaleString()}</span>
      </div>
      <div style="display: flex; justify-content: space-between;">
        <span style="color: #a3a3a3;">Status:</span>
        <span style="font-weight: 500; ${!node.played ? "color: #dc2626;" : "color: #10b981;"}">
          ${node.played ? "✓ Played" : "✗ Never occurred"}
        </span>
      </div>
    </div>
  `;

  tooltip.style.opacity = "0";
  tooltip.style.display = "block";
  tooltip.style.left = `${containerRect.left + nodeDisplayData.x + 15}px`;
  tooltip.style.top = `${containerRect.top + nodeDisplayData.y - 10}px`;

  requestAnimationFrame(() => {
    tooltip.style.opacity = "1";
  });
}
