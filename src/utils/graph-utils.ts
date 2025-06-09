import { DEPTH_COLORS, NEVER_OCCURRED_COLOR } from "@/constants/graph-colors";
import { NodeDTO } from "@/lib/types";
import { scaleLinear } from "d3-scale";

const ROOT_ID = 0;

/**
 * Convert HSL values to hex color format for better Sigma.js compatibility
 */
export const hslToHex = (h: number, s: number, l: number): string => {
  l /= 100;
  const a = (s * Math.min(l, 1 - l)) / 100;
  const f = (n: number) => {
    const k = (n + h / 30) % 12;
    const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
    return Math.round(255 * color)
      .toString(16)
      .padStart(2, "0");
  };
  return `#${f(0)}${f(8)}${f(4)}`;
};

/**
 * Create depth-based occurrence scales for gradient coloring
 */
export const createDepthScales = (
  nodes: NodeDTO[]
): Record<number, ReturnType<typeof scaleLinear>> => {
  const scales: Record<number, ReturnType<typeof scaleLinear>> = {};
  const nodesByDepth = nodes.reduce(
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
};

/**
 * Get the appropriate color for a node based on color mode
 */
export const getNodeColor = (
  node: NodeDTO,
  colorMode: "category" | "gradient",
  depthScales: Record<number, ReturnType<typeof scaleLinear>>
): string => {
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
      // Clamp intensity and map to safe lightness range (75% to 25%)
      const clampedIntensity = Math.max(0, Math.min(1, intensity));
      const lightness = 75 - clampedIntensity * 50;

      return hslToHex(220, 80, lightness);
    }
    return "#4f83cc"; // Default blue
  }
};

export const getOccurrenceIntensityColor = (intensity: number): string => {
  const L = 90 - intensity * 60;
  return `hsl(220,80%,${L}%)`;
};

export const getEdgeColorByDepth = (maxDepth: number): string => {
  const brightness = 40 + maxDepth * 15;
  return `hsl(200, 70%, ${brightness}%)`;
};
