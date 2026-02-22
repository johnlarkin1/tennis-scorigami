"use client";

import Link from "next/link";
import { useEffect } from "react";

interface PageErrorBoundaryProps {
  error: Error & { digest?: string };
  reset: () => void;
  label?: string;
  title: string;
  fallbackMessage?: string;
}

export function PageErrorBoundary({
  error,
  reset,
  label = "Error",
  title,
  fallbackMessage = "Something went wrong. Please try again.",
}: PageErrorBoundaryProps) {
  useEffect(() => {
    console.error(`[${label}]`, error);
  }, [error, label]);

  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center justify-center px-6">
      <div className="text-center max-w-lg">
        <p className="text-red-400 text-lg font-semibold mb-2">{label}</p>
        <h1 className="text-4xl md:text-5xl font-bold mb-4">{title}</h1>
        <p className="text-lg text-gray-400 mb-8">
          {error.message || fallbackMessage}
        </p>
        <div className="flex items-center justify-center gap-4">
          <button
            onClick={reset}
            className="inline-flex items-center gap-2 bg-green-500 hover:bg-green-600 text-black font-bold px-6 py-3 rounded-full transition-colors"
          >
            Try Again
          </button>
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
          >
            Go Home
          </Link>
        </div>
      </div>
    </div>
  );
}
