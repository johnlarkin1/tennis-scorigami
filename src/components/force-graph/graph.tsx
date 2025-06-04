"use client";

import {
  graphColorModeAtom,
  graphDensityAtom,
  graphLayoutAtom,
  selectedSetsAtom,
  selectedSexAtom,
  selectedYearAtom,
  showEdgesAtom,
  showLabelsAtom,
} from "@/components/force-graph/controls";
import { DiscoveryModal } from "@/components/force-graph/discovery-modal";
import { MatchDetailsModal } from "@/components/force-graph/match-details-modal";
// Dynamic import for SigmaGraph to prevent SSR issues
const SigmaGraph = dynamic(() => import("@/components/force-graph/sigma-graph").then(mod => ({ default: mod.SigmaGraph })), {
  ssr: false,
});
import type { EdgeDTO, NodeDTO } from "@/lib/types";
import { selectedTournamentAtom } from "@/store/tournament";
import { convertSexFilter, convertYearFilter } from "@/utils/filter-converters";
import { scaleLinear } from "d3-scale";
import { useAtom } from "jotai";
import dynamic from "next/dynamic";
import {
  Fragment,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import type { ForceGraphMethods } from "react-force-graph-3d";
import { useResizeDetector } from "react-resize-detector";
import SpriteText from "three-spritetext";

// All colors in one place
const DEPTH_COLORS: Record<number, string> = {
  0: "#FF3B30", // Vibrant Red
  1: "#FF9500", // Warm Orange
  2: "#FFD60A", // Bright Yellow
  3: "#30D158", // Spring Green
  4: "#5AC8FA", // Electric Cyan
  5: "#BF5AF2", // Electric Purple
};

const NEVER_OCCURRED_COLOR = "#dc2626"; // Bright red

const FREQUENCY_LEGEND = [
  { label: "High frequency", color: "hsl(220,80%,30%)" },
  { label: "Medium frequency", color: "hsl(220,80%,60%)" },
  { label: "Low frequency", color: "hsl(220,80%,90%)" },
];

// Graph constants
const ROOT_ID = 0;

// Dynamically load only on client
const ForceGraph3D = dynamic(() => import("react-force-graph-3d"), {
  ssr: false,
});

type GraphLink = { source: number; target: number };
interface GraphData {
  nodes: NodeDTO[];
  links: GraphLink[];
}

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

// Enhanced Legend component
const Legend = ({
  colorMode,
  maxDepth,
  data,
}: {
  colorMode: string;
  maxDepth: number;
  data: GraphData;
}) => {
  // Calculate statistics per depth
  const depthStats = useMemo(() => {
    const stats: Record<
      number,
      { count: number; maxOccurrences: number; avgOccurrences: number }
    > = {};

    for (let depth = 0; depth <= maxDepth; depth++) {
      const nodesAtDepth = data.nodes.filter((n) => n.depth === depth);
      const occurrences = nodesAtDepth.map((n) => n.occurrences);

      stats[depth] = {
        count: nodesAtDepth.length,
        maxOccurrences: Math.max(...occurrences, 0),
        avgOccurrences:
          occurrences.length > 0
            ? occurrences.reduce((a, b) => a + b, 0) / occurrences.length
            : 0,
      };
    }

    return stats;
  }, [data, maxDepth]);

  if (colorMode === "category") {
    return (
      <div className="absolute top-4 right-4 bg-gray-800/90 rounded-lg p-4 backdrop-blur-sm max-w-xs shadow-lg z-10">
        <h3 className="text-white text-sm font-semibold mb-3">Score Levels</h3>
        {Array.from({ length: Math.min(maxDepth + 1, 5) }, (_, i) => (
          <div key={i} className="mb-3">
            <div className="flex items-center gap-2 mb-1">
              <div
                className="w-4 h-4 rounded-full"
                style={{ backgroundColor: DEPTH_COLORS[i] }}
              />
              <span className="text-gray-300 text-xs font-medium">
                Depth {i}
                {i === 0 ? " (love-all)" : ""}
              </span>
            </div>
            <div className="text-gray-400 text-xs ml-6">
              {depthStats[i]?.count || 0} scores
              {i > 0 && depthStats[i]?.maxOccurrences > 0 && (
                <span className="block">
                  Max: {depthStats[i].maxOccurrences} occurrences
                </span>
              )}
            </div>
          </div>
        ))}
        <div className="mt-3 pt-3 border-t border-gray-700">
          <div className="flex items-center gap-2 mb-1">
            <div
              className="w-4 h-4 rounded-full"
              style={{ backgroundColor: NEVER_OCCURRED_COLOR }}
            />
            <span className="text-gray-300 text-xs">Never occurred</span>
          </div>
        </div>
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
        {FREQUENCY_LEGEND.map((item, i) => (
          <div key={i} className="flex items-center gap-2 mb-1">
            <div
              className="w-4 h-4 rounded-full"
              style={{ backgroundColor: item.color }}
            />
            <span className="text-gray-300 text-xs">{item.label}</span>
          </div>
        ))}
        <div className="mt-3 pt-3 border-t border-gray-700">
          <div className="flex items-center gap-2 mb-1">
            <div
              className="w-4 h-4 rounded-full"
              style={{ backgroundColor: NEVER_OCCURRED_COLOR }}
            />
            <span className="text-gray-300 text-xs">Never occurred</span>
          </div>
        </div>
      </div>
    );
  }
};

export const ForceGraph = () => {
  const fgRef = useRef<ForceGraphMethods | null>(null);
  const { width, height, ref: wrapperRef } = useResizeDetector();

  /* ─ UI state ─ */
  const [graphLayout] = useAtom(graphLayoutAtom);
  const [showLabels] = useAtom(showLabelsAtom);
  const [colorMode] = useAtom(graphColorModeAtom);
  const [graphDensity] = useAtom(graphDensityAtom);
  // const [nodeStrength] = useAtom(nodeStrengthAtom);
  const nodeStrength = 50;
  const [showEdges] = useAtom(showEdgesAtom);
  const [selectedYear] = useAtom(selectedYearAtom);
  const [selectedSex] = useAtom(selectedSexAtom);
  const [selectedSets] = useAtom(selectedSetsAtom);
  const [selectedTournament] = useAtom(selectedTournamentAtom);

  /* ─ Modal state ─ */
  const [selectedSequenceId, setSelectedSequenceId] = useState<number | null>(
    null
  );
  const [discoveryModalOpen, setDiscoveryModalOpen] = useState(false);
  const [discoveredNode, setDiscoveredNode] = useState<NodeDTO | null>(null);

  /* ─ Graph data ─ */
  const [data, setData] = useState<GraphData>({ nodes: [], links: [] });
  // Loading state
  const [loading, setLoading] = useState(false);

  /* ─ Check if there are any unscored nodes ─ */
  const hasUnscoredNodes = useMemo(() => {
    return data.nodes.some((node) => !node.played && node.id !== ROOT_ID);
  }, [data.nodes]);

  /* ─ Compute max depth for coloring ─ */
  const maxDepth = selectedSets;

  /* ─ Depth-based occurrence scales ─ */
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

  /* ─ Fetch + sanitize + inject love-all root ─ */
  useEffect(() => {
    async function fetchGraph() {
      setLoading(true);
      try {
        const qs = new URLSearchParams({
          year: selectedYear ? convertYearFilter(selectedYear.toString()) : "",
          sex: convertSexFilter(selectedSex ?? ""),
          sets: selectedSets.toString(),
          tournament: selectedTournament && selectedTournament.tournament_id > 0 
            ? selectedTournament.tournament_id.toString() 
            : "all",
        });

        const { nodes: rawNodes, edges: rawEdges } = (await (
          await fetch(`/api/v1/graph?${qs}`)
        ).json()) as { nodes: NodeDTO[]; edges: EdgeDTO[] };

        // dedupe & sanitize
        const deduped = Array.from(
          new Map(rawEdges.map((e) => [`${e.frm}-${e.to}`, e])).values()
        );
        const nodeIds = new Set(rawNodes.map((n) => n.id));
        const valid = deduped.filter(
          (e) => nodeIds.has(e.frm) && nodeIds.has(e.to)
        );

        // remap
        let nodes = rawNodes.slice();
        let links = valid.map((e) => ({ source: e.frm, target: e.to }));

        // inject love-all root
        if (!nodes.some((n) => n.depth === 0)) {
          nodes = [
            {
              id: ROOT_ID,
              slug: "love-all",
              played: false,
              depth: 0,
              occurrences: 0,
              norm: 0,
            },
            ...nodes,
          ];
          const rootLinks = nodes
            .filter((n) => n.depth === 1)
            .map((n) => ({ source: ROOT_ID, target: n.id }));
          links = [...rootLinks, ...links];
        }

        setData({ nodes, links });
      } finally {
        setLoading(false);
      }
    }
    fetchGraph().catch((err) => {
      setLoading(false);
      console.error(err);
    });
  }, [selectedYear, selectedSex, selectedSets, selectedTournament]);


  /* ─ Node styling ─ */
  const nodeColor = useCallback(
    (n: NodeDTO) => {
      // Root node
      if (n.id === ROOT_ID) return DEPTH_COLORS[0];

      // Highlight nodes that have never occurred
      if (!n.played || n.occurrences === 0) {
        return NEVER_OCCURRED_COLOR;
      }

      if (colorMode === "category") {
        // Use predefined colors by depth
        return DEPTH_COLORS[n.depth] || "#64748b";
      } else {
        // Color by occurrence intensity
        const scale = depthScales[n.depth];
        if (scale) {
          const intensity = scale(n.occurrences);
          const L = 90 - intensity * 60;
          return `hsl(220,80%,${L}%)`;
        }
        return `hsl(220,80%,50%)`;
      }
    },
    [colorMode, depthScales]
  );

  const nodeVal = useCallback((n: NodeDTO) => {
    if (n.id === ROOT_ID) return 200; // Make root slightly larger
    // Scale node size based on occurrences
    const baseSize = Math.max(n.norm * 100, 1); // Fixed: multiply by 100 instead of 10
    const occurrenceBonus = Math.log(n.occurrences + 1) * 2;
    return baseSize + occurrenceBonus + 3; // Add minimum size
  }, []);

  /* ─ Enhanced tooltip ─ */
  const nodeLabel = useCallback((n: NodeDTO) => {
    const parts = [`Score: ${n.slug}`];
    if (n.id !== ROOT_ID) {
      parts.push(`Depth: ${n.depth}`);
      parts.push(`Occurrences: ${n.occurrences}`);
      parts.push(`Normalized: ${(n.norm * 100).toFixed(3)}%`);
      parts.push(n.played ? "Status: Scored" : "Status: Never occurred");
    }
    return parts.join("<br/>");
  }, []);

  /* ─ Common graph props ─ */
  const graphProps = useMemo(
    () => ({
      nodeLabel,
      nodeVal,
      nodeColor,
      nodeThreeObjectExtend: true,
      // -------- 3-D labels --------
      nodeThreeObject: showLabels
        ? (n: { slug: string | undefined }) => {
            const sprite = new SpriteText(n.slug); // slug == score string
            sprite.color = "#ffffff";
            sprite.textHeight = 6; // world-space units
            sprite.material.depthWrite = false; // keeps text on top
            sprite.material.depthTest = false; //   don't get clipped by it
            sprite.renderOrder = 999; //   last thing the GPU draws
            // sprite.backgroundColor = "rgba(0,0,0,0.75)";
            // sprite.material.opacity = 1.0; // keep underlying sphere visible
            return sprite;
          }
        : undefined,

      // -------- 2-D labels --------
      nodeCanvasObject: showLabels
        ? (
            n: { slug: string | undefined; x: number; y: number },
            ctx: CanvasRenderingContext2D,
            globalScale: number
          ) => {
            const label = n.slug;
            const fontSizePx = 12 / globalScale; // don't grow when zooming
            ctx.font = `${fontSizePx}px Inter, sans-serif`;
            ctx.textAlign = "center";
            ctx.textBaseline = "middle";

            const padding = 2 / globalScale;
            const m = ctx.measureText(label);
            const w = m.width + padding * 2;
            const h = fontSizePx + padding * 2;
            ctx.fillStyle = "rgba(0,0,0,0.45)";
            ctx.fillRect(n.x - w / 2, n.y - h / 2, w, h);

            ctx.fillStyle = "#fff";
            ctx.fillText(label, n.x, n.y);
          }
        : undefined,
      nodeCanvasObjectMode: () => "after", // draw text on top of nodes

      nodeDescription: (n: NodeDTO) => nodeLabel(n),
      linkColor: (link: { source: { id: number } | number; target: { id: number } | number }) => {
        // Make links more visible with gradient based on depth
        const sourceId = typeof link.source === 'object' ? link.source.id : link.source;
        const targetId = typeof link.target === 'object' ? link.target.id : link.target;
        const source = data.nodes.find((n) => n.id === sourceId);
        const target = data.nodes.find((n) => n.id === targetId);
        if (!source || !target) return "#666";

        // Higher depth links get brighter colors
        const maxDepth = Math.max(source.depth, target.depth);
        const brightness = 40 + maxDepth * 15;
        return `hsl(200, 70%, ${brightness}%)`;
      },
      linkWidth: (link: { source: { id: number } | number; target: { id: number } | number }) => {
        // Vary link width based on connection depth
        const sourceId = typeof link.source === 'object' ? link.source.id : link.source;
        const targetId = typeof link.target === 'object' ? link.target.id : link.target;
        const source = data.nodes.find((n) => n.id === sourceId);
        const target = data.nodes.find((n) => n.id === targetId);
        if (!source || !target) return 1;

        // Connections to higher depths are thicker
        const maxDepth = Math.max(source.depth, target.depth);
        return 1 + maxDepth * 0.5;
      },
      linkVisibility: showEdges,
      backgroundColor: "#0f172a",
      nodeOpacity: 0.9,
      linkOpacity: 0.6,
      linkDirectionalParticles: showEdges ? 2 : 0,
      linkDirectionalParticleSpeed: 0.01,
      linkDirectionalParticleWidth: 3,
    }),
    [showLabels, nodeLabel, nodeVal, nodeColor, showEdges, data.nodes]
  );

  // Simple confetti effect for discoveries
  const launchConfetti = useCallback(() => {
    // Import and use confetti only on client side
    import("canvas-confetti").then((confettiModule) => {
      const confetti = confettiModule.default;

      // Simple confetti burst
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
      });
    });
  }, []);

  const onNodeClick = useCallback(
    (node: NodeDTO) => {
      if (node.id === ROOT_ID) return; // Don't open modal for root node

      // Check if this is an unscored node
      if (!node.played || node.occurrences === 0) {
        console.log("Unscored node clicked:", node);

        // Launch confetti (simple celebration)
        launchConfetti();

        // Open discovery modal
        setDiscoveredNode(node);
        setDiscoveryModalOpen(true);
      } else {
        // For scored nodes, use the regular match details modal
        setSelectedSequenceId(node.id);
      }
    },
    [launchConfetti]
  );

  // Handle modal closes
  const handleCloseMatchModal = useCallback(() => {
    setSelectedSequenceId(null);
  }, []);

  const handleCloseDiscoveryModal = useCallback(() => {
    setDiscoveryModalOpen(false);
  }, []);

  const graphKey = [
    data.nodes.length,
    data.links.length,
    selectedSets,
    selectedYear,
    selectedSex,
  ].join("-");

  /* ─ Render ─ */
  return (
    <div ref={wrapperRef} className="relative w-full h-full overflow-hidden">
      {loading && (
        <div className="absolute inset-0 z-50 bg-black/40 flex items-center justify-center">
          <svg
            className="animate-spin h-12 w-12 text-gray-300"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
              fill="none"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8v8z"
            />
          </svg>
        </div>
      )}
      {width && height && !loading && (
        <Fragment>
          {graphLayout === "2d" ? (
            <SigmaGraph
              selectedSets={selectedSets}
              selectedSex={selectedSex || ""}
              selectedYear={selectedYear || ""}
              className="w-full h-full"
            />
          ) : (
            <ForceGraph3D
              key={graphKey}
              width={width}
              height={height}
              style={{ display: "block" }}
              // @ts-expect-error - ForceGraph3D ref type incompatibility
              ref={(inst) => (fgRef.current = inst!)}
              graphData={data}
              {...graphProps}
              onNodeClick={onNodeClick}
              showNavInfo={false}
              enableNodeDrag={true}
              nodeRelSize={nodeStrength / 10}
              // onEngineStop={onEngineStop}
            />
          )}

          {/* Show banner if there are unscored nodes */}
          <UnscoredBanner visible={hasUnscoredNodes} />

          <div
            className="
              absolute
              bottom-3 left-3
              text-white
              text-sm
              p-2
              rounded
              shadow-lg
              backdrop-blur-sm
            "
          >
            <p>Click on a node to see matches</p>
            <p>Left-click: rotate</p>
            <p>Mouse-wheel/middle-click: zoom</p>
            <p>Right-click: pan</p>
          </div>
          
          {/* Only show legend for 3D mode */}
          {graphLayout === "3d" && (
            <Legend colorMode={colorMode} maxDepth={maxDepth} data={data} />
          )}
        </Fragment>
      )}
      <div className="absolute bottom-2 right-3 text-xs text-gray-500">
        layout {graphLayout} | density {graphDensity}% | strength {nodeStrength}
      </div>

      {/* Match Details Modal */}
      <MatchDetailsModal
        sequenceId={selectedSequenceId}
        onClose={handleCloseMatchModal}
        filters={{
          year: selectedYear || "All Years",
          sex: selectedSex || "Men and Women",
          // Use the ID if available, otherwise use "All Tournaments"
          tournament:
            selectedTournament?.name !== "All Tournaments" &&
            selectedTournament?.tournament_id
              ? String(selectedTournament.tournament_id)
              : "All Tournaments",
          sets: String(selectedSets),
        }}
      />

      {/* Discovery Modal for unscored nodes */}
      {discoveryModalOpen && discoveredNode && (
        <DiscoveryModal
          node={discoveredNode}
          onClose={handleCloseDiscoveryModal}
        />
      )}
    </div>
  );
};
