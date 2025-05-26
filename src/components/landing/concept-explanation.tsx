"use client";

import { SectionDivider } from "@/components/landing/section-divider";
import { motion, useInView } from "framer-motion";
import { useRef } from "react";

export const ConceptExplanation = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.3 });

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: "easeOut" },
    },
  };

  return (
    <section className="bg-gray-900" id="concept">
      <div className="container mx-auto px-4">
        <div className="mx-auto w-3/4">
          <motion.div
            ref={ref}
            variants={containerVariants}
            initial="hidden"
            animate={isInView ? "visible" : "hidden"}
            className="text-center mb-16"
          >
            <motion.h2
              variants={itemVariants}
              className="text-3xl md:text-4xl font-bold mb-6"
            >
              <SectionDivider id="concept-divider" title="What is Tennis Scorigami?" fullWidth />
            </motion.h2>
            <motion.p
              variants={itemVariants}
              className="text-lg text-gray-300 leading-relaxed"
            >
              Tennis Scorigami is the concept of tracking unique score
              combinations that have occurred in professional tennis matches.
              Inspired by Jon Bois&apos;s Football Scorigami, this project explores
              the mathematical possibilities of tennis scoring and documents
              which score patterns have been achieved and which remain
              theoretical.
            </motion.p>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-10">
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate={isInView ? "visible" : "hidden"}
              className="bg-gray-800 rounded-lg p-8 shadow-lg"
            >
              <motion.div variants={itemVariants}>
                <h3 className="text-2xl font-bold text-green-400 mb-4">
                  The Challenge
                </h3>
                <p className="text-gray-300 mb-4">
                  In tennis, a match consists of sets, which are won by the
                  first player to win 6 games (with at least a 2-game lead) or
                  by winning a tiebreak. This creates numerous possible score
                  combinations.
                </p>
                <p className="text-gray-300">
                  Based on our mathematical model, there are 735 possible final
                  score combinations in a best-of-3 match and over 108,000 in a
                  best-of-5 match! Many of these combinations are extremely rare
                  or have never occurred.
                </p>
              </motion.div>
            </motion.div>

            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate={isInView ? "visible" : "hidden"}
              className="bg-gray-800 rounded-lg p-8 shadow-lg"
            >
              <motion.div variants={itemVariants}>
                <h3 className="text-2xl font-bold text-green-400 mb-4">
                  The Visualization
                </h3>
                <p className="text-gray-300 mb-4">
                  Our interactive tree visualization lets you explore all
                  possible tennis score combinations. Green nodes represent
                  scores that have occurred in professional matches, while gray
                  nodes represent scores that are theoretically possible but
                  have never been recorded.
                </p>
                <p className="text-gray-300">
                  You can filter by gender, tournament, and year to see how
                  scoring patterns have evolved over time and across different
                  competitions.
                </p>
              </motion.div>
            </motion.div>
          </div>

          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate={isInView ? "visible" : "hidden"}
            className="mt-16 bg-gray-800 rounded-lg p-8 shadow-lg"
          >
            <motion.div variants={itemVariants}>
              <h3 className="text-2xl font-bold text-green-400 mb-4">
                Interesting Findings
              </h3>
              <ul className="list-disc pl-6 text-gray-300 space-y-3">
                <li>
                  Women&apos;s tennis has a higher completion percentage in best-of-3
                  matches (99.59%) compared to men&apos;s (98.64%).
                </li>
                <li>
                  Only 8.47% of the theoretically possible score combinations in
                  men&apos;s best-of-5 matches have ever occurred.
                </li>
                <li>
                  Some score combinations that seem plausible have never
                  happened in recorded professional tennis history.
                </li>
                <li>
                  Grand Slam tournaments, with their longer format, tend to
                  produce more unique score combinations than other events.
                </li>
              </ul>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};
