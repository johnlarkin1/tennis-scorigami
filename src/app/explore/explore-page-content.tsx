"use client";

import {
  GraphControls,
  selectedSetsAtom,
  selectedYearAtom,
  selectedSexAtom,
  graphLayoutAtom,
  graphColorModeAtom,
  showLabelsAtom,
} from "@/components/graph/controls/graph-controls";
import { GraphVisualization } from "@/components/graph/graph-visualization";
import { SexType } from "@/types/tree-control-types";
import { useAtom } from "jotai";
import { ChevronLeft, Settings } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, useEffect } from "react";
import { isMobile } from "react-device-detect";

export function ExplorePageContent() {
  // Start with sidebar closed on mobile, open on desktop
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const router = useRouter();
  const searchParams = useSearchParams();

  // Atoms for URL sync
  const [selectedSets, setSelectedSets] = useAtom(selectedSetsAtom);
  const [selectedYear, setSelectedYear] = useAtom(selectedYearAtom);
  const [selectedSex, setSelectedSex] = useAtom(selectedSexAtom);
  const [graphLayout, setGraphLayout] = useAtom(graphLayoutAtom);
  const [colorMode, setColorMode] = useAtom(graphColorModeAtom);
  const [showLabels, setShowLabels] = useAtom(showLabelsAtom);

  // Set sidebar state based on device type after mount to avoid hydration issues
  useEffect(() => {
    setSidebarOpen(!isMobile);
  }, []);

  // Initialize atoms from URL params on mount
  useEffect(() => {
    const sets = searchParams.get("sets");
    const year = searchParams.get("year");
    const sex = searchParams.get("division");
    const layout = searchParams.get("layout");
    const color = searchParams.get("color");
    const labels = searchParams.get("labels");

    if (sets && (sets === "3" || sets === "5")) {
      setSelectedSets(Number(sets) as 3 | 5);
    }
    if (year) {
      setSelectedYear(year);
    }
    if (sex && (sex === "Men" || sex === "Women" || sex === "Men and Women")) {
      setSelectedSex(sex as SexType);
    }
    if (layout && (layout === "2d" || layout === "3d")) {
      setGraphLayout(layout);
    }
    if (color && (color === "category" || color === "gradient")) {
      setColorMode(color);
    }
    if (labels && (labels === "true" || labels === "false")) {
      setShowLabels(labels === "true");
    }
  }, [
    searchParams,
    setSelectedSets,
    setSelectedYear,
    setSelectedSex,
    setGraphLayout,
    setColorMode,
    setShowLabels,
  ]);

  // Update URL when atoms change
  useEffect(() => {
    const params = new URLSearchParams();

    if (selectedSets !== 3) {
      params.set("sets", selectedSets.toString());
    }
    if (selectedYear !== "All Years") {
      params.set("year", selectedYear);
    }
    if (selectedSex !== "Men and Women") {
      params.set("division", selectedSex);
    }
    if (graphLayout !== "3d") {
      params.set("layout", graphLayout);
    }
    if (colorMode !== "category") {
      params.set("color", colorMode);
    }
    if (showLabels !== false) {
      params.set("labels", showLabels.toString());
    }

    const newUrl = params.toString() ? `?${params.toString()}` : "";
    const currentUrl = window.location.search;

    if (newUrl !== currentUrl) {
      router.push(`/explore${newUrl}`, { scroll: false });

      // Close sidebar on mobile after selection
      if (isMobile && sidebarOpen) {
        setSidebarOpen(false);
      }
    }
  }, [
    selectedSets,
    selectedYear,
    selectedSex,
    graphLayout,
    colorMode,
    showLabels,
    router,
    sidebarOpen,
  ]);

  return (
    <>
      {/* Main Content with Sidebar and Graph */}
      <div className="flex flex-1 relative">
        {/* Sidebar Controls - Mobile responsive */}
        <aside
          className={`bg-gray-800 border-r border-gray-700 h-[calc(100vh-140px)] sm:h-[calc(100vh-180px)] z-10 transition-all duration-300 overflow-y-auto
            ${sidebarOpen ? "w-full sm:w-80 lg:w-96" : "w-0"}`}
        >
          {sidebarOpen && (
            <div className="p-3 sm:p-4">
              <GraphControls />
            </div>
          )}
        </aside>

        {/* Toggle Button - Mobile responsive */}
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className={`absolute top-3 sm:top-4 bg-gray-700 hover:bg-gray-600 z-20 p-2 rounded-r-lg shadow-lg transition-all duration-300
            ${sidebarOpen ? "left-full sm:left-80 lg:left-96 -ml-10 sm:-ml-0" : "left-0"}`}
        >
          {sidebarOpen ? (
            <ChevronLeft size={16} className="sm:w-[18px] sm:h-[18px]" />
          ) : (
            <Settings size={16} className="sm:w-[18px] sm:h-[18px]" />
          )}
        </button>

        {/* Main Graph Area */}
        <div className="flex-1 bg-gray-850 relative">
          <div className="absolute inset-0">
            <GraphVisualization />
          </div>
        </div>
      </div>
    </>
  );
}
