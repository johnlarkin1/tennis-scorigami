"use client";

import { motion } from "framer-motion";

export const ForceGraphSection = () => {
  return (
    <section id="force-graph" className="min-h-screen bg-gray-900 py-20">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="max-w-4xl mx-auto text-center mb-12"
        >
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Interactive 3D Force Graph
          </h2>
          <p className="text-lg text-gray-300">
            Explore the relationships between tennis scores in an immersive 3D
            visualization. Click and drag to rotate, scroll to zoom, and click
            on nodes to see match details.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          viewport={{ once: true }}
          className="bg-gray-800 rounded-lg shadow-2xl overflow-hidden"
          style={{ height: "70vh", minHeight: "500px" }}
        >
          {/* 3D Force Graph will be added here */}
          <div className="w-full h-full flex items-center justify-center">
            <p className="text-gray-400 text-xl">
              3D Force Graph Coming Soon...
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  );
};
