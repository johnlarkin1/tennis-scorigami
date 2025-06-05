"use client";

import { AnimatedPercentageBar } from "@/components/ui/animated-percentage-bar";
import { MatchStat } from "@/types/landing/types";
import FlipNumbers from "react-flip-numbers";

interface StatHighlightCardProps {
  stat: MatchStat;
  categoryTitle: string; // e.g., "Men's 3-Set Matches"
}

export const StatHighlightCard: React.FC<StatHighlightCardProps> = ({
  stat,
  categoryTitle,
}) => {
  const genderDisplay =
    stat.gender.charAt(0).toUpperCase() + stat.gender.slice(1);

  return (
    <div className="bg-gray-800 p-6 rounded-xl shadow-xl hover:shadow-2xl transition-shadow duration-300 flex flex-col">
      <h3 className="text-2xl font-bold text-green-400 mb-4 text-center">
        {categoryTitle}
      </h3>
      <p className="text-gray-300 mb-6 text-center text-sm">
        For {genderDisplay}&apos;s matches of {stat.best_of} set length, there
        are:
      </p>

      <div className="space-y-5 flex-grow">
        <div className="text-center">
          <p className="text-gray-400 text-xs uppercase tracking-wider mb-1">
            Possible Unique Final Scores
          </p>
          <div className="h-12 flex items-center justify-center">
            <FlipNumbers
              height={36}
              width={22}
              color="white"
              background="transparent"
              play
              perspective={500}
              numbers={stat.total_possible.toString()}
            />
          </div>
        </div>

        <div className="text-center">
          <p className="text-gray-400 text-xs uppercase tracking-wider mb-1">
            Unique Final Scores Occurred
          </p>
          <div className="h-12 flex items-center justify-center">
            <FlipNumbers
              height={36}
              width={22}
              color="white"
              background="transparent"
              play
              perspective={500}
              numbers={stat.total_occurred.toString()}
            />
          </div>
        </div>
      </div>

      <div className="mt-auto pt-6">
        <p className="text-gray-400 text-xs uppercase tracking-wider mb-2 text-center">
          Completion Progress
        </p>
        <div className="flex items-center justify-center space-x-3">
          <div className="w-full">
            <AnimatedPercentageBar percentage={stat.completion_pct} />
          </div>
          <div className="text-lg font-semibold text-yellow-400 w-16 text-right">
            {Number(stat.completion_pct).toFixed(2)}%
          </div>
        </div>
      </div>
    </div>
  );
};
