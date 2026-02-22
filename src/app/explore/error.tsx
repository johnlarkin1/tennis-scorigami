"use client";

import { PageErrorBoundary } from "@/components/layout/page-error-boundary";

export default function ExploreError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <PageErrorBoundary
      error={error}
      reset={reset}
      label="Visualization Error"
      title="Graph Failed to Load"
      fallbackMessage="Something went wrong loading the graph visualization. Please try again."
    />
  );
}
