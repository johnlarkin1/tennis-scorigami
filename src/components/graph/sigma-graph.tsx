"use client";

import {
  graphColorModeAtom,
  showLabelsAtom,
} from "@/components/graph/controls/game-controls";
import { DiscoveryModal } from "@/components/graph/discovery-modal";
import { MatchDetailsModal } from "@/components/graph/match-details-modal";
import type { EdgeDTO, NodeDTO } from "@/lib/types";
import { selectedTournamentAtom } from "@/store/tournament";
import { convertSexFilter, convertYearFilter } from "@/utils/filter-converters";
import { createNodeBorderProgram } from "@sigma/node-border";
import { scaleLinear } from "d3-scale";
import Graph from "graphology";
import { circular } from "graphology-layout";
import forceAtlas2 from "graphology-layout-forceatlas2";
import { useAtom } from "jotai";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { EdgeArrowProgram } from "sigma/rendering";

// Create custom border program with visible borders
const CustomNodeBorderProgram = createNodeBorderProgram({});

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

// Animation duration constants
const INITIAL_ANIMATION_DURATION = 2000;

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
        <div className="flex items-center gap-2 mb-1">
          <div
            className="w-4 h-4 rounded-full ring-1 ring-black"
            style={{ backgroundColor: "hsl(220,80%,30%)" }}
          />
          <span className="text-gray-300 text-xs">High frequency</span>
        </div>
        <div className="flex items-center gap-2 mb-1">
          <div
            className="w-4 h-4 rounded-full ring-1 ring-black"
            style={{ backgroundColor: "hsl(220,80%,60%)" }}
          />
          <span className="text-gray-300 text-xs">Medium frequency</span>
        </div>
        <div className="flex items-center gap-2 mb-1">
          <div
            className="w-4 h-4 rounded-full ring-1 ring-black"
            style={{ backgroundColor: "hsl(220,80%,90%)" }}
          />
          <span className="text-gray-300 text-xs">Low frequency</span>
        </div>
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

// Banner to highlight unscored sequences
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
  const animationFrameRef = useRef<number | null>(null);

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

  // Max depth is simply the number of sets
  const maxDepth = selectedSets;

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
        if (!nodes.some((n: NodeDTO) => n.depth === 0)) {
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
            .filter((n: NodeDTO) => n.depth === 1)
            .map((n: NodeDTO) => ({ frm: ROOT_ID, to: n.id }));
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
          const intensity = scale(node.occurrences) as number;
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

    // Cleanup previous instances
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }

    // Dynamically import Sigma to avoid SSR issues
    import("sigma").then((SigmaModule) => {
      const Sigma = SigmaModule.default || SigmaModule;

      // Create new graph - ensure it's a proper Graphology instance
      let graph: Graph;
      try {
        graph = new Graph({ multi: false, type: "directed" });
      } catch (error) {
        console.error("Failed to create graph:", error);
        return;
      }

      // Store initial positions for animation
      const initialPositions: Record<string, { x: number; y: number }> = {};

      // Add nodes with improved sizing and border support
      data.nodes.forEach((node) => {
        let size;
        if (node.id === ROOT_ID) {
          size = 14; // Make root node larger
        } else {
          // Scale node size based on occurrences and importance
          const baseSize = Math.max(node.norm * 60, 2);
          const occurrenceBonus = Math.log(node.occurrences + 1) * 1.5;
          size = Math.max(5, baseSize + occurrenceBonus);
        }

        // Skip nodes with empty slugs
        if (!node.slug || node.slug.trim() === "") {
          console.warn("Skipping node with empty slug:", node);
          return;
        }

        // Generate random initial position for animation
        const nodeIdStr = node.id.toString();
        const angle = Math.random() * 2 * Math.PI;
        const distance = Math.random() * 50;
        initialPositions[nodeIdStr] = {
          x: distance * Math.cos(angle),
          y: distance * Math.sin(angle),
        };

        const nodeId = node.id.toString();

        graph.addNode(nodeId, {
          label: node.slug, // Always include label in node data
          size,
          color: getNodeColor(node),
          borderColor:
            node.id === ROOT_ID || !node.played || node.occurrences === 0
              ? "#ffffff" // White border for root and unplayed nodes
              : "#000000", // Black border for others
          borderSize:
            node.id === ROOT_ID
              ? 3
              : !node.played || node.occurrences === 0
                ? 2
                : 1, // Different border sizes
          type: "border", // Use border node type
          x: initialPositions[nodeIdStr].x,
          y: initialPositions[nodeIdStr].y,
          originalNode: node,
        });
      });

      // Add edges with improved styling
      data.edges.forEach((edge) => {
        // Only add edge if both nodes exist
        if (
          graph.hasNode(edge.frm.toString()) &&
          graph.hasNode(edge.to.toString())
        ) {
          const fromNode = data.nodes.find((n) => n.id === edge.frm);
          const toNode = data.nodes.find((n) => n.id === edge.to);
          const maxDepth = Math.max(fromNode?.depth || 0, toNode?.depth || 0);
          const brightness = 40 + maxDepth * 10;

          graph.addEdge(edge.frm.toString(), edge.to.toString(), {
            color: `hsla(200, 60%, ${brightness}%, 0.8)`,
            size: 1 + maxDepth * 0.3,
            type: "arrow", // Use arrow edges
          });
        }
      });

      // First apply circular layout as base
      circular.assign(graph, {
        scale: 100,
      });

      // Apply hierarchical radial layout based on parent-child relationships
      const centerX = 0;
      const centerY = 0;
      const radiusStep = 120; // Distance between layers

      // Build adjacency list for parent-child relationships
      const children: Record<string, string[]> = {};
      const parents: Record<string, string | null> = {};

      graph.forEachEdge((edge, attributes, source, target) => {
        const sourceAttrs = graph.getNodeAttributes(source);
        const targetAttrs = graph.getNodeAttributes(target);

        const sourceNode = sourceAttrs?.originalNode as NodeDTO;
        const targetNode = targetAttrs?.originalNode as NodeDTO;

        if (!sourceNode || !targetNode) return;

        // Edge goes from lower depth to higher depth (parent to child)
        if (sourceNode.depth < targetNode.depth) {
          if (!children[source]) children[source] = [];
          children[source].push(target);
          parents[target] = source;
        }
      });

      // Find root node
      const rootNode = graph.findNode(
        (node, attributes) => attributes?.originalNode?.depth === 0
      );

      // Store target positions for animation
      const targetPositions: Record<string, { x: number; y: number }> = {};

      // Position root at center
      if (rootNode) {
        targetPositions[rootNode] = { x: centerX, y: centerY };
      }

      // Recursive function to position nodes in their parent's angular sector
      const positionSubtree = (
        nodeId: string,
        startAngle: number,
        endAngle: number,
        depth: number
      ) => {
        const nodeChildren = children[nodeId] || [];
        if (nodeChildren.length === 0) return;

        const radius = depth * radiusStep;
        const angleRange = endAngle - startAngle;
        const angleStep = angleRange / nodeChildren.length;

        nodeChildren.forEach((childId, index) => {
          // Position child within parent's angular sector with some randomness
          const baseAngle = startAngle + angleStep * (index + 0.5);
          const angleVariation = (Math.random() - 0.5) * angleStep * 0.3;
          const childAngle = baseAngle + angleVariation;

          const radiusVariation = (Math.random() - 0.5) * radiusStep * 0.2;
          const childRadius = radius + radiusVariation;

          const x = centerX + childRadius * Math.cos(childAngle);
          const y = centerY + childRadius * Math.sin(childAngle);

          targetPositions[childId] = { x, y };

          // Recursively position this child's subtree
          const childStartAngle = startAngle + angleStep * index;
          const childEndAngle = startAngle + angleStep * (index + 1);
          const childAttrs = graph.getNodeAttributes(childId);
          const childDepth = childAttrs?.originalNode?.depth || depth + 1;

          positionSubtree(
            childId,
            childStartAngle,
            childEndAngle,
            childDepth + 1
          );
        });
      };

      // Start positioning from root
      if (rootNode) {
        positionSubtree(rootNode, 0, 2 * Math.PI, 1);
      }

      // Handle any orphaned nodes
      graph.forEachNode((node) => {
        if (!targetPositions[node]) {
          const attributes = graph.getNodeAttributes(node);
          const depth = attributes.originalNode?.depth || 0;
          const radius = depth * radiusStep;
          const angle = Math.random() * 2 * Math.PI;

          targetPositions[node] = {
            x: centerX + radius * Math.cos(angle),
            y: centerY + radius * Math.sin(angle),
          };
        }
      });

      // Clear previous sigma instance
      if (sigmaRef.current) {
        sigmaRef.current.kill();
      }

      // Create sigma instance with enhanced settings
      const sigma = new Sigma(graph, containerRef.current as HTMLDivElement, {
        renderLabels: true, // Always render labels
        renderEdgeLabels: false,
        defaultNodeColor: "#666",
        defaultEdgeColor: "#333",
        labelFont: "Inter, Arial, sans-serif",
        labelSize: 14,
        labelWeight: "600",
        labelColor: { color: "#000000" }, // Black labels for better contrast
        defaultDrawNodeLabel: (context, data, settings) => {
          // Custom label rendering with background
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

          // Draw background with shadow
          context.fillStyle = "rgba(255, 255, 255, 0.95)";
          context.strokeStyle = "rgba(0, 0, 0, 0.3)";
          context.lineWidth = 1.5;

          // Shadow
          context.shadowColor = "rgba(0, 0, 0, 0.2)";
          context.shadowBlur = 4;
          context.shadowOffsetX = 0;
          context.shadowOffsetY = 2;

          // Draw rounded rectangle manually for compatibility
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

          // Reset shadow
          context.shadowColor = "transparent";
          context.shadowBlur = 0;
          context.shadowOffsetX = 0;
          context.shadowOffsetY = 0;

          // Draw text
          context.fillStyle = "#000000";
          context.textAlign = "center";
          context.textBaseline = "middle";
          context.fillText(label, data.x, data.y + yOffset + boxHeight / 2);
        },
        zIndex: true,
        enableEdgeEvents: false,
        labelDensity: 0.05, // Show more labels
        labelGridCellSize: 80, // Larger grid cells
        labelRenderedSizeThreshold: 3, // Lower threshold to show more labels
        // Node programs for border support
        nodeProgramClasses: {
          border: CustomNodeBorderProgram,
        },
        // Edge programs for arrow support
        edgeProgramClasses: {
          arrow: EdgeArrowProgram,
        },
        // Node reducer for hover effects - very subtle
        nodeReducer: (node, data) => {
          const res = { ...data };
          if (data.highlighted) {
            // Only change border on hover, not size
            res.zIndex = 1;
            res.borderSize = 3; // Thicker border
            res.borderColor = "#ffffff"; // White border on hover
          }
          return res;
        },
      });

      // Animate nodes from initial to target positions
      const animateInitialLayout = () => {
        const duration = INITIAL_ANIMATION_DURATION;
        const startTime = Date.now();

        const animate = () => {
          const now = Date.now();
          const progress = Math.min((now - startTime) / duration, 1);

          // Easing function for smooth animation
          const easeInOutCubic = (t: number) => {
            return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
          };

          const easedProgress = easeInOutCubic(progress);

          graph.forEachNode((node) => {
            const initial = initialPositions[node] || { x: 0, y: 0 };
            const target = targetPositions[node] || { x: 0, y: 0 };

            if (!initialPositions[node] || !targetPositions[node]) {
              console.warn(`Missing positions for node ${node}`);
            }

            const x = initial.x + (target.x - initial.x) * easedProgress;
            const y = initial.y + (target.y - initial.y) * easedProgress;

            graph.setNodeAttribute(node, "x", x);
            graph.setNodeAttribute(node, "y", y);
          });

          sigma.refresh();

          if (progress < 1) {
            animationFrameRef.current = requestAnimationFrame(animate);
          } else {
            // Apply force layout to refine positions after initial animation
            try {
              // Ensure graph is valid before applying layout
              if (!graph || typeof graph.order !== "function") {
                console.warn("Invalid graph instance for ForceAtlas2");
                return;
              }

              const settings = forceAtlas2.inferSettings(graph);

              // Run ForceAtlas2 iterations synchronously
              forceAtlas2.assign(graph, {
                iterations: 50,
                settings: {
                  ...settings,
                  strongGravityMode: false,
                  gravity: 0.05,
                  scalingRatio: 10,
                  slowDown: 10,
                  outboundAttractionDistribution: true,
                  adjustSizes: true,
                  barnesHutOptimize: true,
                  linLogMode: false,
                  edgeWeightInfluence: 0.5,
                },
              });

              // Refresh after layout
              sigma.refresh();
            } catch (error) {
              console.error("ForceAtlas2 layout error:", error);
              // Continue without force layout if there's an error
              sigma.refresh();
            }
          }
        };

        animate();
      };

      // Start initial animation
      animateInitialLayout();

      // Handle node clicks without animation
      sigma.on("clickNode", (event) => {
        try {
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
              const confetti = confettiModule.default || confettiModule;
              confetti({
                particleCount: 150,
                spread: 100,
                origin: { y: 0.4 },
                colors: ["#FF3B30", "#FF9500", "#FFD60A", "#30D158", "#5AC8FA"],
              });
            });

            setDiscoveredNode(originalNode);
            setDiscoveryModalOpen(true);
          } else {
            setSelectedSequenceId(originalNode.id);
          }
        } catch (error) {
          console.error("Error in clickNode handler:", error);
        }
      });

      // Add hover effects with enhanced tooltip
      let hoverTimeout: NodeJS.Timeout;
      const tooltip = document.createElement("div");
      tooltip.style.position = "absolute";
      tooltip.style.pointerEvents = "none";
      tooltip.style.backgroundColor = "rgba(0, 0, 0, 0.95)";
      tooltip.style.backdropFilter = "blur(10px)";
      tooltip.style.color = "white";
      tooltip.style.padding = "10px 14px";
      tooltip.style.borderRadius = "8px";
      tooltip.style.fontSize = "14px";
      tooltip.style.zIndex = "1000";
      tooltip.style.display = "none";
      tooltip.style.maxWidth = "300px";
      tooltip.style.boxShadow = "0 4px 20px rgba(0, 0, 0, 0.3)";
      tooltip.style.border = "1px solid rgba(255, 255, 255, 0.1)";
      tooltip.style.transition = "opacity 0.2s ease-in-out";
      document.body.appendChild(tooltip);

      sigma.on("enterNode", (event) => {
        try {
          const node = event.node;
          if (!graph.hasNode(node)) return;

          const nodeData = graph.getNodeAttributes(node);
          const originalNode = nodeData.originalNode as NodeDTO;

          if (!originalNode) return;

          // Subtle hover effect
          graph.setNodeAttribute(node, "highlighted", true);

          // Show tooltip with animation
          clearTimeout(hoverTimeout);
          const nodeDisplayData = sigma.getNodeDisplayData(node);
          if (!nodeDisplayData) return;

          const containerRect = containerRef.current!.getBoundingClientRect();

          tooltip.innerHTML = `
          <div style="font-weight: 600; margin-bottom: 6px; font-size: 15px;">${originalNode.slug}</div>
          <div style="font-size: 13px; color: #e5e5e5; line-height: 1.5;">
            <div style="display: flex; justify-content: space-between; margin-bottom: 2px;">
              <span style="color: #a3a3a3;">Depth:</span>
              <span style="font-weight: 500;">${originalNode.depth}</span>
            </div>
            <div style="display: flex; justify-content: space-between; margin-bottom: 2px;">
              <span style="color: #a3a3a3;">Occurrences:</span>
              <span style="font-weight: 500;">${originalNode.occurrences.toLocaleString()}</span>
            </div>
            <div style="display: flex; justify-content: space-between;">
              <span style="color: #a3a3a3;">Status:</span>
              <span style="font-weight: 500; ${!originalNode.played ? "color: #dc2626;" : "color: #10b981;"}">
                ${originalNode.played ? "✓ Played" : "✗ Never occurred"}
              </span>
            </div>
          </div>
        `;

          tooltip.style.opacity = "0";
          tooltip.style.display = "block";
          tooltip.style.left = `${containerRect.left + nodeDisplayData.x + 15}px`;
          tooltip.style.top = `${containerRect.top + nodeDisplayData.y - 10}px`;

          // Fade in
          requestAnimationFrame(() => {
            tooltip.style.opacity = "1";
          });

          sigma.refresh();
        } catch (error) {
          console.error("Error in enterNode handler:", error);
        }
      });

      sigma.on("leaveNode", (event) => {
        try {
          const node = event.node;
          if (!graph.hasNode(node)) return;

          graph.setNodeAttribute(node, "highlighted", false);

          // Hide tooltip with fade out
          tooltip.style.opacity = "0";
          hoverTimeout = setTimeout(() => {
            tooltip.style.display = "none";
          }, 200);

          sigma.refresh();
        } catch (error) {
          console.error("Error in leaveNode handler:", error);
        }
      });

      // Clean up tooltip on unmount
      sigma.on("kill", () => {
        tooltip.remove();
      });

      sigmaRef.current = sigma;
      graphRef.current = graph;

      // Center and zoom the graph to fit after animation completes
      setTimeout(() => {
        const camera = sigma.getCamera();
        camera.animatedReset({
          duration: 500,
        });
      }, INITIAL_ANIMATION_DURATION + 500);
    });

    // Cleanup
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = null;
      }
      if (sigmaRef.current) {
        sigmaRef.current.kill();
        sigmaRef.current = null;
      }
    };
  }, [data, getNodeColor, showLabels]);

  // Update node colors when color mode changes with animation
  useEffect(() => {
    if (!graphRef.current || !sigmaRef.current) return;

    const sigma = sigmaRef.current;
    const graph = graphRef.current;

    // Animate color changes
    data.nodes.forEach((node) => {
      if (graph.hasNode(node.id.toString())) {
        const newColor = getNodeColor(node);
        graph.setNodeAttribute(node.id.toString(), "color", newColor);
      }
    });

    sigma.refresh();
  }, [colorMode, data.nodes, getNodeColor]);

  // Update labels when showLabels changes
  useEffect(() => {
    if (!sigmaRef.current) {
      return;
    }

    // Simply refresh sigma to apply the new label visibility
    sigmaRef.current.refresh();
  }, [showLabels]);

  return (
    <div className={`relative ${className}`}>
      {loading && (
        <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center z-10 backdrop-blur-sm">
          <div className="flex flex-col items-center">
            <div className="w-12 h-12 border-4 border-white border-t-transparent rounded-full animate-spin mb-4"></div>
            <div className="text-white text-lg font-medium">
              Loading graph...
            </div>
          </div>
        </div>
      )}

      <div
        ref={containerRef}
        className="w-full h-full rounded-lg shadow-2xl"
        style={{
          minHeight: "600px",
          background:
            "radial-gradient(ellipse at center, #1e293b 0%, #0f172a 50%, #020617 100%)",
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
