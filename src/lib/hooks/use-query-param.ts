"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { startTransition, useCallback } from "react";

/**
 * React-state-like API but backed by the location bar.
 * Usage: const [q, setQ] = useQueryParam("q");
 */
export function useQueryParam(key: string) {
  const router = useRouter();
  const searchParams = useSearchParams(); // Read-only URLSearchParams
  const pathname = usePathname();

  // Current value in the address bar
  const value = searchParams.get(key) ?? "";

  // Setter ⇒ updates the address bar (no full page reload)
  const setValue = useCallback(
    (next: string, { push = false } = {}) => {
      const currentValue = searchParams.get(key) ?? "";

      // Don't navigate if the value hasn't actually changed
      if (currentValue === next) {
        return;
      }

      const params = new URLSearchParams(searchParams); // clone

      if (next) {
        params.set(key, next);
      } else {
        params.delete(key);
      }

      const url = params.toString()
        ? `${pathname}?${params.toString()}`
        : pathname;

      const navigate = push ? router.push : router.replace;

      // startTransition keeps the UI responsive while we navigate
      startTransition(() => {
        navigate(url, { scroll: false });
      });
    },
    [key, pathname, router, searchParams]
  );

  return [value, setValue] as const;
}
