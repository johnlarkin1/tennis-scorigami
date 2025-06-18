export const getSurfaceBorder = (surface?: string) => {
  const surfaceType = surface?.toLowerCase();
  switch (surfaceType) {
    case "grass":
      return "border-l-green-400";
    case "clay":
      return "border-l-orange-400";
    case "hard":
    default:
      return "border-l-blue-400";
  }
};

export const getSurfaceIcon = (surface?: string) => {
  const surfaceType = surface?.toLowerCase();
  switch (surfaceType) {
    case "grass":
      return "🌱";
    case "clay":
      return "🧱";
    case "hard":
    default:
      return "⚪";
  }
};
