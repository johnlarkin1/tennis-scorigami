"use client";

import { ConceptExplanation } from "@/components/landing/concept-explanation";
import { Footer } from "@/components/landing/footer";
import { HeroSection } from "@/components/landing/hero-section";
import { KeyStatsSection } from "@/components/landing/key-stats-section";
import { SectionDivider } from "@/components/landing/section-divider";
import { MatchStat } from "@/components/landing/types";
import UnscoredMatchesSection from "@/components/landing/unscored-matches-section";
import { Header } from "@/components/layout/header";
import { TennisScorigamiVisualization } from "@/components/scorigami/scorigami-tree-viz";
import { useEffect, useState } from "react";

export default function Home() {
  const [stats, setStats] = useState<MatchStat[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchStats() {
      try {
        setIsLoading(true); // Ensure loading is true at the start
        setError(null); // Reset error
        const response = await fetch("/api/v1/match-stats");
        if (!response.ok) {
          throw new Error(`Failed to fetch stats: ${response.statusText}`);
        }
        const data = await response.json();
        if (!Array.isArray(data)) {
          // Basic validation
          throw new Error("Fetched data is not in the expected format.");
        }
        setStats(data);
      } catch (err: any) {
        setError(err.message || "Failed to load statistics");
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    }

    fetchStats();
  }, []);

  return (
    <div className="bg-gray-900 text-white">
      <Header />
      <main>
        <HeroSection className="h-[30vh]" />

        <UnscoredMatchesSection className="h-auto" />
        {/* Replace StatsCarousel with KeyStatsSection */}
        <KeyStatsSection stats={stats} isLoading={isLoading} error={error} />

        <ConceptExplanation />

        {/* Visualization Section */}
        <SectionDivider id="visualization" title="Interactive Visualization" />
        <section className="pt-8 pb-20 bg-gray-800">
          <div className="container mx-auto px-4">
            <div className="max-w-5xl mx-auto text-center mb-12">
              <p className="text-lg text-gray-300">
                Explore our interactive tree visualization to discover unique
                tennis score combinations. Green nodes represent scores that
                have occurred, while gray nodes represent scores that remain
                theoretical. Click nodes to expand and see more details.
              </p>
            </div>

            <div
              className="visualization-container bg-gray-900 rounded-lg shadow-2xl overflow-hidden" // Added some styling
              style={{ height: "80vh", minHeight: "600px" }}
            >
              <TennisScorigamiVisualization />
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
