import { motion } from "framer-motion";
import FlipNumbers from "react-flip-numbers";

interface GraphLoadingStateProps {
  status: "connecting" | "loading-metadata" | "loading-nodes" | "loading-edges" | "rendering";
  progress: number;
  totalNodes?: number;
  totalEdges?: number;
  loadedNodes?: number;
  loadedEdges?: number;
}

export const GraphLoadingState: React.FC<GraphLoadingStateProps> = ({
  status,
  progress,
  totalNodes,
  totalEdges,
  loadedNodes,
  loadedEdges,
}) => {
  const getStatusMessage = () => {
    switch (status) {
      case "connecting":
        return "Connecting to server...";
      case "loading-metadata":
        return "Loading graph metadata...";
      case "loading-nodes":
        return totalNodes ? `Loading nodes (${loadedNodes ?? 0} of ${totalNodes})` : "Loading nodes...";
      case "loading-edges":
        return totalEdges ? `Loading edges (${loadedEdges ?? 0} of ${totalEdges})` : "Loading edges...";
      case "rendering":
        return "Rendering graph...";
      default:
        return "Loading...";
    }
  };

  const getStatusColor = () => {
    switch (status) {
      case "connecting":
        return "from-blue-600 to-blue-400";
      case "loading-metadata":
        return "from-purple-600 to-purple-400";
      case "loading-nodes":
        return "from-green-600 to-green-400";
      case "loading-edges":
        return "from-yellow-600 to-yellow-400";
      case "rendering":
        return "from-emerald-600 to-emerald-400";
      default:
        return "from-gray-600 to-gray-400";
    }
  };

  const formattedProgress = progress.toFixed(0);
  const digitsCount = formattedProgress.length;
  const digitWidth = 12;
  const totalWidth = digitsCount * digitWidth;

  return (
    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-10">
      <div className="bg-gray-900/95 rounded-2xl p-8 shadow-2xl border border-gray-800/50 max-w-md w-full mx-4">
        {/* Status Message */}
        <motion.h3 
          className="text-white text-lg font-semibold mb-6 text-center"
          key={status}
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          {getStatusMessage()}
        </motion.h3>

        {/* Progress Bar */}
        <div className="mb-4">
          <div className="bg-gray-800/80 rounded-full h-8 relative overflow-hidden border border-gray-700/30">
            <motion.div
              className={`bg-gradient-to-r ${getStatusColor()} h-full rounded-full relative`}
              initial={{ width: "0%" }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.5, ease: "easeOut" }}
            >
              {/* Animated shimmer effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-shimmer" />
            </motion.div>
            
            {/* Progress Percentage */}
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-white font-semibold text-sm flex items-center drop-shadow-md">
                <div style={{ width: `${totalWidth}px` }}>
                  <FlipNumbers
                    height={16}
                    width={digitWidth}
                    color="#ffffff"
                    background="transparent"
                    play
                    numbers={formattedProgress}
                  />
                </div>
                <span className="ml-1">%</span>
              </span>
            </div>
          </div>
        </div>

        {/* Metadata Stats */}
        {(totalNodes || totalEdges) && (
          <motion.div 
            className="grid grid-cols-2 gap-4 mt-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            {totalNodes && (
              <div className="bg-gray-800/40 rounded-lg p-3 border border-gray-700/20">
                <p className="text-gray-400 text-xs font-medium mb-1">Total Nodes</p>
                <p className="text-white text-lg font-bold">{totalNodes.toLocaleString()}</p>
              </div>
            )}
            {totalEdges && (
              <div className="bg-gray-800/40 rounded-lg p-3 border border-gray-700/20">
                <p className="text-gray-400 text-xs font-medium mb-1">Total Edges</p>
                <p className="text-white text-lg font-bold">{totalEdges.toLocaleString()}</p>
              </div>
            )}
          </motion.div>
        )}

        {/* Loading spinner animation */}
        <div className="flex justify-center mt-6">
          <div className="relative">
            <div className="w-12 h-12 border-4 border-gray-700 rounded-full" />
            <motion.div 
              className="absolute inset-0 w-12 h-12 border-4 border-transparent border-t-white rounded-full"
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};