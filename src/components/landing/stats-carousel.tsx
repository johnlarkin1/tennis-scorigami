"use client";

import { MatchStat, StatCarouselProps } from "@/types/landing/types";
import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";
import FlipNumbers from "react-flip-numbers";

export const StatsCarousel: React.FC<StatCarouselProps> = ({
  stats,
  isLoading,
  error,
}) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [displayStats, setDisplayStats] = useState<MatchStat[]>([]);

  // Filter stats to only include the categories we want to display
  useEffect(() => {
    if (stats.length > 0) {
      // Order: men's 3-set, men's 5-set, women's 3-set
      const men3Set = stats.find((s) => s.gender === "men" && s.best_of === 3);
      const men5Set = stats.find((s) => s.gender === "men" && s.best_of === 5);
      const women3Set = stats.find(
        (s) => s.gender === "women" && s.best_of === 3
      );

      const filteredStats = [men3Set, men5Set, women3Set].filter(
        Boolean
      ) as MatchStat[];
      setDisplayStats(filteredStats);
    }
  }, [stats]);

  // Auto-rotate through the stats every 6 seconds
  useEffect(() => {
    if (displayStats.length === 0) return;

    const interval = setInterval(() => {
      setActiveIndex((current) => (current + 1) % displayStats.length);
    }, 6000);

    return () => clearInterval(interval);
  }, [displayStats.length]);

  // Get category title based on current stat
  const getCategoryTitle = (stat: MatchStat) => {
    return `${stat.gender.charAt(0).toUpperCase() + stat.gender.slice(1)}'s ${stat.best_of}-Set Matches`;
  };

  if (isLoading) {
    return (
      <section className="py-20 bg-gray-800" id="stats">
        <div className="container mx-auto px-4">
          <div className="flex justify-center items-center h-64">
            <div className="animate-pulse flex space-x-4">
              <div className="rounded-full bg-gray-700 h-12 w-12"></div>
              <div className="flex-1 space-y-4 py-1">
                <div className="h-4 bg-gray-700 rounded w-3/4"></div>
                <div className="space-y-2">
                  <div className="h-4 bg-gray-700 rounded"></div>
                  <div className="h-4 bg-gray-700 rounded w-5/6"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="py-20 bg-gray-800" id="stats">
        <div className="container mx-auto px-4">
          <div className="flex justify-center items-center h-64">
            <div className="text-red-400 text-center">
              <p className="text-xl">Failed to load statistics</p>
              <p className="mt-2">Please try again later</p>
            </div>
          </div>
        </div>
      </section>
    );
  }

  if (displayStats.length === 0) {
    return null;
  }

  const currentStat = displayStats[activeIndex];

  return (
    <section className="py-12 sm:py-20 bg-gray-800" id="stats">
      <div className="container mx-auto px-4">
        <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-center mb-8 sm:mb-12">
          Tennis Scorigami Statistics
        </h2>

        <div className="max-w-4xl mx-auto relative">
          <div className="grid grid-cols-3 gap-2 sm:gap-4 mb-4 sm:mb-6">
            {displayStats.map((stat, index) => (
              <button
                key={`${stat.gender}-${stat.best_of}`}
                onClick={() => setActiveIndex(index)}
                className={`py-2 px-2 sm:px-4 rounded-t-lg font-semibold transition text-sm sm:text-base ${
                  index === activeIndex
                    ? "bg-green-500 text-white"
                    : "bg-gray-700 text-gray-300 hover:bg-gray-600"
                }`}
              >
                <span className="hidden sm:inline">{stat.gender === "men" ? "Men's" : "Women's"} {stat.best_of}-Set</span>
                <span className="sm:hidden">{stat.gender === "men" ? "M" : "W"} {stat.best_of}</span>
              </button>
            ))}
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={`${currentStat.gender}-${currentStat.best_of}`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5 }}
              className="bg-gray-700 rounded-lg p-4 sm:p-8 shadow-xl"
            >
              <h3 className="text-lg sm:text-2xl font-bold text-green-400 mb-4 sm:mb-6 text-center">
                {getCategoryTitle(currentStat)}
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
                <StatCard
                  label="Total Possible Scores"
                  value={currentStat.total_possible}
                  color="blue"
                />
                <StatCard
                  label="Scores That Have Occurred"
                  value={currentStat.total_occurred}
                  color="green"
                />
                <StatCard
                  label="Scores Yet To Happen"
                  value={currentStat.total_never_occurred}
                  color="purple"
                />
              </div>

              <div className="mt-6 sm:mt-8 text-center">
                <h4 className="text-lg sm:text-xl font-semibold mb-2 sm:mb-3">
                  Completion Percentage
                </h4>
                <div className="flex items-center justify-center">
                  <div className="text-3xl sm:text-4xl font-bold text-yellow-400 h-10 sm:h-12 flex items-center">
                    <FlipNumbers
                      height={32}
                      width={20}
                      color="#fcd34d"
                      background="transparent"
                      play
                      numbers={currentStat.completion_pct.toFixed(2)}
                    />
                  </div>
                  <span className="text-3xl sm:text-4xl font-bold text-yellow-400 ml-1">
                    %
                  </span>
                </div>
              </div>

              <div className="w-full bg-gray-600 rounded-full h-3 sm:h-4 mt-3 sm:mt-4">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${currentStat.completion_pct}%` }}
                  transition={{ duration: 1, delay: 0.2 }}
                  className="bg-yellow-400 h-3 sm:h-4 rounded-full"
                ></motion.div>
              </div>
            </motion.div>
          </AnimatePresence>

          <div className="flex justify-center mt-6">
            {displayStats.map((_, index) => (
              <button
                key={index}
                onClick={() => setActiveIndex(index)}
                className={`w-3 h-3 mx-1 rounded-full ${
                  index === activeIndex ? "bg-green-500" : "bg-gray-600"
                }`}
                aria-label={`Go to slide ${index + 1}`}
              ></button>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

interface StatCardProps {
  label: string;
  value: number;
  color: "blue" | "green" | "purple";
}

const StatCard: React.FC<StatCardProps> = ({ label, value, color }) => {
  const bgColor = {
    blue: "bg-blue-900",
    green: "bg-green-900",
    purple: "bg-purple-900",
  };

  const textColor = {
    blue: "#93c5fd", // text-blue-400
    green: "#4ade80", // text-green-400
    purple: "#c084fc", // text-purple-400
  };

  return (
    <div className={`${bgColor[color]} p-4 sm:p-6 rounded-lg text-center`}>
      <h4 className="text-sm sm:text-lg font-semibold mb-2 sm:mb-3">{label}</h4>
      <div className="h-10 sm:h-12 flex items-center justify-center">
        <FlipNumbers
          height={32}
          width={22}
          color={textColor[color]}
          background="transparent"
          play
          numbers={value.toString()}
        />
      </div>
    </div>
  );
};
