export function LoadingSkeletons() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="space-y-2">
          <div className="h-6 bg-gray-700 rounded w-48 animate-pulse" />
          <div className="h-4 bg-gray-700 rounded w-64 animate-pulse" />
        </div>
        <div className="flex gap-2">
          <div className="h-10 w-32 bg-gray-700 rounded animate-pulse" />
          <div className="h-10 w-32 bg-gray-700 rounded animate-pulse" />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            className="bg-gray-800/30 backdrop-blur-sm border border-gray-700 rounded-xl p-6 animate-pulse"
          >
            <div className="flex justify-between items-start mb-4">
              <div className="space-y-2">
                <div className="h-4 bg-gray-700 rounded w-32" />
                <div className="h-3 bg-gray-700 rounded w-24" />
              </div>
              <div className="h-6 w-20 bg-gray-700 rounded" />
            </div>

            <div className="space-y-3 mb-4">
              <div className="h-12 bg-gray-700 rounded" />
              <div className="h-12 bg-gray-700 rounded" />
            </div>

            <div className="h-16 bg-gray-700 rounded mb-4" />

            <div className="flex justify-between">
              <div className="h-3 bg-gray-700 rounded w-16" />
              <div className="h-3 bg-gray-700 rounded w-16" />
              <div className="h-3 bg-gray-700 rounded w-16" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
