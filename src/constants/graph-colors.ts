export const DEPTH_COLORS: Record<number, string> = {
  0: "#FF3B30", // Vibrant Red
  1: "#FF9500", // Warm Orange
  2: "#FFD60A", // Bright Yellow
  3: "#30D158", // Spring Green
  4: "#5AC8FA", // Electric Cyan
  5: "#BF5AF2", // Electric Purple
};

export const NEVER_OCCURRED_COLOR = "#dc2626"; // Bright red

export const FREQUENCY_LEGEND = [
  { label: "High frequency", color: "#1e40af" }, // Dark blue
  { label: "Medium frequency", color: "#3b82f6" }, // Medium blue
  { label: "Low frequency", color: "#dbeafe" }, // Light blue
];

export const GRAPH_BACKGROUND_COLOR = "#0f172a";

export const DEPTH_GRADIENT_STOPS = [
  { offset: "0%", color: "#ef4444" }, // Level 0 - Red
  { offset: "20%", color: "#f59e0b" }, // Level 1 - Orange
  { offset: "40%", color: "#10b981" }, // Level 2 - Green
  { offset: "60%", color: "#3b82f6" }, // Level 3 - Blue
  { offset: "80%", color: "#8b5cf6" }, // Level 4 - Purple
  { offset: "100%", color: "#ec4899" }, // Level 5+ - Pink
];
