"use client";

import { Footer } from "@/components/layout/footer";
import { Header } from "@/components/layout/header";
import { GraphProvider } from "@/providers/graph-provider";
import { selectedSetsAtom } from "@/components/graph/controls/graph-controls";
import { useAtom } from "jotai";
import { Suspense } from "react";
import { ExplorePageContent } from "./explore-page-content";

export default function ExplorePage() {
  const [selectedSets] = useAtom(selectedSetsAtom);

  return (
    <GraphProvider maxDepth={selectedSets}>
      <main className="min-h-screen bg-gray-900 text-white flex flex-col">
        <Header />

        {/* Page Header */}
        <div className="pt-8 pb-4 px-6 border-b border-gray-700 shadow-[0_4px_12px_rgba(0,0,0,0.3)]">
          <h2 className="text-3xl md:text-4xl font-bold text-center">
            Explore Tennis Scorigami Data
          </h2>
          <p className="text-md text-gray-300 max-w-3xl mx-auto text-center mt-3">
            This graph (really tree, see more in our technical discussion) is
            meant to show all possible score sequences in tennis matches. Click
            the gear icon on the left to adjust the parameters. Click on nodes
            to see more detail.
          </p>
        </div>

        <Suspense fallback={<div>Loading...</div>}>
          <ExplorePageContent />
        </Suspense>

        <Footer />
      </main>
    </GraphProvider>
  );
}
