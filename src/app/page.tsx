"use client";

import { HeroSection } from "@/components/landing/hero-section";
import UnscoredMatchesSection from "@/components/landing/unscored-matches-section";
import { Footer } from "@/components/layout/footer";
import { Header } from "@/components/layout/header";
import { FloatingExploreButton } from "@/components/ui/floating-explore-button";
import { MatchStat } from "@/types/landing/types";
import { useEffect, useState } from "react";

export default function Home() {
  const [stats, setStats] = useState<MatchStat[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showFloatingButton, setShowFloatingButton] = useState(true);

  useEffect(() => {
    async function fetchStats() {
      try {
        setIsLoading(true);
        setError(null);
        const response = await fetch("/api/v1/match-stats");
        if (!response.ok) {
          throw new Error(`Failed to fetch stats: ${response.statusText}`);
        }
        const data = await response.json();
        if (!Array.isArray(data)) {
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

  useEffect(() => {
    if (typeof window !== "undefined" && window.location.hash) {
      const hash = window.location.hash.substring(1);
      // Small delay to ensure the page is fully loaded
      setTimeout(() => {
        const element = document.getElementById(hash);
        if (element) {
          element.scrollIntoView({ behavior: "smooth" });
        }
      }, 100);
    }
  }, []);

  // Hide floating button after scrolling starts
  useEffect(() => {
    const handleScroll = () => {
      // Hide button once user starts scrolling
      setShowFloatingButton(window.scrollY === 0);
    };

    window.addEventListener("scroll", handleScroll);
    handleScroll(); // Check initial position

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="bg-gray-900 text-white">
      <Header />
      <main>
        {/* Main content visible on initial load */}
        <div className="min-h-screen flex flex-col">
          <HeroSection className="h-[30vh]" />
          <UnscoredMatchesSection className="h-auto flex-1" />
          
          {/* Floating button for navigation */}
          {showFloatingButton && (
            <FloatingExploreButton targetId="force-graph" />
          )}
        </div>

        {/* Additional sections below the fold */}
        {/* <KeyStatsSection stats={stats} isLoading={isLoading} error={error} /> */}
        
        {/* <ConceptExplanation /> */}

        {/* 3D Force Graph Section */}
        {/* <ForceGraphSection /> */}
      </main>
      <Footer />
    </div>
  );
}