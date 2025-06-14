"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { motion } from "framer-motion";
import { Users, TrendingUp, Sparkles, History } from "lucide-react";

interface QuickFiltersProps {
  onFilterSelect: (query: string) => void;
  currentQuery: string;
}

const playerExamples = [
  { label: "Roger Federer", icon: Sparkles },
  { label: "Novak Djokovic", icon: Sparkles },
  { label: "Rafael Nadal", icon: Sparkles },
  { label: "Serena Williams", icon: Sparkles },
];

const scoreExamples = [
  { label: "6-0 6-0", icon: TrendingUp },
  { label: "7-6 6-4", icon: TrendingUp },
  { label: "6-4 6-3", icon: TrendingUp },
  { label: "6-1 6-1", icon: TrendingUp },
];

export const QuickFilters: React.FC<QuickFiltersProps> = ({
  onFilterSelect,
  currentQuery,
}) => {
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      className="grid md:grid-cols-2 gap-6"
    >
      <Card className="bg-gray-900/40 backdrop-blur-xl border-gray-700/50 shadow-2xl overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-400/5 to-transparent" />
        <CardHeader className="relative">
          <CardTitle className="flex items-center text-blue-400">
            <div className="p-2 bg-blue-400/10 rounded-lg mr-3">
              <Users className="w-5 h-5" />
            </div>
            Player Search
          </CardTitle>
          <CardDescription className="text-gray-300">
            Search for professional tennis players to explore their match history
          </CardDescription>
        </CardHeader>
        <CardContent className="relative">
          <div className="space-y-3 mb-4">
            <div className="flex items-center space-x-2 text-sm text-gray-400">
              <History className="w-4 h-4" />
              <span>Recent searches & popular players</span>
            </div>
            <motion.div 
              variants={container}
              initial="hidden"
              animate="show"
              className="grid grid-cols-2 gap-2"
            >
              {playerExamples.map((example) => (
                <motion.div key={example.label} variants={item}>
                  <Button
                    variant="outline"
                    size="sm"
                    className={`w-full border-gray-600 text-gray-300 hover:bg-blue-400/10 hover:border-blue-400/50 hover:text-blue-400 transition-all duration-300 ${
                      currentQuery === example.label ? 'bg-blue-400/10 border-blue-400/50 text-blue-400' : ''
                    }`}
                    onClick={() => onFilterSelect(example.label)}
                  >
                    <example.icon className="w-3 h-3 mr-1" />
                    <span className="truncate">{example.label}</span>
                  </Button>
                </motion.div>
              ))}
            </motion.div>
          </div>
          <div className="pt-4 border-t border-gray-700/50">
            <p className="text-xs text-gray-500 text-center">
              Search by full or partial name • Case insensitive
            </p>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-gray-900/40 backdrop-blur-xl border-gray-700/50 shadow-2xl overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-400/5 to-transparent" />
        <CardHeader className="relative">
          <CardTitle className="flex items-center text-purple-400">
            <div className="p-2 bg-purple-400/10 rounded-lg mr-3">
              <TrendingUp className="w-5 h-5" />
            </div>
            Score Search
          </CardTitle>
          <CardDescription className="text-gray-300">
            Find matches with specific scorelines and explore tennis scorigami
          </CardDescription>
        </CardHeader>
        <CardContent className="relative">
          <div className="space-y-3 mb-4">
            <div className="flex items-center space-x-2 text-sm text-gray-400">
              <Sparkles className="w-4 h-4" />
              <span>Popular & rare scorelines</span>
            </div>
            <motion.div 
              variants={container}
              initial="hidden"
              animate="show"
              className="grid grid-cols-2 gap-2"
            >
              {scoreExamples.map((example) => (
                <motion.div key={example.label} variants={item}>
                  <Button
                    variant="outline"
                    size="sm"
                    className={`w-full border-gray-600 text-gray-300 hover:bg-purple-400/10 hover:border-purple-400/50 hover:text-purple-400 transition-all duration-300 ${
                      currentQuery === example.label ? 'bg-purple-400/10 border-purple-400/50 text-purple-400' : ''
                    }`}
                    onClick={() => onFilterSelect(example.label)}
                  >
                    <example.icon className="w-3 h-3 mr-1" />
                    {example.label}
                  </Button>
                </motion.div>
              ))}
            </motion.div>
          </div>
          <div className="pt-4 border-t border-gray-700/50">
            <p className="text-xs text-gray-500 text-center">
              Format: &ldquo;6-4 6-3&rdquo; • Partial patterns work too
            </p>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};