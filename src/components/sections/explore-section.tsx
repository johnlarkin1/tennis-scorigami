"use client";

import { Button } from "@/components/ui/button";
import { motion, useInView } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { useRef } from "react";

export const ExploreSection = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.2 });

  return (
    <section
      className="py-20 bg-gray-900 relative overflow-hidden"
      id="explore"
    >
      {/* Tennis court lines background decoration */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute left-0 right-0 top-1/4 h-px bg-white"></div>
        <div className="absolute left-0 right-0 top-3/4 h-px bg-white"></div>
        <div className="absolute left-1/4 top-0 bottom-0 w-px bg-white"></div>
        <div className="absolute left-3/4 top-0 bottom-0 w-px bg-white"></div>
        <div className="absolute left-1/2 top-0 bottom-0 w-px bg-white"></div>
        <div className="absolute left-0 right-0 top-1/2 h-px bg-white"></div>
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 40 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 40 }}
          transition={{ duration: 0.8 }}
          className="max-w-5xl mx-auto"
        >
          <div className="bg-gradient-to-r from-gray-800 to-gray-700 rounded-2xl overflow-hidden shadow-2xl">
            <div className="md:flex">
              <div className="md:w-1/2 p-10 md:p-12 flex flex-col justify-center">
                <h2 className="text-3xl md:text-4xl font-bold mb-6 text-white">
                  Dive Into The{" "}
                  <span className="text-green-400">Visualization</span>
                </h2>
                <p className="text-gray-300 mb-8 text-lg">
                  Explore our interactive tree visualization to discover which
                  score combinations have occurred and which remain theoretical.
                  Filter by gender, tournament, and year to uncover patterns and
                  trends.
                </p>
                <div>
                  <Button
                    size="lg"
                    className="bg-green-500 hover:bg-green-600 text-white font-semibold px-8 py-6 text-lg"
                    asChild
                  >
                    <Link href="/explore">Explore Now</Link>
                  </Button>
                </div>
              </div>
              <div className="md:w-1/2 relative">
                <div className="h-64 md:h-full relative">
                  <Image
                    src="/visualization-preview.jpg"
                    alt="Tennis Scorigami Visualization Preview"
                    fill
                    className="object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-l from-transparent to-gray-900 md:to-transparent"></div>
                </div>
              </div>
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-8 mt-16">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={
                  isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }
                }
                transition={{ duration: 0.6, delay: 0.2 + index * 0.1 }}
                className="bg-gray-800 rounded-lg p-6 shadow-lg"
              >
                <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center mb-4">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-bold mb-3">{feature.title}</h3>
                <p className="text-gray-300">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
};

const features = [
  {
    title: "Interactive Tree",
    description:
      "Navigate through possible score combinations with our intuitive tree visualization.",
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className="h-6 w-6 text-white"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z"
        />
      </svg>
    ),
  },
  {
    title: "Advanced Filtering",
    description:
      "Filter by gender, tournament, and year to isolate specific tennis contexts.",
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className="h-6 w-6 text-white"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"
        />
      </svg>
    ),
  },
  {
    title: "Match Details",
    description:
      "View specific matches that have produced each unique score combination.",
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className="h-6 w-6 text-white"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
        />
      </svg>
    ),
  },
];
