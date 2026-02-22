"use client";

import { PageErrorBoundary } from "@/components/layout/page-error-boundary";

export default function AboutError({
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
      label="Page Error"
      title="About Page Error"
      fallbackMessage="Something went wrong loading this page. Please try again."
    />
  );
}
