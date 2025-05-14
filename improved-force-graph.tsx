"use client";

import { forceCollide, forceLink, forceManyBody } from "d3-force-3d";
import { useAtom } from "jotai";
import dynamic from "next/dynamic";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { ForceGraphMethods } from "react-force-graph-3d";
import { useResizeDetector } from "react-resize-detector";
import * as THREE from "three";

import {
  graphColorModeAtom,
  graphDensityAtom,
  graphLayoutAtom,
  nodeStrengthAtom,
  selectedSetsAtom,
  selectedSexAtom,
  selectedYearAtom,
  showEdgesAtom,
  showLabelsAtom,
} from "@/components/force-graph/controls";
import type { EdgeDTO, NodeDTO } from "@/lib/types";

// Dynamically load only on client
const ForceGraph3D = dynamic(() => import("react-force-graph-3d"), {
  ssr: false,
});

type GraphLink = { source: number; target: number };
interface GraphData {
  nodes: NodeDTO[];
  links: GraphLink[];
}

export const ForceGraph = () => {
  const ROOT_ID = 0;
  const fgRef = useRef<ForceGraphMethods | null>(null);
  const { width, height, ref: wrapperRef } = useResizeDetector();

  /* ─ UI state ─ */
  const [graphLayout] = useAtom(graphLayoutAtom);
  const [showLabels] = useAtom(showLabelsAtom);
  const [colorMode] = useAtom(graphColorModeAtom);
  const [graphDensity] = useAtom(graphDensityAtom);
  const [nodeStrength] = useAtom(nodeStrengthAtom);
  const [showEdges] = useAtom(showEdgesAtom);
  const [selectedYear] = useAtom(selectedYearAtom);
  const [selectedSex] = useAtom(selectedSexAtom);
  const [selectedSets] = useAtom(selectedSetsAtom);

  /* ─ Graph data ─ */
  const [data, setData] = useState<GraphData>({ nodes: [], links: [] });
  const [hoveredNode, setHoveredNode] = useState<number | null>(null);

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

  /* ─ Compute max depth for coloring ─ */
  const maxDepth = selectedSets;

  /* ─ Enhanced Node styling with glow effects ─ */
  const nodeColor = useCallback(
    (n: any) => {
      // Unscored nodes (not played) - distinct color
      if (!n.played && n.id !== ROOT_ID) {
        return "#4a5568"; // Gray color for unscored nodes
      }
      
      if (n.id === ROOT_ID) return "#ff006e"; // Vibrant pink for root
      
      if (colorMode === "category") {
        // Color by depth with intensity variation based on occurrences
        const depthHue = (n.depth / maxDepth) * 270; // From red to blue
        const intensity = Math.min(100, 40 + (n.occurrences / 100) * 60);
        return `hsl(${depthHue}, 80%, ${intensity}%)`;
      } else {
        // Color by occurrence intensity
        const intensity = Math.min(1, Math.max(0, n.norm));
        const hue = 210 - intensity * 60; // Blue to cyan gradient
        const lightness = 80 - intensity * 30;
        return `hsl(${hue}, 90%, ${lightness}%)`;
      }
    },
    [colorMode, maxDepth]
  );

  // Enhanced node sizes
  const nodeVal = useCallback(
    (n: any) => {
      if (n.id === ROOT_ID) return 80;
      if (!n.played) return 5; // Smaller size for unscored nodes
      return Math.max(5, n.norm * 30 + 5);
    },
    []
  );

  // Custom node geometry for better visuals
  const nodeGeometry = useCallback((n: any) => {
    if (!n.played && n.id !== ROOT_ID) {
      // Create a ring geometry for unscored nodes
      const geometry = new THREE.RingGeometry(3, 5, 8);
      return geometry;
    }
    return null; // Use default sphere for scored nodes
  }, []);

  /* ─ Enhanced tooltip with more information ─ */
  const nodeLabel = useCallback(
    (n: any) => {
      if (!showLabels) return "";
      
      const parts = [
        `Score: ${n.slug}`,
        `Depth: Level ${n.depth}`,
        `Occurrences: ${n.occurrences.toLocaleString()}`,
        `Frequency: ${Math.round(n.norm * 100)}%`,
        n.played ? "" : "(Not Yet Scored)"
      ].filter(Boolean);
      
      return parts.join("\n");
    },
    [showLabels]
  );

  /* ─ Common graph props with enhanced visual effects ─ */
  const graphProps = useMemo(
    () => ({
      nodeLabel,
      nodeVal,
      nodeColor,
      nodeOpacity: (n: any) => (!n.played && n.id !== ROOT_ID ? 0.6 : 1),
      nodeThreeObject: nodeGeometry,
      linkColor: () => "rgba(136, 136, 136, 0.3)",
      linkWidth: 2,
      linkOpacity: 0.3,
      linkVisibility: () => showEdges,
      backgroundColor: "#0f172a",
      nodeRelSize: nodeStrength / 10,
      nodeResolution: 16, // Higher resolution spheres
      onNodeHover: (node: any) => setHoveredNode(node?.id ?? null),
    }),
    [nodeLabel, nodeVal, nodeColor, nodeGeometry, showEdges, nodeStrength]
  );

  const onNodeClick = useCallback((n: any) => {
    const status = n.played ? "Scored" : "Not Yet Scored";
    alert(
      `Score: ${n.slug}\n` +
      `Status: ${status}\n` +
      `Depth: Level ${n.depth}\n` +
      `Occurrences: ${n.occurrences.toLocaleString()}\n` +
      `Frequency: ${Math.round(n.norm * 100)}%`
    );
  }, []);

  /* ─ Add custom d3-force-3d forces with better parameters ─ */
  useEffect(() => {
    const fg = fgRef.current;
    if (!fg || !data.nodes.length) return;

    const applyForces = (retryCount = 0, maxRetries = 3) => {
      try {
        // how big each sphere really is in simulation units
        const relSize = nodeStrength / 10;

        // 1) stronger repulsion for better spacing
        fg.d3Force("charge", forceManyBody().strength(-50));

        // 2) link distance based on node importance
        fg.d3Force(
          "link",
          forceLink(data.links)
            .id((d: any) => d.id)
            .distance((link: any) => {
              const source = data.nodes.find(n => n.id === link.source);
              const target = data.nodes.find(n => n.id === link.target);
              if (source?.depth === 0 || target?.depth === 0) return 150;
              return 100;
            })
            .strength(0.8)
        );

        // 3) collision radius with more iterations for better separation
        fg.d3Force(
          "collide",
          forceCollide((d: any) => nodeVal(d) * relSize * 1.5).iterations(5)
        );

        // reheat so it re-runs with these new forces
        fg.d3ReheatSimulation();
      } catch (error) {
        console.error(
          `Error applying force graph forces (attempt ${retryCount + 1}/${maxRetries}):`,
          error
        );

        if (retryCount < maxRetries - 1) {
          const delay = Math.pow(2, retryCount) * 100;
          setTimeout(() => applyForces(retryCount + 1, maxRetries), delay);
        }
      }
    };

    applyForces();
  }, [data, nodeVal, nodeStrength]);

  /* ─ Legend Component ─ */
  const Legend = () => (
    <div className="absolute top-4 left-4 bg-gray-900/90 backdrop-blur-sm p-4 rounded-lg border border-gray-700">
      <h3 className="text-white text-sm font-bold mb-3">Legend</h3>
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-[#ff006e]"></div>
          <span className="text-gray-300 text-xs">Root (Love-All)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-gradient-to-r from-red-500 to-blue-500"></div>
          <span className="text-gray-300 text-xs">Scored (colored by {colorMode})</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full border-2 border-gray-600"></div>
          <span className="text-gray-300 text-xs">Not Yet Scored</span>
        </div>
        <div className="mt-3 pt-3 border-t border-gray-700">
          <p className="text-gray-400 text-xs">Node size = Frequency</p>
          <p className="text-gray-400 text-xs">Click nodes for details</p>
        </div>
      </div>
    </div>
  );

  /* ─ Stats Panel ─ */
  const StatsPanel = () => {
    const totalNodes = data.nodes.length;
    const scoredNodes = data.nodes.filter(n => n.played).length;
    const unscoredNodes = totalNodes - scoredNodes;
    
    return (
      <div className="absolute top-4 right-4 bg-gray-900/90 backdrop-blur-sm p-4 rounded-lg border border-gray-700">
        <h3 className="text-white text-sm font-bold mb-3">Graph Stats</h3>
        <div className="space-y-1">
          <p className="text-gray-300 text-xs">Total Nodes: {totalNodes}</p>
          <p className="text-green-400 text-xs">Scored: {scoredNodes}</p>
          <p className="text-gray-500 text-xs">Unscored: {unscoredNodes}</p>
          <p className="text-blue-400 text-xs">Max Depth: {maxDepth}</p>
        </div>
      </div>
    );
  };

  /* ─ Render with enhanced UI ─ */
  return (
    <div ref={wrapperRef} className="relative w-full h-full overflow-hidden bg-gray-950">
      {width && height && (
        <ForceGraph3D
          width={width}
          height={height}
          style={{ display: "block" }}
          ref={(inst) => (fgRef.current = inst!)}
          graphData={data}
          {...graphProps}
          onNodeClick={onNodeClick}
          dagMode="radialout"
          dagLevelDistance={100}
          cooldownTicks={graphDensity * 3}
          enableNodeDrag={true}
          showNavInfo={false}
        />
      )}
      <Legend />
      <StatsPanel />
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 text-xs text-gray-500 bg-gray-900/80 px-3 py-1 rounded-full">
        {hoveredNode !== null ? "Hover for details • Click to expand" : "Interactive 3D Force Graph"}
      </div>
    </div>
  );
};
