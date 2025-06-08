"use client";

import { scaleLinear } from "d3-scale";
import { useAtom } from "jotai";
import dynamic from "next/dynamic";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { ForceGraphMethods } from "react-force-graph-3d";
import { useResizeDetector } from "react-resize-detector";

import { LoadingSpinner } from "@/components/ui/loading-spinner";

import {
  graphColorModeAtom,
  selectedSetsAtom,
  selectedSexAtom,
  selectedYearAtom,
  showEdgesAtom,
} from "@/components/graph/controls/graph-controls";
import type { NodeDTO } from "@/lib/types";
import {
  DEPTH_COLORS,
  NEVER_OCCURRED_COLOR,
  getOccurrenceIntensityColor,
  getEdgeColorByDepth,
  GRAPH_BACKGROUND_COLOR,
} from "@/constants/graph-colors";

/* ─── constants ────────────────────────────────────────────────────────────── */
const ROOT_ID = 0;
const nodeStrength = 50;

type GraphLink = { source: number; target: number };
interface GraphData {
  nodes: NodeDTO[];
  links: GraphLink[];
}

/* ─── dynamic import ───────────────────────────────────────────────────────── */
const ForceGraph3D = dynamic(() => import("react-force-graph-3d"), {
  ssr: false,
});

/* ─── legend component (unchanged, hidden here for brevity) ────────────────── */
// … Legend component code …

/* ─── main component ───────────────────────────────────────────────────────── */
export const ForceGraphStream = () => {
  const fgRef = useRef<ForceGraphMethods | null>(null);
  const { width, height, ref: wrapperRef } = useResizeDetector();

  /* UI atoms */
  const [colorMode] = useAtom(graphColorModeAtom);
  const [showEdges] = useAtom(showEdgesAtom);
  const [selectedYear] = useAtom(selectedYearAtom);
  const [selectedSex] = useAtom(selectedSexAtom);
  const [selectedSets] = useAtom(selectedSetsAtom);

  /* streaming state */
  const [loading, setLoading] = useState(true);
  const [progress, setProgress] = useState(0);
  const [totalCount, setTotalCount] = useState(0);
  const [data, setData] = useState<GraphData>({ nodes: [], links: [] });

  /* per-depth occurrence scales */
  const depthScales = useMemo(() => {
    const byDepth: Record<number, NodeDTO[]> = {};
    data.nodes.forEach((n) => (byDepth[n.depth] ||= []).push(n));

    return Object.fromEntries(
      Object.entries(byDepth).map(([d, arr]) => {
        const maxOcc = Math.max(...arr.map((n) => n.occurrences));
        return [+d, scaleLinear().domain([0, maxOcc]).range([0.2, 1])];
      })
    );
  }, [data.nodes]);

  /* ─── fetch + stream NDJSON ──────────────────────────────────────────────── */
  useEffect(() => {
    let cancel = false;

    (async () => {
      setProgress(0);
      setTotalCount(0);
      setLoading(true);

      const qs = new URLSearchParams({
        year: selectedYear?.toString() ?? "",
        sex:
          selectedSex === "Men and Women"
            ? "all"
            : (selectedSex?.toLowerCase() ?? ""),
        sets: selectedSets.toString(),
      });

      const res = await fetch(`/api/v1/graph-stream?${qs}`);
      if (!res.body) return;

      const reader = res.body.getReader();
      const dec = new TextDecoder();

      let buf = "";
      const nodes: NodeDTO[] = [];
      const links: GraphLink[] = [];

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        buf += dec.decode(value, { stream: true });
        const lines = buf.split("\n");
        buf = lines.pop()!; // keep trailing partial line

        for (const line of lines) {
          if (!line) continue;
          const obj = JSON.parse(line);

          switch (obj.type) {
            case "meta":
              setTotalCount(obj.totalNodes + obj.totalEdges);
              break;
            case "node":
              nodes.push({
                id: obj.id,
                slug: obj.slug,
                played: obj.played,
                depth: obj.depth,
                occurrences: obj.occurrences,
                norm: obj.norm,
              });
              setProgress((p) => p + 1);
              break;
            case "edge":
              links.push({ source: obj.frm, target: obj.to });
              setProgress((p) => p + 1);
              break;
          }
        }
      }

      /* ----- dedupe + orphan-edge filter --------------------------- */
      const nodeIds = new Set(nodes.map((n) => n.id));

      const cleanLinks = Array.from(
        new Map(links.map((l) => [`${l.source}-${l.target}`, l])).values() // dedupe
      ).filter((l) => nodeIds.has(l.source) && nodeIds.has(l.target)); // orphan check

      if (!cancel) {
        setData({ nodes, links: cleanLinks });
        setLoading(false);
      }
    })().catch(console.error);

    return () => {
      cancel = true;
    };
  }, [selectedYear, selectedSex, selectedSets]);

  /* ─── zoom-to-fit on finish ──────────────────────────────────────────────── */
  useEffect(() => {
    if (!loading && fgRef.current && data.nodes.length && data.links.length) {
      setTimeout(() => fgRef.current!.zoomToFit(400, 0.9), 0);
    }
  }, [loading, data]);

  /* ─── callbacks & graph props ───────────────────────────────────────────── */
  const nodeColor = useCallback(
    (n: NodeDTO) => {
      if (n.id === ROOT_ID) return DEPTH_COLORS[0];
      if (!n.played || n.occurrences === 0) return NEVER_OCCURRED_COLOR;

      if (colorMode === "category") {
        return DEPTH_COLORS[n.depth] || "#64748b";
      }
      const intensity = depthScales[n.depth]?.(n.occurrences) ?? 0.5;
      return getOccurrenceIntensityColor(intensity);
    },
    [colorMode, depthScales]
  );

  const nodeVal = useCallback((n: NodeDTO) => {
    if (n.id === ROOT_ID) return 200;
    return Math.max(n.norm * 100, 1) + Math.log(n.occurrences + 1) * 2 + 3;
  }, []);

  const nodeLabel = useCallback((n: NodeDTO) => {
    const parts = [`Score: ${n.slug}`];
    if (n.id !== ROOT_ID) {
      parts.push(`Depth: ${n.depth}`);
      parts.push(`Occurrences: ${n.occurrences}`);
      parts.push(`Normalized: ${(n.norm * 100).toFixed(2)}%`);
      parts.push(n.played ? "Scored" : "Never occurred");
    }
    return parts.join("<br/>");
  }, []);

  const graphProps = useMemo(
    () => ({
      nodeLabel,
      nodeVal,
      nodeColor,
      nodeThreeObjectExtend: true,
      nodeDescription: nodeLabel,
      linkColor: (l: GraphLink) => {
        const s = data.nodes.find((n) => n.id === (l.source as number));
        const t = data.nodes.find((n) => n.id === (l.target as number));
        if (!s || !t) return "#666";
        const d = Math.max(s.depth, t.depth);
        return getEdgeColorByDepth(d);
      },
      linkWidth: (l: GraphLink) => {
        const s = data.nodes.find((n) => n.id === (l.source as number));
        const t = data.nodes.find((n) => n.id === (l.target as number));
        if (!s || !t) return 1;
        return 1 + Math.max(s.depth, t.depth) * 0.5;
      },
      linkVisibility: showEdges,
      backgroundColor: GRAPH_BACKGROUND_COLOR,
      nodeOpacity: 0.9,
      linkOpacity: 0.6,
      linkDirectionalParticles: showEdges ? 2 : 0,
      linkDirectionalParticleSpeed: 0.01,
      linkDirectionalParticleWidth: 3,
    }),
    [data.nodes, nodeColor, nodeLabel, nodeVal, showEdges]
  );

  const onNodeClick = useCallback((n: NodeDTO) => {
    alert(
      [
        `Score: ${n.slug}`,
        `Depth: ${n.depth}`,
        `Occurrences: ${n.occurrences}`,
        `Normalized: ${Math.round(n.norm * 100)}%`,
        `Status: ${n.played ? "Scored" : "Never occurred"}`,
      ].join("\n")
    );
  }, []);

  /* ─── render ─────────────────────────────────────────────────────────────── */
  return (
    <div ref={wrapperRef} className="relative w-full h-full overflow-hidden">
      {loading && totalCount > 0 && (
        <div className="absolute inset-0 z-20 flex items-center justify-center bg-black/50">
          <LoadingSpinner
            size={12}
            text={`Loading graph... ${Math.round((progress / totalCount) * 100)}%`}
          />
        </div>
      )}

      {!loading &&
        data.nodes.length &&
        data.links.length &&
        width &&
        height && (
          <>
            <ForceGraph3D
              width={width}
              height={height}
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              ref={fgRef as any}
              graphData={data}
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              {...(graphProps as any)}
              onNodeClick={onNodeClick as (node: object) => void}
              showNavInfo={false}
              enableNodeDrag
              nodeRelSize={nodeStrength / 10}
            />
            {/* Legend component goes here */}
          </>
        )}
    </div>
  );
};
