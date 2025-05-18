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
import { MatchDetailsModal } from "@/components/force-graph/match-details-modal";
import type { EdgeDTO, NodeDTO } from "@/lib/types";
import { selectedTournamentAtom } from "@/store/tournament";
import { scaleLinear } from "d3-scale";
import { useAtom } from "jotai";
import dynamic from "next/dynamic";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
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
const BASE_RADIUS = 60;
const RADIUS_INCREMENT = 80;
const REPULSION_STRENGTH = -80;

// Dynamically load only on client
const ForceGraph3D = dynamic(() => import("react-force-graph-3d"), {
  ssr: false,
});

type GraphLink = { source: number; target: number };
interface GraphData {
  nodes: NodeDTO[];
  links: GraphLink[];
}

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

  /* ─ Graph data ─ */
  const [data, setData] = useState<GraphData>({ nodes: [], links: [] });

  /* ─ Compute max depth for coloring ─ */
  const maxDepth = selectedSets;

  /* ─ Depth-based occurrence scales ─ */
  const depthScales = useMemo(() => {
    const scales: Record<number, any> = {};
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
      const mapSex = (s: string) =>
        s === "Men and Women" ? "all" : s.toLowerCase();

      const qs = new URLSearchParams({
        year: selectedYear?.toString() ?? "",
        gender: mapSex(selectedSex ?? ""),
        sets: selectedSets.toString(),
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
    }
    fetchGraph().catch(console.error);
  }, [selectedYear, selectedSex, selectedSets]);

  /* ─ onEngineStop ⇒ center & zoom to fit ─ */
  const onEngineStop = useCallback(() => {
    const fg = fgRef.current;
    if (!fg) return;
    fg.zoomToFit(400, 0.9);
    fg.cameraPosition(
      { x: 0, y: 0, z: fg.camera().position.z },
      { x: 0, y: 0, z: 0 },
      0
    );
  }, []);

  /* ─ Calculate ring radius for each depth level ─ */
  const ringRadius = useCallback((depth: number) => {
    return depth === 0 ? 0 : BASE_RADIUS + (depth - 1) * RADIUS_INCREMENT;
  }, []);

  /* ─ Node styling ─ */
  const nodeColor = useCallback(
    (n: any) => {
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

  const nodeVal = useCallback((n: any) => {
    if (n.id === ROOT_ID) return 200; // Make root slightly larger
    // Scale node size based on occurrences
    const baseSize = Math.max(n.norm * 100, 1); // Fixed: multiply by 100 instead of 10
    const occurrenceBonus = Math.log(n.occurrences + 1) * 2;
    return baseSize + occurrenceBonus + 3; // Add minimum size
  }, []);

  /* ─ Enhanced tooltip ─ */
  const nodeLabel = useCallback((n: any) => {
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
            ctx: any,
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

      nodeDescription: (n: any) => nodeLabel(n),
      linkColor: (link: any) => {
        // Make links more visible with gradient based on depth
        const source = data.nodes.find(
          (n) => n.id === link.source?.id || n.id === link.source
        );
        const target = data.nodes.find(
          (n) => n.id === link.target?.id || n.id === link.target
        );
        if (!source || !target) return "#666";

        // Higher depth links get brighter colors
        const maxDepth = Math.max(source.depth, target.depth);
        const brightness = 40 + maxDepth * 15;
        return `hsl(200, 70%, ${brightness}%)`;
      },
      linkWidth: (link: any) => {
        // Vary link width based on connection depth
        const source = data.nodes.find(
          (n) => n.id === link.source?.id || n.id === link.source
        );
        const target = data.nodes.find(
          (n) => n.id === link.target?.id || n.id === link.target
        );
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

  const onNodeClick = useCallback((n: any) => {
    if (n.id === ROOT_ID) return; // Don't open modal for root node
    setSelectedSequenceId(n.id);
  }, []);

  // Handle modal close
  const handleCloseModal = useCallback(() => {
    setSelectedSequenceId(null);
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
      {width && height && (
        <>
          <ForceGraph3D
            key={graphKey}
            width={width}
            height={height}
            style={{ display: "block" }}
            // @ts-ignore
            ref={(inst) => (fgRef.current = inst!)}
            graphData={data}
            {...graphProps}
            onNodeClick={onNodeClick}
            showNavInfo={false}
            enableNodeDrag={true}
            nodeRelSize={nodeStrength / 10}
            // onEngineStop={onEngineStop}
          />
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
          <Legend colorMode={colorMode} maxDepth={maxDepth} data={data} />
        </>
      )}
      <div className="absolute bottom-2 right-3 text-xs text-gray-500">
        layout {graphLayout} | density {graphDensity}% | strength {nodeStrength}
      </div>

      {/* Match Details Modal */}
      <MatchDetailsModal
        sequenceId={selectedSequenceId}
        onClose={handleCloseModal}
        filters={{
          year: selectedYear || "All Years",
          sex: selectedSex || "Men and Women",
          // Use the ID if available, otherwise use "All Tournaments"
          tournament:
            selectedTournament?.name !== "All Tournaments" &&
            selectedTournament?.tournament_id
              ? String(selectedTournament.tournament_id)
              : "All Tournaments",
        }}
      />
    </div>
  );
};
