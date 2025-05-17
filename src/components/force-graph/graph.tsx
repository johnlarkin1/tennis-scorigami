"use client";

import { scaleLinear } from "d3-scale";
import { useAtom } from "jotai";
import dynamic from "next/dynamic";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { ForceGraphMethods } from "react-force-graph-3d";
import { useResizeDetector } from "react-resize-detector";

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
import type { EdgeDTO, NodeDTO } from "@/lib/types";

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
    [nodeLabel, nodeVal, nodeColor, showEdges, data.nodes]
  );

  const onNodeClick = useCallback((n: any) => {
    const message = [
      `Score: ${n.slug}`,
      `Depth: ${n.depth}`,
      `Occurrences: ${n.occurrences}`,
      `Normalized: ${Math.round(n.norm * 100)}%`,
      `Status: ${n.played ? "Scored" : "Never occurred"}`,
    ].join("\n");

    alert(message);
  }, []);

  /* ─ Apply enhanced D3 forces for proper radial layout ─ */
  // useEffect(() => {
  //   const fg = fgRef.current;
  //   if (!fg || !data.nodes.length) return;

  //   // Delay applying forces to ensure the graph is fully initialized
  //   const timeoutId = setTimeout(() => {
  //     // Double-check that fg is still valid when the timeout executes
  //     if (!fgRef.current) return;

  //     const applyForces = () => {
  //       try {
  //         const fg = fgRef.current;
  //         // Extra safety check to ensure fg is still valid
  //         if (!fg) return;

  //         // First, fix the root node at the center
  //         const rootNode = data.nodes.find((n) => n.id === ROOT_ID);
  //         if (rootNode) {
  //           (rootNode as any).fx = 0;
  //           (rootNode as any).fy = 0;
  //           (rootNode as any).fz = 0;
  //         }

  //         // Repelling force - balanced to maintain structure
  //         if (fg.d3Force) {
  //           fg.d3Force("charge", forceManyBody().strength(REPULSION_STRENGTH));

  //           // Link force - stronger to maintain connections visible
  //           fg.d3Force(
  //             "link",
  //             forceLink(data.links)
  //               .id((d: any) => d.id)
  //               .distance((d: any) => {
  //                 const source = data.nodes.find(
  //                   (n) => n.id === d.source?.id || n.id === d.source
  //                 );
  //                 const target = data.nodes.find(
  //                   (n) => n.id === d.target?.id || n.id === d.target
  //                 );
  //                 if (!source || !target) return 100;

  //                 // Shorter distances for better connectivity
  //                 const depthDiff = Math.abs(target.depth - source.depth);
  //                 return depthDiff * 60 + 40;
  //               })
  //               .strength((d: any) => {
  //                 const source = data.nodes.find(
  //                   (n) => n.id === d.source?.id || n.id === d.source
  //                 );
  //                 const target = data.nodes.find(
  //                   (n) => n.id === d.target?.id || n.id === d.target
  //                 );
  //                 if (!source || !target) return 1;

  //                 // Stronger connections for adjacent depths
  //                 const depthDiff = Math.abs(target.depth - source.depth);
  //                 return depthDiff === 1 ? 1.5 : 1.0;
  //               })
  //           );

  //           // Radial force - gentler to allow link connections
  //           fg.d3Force(
  //             "radial",
  //             forceRadial((d: any) => ringRadius(d.depth), 0, 0, 0).strength(
  //               (d: any) => {
  //                 if (d.id === ROOT_ID) return 0;
  //                 // Gentler radial force for outer rings to maintain connections
  //                 return 0.4 + 0.3 / (d.depth || 1);
  //               }
  //             )
  //           );

  //           // Center force to keep everything centered
  //           fg.d3Force("center", forceCenter(0, 0, 0).strength(0.05));

  //           // Weaker z-axis constraint to allow some 3D spread
  //           fg.d3Force("z", forceY((d: any) => 0).strength(0.05));

  //           // Collision detection with variable radius
  //           fg.d3Force(
  //             "collide",
  //             forceCollide((d: any) => {
  //               const baseRadius = nodeVal(d) * (nodeStrength / 10);
  //               // Give root node more space, but not too much
  //               return d.id === ROOT_ID ? baseRadius * 1.3 : baseRadius * 0.7;
  //             }).iterations(2)
  //           );

  //           // Gentle positioning forces
  //           fg.d3Force("x", forceX(0).strength(0.02));
  //           fg.d3Force("y", forceY(0).strength(0.02));

  //           // Only reheat if the method exists
  //           if (fg.d3ReheatSimulation) {
  //             fg.d3ReheatSimulation();
  //           }
  //         }
  //       } catch (error) {
  //         console.error("Error applying force graph forces:", error);
  //       }
  //     };

  //     applyForces();
  //   }, 100); // Short delay to ensure graph is ready

  //   // Clean up timeout if component unmounts
  //   return () => clearTimeout(timeoutId);
  // }, [data, nodeVal, nodeStrength, ringRadius]);

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
            <p>Click on a node to see more info</p>
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
    </div>
  );
};
