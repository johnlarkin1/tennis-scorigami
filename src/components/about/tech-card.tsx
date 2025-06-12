import { motion } from "framer-motion";
import React from "react";

export const TechCard: React.FC<{
  icon: React.ReactNode;
  title: string;
  description: React.ReactNode;
}> = ({ icon, title, description }) => (
  <motion.div
    whileHover={{ scale: 1.05 }}
    className="bg-gradient-to-br from-gray-800 to-gray-900 p-5 rounded-xl text-center text-lg hover:from-gray-700 hover:to-gray-800 transition-all min-h-[160px] w-full max-w-[280px]"
  >
    <div className="text-green-400 mb-5 flex justify-center">{icon}</div>
    <h4 className="font-semibold mb-2">{title}</h4>
    <p className="text-md text-gray-400 leading-relaxed">{description}</p>
  </motion.div>
);
