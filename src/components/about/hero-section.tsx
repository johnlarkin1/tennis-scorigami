import { motion } from "framer-motion";
import { ChevronRight } from "lucide-react";
import Image from "next/image";
import React from "react";

export const HeroSection: React.FC = () => {
  return (
    <section className="relative h-[60vh] overflow-hidden">
      <Image
        src="/western-and-southern2.avif"
        alt="Tennis Court"
        fill
        placeholder="blur"
        className="object-cover"
        priority
      />
      <div className="absolute inset-0 bg-gradient-to-b from-gray-900/70 via-gray-900/50 to-gray-900" />

      <div className="absolute inset-0 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center max-w-4xl px-6"
        >
          <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
            About Tennis Scorigami
          </h1>
          <p className="text-xl md:text-2xl text-gray-200 font-light">
            Discovering the undiscovered in professional tennis
          </p>
        </motion.div>
      </div>

      {/* Animated scroll indicator */}
      <motion.div
        className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
        animate={{ y: [0, 10, 0] }}
        transition={{ repeat: Infinity, duration: 2 }}
      >
        <ChevronRight className="w-8 h-8 rotate-90 text-gray-400" />
      </motion.div>
    </section>
  );
};
