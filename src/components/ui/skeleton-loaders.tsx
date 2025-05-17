/**
 * Skeleton component for the flip number counter
 */
export const SkeletonFlipNumber = () => (
  <div className="inline-flex items-center h-9 px-4 bg-gradient-to-r from-green-500/10 to-green-400/10 rounded-lg justify-center animate-pulse">
    <div className="h-5 w-full bg-gray-600/30 rounded"></div>
  </div>
);

/**
 * Skeleton component for the format selection dots
 */
export const SkeletonDot = () => (
  <div className="flex flex-col items-center gap-2">
    <div className="w-4 h-4 rounded-full bg-gray-600/50 animate-pulse"></div>
    <div className="h-4 w-12 bg-gray-600/30 rounded animate-pulse"></div>
  </div>
);

/**
 * Skeleton component for the tennis scoreboard
 */
export const SkeletonScoreboard = () => (
  <div className="flex flex-col">
    <div className="bg-gray-800/50 text-center py-2 rounded-t-lg border-t border-l border-r border-green-600/50">
      <div className="h-5 w-36 mx-auto bg-gray-600/30 rounded animate-pulse"></div>
    </div>
    <div className="w-full bg-black border-2 border-green-600/50 rounded p-4">
      {/* HEADER */}
      <div
        className="grid items-center gap-2 mb-3"
        style={{ gridTemplateColumns: "auto repeat(5, minmax(0, 1fr))" }}
      >
        <div className="invisible p-2">placeholder</div>
        {Array(5)
          .fill(0)
          .map((_, i) => (
            <div
              key={i}
              className="w-full h-12 flex items-center justify-center"
            >
              <div className="h-4 w-12 bg-gray-600/30 rounded animate-pulse"></div>
            </div>
          ))}
      </div>

      {/* PLAYER ROWS */}
      {Array(2)
        .fill(0)
        .map((_, pIdx) => (
          <div
            key={pIdx}
            className="grid items-center gap-2 mb-4"
            style={{ gridTemplateColumns: "auto repeat(5, minmax(0, 1fr))" }}
          >
            <div className="p-2">
              <div className="h-5 w-16 bg-gray-600/30 rounded animate-pulse"></div>
            </div>
            {Array(5)
              .fill(0)
              .map((_, i) => (
                <div
                  key={i}
                  className="w-full h-12 bg-green-900/30 border border-green-500/30 rounded flex items-center justify-center"
                >
                  <div className="h-6 w-6 bg-gray-600/30 rounded animate-pulse"></div>
                </div>
              ))}
          </div>
        ))}
    </div>
  </div>
);
