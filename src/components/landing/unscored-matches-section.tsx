// app/components/UnscoredMatchesSection.tsx
"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import FlipNumbers from "react-flip-numbers";

import { TennisScoreboard } from "@/components/scoreboard";
import { ExploreButton } from "@/components/ui/explore-button";
import {
  SkeletonDot,
  SkeletonFlipNumber,
  SkeletonScoreboard,
} from "@/components/ui/skeleton-loaders";
import { START_DATA_COLLECTION_YEAR } from "@/constants";
import { fetchMatchStats } from "@/lib/api-client";
import type { MatchStatWithSamples } from "@/types/match-stats/response";

const FLIP_NUMBERS_DURATION = 1;
const CATEGORY_ANIMATION_TIME_SEC = 5;

const FLIP_TEXT_STYLE = {
  color: "#4ade80",
  fontSize: "16px",
  fontFamily: "monospace",
  fontWeight: "bold",
  background: "transparent",
};

interface TitleSectionProps {
  yearsSinceStart: number;
}

function TitleSection({ yearsSinceStart }: TitleSectionProps) {
  // return (
  //   <div className="flex justify-center mt-8 sm:mt-16 mb-6 sm:mb-8 px-4">
  //     <div className="max-w-4xl w-full">
  //       <h2 className="text-lg sm:text-2xl md:text-3xl font-bold text-white text-center border border-gray-700 rounded-lg px-4 sm:px-8 py-4 sm:py-6 shadow-[0_0_30px_rgba(68,219,94,0.3),inset_0_0_30px_rgba(68,219,94,0.1)] bg-gray-900/50 backdrop-blur-sm space-y-4">
  //         In the past <span className="text-green-400">{yearsSinceStart}</span>{" "}
  //         years of tennis matches since{" "}
  //         <span className="text-green-400">{START_DATA_COLLECTION_YEAR}</span>,
  //         some score combinations have still never occurred. This project is
  //         designed to track and discover these missing scorelines.
  //       </h2>
  //     </div>
  //   </div>
  // );

  return (
    <div className="flex justify-center mt-8 sm:mt-16 mb-6 sm:mb-8 px-4">
      <div className="max-w-7xl w-full">
        <div className="text-lg sm:text-xl md:text-3xl font-bold text-white text-center border border-gray-700 rounded-lg px-4 sm:px-8 py-4 sm:py-6 shadow-[0_0_30px_rgba(68,219,94,0.3),inset_0_0_30px_rgba(68,219,94,0.1)] bg-gray-900/50 backdrop-blur-sm space-y-4">
          <p>
            Every tennis match tells a story, but some stories have never been
            written.
          </p>
          <p>
            Since{" "}
            <span className="text-green-400">{START_DATA_COLLECTION_YEAR}</span>
            , over <span className="text-green-400">{yearsSinceStart}</span>{" "}
            years, certain score combinations remain the sport&apos;s best-kept
            secrets.
          </p>
          <p>
            This project let&apos;s you flip the cover and explore those
            unwritten stories.
          </p>
        </div>
      </div>
    </div>
  );
}

interface NavigationButtonProps {
  onClick: () => void;
  direction: "prev" | "next";
  disabled?: boolean;
}

function NavigationButton({
  onClick,
  direction,
  disabled = false,
}: NavigationButtonProps) {
  const isPrev = direction === "prev";
  const Icon = isPrev ? ChevronLeft : ChevronRight;
  const text = isPrev ? "Previous" : "Next";
  const ariaLabel = `${text} format`;

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`shrink-0 group flex items-center gap-1 sm:gap-2 px-2 sm:px-4 py-2 rounded-lg transition-all duration-200 ${
        disabled
          ? "bg-[#c5c75a]/50 text-black opacity-50"
          : "bg-[#c5c75a] text-black hover:bg-opacity-90 active:scale-95"
      }`}
      aria-label={ariaLabel}
    >
      {isPrev && <Icon size={16} className="sm:w-5 sm:h-5" />}
      <span className="hidden md:inline text-sm font-medium">{text}</span>
      {!isPrev && <Icon size={16} className="sm:w-5 sm:h-5" />}
    </button>
  );
}

interface FlipNumberDisplayProps {
  value: string;
  color?: string;
  width?: string;
}

function FlipNumberDisplay({
  value,
  color = "#4ade80",
  width = "w-[100px] sm:w-[140px]",
}: FlipNumberDisplayProps) {
  return (
    <span
      className={`inline-flex items-center h-7 sm:h-9 ${width} px-2 sm:px-4 bg-gradient-to-r from-green-500/10 to-green-400/10 rounded-lg justify-center`}
    >
      <FlipNumbers
        height={16}
        width={color === "#a1a1aa" ? 12 : 10}
        color={color}
        background="transparent"
        play
        numbers={value}
        nonNumberStyle={FLIP_TEXT_STYLE}
        numberStyle={FLIP_TEXT_STYLE}
        duration={FLIP_NUMBERS_DURATION}
      />
    </span>
  );
}

interface StatRowProps {
  children: React.ReactNode;
}

function StatRow({ children }: StatRowProps) {
  return (
    <div className="flex items-center justify-center text-sm sm:text-lg md:text-xl">
      <div className="flex flex-wrap items-center justify-center gap-x-1 sm:gap-x-2 gap-y-1">
        {children}
      </div>
    </div>
  );
}

interface StatsDisplayProps {
  currentStat: MatchStatWithSamples;
}

function StatsDisplay({ currentStat }: StatsDisplayProps) {
  return (
    <div className="space-y-4 sm:space-y-6">
      <StatRow>
        <span className="text-gray-300">There are</span>
        <FlipNumberDisplay
          value={currentStat.total_never_occurred.toLocaleString()}
          width="w-[100px] sm:w-[140px]"
        />
        <span className="text-gray-300">
          never-played score combinations in
        </span>
        <FlipNumberDisplay
          value={`${currentStat.gender.toUpperCase()}'S`}
          width="w-[80px] sm:w-[100px]"
        />
        <FlipNumberDisplay
          value={`BEST\u00A0OF\u00A0${currentStat.best_of}`}
          width="w-[100px] sm:w-[120px]"
        />
        <span className="text-gray-300">matches</span>
      </StatRow>

      <StatRow>
        <span className="text-gray-300">Out of</span>
        <FlipNumberDisplay
          value={currentStat.total_possible.toLocaleString()}
          color="#a1a1aa"
          width="w-[100px] sm:w-[140px]"
        />
        <span className="text-gray-300">possible scores.</span>
      </StatRow>

      <StatRow>
        <FlipNumberDisplay
          value={`${parseFloat(currentStat.completion_pct).toFixed(1)}%`}
          width="w-[80px] sm:w-[100px]"
        />
        <span className="text-gray-300">
          of all possible scores have been played.
        </span>
      </StatRow>
    </div>
  );
}

interface Props {
  className?: string;
}

export default function UnscoredMatchesSection({ className }: Props) {
  const [stats, setStats] = useState<MatchStatWithSamples[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [displayPatterns, setDisplayPatterns] = useState<string[][]>([]);
  const autoRef = useRef<number | null>(null);

  // Fetch live stats once on mount
  useEffect(() => {
    setIsLoading(true);
    fetchMatchStats()
      .then((data) => {
        setStats(data);
        setIsLoading(false);
      })
      .catch((error) => {
        console.error(error);
        setIsLoading(false);
      });
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

  // Render loading state with skeleton UI
  if (isLoading) {
    const currentYear = new Date().getFullYear();
    const yearsSinceStart = currentYear - START_DATA_COLLECTION_YEAR;

    return (
      <section className={`${className} overflow-hidden`}>
        <div className="mx-auto max-w-none">
          <TitleSection yearsSinceStart={yearsSinceStart} />

          {/* Stats & Nav - Skeleton */}
          <div className="flex justify-center mb-8 sm:mb-12 px-4">
            <div className="max-w-5xl w-full border border-gray-700 rounded-lg px-3 sm:px-6 py-6 sm:py-8 shadow-[0_0_30px_rgba(68,219,94,0.3),inset_0_0_30px_rgba(68,219,94,0.1)] bg-gray-900/50 backdrop-blur-sm">
              <div className="flex items-center justify-between gap-2 sm:gap-4">
                <NavigationButton
                  onClick={() => {}}
                  direction="prev"
                  disabled
                />

                <div className="flex-1 text-center">
                  <div className="space-y-6">
                    {/* Never-played - Skeleton */}
                    <div className="flex items-center justify-center text-sm sm:text-lg md:text-xl">
                      <div className="flex flex-wrap items-center justify-center gap-x-1 sm:gap-x-2 gap-y-1">
                        <span className="text-gray-300">There are</span>
                        <SkeletonFlipNumber />
                        <span className="text-gray-300">
                          never-played score combinations in
                        </span>
                        <SkeletonFlipNumber />
                        <SkeletonFlipNumber />
                        <span className="text-gray-300">matches</span>
                      </div>
                    </div>

                    {/* Total possible - Skeleton */}
                    <div className="flex items-center justify-center text-sm sm:text-lg md:text-xl">
                      <div className="flex flex-wrap items-center justify-center gap-x-1 sm:gap-x-2 gap-y-1">
                        <span className="text-gray-300">Out of</span>
                        <SkeletonFlipNumber />
                        <span className="text-gray-300">possible scores.</span>
                      </div>
                    </div>

                    {/* Completion percentage - Skeleton */}
                    <div className="flex items-center justify-center text-sm sm:text-lg md:text-xl">
                      <div className="flex flex-wrap items-center justify-center gap-x-1 sm:gap-x-2 gap-y-1">
                        <SkeletonFlipNumber />
                        <span className="text-gray-300">
                          of all possible scores have been played.
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Dots - Skeleton */}
                  <div className="flex items-center justify-center gap-4 sm:gap-8 mt-6 sm:mt-8">
                    {Array(3)
                      .fill(0)
                      .map((_, idx) => (
                        <SkeletonDot key={idx} />
                      ))}
                  </div>
                </div>

                <NavigationButton
                  onClick={() => {}}
                  direction="next"
                  disabled
                />
              </div>
            </div>
          </div>

          {/* Explore Interactively Button */}
          <ExploreButton className="mb-8" />

          {/* Scoreboards Header - Skeleton */}
          <div className="text-center mb-6 sm:mb-8 px-4">
            <h3 className="text-xl sm:text-2xl font-bold text-green-400 mb-2">
              Never-Occurred Scorelines
            </h3>
            <div className="max-w-2xl mx-auto">
              <div className="h-4 bg-gray-600/30 rounded w-full mb-2 animate-pulse"></div>
              <div className="h-4 bg-gray-600/30 rounded w-4/5 mx-auto mb-2 animate-pulse"></div>
              <div className="h-4 bg-gray-600/30 rounded w-3/4 mx-auto animate-pulse"></div>
            </div>
          </div>

          {/* Scoreboards - Skeleton */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-8 w-[95%] sm:w-[90%] mx-auto">
            {Array(6)
              .fill(0)
              .map((_, idx) => (
                <SkeletonScoreboard key={idx} />
              ))}
          </div>
        </div>
      </section>
    );
  }

  const currentStat = stats[currentIndex];
  const slotCount =
    displayPatterns[0]?.length ?? currentStat.best_of + currentStat.best_of;
  const dashRow = Array(slotCount).fill("-");
  const patternsToDisplay = Array.from(
    { length: 6 },
    (_, i) => displayPatterns[i] || dashRow
  );

  const currentYear = new Date().getFullYear();
  const yearsSinceStart = currentYear - START_DATA_COLLECTION_YEAR;

  return (
    <section className={`${className} overflow-hidden`}>
      <div className="mx-auto max-w-none">
        <TitleSection yearsSinceStart={yearsSinceStart} />

        {/* Stats & Nav */}
        <div className="flex justify-center mb-8 sm:mb-12 px-4">
          <div className="max-w-5xl w-full border border-gray-700 rounded-lg px-3 sm:px-6 py-6 sm:py-8 shadow-[0_0_30px_rgba(68,219,94,0.3),inset_0_0_30px_rgba(68,219,94,0.1)] bg-gray-900/50 backdrop-blur-sm">
            <div className="flex items-center justify-between gap-2 sm:gap-4">
              <NavigationButton onClick={goPrev} direction="prev" />

              <div className="flex-1 text-center">
                <StatsDisplay currentStat={currentStat} />

                {/* Dots */}
                <div className="flex items-center justify-center gap-4 sm:gap-8 mt-6 sm:mt-8">
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

              <NavigationButton onClick={goNext} direction="next" />
            </div>
          </div>
        </div>

        {/* Explore Interactively Button */}
        <ExploreButton className="mb-8" />

        {/* Scoreboards Header */}
        <div className="text-center mb-6 sm:mb-8 px-4">
          <h3 className="text-xl sm:text-2xl font-bold text-green-400 mb-2">
            Never-Occurred Scorelines
          </h3>
          <p className="text-sm sm:text-base text-gray-300 max-w-2xl mx-auto">
            Below are examples of score combinations that have never happened in
            professional {currentStat.gender.toLowerCase()}&apos;s best-of-
            {currentStat.best_of} tennis matches. These are just a few of the{" "}
            {currentStat.total_never_occurred.toLocaleString()} missing
            scorelines.
          </p>
        </div>

        {/* Scoreboards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-8 w-[95%] sm:w-[90%] mx-auto mb-8 sm:mb-16">
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
