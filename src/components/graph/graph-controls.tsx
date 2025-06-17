import React from "react";

export const GraphControls: React.FC = () => {
  return (
    <div className="absolute bottom-3 left-3 text-white text-sm p-2 rounded shadow-lg backdrop-blur-sm">
      <p>Click on a node to see matches</p>
      <p>Left-click: rotate</p>
      <p>Mouse-wheel/middle-click: zoom</p>
      <p>Right-click: pan</p>
    </div>
  );
};
