"use client";

import { PageErrorBoundary } from "@/components/layout/page-error-boundary";

export default function Error({
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
      title="Something Went Wrong"
      fallbackMessage="An unexpected error occurred. Please try again."
    />
  );
}
