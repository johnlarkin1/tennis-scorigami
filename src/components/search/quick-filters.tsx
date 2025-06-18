"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { motion } from "framer-motion";
import {
  ArrowRight,
  Calendar,
  Crown,
  Flag,
  History,
  Mountain,
  Sparkles,
  Target,
  TrendingUp,
  Trophy,
  User,
  Users,
} from "lucide-react";

interface QuickFiltersProps {
  onFilterSelect: (query: string) => void;
  currentQuery: string;
}

const keywordExamples = [
  {
    label: "player:Andy Roddick",
    value: "player:#6022:Andy Roddick",
    icon: User,
    description: "Investigate the last American #1",
  },
  {
    label: "tournament:Cincinnati Masters",
    value: "tournament:#51:Cincinnati Masters",
    icon: Trophy,
    description: "Check out the hometown tournament",
  },
  {
    label: "surface:clay",
    value: "surface:#2:clay",
    icon: Mountain,
    description: "Search across the red dirt",
  },
  {
    label: "year:2003",
    value: "year:2003",
    icon: Calendar,
    description: "Last year there was an American #1",
  },
];

const advancedExamples = [
  {
    label:
      "player:Andy Roddick opponent:Roger Federer year:2009 tournament:Wimbledon",
    value:
      "player:#6022:Andy Roddick opponent:#5788:Roger Federer year:2009 tournament:#3:Wimbledon",
    icon: Target,
    description: "This match still haunts Henry and John in their dreams",
  },
  {
    label: "tournament:Cincinnati Masters year:2020-2023",
    value: "tournament:#51:Cincinnati Masters year:2020-2023",
    icon: Flag,
    description: "Best tournament in the world",
  },
  {
    label: "sex:F round:final year:2022",
    value: "sex:F round:#1:final year:2022",
    icon: Crown,
    description: "Bet ya see a good amount of Iga",
  },
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
        staggerChildren: 0.1,
      },
    },
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 },
  };

  // Normalize query for comparison (trim whitespace)
  const normalizedCurrentQuery = currentQuery.trim();

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
            Keyword Search
          </CardTitle>
          <CardDescription className="text-gray-300">
            Use keywords to search players, tournaments, scores, and more
          </CardDescription>
        </CardHeader>
        <CardContent className="relative">
          <div className="space-y-3 mb-4">
            <div className="flex items-center space-x-2 text-sm text-gray-400">
              <History className="w-4 h-4" />
              <span>Try these keyword searches</span>
            </div>
            <motion.div
              variants={container}
              initial="hidden"
              animate="show"
              className="space-y-2"
            >
              {keywordExamples.map((example) => (
                <motion.div key={example.label} variants={item}>
                  <Button
                    type="button"
                    variant="outline"
                    size="lg"
                    className={`w-full justify-between border-gray-600 text-gray-300 hover:bg-green-400/10 hover:border-green-400/50 hover:text-green-400 transition-all duration-300 h-auto p-4 group ${
                      normalizedCurrentQuery ===
                      (example.value || example.label)
                        ? "bg-green-400/10 border-green-400/50 text-green-400"
                        : ""
                    }`}
                    onClick={() =>
                      onFilterSelect(example.value || example.label)
                    }
                  >
                    <div className="flex items-center">
                      <example.icon className="w-4 h-4 mr-3 text-green-400" />
                      <div className="text-left">
                        <code className="text-sm bg-gray-800/50 px-2 py-1 rounded font-mono block mb-1">
                          {example.label}
                        </code>
                        <span className="text-sm text-gray-400">
                          {example.description}
                        </span>
                      </div>
                    </div>
                    <ArrowRight className="w-4 h-4 text-green-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </Button>
                </motion.div>
              ))}
            </motion.div>
          </div>
          <div className="pt-4 border-t border-gray-700/50">
            <p className="text-xs text-gray-500 text-center">
              Type keywords like{" "}
              <code className="bg-gray-800 px-1 rounded">player:</code> and see
              suggestions
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
            Advanced Search
          </CardTitle>
          <CardDescription className="text-gray-300">
            Combine multiple keywords for powerful, specific searches
          </CardDescription>
        </CardHeader>
        <CardContent className="relative">
          <div className="space-y-3 mb-4">
            <div className="flex items-center space-x-2 text-sm text-gray-400">
              <Sparkles className="w-4 h-4" />
              <span>Complex query examples</span>
            </div>
            <motion.div
              variants={container}
              initial="hidden"
              animate="show"
              className="space-y-2"
            >
              {advancedExamples.map((example) => (
                <motion.div key={example.label} variants={item}>
                  <Button
                    type="button"
                    variant="outline"
                    size="lg"
                    className={`w-full justify-start text-left h-auto p-4 border-gray-600 text-gray-300 hover:bg-purple-400/10 hover:border-purple-400/50 hover:text-purple-400 transition-all duration-300 group ${
                      normalizedCurrentQuery ===
                      (example.value || example.label)
                        ? "bg-purple-400/10 border-purple-400/50 text-purple-400"
                        : ""
                    }`}
                    onClick={() =>
                      onFilterSelect(example.value || example.label)
                    }
                  >
                    <div className="w-full">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center">
                          <example.icon className="w-4 h-4 mr-2 text-purple-400" />
                          <code className="text-sm bg-gray-800/50 px-2 py-1 rounded font-mono">
                            {example.label}
                          </code>
                        </div>
                        <ArrowRight className="w-4 h-4 text-purple-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>
                      <div className="text-sm text-gray-400 ml-6">
                        {example.description}
                      </div>
                    </div>
                  </Button>
                </motion.div>
              ))}
            </motion.div>
          </div>
          <div className="pt-4 border-t border-gray-700/50">
            <p className="text-xs text-gray-500 text-center">
              Combine keywords with spaces • Use quotes for exact phrases
            </p>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};
