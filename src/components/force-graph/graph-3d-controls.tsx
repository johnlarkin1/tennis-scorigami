// src/components/force-graph/graph-3d-controls.tsx

"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { atom, useAtom } from "jotai";
import { Info, Layers, Zap } from "lucide-react";
import React from "react";

// Create atoms for 3D graph specific controls
export const nodeDepthAtom = atom(5);
export const forceSeparationAtom = atom(50);
export const linkDistanceAtom = atom(50);
export const chargeStrengthAtom = atom(-100);
export const autoRotateAtom = atom(false);

type Graph3DControlsProps = {
  className?: string;
};

export const Graph3DControls: React.FC<Graph3DControlsProps> = ({
  className,
}) => {
  const [nodeDepth, setNodeDepth] = useAtom(nodeDepthAtom);
  const [forceSeparation, setForceSeparation] = useAtom(forceSeparationAtom);
  const [linkDistance, setLinkDistance] = useAtom(linkDistanceAtom);
  const [chargeStrength, setChargeStrength] = useAtom(chargeStrengthAtom);
  const [autoRotate, setAutoRotate] = useAtom(autoRotateAtom);

  return (
    <Card className={`bg-gray-800 border-gray-700 ${className}`}>
      <CardContent className="p-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Layers className="h-5 w-5" />
          3D Graph Controls
        </h3>

        <div className="space-y-4">
          {/* Node Depth Control */}
          <div>
            <label className="text-sm text-gray-300 mb-2 block">
              Max Depth (Sets): {nodeDepth}
            </label>
            <Slider
              value={[nodeDepth]}
              onValueChange={([value]) => setNodeDepth(value)}
              min={1}
              max={5}
              step={1}
              className="w-full"
            />
          </div>

          {/* Force Separation */}
          <div>
            <label className="text-sm text-gray-300 mb-2 block">
              Force Separation: {forceSeparation}
            </label>
            <Slider
              value={[forceSeparation]}
              onValueChange={([value]) => setForceSeparation(value)}
              min={10}
              max={200}
              step={10}
              className="w-full"
            />
          </div>

          {/* Link Distance */}
          <div>
            <label className="text-sm text-gray-300 mb-2 block">
              Link Distance: {linkDistance}
            </label>
            <Slider
              value={[linkDistance]}
              onValueChange={([value]) => setLinkDistance(value)}
              min={10}
              max={200}
              step={10}
              className="w-full"
            />
          </div>

          {/* Charge Strength */}
          <div>
            <label className="text-sm text-gray-300 mb-2 block">
              Charge Strength: {chargeStrength}
            </label>
            <Slider
              value={[chargeStrength]}
              onValueChange={([value]) => setChargeStrength(value)}
              min={-300}
              max={0}
              step={10}
              className="w-full"
            />
          </div>

          {/* Auto Rotate */}
          <div className="flex items-center justify-between">
            <label
              htmlFor="autoRotate"
              className="text-sm text-gray-300 flex items-center gap-2"
            >
              <Zap className="h-4 w-4" />
              Auto Rotate
            </label>
            <Switch
              id="autoRotate"
              checked={autoRotate}
              onCheckedChange={setAutoRotate}
            />
          </div>
        </div>

        <div className="mt-4 p-3 bg-gray-700 rounded-lg">
          <div className="flex items-center gap-2 text-xs text-gray-300">
            <Info className="h-4 w-4" />
            <span>
              Adjust these controls to change the 3D visualization physics
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
