"use client";

import { motion } from "framer-motion";

type AnimatedPercentageBarProps = {
  percentage: number;
  barColor?: string;
  trackColor?: string;
  height?: string;
};

export const AnimatedPercentageBar: React.FC<AnimatedPercentageBarProps> = ({
  percentage,
  barColor = "bg-green-500",
  trackColor = "bg-gray-700",
  height = "h-3",
}) => {
  return (
    <div className={`w-full ${trackColor} rounded-full ${height}`}>
      <motion.div
        className={`${barColor} ${height} rounded-full`}
        initial={{ width: 0 }}
        animate={{ width: `${percentage}%` }}
        transition={{ duration: 1, ease: "easeInOut", delay: 0.2 }}
      />
    </div>
  );
};
