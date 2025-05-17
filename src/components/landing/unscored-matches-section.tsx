// app/components/UnscoredMatchesSection.tsx
"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import FlipNumbers from "react-flip-numbers";

import { TennisScoreboard } from "@/components/scoreboard";
import type { MatchStatWithSamples } from "@/types/match-stats/response";

const FLIP_NUMBERS_HEIGHT = 20;
const FLIP_NUMBERS_WIDTH = 16;
const FLIP_NUMBERS_DURATION = 1; // seconds
const CATEGORY_ANIMATION_TIME_SEC = 10;

const FLIP_TEXT_STYLE = {
  color: "#4ade80",
  fontSize: "16px",
  fontFamily: "monospace",
  fontWeight: "bold",
  background: "transparent",
};

interface Props {
  className?: string;
}

export default function UnscoredMatchesSection({ className }: Props) {
  const [stats, setStats] = useState<MatchStatWithSamples[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [displayPatterns, setDisplayPatterns] = useState<string[][]>([]);
  const autoRef = useRef<number | null>(null);

  // Fetch live stats once on mount
  useEffect(() => {
    fetch("/api/v1/match-stats")
      .then((res) => res.json())
      .then((data: MatchStatWithSamples[]) => {
        console.log(data);
        setStats(data);
      })
      .catch(console.error);
  }, []);

  useEffect(() => {
    if (!stats.length) return;
    const samples = stats[currentIndex].samples.slice(0, 6);
    const patterns = samples.map((s) => s.slug.split(","));
    setDisplayPatterns(patterns);
  }, [stats, currentIndex]);

  // Auto-advance carousel
  useEffect(() => {
    if (!stats.length) return;
    // clear any existing
    if (autoRef.current) window.clearInterval(autoRef.current);
    autoRef.current = window.setInterval(() => {
      setCurrentIndex((i) => (i + 1) % stats.length);
    }, CATEGORY_ANIMATION_TIME_SEC * 1000);
    return () => {
      if (autoRef.current) window.clearInterval(autoRef.current);
    };
  }, [stats, currentIndex]);

  const goPrev = () => {
    if (autoRef.current) window.clearInterval(autoRef.current);
    setCurrentIndex((i) => (i - 1 + stats.length) % stats.length);
  };
  const goNext = () => {
    if (autoRef.current) window.clearInterval(autoRef.current);
    setCurrentIndex((i) => (i + 1) % stats.length);
  };

  if (!stats.length) {
    return <div className={className}>Loading…</div>;
  }

  const currentStat = stats[currentIndex];
  const slotCount =
    displayPatterns[0]?.length ?? currentStat.best_of + currentStat.best_of;
  const dashRow = Array(slotCount).fill("-");
  const patternsToDisplay = Array.from(
    { length: 6 },
    (_, i) => displayPatterns[i] || dashRow
  );

  const startDataCollectionYear = 1981;
  const currentYear = new Date().getFullYear();
  const yearsSinceStart = currentYear - startDataCollectionYear;

  return (
    <section className={`${className} bg-gray-900 overflow-hidden`}>
      <div className="mx-auto max-w-none">
        {/* Title with glow effect */}
        <div className="flex justify-center mt-16 mb-8">
          <div className="max-w-4xl w-full">
            <h2 className="text-2xl md:text-3xl font-bold text-white text-center border border-gray-700 rounded-lg px-8 py-6 shadow-[0_0_30px_rgba(68,219,94,0.3),inset_0_0_30px_rgba(68,219,94,0.1)] bg-gray-900/50 backdrop-blur-sm">
              In the past{" "}
              <span className="text-green-400">{yearsSinceStart}</span> years of
              tennis matches since{" "}
              <span className="text-green-400">{startDataCollectionYear}</span>,
              some score combinations have still never occurred. This project is
              designed to track and discover these missing scorelines.
            </h2>
          </div>
        </div>

        {/* Stats & Nav */}
        <div className="flex justify-center mb-12">
          <div className="max-w-5xl w-full border border-gray-700 rounded-lg px-6 py-8 shadow-[0_0_30px_rgba(68,219,94,0.3),inset_0_0_30px_rgba(68,219,94,0.1)] bg-gray-900/50 backdrop-blur-sm">
            <div className="flex items-center justify-between gap-4">
              <button
                onClick={goPrev}
                className="shrink-0 group flex items-center gap-2 px-4 py-2 bg-[#c5c75a] text-black rounded-lg transition-all duration-200 hover:bg-opacity-90 active:scale-95"
                aria-label="Previous format"
              >
                <ChevronLeft size={20} />
                <span className="hidden sm:inline text-sm font-medium">
                  Previous
                </span>
              </button>

              <div className="flex-1 text-center">
                <div className="space-y-6">
                  {/* Never-played */}
                  <div className="flex items-center justify-center text-lg md:text-xl">
                    <div className="flex flex-wrap items-center justify-center gap-x-2 gap-y-1">
                      <span className="text-gray-300">There are</span>
                      <span className="inline-flex items-center h-9 w-[140px] px-4 bg-gradient-to-r from-green-500/10 to-green-400/10 rounded-lg justify-center">
                        <FlipNumbers
                          height={FLIP_NUMBERS_HEIGHT}
                          width={FLIP_NUMBERS_WIDTH}
                          color="#4ade80"
                          background="transparent"
                          play
                          numbers={currentStat.total_never_occurred.toLocaleString()}
                          nonNumberStyle={FLIP_TEXT_STYLE}
                          numberStyle={FLIP_TEXT_STYLE}
                          duration={FLIP_NUMBERS_DURATION}
                        />
                      </span>
                      <span className="text-gray-300">
                        never-played score combinations in
                      </span>
                      <span className="inline-flex items-center h-9 w-[100px] px-4 bg-gradient-to-r from-green-500/10 to-green-400/10 rounded-lg justify-center">
                        <FlipNumbers
                          height={FLIP_NUMBERS_HEIGHT}
                          width={FLIP_NUMBERS_WIDTH}
                          color="#4ade80"
                          background="transparent"
                          play
                          numbers={`${currentStat.gender.toUpperCase()}'S`}
                          nonNumberStyle={FLIP_TEXT_STYLE}
                          numberStyle={FLIP_TEXT_STYLE}
                          duration={FLIP_NUMBERS_DURATION}
                        />
                      </span>
                      <span className="inline-flex items-center h-9 w-[120px] px-4 bg-gradient-to-r from-green-500/10 to-green-400/10 rounded-lg justify-center">
                        <FlipNumbers
                          height={FLIP_NUMBERS_HEIGHT}
                          width={FLIP_NUMBERS_WIDTH}
                          color="#4ade80"
                          background="transparent"
                          play
                          numbers={`BEST\u00A0OF\u00A0${currentStat.best_of}`}
                          nonNumberStyle={FLIP_TEXT_STYLE}
                          numberStyle={FLIP_TEXT_STYLE}
                          duration={FLIP_NUMBERS_DURATION}
                        />
                      </span>
                      <span className="text-gray-300">matches</span>
                    </div>
                  </div>

                  {/* Total possible */}
                  <div className="flex items-center justify-center text-lg md:text-xl">
                    <div className="flex flex-wrap items-center justify-center gap-x-2 gap-y-1">
                      <span className="text-gray-300">Out of</span>
                      <span className="inline-flex items-center h-9 w-[140px] px-4 bg-gradient-to-r from-green-500/10 to-green-400/10 rounded-lg justify-center">
                        <FlipNumbers
                          height={FLIP_NUMBERS_HEIGHT}
                          width={FLIP_NUMBERS_WIDTH}
                          color="#a1a1aa"
                          background="transparent"
                          play
                          numbers={currentStat.total_possible.toLocaleString()}
                          nonNumberStyle={FLIP_TEXT_STYLE}
                          numberStyle={FLIP_TEXT_STYLE}
                          duration={FLIP_NUMBERS_DURATION}
                        />
                      </span>
                      <span className="text-gray-300">possible score.</span>
                    </div>
                  </div>
                </div>

                {/* Dots */}
                <div className="flex items-center justify-center gap-8 mt-8">
                  {stats.map((_, idx) => (
                    <div key={idx} className="flex flex-col items-center gap-2">
                      <div
                        className={`w-4 h-4 rounded-full transition-colors ${
                          idx === currentIndex ? "bg-green-400" : "bg-gray-600"
                        }`}
                      />
                      <span
                        className={`text-sm transition-colors ${idx === currentIndex ? "text-gray-300" : "text-gray-500"}`}
                      >
                        {stats[idx].gender.toUpperCase()} {stats[idx].best_of}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <button
                onClick={goNext}
                className="shrink-0 group flex items-center gap-2 px-4 py-2 bg-[#c5c75a] text-black rounded-lg transition-all duration-200 hover:bg-opacity-90 active:scale-95"
                aria-label="Next format"
              >
                <span className="hidden sm:inline text-sm font-medium">
                  Next
                </span>
                <ChevronRight size={20} />
              </button>
            </div>
          </div>
        </div>

        {/* Scoreboards Header */}
        <div className="text-center mb-8">
          <h3 className="text-2xl font-bold text-green-400 mb-2">
            Never-Occurred Scorelines
          </h3>
          <p className="text-gray-300 max-w-2xl mx-auto">
            Below are examples of score combinations that have never happened in
            professional {currentStat.gender.toLowerCase()}'s best-of-
            {currentStat.best_of} tennis matches. These are just a few of the{" "}
            {currentStat.total_never_occurred.toLocaleString()} missing
            scorelines.
          </p>
        </div>

        {/* Scoreboards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 w-[90%] mx-auto">
          {patternsToDisplay.map((pattern, idx) => (
            <div
              key={`${currentStat.gender}_${currentStat.best_of}-${idx}`}
              className="flex flex-col"
            >
              <div className="bg-gray-800/50 text-center py-2 rounded-t-lg border-t border-l border-r border-green-600">
                <span className="text-green-400 font-medium">
                  Unplayed Scoreline #{idx + 1}
                </span>
              </div>
              <TennisScoreboard scores={pattern} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
