"use client";

import { PageErrorBoundary } from "@/components/layout/page-error-boundary";

export default function SearchError({
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
      label="Search Error"
      title="Search Unavailable"
      fallbackMessage="Something went wrong with the search. Please try again."
    />
  );
}
