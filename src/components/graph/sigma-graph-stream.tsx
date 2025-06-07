"use client";

import {
  graphColorModeAtom,
  showLabelsAtom,
} from "@/components/graph/controls";
import { DiscoveryModal } from "@/components/graph/discovery-modal";
import { MatchDetailsModal } from "@/components/graph/match-details-modal";
import type { EdgeDTO, NodeDTO } from "@/lib/types";
import { selectedTournamentAtom } from "@/store/tournament";
import { convertSexFilter, convertYearFilter } from "@/utils/filter-converters";
import { createNodeBorderProgram } from "@sigma/node-border";
import { scaleLinear } from "d3-scale";
import Graph from "graphology";
import FA2Layout from "graphology-layout-forceatlas2/worker";
import { useAtom } from "jotai";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { EdgeArrowProgram } from "sigma/rendering";

// Constants
const CustomNodeBorderProgram = createNodeBorderProgram({});

const DEPTH_COLORS: Record<number, string> = {
  0: "#FF3B30",
  1: "#FF9500",
  2: "#FFD60A",
  3: "#30D158",
  4: "#5AC8FA",
  5: "#BF5AF2",
};

const NEVER_OCCURRED_COLOR = "#dc2626";
const ROOT_ID = 0;
const NODE_BATCH_SIZE = 1000; // Add nodes in smaller batches to Sigma
const EDGE_BATCH_SIZE = 2000; // Add edges in batches

// Types for streaming
interface StreamMeta {
  totalNodes: number;
  totalEdges: number;
  batchSize: number;
}

interface NodeBatch {
  nodes: NodeDTO[];
  startIndex: number;
  endIndex: number;
}

interface EdgeBatch {
  edges: EdgeDTO[];
  startIndex: number;
  endIndex: number;
}

type StreamMessage =
  | ({ type: "meta" } & StreamMeta)
  | ({ type: "node-batch" } & NodeBatch)
  | ({ type: "edge-batch" } & EdgeBatch)
  | { type: "complete" };

// Legend component (keeping existing)
const Legend = ({
  colorMode,
  maxDepth,
  hasUnscoredNodes,
}: {
  colorMode: string;
  maxDepth: number;
  hasUnscoredNodes: boolean;
}) => {
  // ... keeping existing Legend component code ...
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
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [totalItems, setTotalItems] = useState(0);
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

  // Fetch graph data with streaming
  useEffect(() => {
    async function fetchGraphStream() {
      // Cancel previous request
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }

      const abortController = new AbortController();
      abortControllerRef.current = abortController;

      setLoading(true);
      setLoadingProgress(0);
      setTotalItems(0);

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

        const response = await fetch(`/api/v1/graph-stream?${qs}`, {
          signal: abortController.signal,
        });

        if (!response.body) {
          throw new Error("No response body");
        }

        const reader = response.body.getReader();
        const decoder = new TextDecoder();

        const nodes: NodeDTO[] = [];
        const edges: EdgeDTO[] = [];
        const nodeIds = new Set<number>(); // Track node IDs to prevent duplicates
        const edgeKeys = new Set<string>(); // Track edge keys to prevent duplicates
        let receivedItems = 0;
        let buffer = ""; // Buffer for incomplete lines

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          // Decode chunk and add to buffer
          const chunk = decoder.decode(value, { stream: true });
          buffer += chunk;

          // Process complete lines
          const lines = buffer.split("\n");
          // Keep the last line in buffer if it's incomplete
          buffer = lines.pop() || "";

          for (const line of lines) {
            if (!line.trim()) continue;
            
            try {
              const message: StreamMessage = JSON.parse(line);

              switch (message.type) {
                case "meta":
                  setTotalItems(message.totalNodes + message.totalEdges);
                  break;

                case "node-batch":
                  // Filter out duplicate nodes
                  const newNodes = message.nodes.filter((node) => {
                    if (nodeIds.has(node.id)) {
                      console.warn(`Duplicate node ${node.id} received, skipping`);
                      return false;
                    }
                    nodeIds.add(node.id);
                    return true;
                  });
                  nodes.push(...newNodes);
                  receivedItems += message.nodes.length;
                  setLoadingProgress((receivedItems / totalItems) * 100);
                  break;

                case "edge-batch":
                  // Filter out duplicate edges
                  const newEdges = message.edges.filter((edge) => {
                    const edgeKey = `${edge.frm}-${edge.to}`;
                    if (edgeKeys.has(edgeKey)) {
                      console.warn(`Duplicate edge ${edgeKey} received, skipping`);
                      return false;
                    }
                    edgeKeys.add(edgeKey);
                    return true;
                  });
                  edges.push(...newEdges);
                  receivedItems += message.edges.length;
                  setLoadingProgress((receivedItems / totalItems) * 100);
                  break;

                case "complete":
                  setData({ nodes, edges });
                  setLoading(false);
                  break;
              }
            } catch (e) {
              console.error("Failed to parse stream message:", e, "Line:", line);
            }
          }
        }

        // Process any remaining data in buffer
        if (buffer.trim()) {
          try {
            const message: StreamMessage = JSON.parse(buffer);
            // Process the final message similar to above
            if (message.type === "complete") {
              setData({ nodes, edges });
              setLoading(false);
            }
          } catch (e) {
            console.error("Failed to parse final buffer:", e, "Buffer:", buffer);
          }
        }
      } catch (error: any) {
        if (error.name !== "AbortError") {
          console.error("Failed to fetch graph data:", error);
        }
      } finally {
        if (!abortController.signal.aborted) {
          setLoading(false);
        }
      }
    }

    fetchGraphStream();

    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [selectedYear, selectedSex, selectedSets, selectedTournament]);

  // Depth-based occurrence scales
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

  const getNodeColor = useCallback(
    (node: NodeDTO) => {
      if (node.id === ROOT_ID) return DEPTH_COLORS[0];
      if (!node.played || node.occurrences === 0) {
        return NEVER_OCCURRED_COLOR;
      }

      if (colorMode === "category") {
        return DEPTH_COLORS[node.depth] || "#666";
      } else {
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

  // Initialize and update Sigma graph with progressive loading
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

      // ITERATIVE positioning to avoid stack overflow
      const positionNodes = () => {
        const centerX = 0;
        const centerY = 0;
        const radiusStep = 120;

        // Build adjacency lists
        const children: Record<string, string[]> = {};
        const nodeMap = new Map(data.nodes.map((n) => [n.id.toString(), n]));

        // First pass: identify parent-child relationships
        data.edges.forEach((edge) => {
          const sourceNode = nodeMap.get(edge.frm.toString());
          const targetNode = nodeMap.get(edge.to.toString());

          if (sourceNode && targetNode && sourceNode.depth < targetNode.depth) {
            const sourceId = edge.frm.toString();
            if (!children[sourceId]) children[sourceId] = [];
            children[sourceId].push(edge.to.toString());
          }
        });

        // Position nodes using BFS (iterative, not recursive!)
        const positions: Record<string, { x: number; y: number }> = {};
        const queue: Array<{
          nodeId: string;
          startAngle: number;
          endAngle: number;
          depth: number;
        }> = [];

        // Find and position root
        const rootNode = data.nodes.find((n) => n.depth === 0);
        if (rootNode) {
          const rootId = rootNode.id.toString();
          positions[rootId] = { x: centerX, y: centerY };
          queue.push({
            nodeId: rootId,
            startAngle: 0,
            endAngle: 2 * Math.PI,
            depth: 1,
          });
        }

        // Process queue iteratively
        while (queue.length > 0) {
          const { nodeId, startAngle, endAngle, depth } = queue.shift()!;
          const nodeChildren = children[nodeId] || [];

          if (nodeChildren.length === 0) continue;

          const radius = depth * radiusStep;
          const angleRange = endAngle - startAngle;
          const angleStep = angleRange / nodeChildren.length;

          nodeChildren.forEach((childId, index) => {
            const baseAngle = startAngle + angleStep * (index + 0.5);
            const angleVariation = (Math.random() - 0.5) * angleStep * 0.3;
            const childAngle = baseAngle + angleVariation;

            const radiusVariation = (Math.random() - 0.5) * radiusStep * 0.2;
            const childRadius = radius + radiusVariation;

            const x = centerX + childRadius * Math.cos(childAngle);
            const y = centerY + childRadius * Math.sin(childAngle);

            positions[childId] = { x, y };

            // Add child to queue for further processing
            const childNode = nodeMap.get(childId);
            if (childNode) {
              queue.push({
                nodeId: childId,
                startAngle: startAngle + angleStep * index,
                endAngle: startAngle + angleStep * (index + 1),
                depth: childNode.depth + 1,
              });
            }
          });
        }

        // Handle orphaned nodes
        data.nodes.forEach((node) => {
          const nodeId = node.id.toString();
          if (!positions[nodeId]) {
            const radius = node.depth * radiusStep;
            const angle = Math.random() * 2 * Math.PI;
            positions[nodeId] = {
              x: centerX + radius * Math.cos(angle),
              y: centerY + radius * Math.sin(angle),
            };
          }
        });

        return positions;
      };

      // Calculate positions
      const positions = positionNodes();

      // Progressive node addition using requestIdleCallback
      const addNodesProgressively = async () => {
        const nodesArray = data.nodes;

        for (let i = 0; i < nodesArray.length; i += NODE_BATCH_SIZE) {
          const batch = nodesArray.slice(i, i + NODE_BATCH_SIZE);

          // Add nodes in this batch
          batch.forEach((node) => {
            const nodeId = node.id.toString();
            const pos = positions[nodeId] || { x: 0, y: 0 };

            let size;
            if (node.id === ROOT_ID) {
              size = 14;
            } else {
              const baseSize = Math.max(node.norm * 60, 2);
              const occurrenceBonus = Math.log(node.occurrences + 1) * 1.5;
              size = Math.max(5, baseSize + occurrenceBonus);
            }

            if (!node.slug || node.slug.trim() === "") return;

            // Check if node already exists to prevent duplicates
            if (graph.hasNode(nodeId)) {
              console.warn(`Node ${nodeId} already exists in graph, skipping`);
              return;
            }

            graph.addNode(nodeId, {
              label: node.slug,
              size,
              color: getNodeColor(node),
              borderColor:
                node.id === ROOT_ID || !node.played || node.occurrences === 0
                  ? "#ffffff"
                  : "#000000",
              borderSize:
                node.id === ROOT_ID
                  ? 3
                  : !node.played || node.occurrences === 0
                    ? 2
                    : 1,
              type: "border",
              x: pos.x,
              y: pos.y,
              originalNode: node,
            });
          });

          // Yield to browser
          await new Promise((resolve) => {
            if ("requestIdleCallback" in window) {
              (window as any).requestIdleCallback(resolve);
            } else {
              setTimeout(resolve, 0);
            }
          });
        }
      };

      // Progressive edge addition
      const addEdgesProgressively = async () => {
        const edgesArray = data.edges;

        for (let i = 0; i < edgesArray.length; i += EDGE_BATCH_SIZE) {
          const batch = edgesArray.slice(i, i + EDGE_BATCH_SIZE);

          batch.forEach((edge) => {
            if (
              graph.hasNode(edge.frm.toString()) &&
              graph.hasNode(edge.to.toString())
            ) {
              // Check if edge already exists before adding
              if (!graph.hasEdge(edge.frm.toString(), edge.to.toString())) {
                const fromNode = data.nodes.find((n) => n.id === edge.frm);
                const toNode = data.nodes.find((n) => n.id === edge.to);
                const maxDepth = Math.max(
                  fromNode?.depth || 0,
                  toNode?.depth || 0
                );
                const brightness = 40 + maxDepth * 10;

                graph.addEdge(edge.frm.toString(), edge.to.toString(), {
                  color: `hsla(200, 60%, ${brightness}%, 0.8)`,
                  size: 1 + maxDepth * 0.3,
                  type: "arrow",
                });
              }
            }
          });

          // Yield to browser
          await new Promise((resolve) => {
            if ("requestIdleCallback" in window) {
              (window as any).requestIdleCallback(resolve);
            } else {
              setTimeout(resolve, 0);
            }
          });
        }
      };

      // Add nodes and edges progressively
      await addNodesProgressively();
      await addEdgesProgressively();

      // Clear previous sigma instance
      if (sigmaRef.current) {
        sigmaRef.current.kill();
      }

      // Create sigma instance
      const sigma = new Sigma(graph, containerRef.current as HTMLDivElement, {
        renderLabels: true,
        renderEdgeLabels: false,
        defaultNodeColor: "#666",
        defaultEdgeColor: "#333",
        labelFont: "Inter, Arial, sans-serif",
        labelSize: 14,
        labelWeight: "600",
        labelColor: { color: "#000000" },
        defaultDrawNodeLabel: (context, data, settings) => {
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
        },
        zIndex: true,
        enableEdgeEvents: false,
        labelDensity: 0.05,
        labelGridCellSize: 80,
        labelRenderedSizeThreshold: 3,
        nodeProgramClasses: {
          border: CustomNodeBorderProgram,
        },
        edgeProgramClasses: {
          arrow: EdgeArrowProgram,
        },
        nodeReducer: (node, data) => {
          const res = { ...data };
          if (data.highlighted) {
            res.zIndex = 1;
            res.borderSize = 3;
            res.borderColor = "#ffffff";
          }
          return res;
        },
      });

      // Use Web Worker for ForceAtlas2 layout
      const layout = new FA2Layout(graph, {
        settings: {
          barnesHutOptimize: true,
          strongGravityMode: false,
          gravity: 0.05,
          scalingRatio: 10,
          slowDown: 10,
          outboundAttractionDistribution: true,
          adjustSizes: true,
          linLogMode: false,
          edgeWeightInfluence: 0.5,
        },
      });

      layoutRef.current = layout;
      layout.start();

      // Stop layout after 5 seconds
      setTimeout(() => {
        if (layoutRef.current) {
          layoutRef.current.stop();
        }
      }, 5000);

      // Event handlers
      sigma.on("clickNode", (event) => {
        try {
          const nodeData = graph.getNodeAttributes(event.node);
          const originalNode = nodeData.originalNode as NodeDTO;

          if (!originalNode) return;
          if (originalNode.id === ROOT_ID) return;

          if (!originalNode.played || originalNode.occurrences === 0) {
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

      // Add hover tooltip
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

      let hoverTimeout: NodeJS.Timeout;

      sigma.on("enterNode", (event) => {
        try {
          const node = event.node;
          if (!graph.hasNode(node)) return;

          const nodeData = graph.getNodeAttributes(node);
          const originalNode = nodeData.originalNode as NodeDTO;

          if (!originalNode) return;

          graph.setNodeAttribute(node, "highlighted", true);

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

          tooltip.style.opacity = "0";
          hoverTimeout = setTimeout(() => {
            tooltip.style.display = "none";
          }, 200);

          sigma.refresh();
        } catch (error) {
          console.error("Error in leaveNode handler:", error);
        }
      });

      sigma.on("kill", () => {
        tooltip.remove();
      });

      sigmaRef.current = sigma;
      graphRef.current = graph;

      // Center camera after layout stabilizes
      setTimeout(() => {
        const camera = sigma.getCamera();
        camera.animatedReset({
          duration: 500,
        });
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

  // Update label visibility
  useEffect(() => {
    if (!sigmaRef.current) return;
    sigmaRef.current.refresh();
  }, [showLabels]);

  return (
    <div className={`relative ${className}`}>
      {loading && (
        <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center z-10 backdrop-blur-sm">
          <div className="flex flex-col items-center">
            <div className="w-12 h-12 border-4 border-white border-t-transparent rounded-full animate-spin mb-4"></div>
            <div className="text-white text-lg font-medium mb-2">
              Loading graph data...
            </div>
            {totalItems > 0 && (
              <div className="w-64">
                <div className="bg-gray-700 rounded-full h-2 overflow-hidden">
                  <div
                    className="bg-green-500 h-full transition-all duration-300"
                    style={{ width: `${loadingProgress}%` }}
                  />
                </div>
                <div className="text-white text-sm mt-2 text-center">
                  {Math.round(loadingProgress)}% complete
                </div>
              </div>
            )}
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

      <Legend
        colorMode={colorMode}
        maxDepth={maxDepth}
        hasUnscoredNodes={hasUnscoredNodes}
      />

      <UnscoredBanner visible={hasUnscoredNodes} />

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
