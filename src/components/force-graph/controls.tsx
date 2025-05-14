"use client";

import { TournamentDropdown } from "@/components/scorigami/controls/tournament-dropdown";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { ToggleButton } from "@/components/ui/toggle-button";
import { YEARS } from "@/constants";
import { SexType, ViewType } from "@/types/tree-control-types";
import { atom, useAtom } from "jotai";
import {
  Calendar,
  Hash,
  Layers,
  Link,
  Maximize,
  Minimize,
  Network,
  Paintbrush,
  Users,
} from "lucide-react";
import * as React from "react";

// Force graph specific atoms
export const graphDensityAtom = atom(50);
export const graphLayoutAtom = atom<"3d" | "2d">("3d");
export const showLabelsAtom = atom(true);
export const nodeStrengthAtom = atom(50);
export const graphColorModeAtom = atom<"category" | "gradient">("category");
export const showEdgesAtom = atom(true);

// View type control
export const viewTypeAtom = atom<ViewType>("vertical");

// Visual controls
export const showGradientAtom = atom<boolean>(false);
export const showCountAtom = atom<boolean>(false);

// Filter controls
export const selectedYearAtom = atom<string>("All Years");
export const selectedSexAtom = atom<SexType>("Men and Women");
export const selectedSetsAtom = atom<3 | 5>(3);
nodeStrengthAtom;

type ForceGraphControlsProps = {
  className?: string;
};

export const ForceGraphControls: React.FC<ForceGraphControlsProps> = ({
  className,
}) => {
  // Graph type and layout controls
  const [graphLayout, setGraphLayout] = useAtom(graphLayoutAtom);
  const [graphDensity, setGraphDensity] = useAtom(graphDensityAtom);
  const [nodeStrength, setNodeStrength] = useAtom(nodeStrengthAtom);
  const [showLabels, setShowLabels] = useAtom(showLabelsAtom);
  const [colorMode, setColorMode] = useAtom(graphColorModeAtom);
  const [showEdges, setShowEdges] = useAtom(showEdgesAtom);

  // Filter controls (reused from tree controls)
  const [selectedYear, setSelectedYear] = useAtom(selectedYearAtom);
  const [selectedSex, setSelectedSex] = useAtom(selectedSexAtom);

  // Slider component temporarily replaced with a range input
  const SliderComponent = ({
    value,
    onValueChange,
    min,
    max,
    step,
    className,
  }: {
    value: number[];
    onValueChange: (values: number[]) => void;
    min: number;
    max: number;
    step: number;
    className?: string;
  }) => (
    <input
      type="range"
      min={min}
      max={max}
      step={step}
      value={value[0]}
      onChange={(e) => onValueChange([Number(e.target.value)])}
      className={`w-full h-2 bg-gray-600 rounded-lg appearance-none cursor-pointer ${className}`}
    />
  );

  return (
    <Card className="w-full mx-auto mb-6 bg-gray-800 border-gray-700 rounded-md">
      <CardContent className="p-6">
        <h2 className="text-xl font-semibold">Force Graph Controls</h2>
        <p className="text-gray-400 mb-4 text-sm">
          Customize the view settings for the tennis score force graph
          visualization. Adjust layout, density, colors, and filters to explore
          different patterns.
        </p>
        <div className="flex flex-col gap-6">
          {/* Layout and Visualization Controls */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-sm font-medium mb-2">Graph Layout</h3>
              <div className="flex gap-2">
                <ToggleButton
                  isActive={graphLayout === "3d"}
                  onClick={() => setGraphLayout("3d")}
                >
                  <Layers className="mr-2 h-4 w-4" />
                  3D View
                </ToggleButton>
                <ToggleButton
                  isActive={graphLayout === "2d"}
                  onClick={() => setGraphLayout("2d")}
                >
                  <Network className="mr-2 h-4 w-4" />
                  <span>2D View</span>
                </ToggleButton>
              </div>
            </div>

            <div>
              <h3 className="text-sm font-medium mb-2">Node Coloring</h3>
              <div className="flex gap-2">
                <ToggleButton
                  isActive={colorMode === "category"}
                  onClick={() => setColorMode("category")}
                >
                  <Hash className="mr-2 h-4 w-4" />
                  Category Based
                </ToggleButton>
                <ToggleButton
                  isActive={colorMode === "gradient"}
                  onClick={() => setColorMode("gradient")}
                >
                  <Paintbrush className="mr-2 h-4 w-4" />
                  <span>Gradient</span>
                </ToggleButton>
              </div>
            </div>
          </div>

          {/* Sliders for Graph Properties */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <div className="flex justify-between items-center mb-2">
                <h3 className="text-sm font-medium">Graph Density</h3>
                <span className="text-xs text-gray-400">{graphDensity}%</span>
              </div>
              <div className="flex items-center gap-3">
                <Minimize className="h-4 w-4 text-gray-400" />
                <SliderComponent
                  value={[graphDensity]}
                  onValueChange={(values) => setGraphDensity(values[0])}
                  min={10}
                  max={100}
                  step={5}
                  className="flex-1"
                />
                <Maximize className="h-4 w-4 text-gray-400" />
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-2">
                <h3 className="text-sm font-medium">Node Force Strength</h3>
                <span className="text-xs text-gray-400">{nodeStrength}%</span>
              </div>
              <div className="flex items-center gap-3">
                <Minimize className="h-4 w-4 text-gray-400" />
                <SliderComponent
                  value={[nodeStrength]}
                  onValueChange={(values) => setNodeStrength(values[0])}
                  min={10}
                  max={100}
                  step={5}
                  className="flex-1"
                />
                <Maximize className="h-4 w-4 text-gray-400" />
              </div>
            </div>
          </div>

          {/* Toggle Options */}
          <div className="flex items-center gap-4 bg-gray-700 rounded-md px-3 py-2">
            <div className="flex items-center space-x-2">
              <Switch
                id="showLabels"
                checked={showLabels}
                onCheckedChange={(checked) => setShowLabels(checked)}
              />
              <label
                htmlFor="showLabels"
                className="text-sm text-gray-300 flex items-center"
              >
                <Hash className="mr-1 h-4 w-4" />
                Show Node Labels
              </label>
            </div>
          </div>

          {/* link visibility */}
          <div className="flex items-center space-x-2">
            <Switch
              id="showEdges"
              checked={showEdges}
              onCheckedChange={(checked) => setShowEdges(checked)}
            />
            <label
              htmlFor="showEdges"
              className="text-sm text-gray-300 flex items-center"
            >
              <Link className="mr-1 h-4 w-4" />
              Show Edges
            </label>
          </div>

          {/* Slam and Year Selectors */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {/* Tournament (Slam) Select with "All" Option */}
            <TournamentDropdown />

            {/* Year Select with "All" Option */}
            <Select onValueChange={setSelectedYear} value={selectedYear}>
              <SelectTrigger className="select-trigger">
                <Calendar className="mr-2 h-4 w-4" />
                <SelectValue placeholder="Year" />
              </SelectTrigger>
              <SelectContent className="min-w-[inherit] bg-gray-800 text-white border-gray-700 rounded-md">
                <SelectItem value="All Years" className="hover:bg-gray-700">
                  All Years
                </SelectItem>
                {YEARS.map((year) => (
                  <SelectItem
                    key={year.value}
                    value={year.value}
                    className="hover:bg-gray-700"
                  >
                    {year.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Gender Select */}
            <Select
              onValueChange={(value) => setSelectedSex(value as SexType)}
              value={selectedSex}
            >
              <SelectTrigger className="select-trigger">
                <Users className="mr-2 h-4 w-4" />
                <SelectValue placeholder="Gender" />
              </SelectTrigger>
              <SelectContent className="min-w-[inherit] bg-gray-800 text-white border-gray-700 rounded-md">
                <SelectItem value="Men and Women" className="hover:bg-gray-700">
                  Men and Women
                </SelectItem>
                <SelectItem value="Men" className="hover:bg-gray-700">
                  Men
                </SelectItem>
                <SelectItem value="Women" className="hover:bg-gray-700">
                  Women
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
