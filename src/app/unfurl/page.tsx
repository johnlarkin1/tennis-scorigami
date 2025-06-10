"use client";

import { GraphProvider } from "@/providers/graph-provider";
import { useGraphData } from "@/lib/hooks/use-graph-data";
import { motion } from "framer-motion";
import Link from "next/link";
import React from "react";

// Dynamic imports for development-only components
const UnfurlForceGraph3D = React.lazy(() => import("@/components/graph/unfurl-force-graph-3d"));
const UnfurlSigmaGraph2D = React.lazy(() => import("@/components/graph/unfurl-sigma-graph-2d"));
const UnfurlParticleCanvas = React.lazy(() => import("@/components/ui/unfurl-particle-canvas").then(mod => ({ default: mod.UnfurlParticleCanvas })));

// Component to load real graph data
const GraphDataLoader: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  // This hook will fetch and load real graph data into the context
  useGraphData();
  
  return <>{children}</>;
};

const UnfurlPreviewPage = () => {
  // Prevent access in production
  if (process.env.NODE_ENV === 'production') {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Page Not Available</h1>
          <p className="text-gray-400">This development tool is not available in production.</p>
          <Link href="/" className="text-green-400 hover:text-green-300 mt-4 inline-block">
            Go to Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-900 text-white flex flex-col items-center p-8 gap-8">
      {/* 1. Particle Animation Preview */}
      <div
        className="relative overflow-hidden bg-gradient-to-br from-gray-900 to-black border-b-4 border-green-500 rounded-lg"
        style={{ width: "1200px", height: "630px" }}
      >
        <React.Suspense fallback={<div className="w-full h-full bg-gray-800 flex items-center justify-center text-white">Loading...</div>}>
          <UnfurlParticleCanvas className="w-full h-full" />
        </React.Suspense>
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2">
          <p className="text-lg font-bold text-green-400 font-['Inter']">
            EXPLORE NEVER-PLAYED TENNIS SCORES
          </p>
        </div>
      </div>

      {/* 2. 2D Force Graph Preview */}
      <div
        className="relative overflow-hidden bg-gray-800 border-b-4 border-blue-500 rounded-lg"
        style={{ width: "1200px", height: "630px" }}
      >
        <GraphProvider maxDepth={3}>
          <GraphDataLoader>
            <React.Suspense fallback={<div className="w-full h-full bg-gray-700 flex items-center justify-center text-white">Loading Graph...</div>}>
              <UnfurlSigmaGraph2D />
            </React.Suspense>
          </GraphDataLoader>
        </GraphProvider>
        <div className="absolute top-8 left-8 z-10">
          <h2 className="text-2xl font-bold text-green-400 mb-2">
            Score Tree Visualization
          </h2>
          <p className="text-lg text-green-300">
            Explore tennis match progressions
          </p>
        </div>
        <div className="absolute bottom-8 left-8 z-10">
          <p className="text-sm text-green-400">2D Interactive Graph</p>
        </div>
      </div>

      {/* 3. 3D Force Graph Preview */}
      <div
        className="relative overflow-hidden bg-gray-700 border-b-4 border-purple-500 rounded-lg"
        style={{ width: "1200px", height: "630px" }}
      >
        <GraphProvider maxDepth={3}>
          <GraphDataLoader>
            <React.Suspense fallback={<div className="w-full h-full bg-gray-600 flex items-center justify-center text-white">Loading 3D Graph...</div>}>
              <UnfurlForceGraph3D />
            </React.Suspense>
          </GraphDataLoader>
        </GraphProvider>
        <div className="absolute top-8 left-8 z-10">
          <h2 className="text-2xl font-bold text-green-400 mb-2">
            3D Score Network
          </h2>
          <p className="text-lg text-green-300">
            Immersive tennis data exploration
          </p>
        </div>
        <div className="absolute bottom-8 left-8 z-10">
          <p className="text-sm text-green-400">3D Interactive Visualization</p>
        </div>
      </div>

      {/* 4. About Page Preview */}
      <div
        className="relative overflow-hidden bg-gradient-to-br from-blue-900 to-purple-900 border-b-4 border-yellow-500 rounded-lg"
        style={{ width: "1200px", height: "630px" }}
      >
        <div className="absolute inset-0 flex items-center justify-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1 }}
            className="text-center max-w-4xl px-12"
          >
            <h1 className="text-6xl font-bold mb-8 text-green-400">
              Tennis Scorigami
            </h1>
            <p className="text-2xl text-green-300 mb-6 font-light leading-relaxed">
              Exploring the rarest and most unique scorelines in professional
              tennis history
            </p>
            <div className="grid grid-cols-3 gap-8 mt-12">
              <div className="text-center">
                <div className="text-4xl font-bold text-green-400 mb-2">
                  500k+
                </div>
                <div className="text-lg text-green-300">Matches Analyzed</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-green-400 mb-2">
                  12k+
                </div>
                <div className="text-lg text-green-300">Unique Scores</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-green-400 mb-2">
                  3k+
                </div>
                <div className="text-lg text-green-300">Never Occurred</div>
              </div>
            </div>
          </motion.div>
        </div>
        <div className="absolute bottom-8 right-8 text-right">
          <p className="text-sm text-green-400">Data-Driven Tennis Analysis</p>
        </div>
      </div>
    </div>
  );
};

export default UnfurlPreviewPage;
