"use client";

import { SectionDivider } from "@/components/landing/section-divider";
import { StatHighlightCard } from "@/components/landing/stat-highlight-card";
import { MatchStat } from "@/types/landing/types";
import { motion } from "framer-motion";

interface KeyStatsSectionProps {
  stats: MatchStat[];
  isLoading: boolean;
  error: string | null;
}

const SkeletonCard = () => (
  <div className="bg-gray-800 p-6 rounded-xl shadow-xl animate-pulse">
    <div className="h-8 bg-gray-700 rounded w-3/4 mx-auto mb-4"></div>
    <div className="h-4 bg-gray-700 rounded w-full mx-auto mb-6"></div>
    <div className="space-y-5 mb-6">
      <div>
        <div className="h-3 bg-gray-700 rounded w-1/2 mx-auto mb-1"></div>
        <div className="h-10 bg-gray-700 rounded w-1/4 mx-auto"></div>
      </div>
      <div>
        <div className="h-3 bg-gray-700 rounded w-1/2 mx-auto mb-1"></div>
        <div className="h-10 bg-gray-700 rounded w-1/4 mx-auto"></div>
      </div>
    </div>
    <div>
      <div className="h-3 bg-gray-700 rounded w-1/3 mx-auto mb-2"></div>
      <div className="flex items-center space-x-3">
        <div className="h-3 bg-gray-700 rounded-full w-full"></div>
        <div className="h-6 bg-gray-700 rounded w-16"></div>
      </div>
    </div>
  </div>
);

export const KeyStatsSection: React.FC<KeyStatsSectionProps> = ({
  stats,
  isLoading,
  error,
}) => {
  if (isLoading) {
    return (
      <section className="py-16 bg-gray-900" id="stats">
        <SectionDivider
          id="key-stats-divider"
          title="Key Scorigami Statistics"
        />
        <div className="container mx-auto px-4 pt-8">
          <p className="text-center text-lg text-gray-400 mb-12 max-w-2xl mx-auto">
            Crunching the numbers on how many unique scorelines have been
            realized in professional tennis...
          </p>
          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
          </div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="py-16 bg-gray-900" id="stats">
        <SectionDivider
          id="key-stats-error-divider"
          title="Key Scorigami Statistics"
        />
        <div className="container mx-auto px-4 pt-8 text-center">
          <p className="text-red-400 text-xl">Failed to load statistics.</p>
          <p className="text-gray-500 mt-2">
            Please try refreshing the page or check back later.
          </p>
        </div>
      </section>
    );
  }

  const men3Set = stats.find((s) => s.gender === "men" && s.best_of === 3);
  const men5Set = stats.find((s) => s.gender === "men" && s.best_of === 5);
  const women3Set = stats.find((s) => s.gender === "women" && s.best_of === 3);

  const displayableStats = [
    { stat: men3Set, title: "Men's 3-Set Matches" },
    { stat: men5Set, title: "Men's 5-Set Matches" },
    { stat: women3Set, title: "Women's 3-Set Matches" },
  ].filter((item) => item.stat);

  if (displayableStats.length === 0) {
    return (
      <section className="py-16 bg-gray-900" id="stats">
        <SectionDivider
          id="key-stats-nodata-divider"
          title="Key Scorigami Statistics"
        />
        <div className="container mx-auto px-4 pt-8 text-center">
          <p className="text-gray-400 text-xl">
            No statistics available at the moment.
          </p>
        </div>
      </section>
    );
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5, ease: "easeOut" },
    },
  };

  return (
    <section className="pt-4 pb-16 bg-gray-900" id="stats">
      <SectionDivider
        id="key-stats-title-divider"
        title="Key Scorigami Statistics"
      />
      <div className="container mx-auto px-4 pt-8">
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center text-lg text-gray-400 mb-12 max-w-2xl mx-auto"
        >
          A quick overview of how many unique scorelines have been realized in
          professional tennis across different formats.
        </motion.p>

        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
        >
          {displayableStats.map(({ stat, title }, index) =>
            stat ? (
              <motion.div
                key={`${stat.gender}-${stat.best_of}`}
                variants={itemVariants}
              >
                <StatHighlightCard stat={stat} categoryTitle={title} />
              </motion.div>
            ) : null
          )}
        </motion.div>
      </div>
    </section>
  );
};
