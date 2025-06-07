import React from "react";

export const LoadingSpinner: React.FC = () => {
  return (
    <div className="absolute inset-0 z-50 bg-black/40 flex items-center justify-center">
      <svg
        className="animate-spin h-12 w-12 text-gray-300"
        viewBox="0 0 24 24"
      >
        <circle
          className="opacity-25"
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          strokeWidth="4"
          fill="none"
        />
        <path
          className="opacity-75"
          fill="currentColor"
          d="M4 12a8 8 0 018-8v8z"
        />
      </svg>
    </div>
  );
};