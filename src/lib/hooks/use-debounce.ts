"use client";

import { useEffect, useState } from "react";

/**
 * Debounces a value with a given delay.
 * Usage: const debouncedValue = useDebounce(value, 300);
 */
export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    // Don't set timer if value hasn't changed
    if (debouncedValue === value) {
      return;
    }

    const timer = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(timer);
    };
  }, [value, delay, debouncedValue]);

  return debouncedValue;
}
