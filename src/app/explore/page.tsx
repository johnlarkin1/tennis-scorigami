"use client";

import { selectedSetsAtom } from "@/components/graph/controls/graph-controls";
import { Footer } from "@/components/layout/footer";
import { Header } from "@/components/layout/header";
import { GraphProvider } from "@/providers/graph-provider";
import { motion } from "framer-motion";
import { useAtom } from "jotai";
import { Network, Sparkles } from "lucide-react";
import { Suspense } from "react";
import { ExplorePageContent } from "./explore-page-content";

export default function ExplorePage() {
  const [selectedSets] = useAtom(selectedSetsAtom);

  return (
    <GraphProvider maxDepth={selectedSets}>
      <div className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-900 to-black text-white flex flex-col">
        <Header />

        <main className="flex-1 flex flex-col">
          {/* Page Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center py-6 sm:py-8 px-4 sm:px-6 border-b border-gray-700/50 shadow-[0_4px_12px_rgba(0,0,0,0.3)]"
          >
            <div className="flex items-center justify-center mb-4">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                className="p-2 sm:p-3 bg-gradient-to-br from-green-400/20 to-green-400/10 rounded-xl sm:rounded-2xl mr-3 sm:mr-4"
              >
                <Network className="w-6 h-6 sm:w-8 sm:h-8 text-green-400" />
              </motion.div>
              <h1 className="text-2xl sm:text-4xl md:text-6xl font-bold bg-gradient-to-r from-white via-gray-200 to-gray-400 bg-clip-text text-transparent">
                Explore Interactively
              </h1>
            </div>
            <p className="text-sm sm:text-base md:text-lg text-gray-300 max-w-3xl mx-auto leading-relaxed">
              Visualize all possible score sequences in tennis matches through
              our interactive graph.
            </p>
            <div className="block mt-2 text-green-400 text-xs sm:text-sm md:text-base">
              <div className="flex items-center justify-center">
                <Sparkles className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                Click the gear icon to adjust parameters.
              </div>
              <div className="flex items-center justify-center">
                <strong>Click nodes for details!</strong>
              </div>
            </div>
          </motion.div>

          <Suspense
            fallback={
              <div className="flex-1 flex items-center justify-center">
                <div className="text-gray-400">Loading visualization...</div>
              </div>
            }
          >
            <ExplorePageContent />
          </Suspense>
        </main>

        <Footer />
      </div>
    </GraphProvider>
  );
}
