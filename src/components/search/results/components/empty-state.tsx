"use client";

import { motion } from "framer-motion";
import { Calendar, Target, Trophy, Users } from "lucide-react";

export function EmptyState() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="text-center py-16"
    >
      <div className="mb-8">
        <Target className="h-20 w-20 text-gray-600 mx-auto mb-6" />
        <h3 className="text-2xl font-semibold text-gray-300 mb-3">
          Ready to Explore Tennis History
        </h3>
        <p className="text-gray-400 max-w-2xl mx-auto text-lg">
          Use the search bar above to dive into our comprehensive database of
          professional tennis matches. Discover rare scorelines, analyze player
          performance, and explore the evolution of the game.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
        {[
          {
            icon: Users,
            label: "Players",
            count: "100K+",
            description: "Professional players",
            example: "Try: player:Andy Roddick",
          },
          {
            icon: Trophy,
            label: "Tournaments",
            count: "2K+",
            description: "Events & competitions",
            example: "Try: tournament:Cincinnati Masters",
          },
          {
            icon: Calendar,
            label: "Years",
            count: "50+",
            description: "Years of data",
            example: "Try: year:2023",
          },
          {
            icon: Target,
            label: "Matches",
            count: "300k+",
            description: "Total matches",
            example: "Try: score:6-4,6-3",
          },
        ].map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 + index * 0.1 }}
            className="bg-gray-800/30 backdrop-blur-sm border border-gray-700 rounded-xl p-6 text-center hover:border-green-500/30 transition-colors"
          >
            <stat.icon className="h-10 w-10 text-green-400 mx-auto mb-4" />
            <div className="text-3xl font-bold text-white mb-2">
              {stat.count}
            </div>
            <div className="text-sm font-medium text-gray-300 mb-2">
              {stat.label}
            </div>
            <div className="text-xs text-gray-400 mb-3">{stat.description}</div>
            <div className="text-xs text-green-400 font-mono bg-gray-900/50 rounded px-2 py-1">
              {stat.example}
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}
