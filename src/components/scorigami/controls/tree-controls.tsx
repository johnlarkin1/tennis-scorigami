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
import {
  selectedSexAtom,
  selectedYearAtom,
  showCountAtom,
  showGradientAtom,
  viewTypeAtom,
} from "@/store/scoreigami/tree-controls";
import { SexType } from "@/types/tree-control-types";
import { useAtom } from "jotai";
import {
  Calendar,
  Hash,
  MoveHorizontal,
  MoveVertical,
  Paintbrush,
  Users,
} from "lucide-react";
import * as React from "react";

type TreeControlsProps = {
  className?: string;
};

export const TreeControls: React.FC<TreeControlsProps> = ({ _className }) => {
  // View type controls
  const [viewType, setViewType] = useAtom(viewTypeAtom);

  // Visual controls
  const [showGradient, setShowGradient] = useAtom(showGradientAtom);
  const [showCount, setShowCount] = useAtom(showCountAtom);

  // Filter controls
  const [selectedYear, setSelectedYear] = useAtom(selectedYearAtom);
  const [selectedSex, setSelectedSex] = useAtom(selectedSexAtom);

  return (
    <Card className="w-4/5 mx-auto mb-6 bg-gray-800 border-gray-700 rounded-md">
      <CardContent className="p-6">
        <h2 className="text-xl font-semibold">Control Panel</h2>
        <p className="text-gray-400 mb-4 text-sm">
          Customize the view settings for the tennis scorigami visualization.
          Select orientation, filters, and additional details.
        </p>
        <div className="flex flex-col sm:flex-row flex-wrap items-center justify-between gap-4">
          {/* View Type Selection */}
          <div className="flex gap-2">
            <ToggleButton
              isActive={viewType === "vertical"}
              onClick={() => setViewType("vertical")}
            >
              <MoveVertical className="mr-2 h-4 w-4" />
              Vertical
            </ToggleButton>
            <ToggleButton
              isActive={viewType === "horizontal"}
              onClick={() => setViewType("horizontal")}
            >
              <MoveHorizontal className="mr-2 h-4 w-4" />
              <span>Horizontal</span>
            </ToggleButton>
          </div>

          {/* Toggle Options */}
          <div className="flex items-center gap-4 bg-background border-border rounded-md px-3 py-2">
            <div className="flex items-center space-x-2">
              <Switch
                id="showGradient"
                checked={showGradient}
                onCheckedChange={(checked) => setShowGradient(checked)}
              />
              <label
                htmlFor="showGradient"
                className="text-sm text-gray-300 flex items-center"
              >
                <Paintbrush className="mr-1 h-4 w-4" />
                Show Gradient
              </label>
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="showCount"
                checked={showCount}
                onCheckedChange={(checked) => setShowCount(checked)}
              />
              <label
                htmlFor="showCount"
                className="text-sm text-gray-300 flex items-center"
              >
                <Hash className="mr-1 h-4 w-4" />
                Show Count
              </label>
            </div>
          </div>

          {/* Slam and Year Selectors */}
          <div className="flex items-center gap-3">
            {/* Tournament (Slam) Select with "All" Option */}
            <TournamentDropdown />

            {/* Year Select with "All" Option */}
            <Select onValueChange={setSelectedYear} value={selectedYear}>
              <SelectTrigger className="select-trigger">
                <Calendar className="mr-2 h-4 w-4" />
                <SelectValue placeholder="Year" />
              </SelectTrigger>
              <SelectContent className="min-w-[inherit] bg-background text-foreground border-border rounded-md">
                <SelectItem value="All Years" className="hover:bg-gray-600">
                  All Years
                </SelectItem>
                {YEARS.map((year) => (
                  <SelectItem
                    key={year.value}
                    value={year.value}
                    className="hover:bg-gray-600"
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
                <SelectValue placeholder="Sex" />
              </SelectTrigger>
              <SelectContent className="min-w-[inherit] bg-background text-foreground border-border rounded-md">
                <SelectItem value="Men and Women" className="hover:bg-gray-600">
                  Men and Women
                </SelectItem>
                <SelectItem value="Men" className="hover:bg-gray-600">
                  Men
                </SelectItem>
                <SelectItem value="Women" className="hover:bg-gray-600">
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
