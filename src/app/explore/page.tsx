"use client";

import { ForceGraphControls } from "@/components/force-graph/controls";
import { ForceGraph } from "@/components/force-graph/graph";
import { Footer } from "@/components/layout/footer";
import { Header } from "@/components/layout/header";
import { ChevronLeft, Settings } from "lucide-react";
import { useState } from "react";

export default function ExplorePage() {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  return (
    <main className="min-h-screen bg-gray-900 text-white flex flex-col">
      <Header />

      {/* Page Header */}
      <div className="pt-8 pb-4 px-6 border-b border-gray-700 shadow-[0_4px_12px_rgba(0,0,0,0.3)]">
        <h2 className="text-3xl md:text-4xl font-bold text-center">
          Explore Tennis Scorigami Data
        </h2>
        <p className="text-md text-gray-300 max-w-3xl mx-auto text-center mt-3">
          This graph (really tree, see more in our technical discussion) is
          meant to show all possible score sequences in tennis matches. You can
          filter by tournament, year, and division. Click the gear icon on the
          left to adjust the parameters. Click on nodes to see more detail.
        </p>
      </div>

      {/* Main Content with Sidebar and Graph */}
      <div className="flex flex-1 relative">
        {/* Sidebar Controls */}
        <aside
          className={`bg-gray-800 border-r border-gray-700 h-[calc(100vh-180px)] z-10 transition-all duration-300 overflow-y-auto
            ${sidebarOpen ? "w-80 lg:w-96" : "w-0"}`}
        >
          {sidebarOpen && (
            <div className="p-4">
              <ForceGraphControls />
            </div>
          )}
        </aside>

        {/* Toggle Button */}
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className={`absolute top-4 bg-gray-700 hover:bg-gray-600 z-20 p-2 rounded-r-lg shadow-lg transition-all duration-300
            ${sidebarOpen ? "left-80 lg:left-96" : "left-0"}`}
        >
          {sidebarOpen ? <ChevronLeft size={18} /> : <Settings size={18} />}
        </button>

        {/* Main Graph Area */}
        <div className="flex-1 bg-gray-850 relative">
          <div className="absolute inset-0">
            <ForceGraph />
          </div>
        </div>
      </div>

      <Footer />
    </main>
  );
}
