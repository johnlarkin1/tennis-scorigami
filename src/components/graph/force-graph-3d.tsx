"use client";

import {
  graphColorModeAtom,
  showEdgesAtom,
  showLabelsAtom,
} from "@/components/graph/controls/graph-controls";
import { Legend } from "@/components/graph/legend";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import {
  DEPTH_COLORS,
  GRAPH_BACKGROUND_COLOR,
  NEVER_OCCURRED_COLOR,
} from "@/constants/graph-colors";
import type { NodeDTO } from "@/lib/types";
import { useGraphContext } from "@/providers/graph-provider";
import {
  getEdgeColorByDepth,
  getOccurrenceIntensityColor,
} from "@/utils/graph-utils";
import { scaleLinear } from "d3-scale";
import { useAtom } from "jotai";
import dynamic from "next/dynamic";
import React, { useCallback, useMemo, useRef } from "react";
import type { ForceGraphMethods } from "react-force-graph-3d";
import { useResizeDetector } from "react-resize-detector";
const ROOT_ID = 0;

// Dynamically import ForceGraph3D to avoid SSR issues
const ForceGraph3DLib = dynamic(() => import("react-force-graph-3d"), {
  ssr: false,
});

const ForceGraph3D: React.FC = () => {
  const fgRef = useRef<ForceGraphMethods>(null!);
  const {
    width,
    height,
    ref: wrapperRef,
  } = useResizeDetector({
    handleHeight: true,
    handleWidth: true,
    refreshMode: "debounce",
    refreshRate: 100,
  });

  const {
    data,
    setSelectedSequenceId,
    setDiscoveryModalOpen,
    setDiscoveredNode,
    maxDepth,
  } = useGraphContext();

  const [showLabels] = useAtom(showLabelsAtom);
  const [colorMode] = useAtom(graphColorModeAtom);
  const [showEdges] = useAtom(showEdgesAtom);

  const nodeStrength = 50;

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

  // Node styling callbacks
  const nodeColor = useCallback(
    (n: NodeDTO) => {
      if (n.id === ROOT_ID) return DEPTH_COLORS[0];

      if (!n.played || n.occurrences === 0) {
        return NEVER_OCCURRED_COLOR;
      }

      if (colorMode === "category") {
        return DEPTH_COLORS[n.depth] || "#64748b";
      } else {
        const scale = depthScales[n.depth];
        if (scale) {
          const intensity = scale(n.occurrences) as number;
          return getOccurrenceIntensityColor(intensity);
        }
        return `hsl(220,80%,50%)`;
      }
    },
    [colorMode, depthScales]
  );

  const nodeVal = useCallback((n: NodeDTO) => {
    if (n.id === ROOT_ID) return 200;
    const baseSize = Math.max(n.norm * 100, 1);
    const occurrenceBonus = Math.log(n.occurrences + 1) * 2;
    return baseSize + occurrenceBonus + 3;
  }, []);

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

  // Launch confetti effect
  const launchConfetti = useCallback(() => {
    import("canvas-confetti").then((confettiModule) => {
      const confetti = confettiModule.default;
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
      });
    });
  }, []);

  const onNodeClick = useCallback(
    (node: NodeDTO) => {
      if (node.id === ROOT_ID) return;

      if (!node.played || node.occurrences === 0) {
        launchConfetti();
        setDiscoveredNode(node);
        setDiscoveryModalOpen(true);
      } else {
        setSelectedSequenceId(node.id);
      }
    },
    [
      launchConfetti,
      setDiscoveredNode,
      setDiscoveryModalOpen,
      setSelectedSequenceId,
    ]
  );

  // Graph props - suppress TypeScript errors for force graph compatibility
  const graphProps = useMemo(
    () => ({
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      nodeLabel: nodeLabel as (node: any) => string,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      nodeVal: nodeVal as (node: any) => number,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      nodeColor: nodeColor as (node: any) => string,
      nodeThreeObjectExtend: true,
      nodeThreeObject: showLabels
        ? // eslint-disable-next-line @typescript-eslint/no-explicit-any
          (n: any) => {
            const SpriteText =
              require("three-spritetext").default ||
              require("three-spritetext");
            const sprite = new SpriteText(n.slug || "");
            sprite.color = "#ffffff";
            sprite.textHeight = 6;
            sprite.material.depthWrite = false;
            sprite.material.depthTest = false;
            sprite.renderOrder = 999;
            return sprite;
          }
        : undefined,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      nodeDescription: (n: any) => nodeLabel(n as NodeDTO),
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      linkColor: (link: any) => {
        const sourceId =
          typeof link.source === "object" ? link.source.id : link.source;
        const targetId =
          typeof link.target === "object" ? link.target.id : link.target;
        const source = data.nodes.find((n) => n.id === sourceId);
        const target = data.nodes.find((n) => n.id === targetId);
        if (!source || !target) return "#666";

        const maxDepth = Math.max(source.depth, target.depth);
        return getEdgeColorByDepth(maxDepth);
      },
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      linkWidth: (link: any) => {
        const sourceId =
          typeof link.source === "object" ? link.source.id : link.source;
        const targetId =
          typeof link.target === "object" ? link.target.id : link.target;
        const source = data.nodes.find((n) => n.id === sourceId);
        const target = data.nodes.find((n) => n.id === targetId);
        if (!source || !target) return 1;

        const maxDepth = Math.max(source.depth, target.depth);
        return 1 + maxDepth * 0.5;
      },
      linkVisibility: showEdges,
      backgroundColor: GRAPH_BACKGROUND_COLOR,
      nodeOpacity: 0.9,
      linkOpacity: 0.6,
      linkDirectionalParticles: showEdges ? 2 : 0,
      linkDirectionalParticleSpeed: 0.01,
      linkDirectionalParticleWidth: 3,
    }),
    [showLabels, nodeLabel, nodeVal, nodeColor, showEdges, data.nodes]
  );

  // Use fallback dimensions if not detected
  const actualWidth = width || 800;
  const actualHeight = height || 600;

  return (
    <div ref={wrapperRef} className="w-full h-full">
      {data.nodes.length > 0 ? (
        <ForceGraph3DLib
          width={actualWidth}
          height={actualHeight}
          ref={fgRef}
          graphData={data}
          {...graphProps}
          onNodeClick={onNodeClick as (node: object) => void}
          showNavInfo={false}
          enableNodeDrag={true}
          nodeRelSize={nodeStrength / 10}
          // warmupTicks={1000}
          // cooldownTicks={0}
          // d3AlphaDecay={0.0228}
          // d3VelocityDecay={0.4}
          // d3Force={{
          //   charge: { strength: -120, distanceMax: 2000 },
          //   link: { distance: 30, iterations: 1 },
          //   center: { x: 0, y: 0, z: 0 }
          // }}
          onEngineStop={() => {
            // Physics simulation has stopped - no auto-zoom
          }}
        />
      ) : (
        <LoadingSpinner
          size={12}
          className="w-full h-full"
          text="Loading graph..."
        />
      )}
      <Legend colorMode={colorMode} maxDepth={maxDepth} data={data} />
    </div>
  );
};

export default ForceGraph3D;
