"use client";

import { motion } from "framer-motion";
import { Calendar, ChevronDown, Target, Trophy, Users } from "lucide-react";
import { QuickFilters } from "./quick-filters";

interface SearchLandingProps {
  onQuerySelect: (query: string) => void;
  currentQuery: string;
}

const stats = [
  {
    icon: Users,
    label: "Players",
    count: "100K+",
    description: "Professional players",
  },
  {
    icon: Trophy,
    label: "Tournaments",
    count: "2K+",
    description: "Events & competitions",
  },
  {
    icon: Calendar,
    label: "Years",
    count: "50+",
    description: "Years of data",
  },
  {
    icon: Target,
    label: "Matches",
    count: "300K+",
    description: "Total matches",
  },
];

export function SearchLanding({
  onQuerySelect,
  currentQuery,
}: SearchLandingProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="space-y-12"
    >
      {/* Statistics Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 max-w-4xl mx-auto mb-12">
        {stats.map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 + index * 0.1 }}
            className="bg-gray-800/30 backdrop-blur-sm border border-gray-700 rounded-lg p-4 text-center hover:border-green-500/30 transition-colors"
          >
            <stat.icon className="h-8 w-8 text-green-400 mx-auto mb-3" />
            <div className="text-2xl font-bold text-white mb-1">
              {stat.count}
            </div>
            <div className="text-sm font-medium text-gray-300 mb-1">
              {stat.label}
            </div>
            <div className="text-xs text-gray-400">{stat.description}</div>
          </motion.div>
        ))}
      </div>

      {/* Call to Action */}
      <div className="text-center">
        <p className="text-green-400 font-semibold text-lg flex items-center justify-center">
          <ChevronDown className="w-5 h-5 mr-2" />
          Click any search suggestion below to get started!
        </p>
      </div>

      {/* Search Filters */}
      <QuickFilters
        onFilterSelect={onQuerySelect}
        currentQuery={currentQuery}
      />
    </motion.div>
  );
}
