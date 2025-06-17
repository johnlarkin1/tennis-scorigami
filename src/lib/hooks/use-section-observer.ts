"use client";

import { useEffect, useRef, useCallback } from "react";

export const useSectionObserver = (sectionIds: string[]) => {
  const observerRef = useRef<IntersectionObserver | null>(null);
  const debounceTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastUrlRef = useRef<string>("");

  const updateUrl = useCallback((sectionId: string) => {
    const newUrl = sectionId ? `#${sectionId}` : "";
    if (lastUrlRef.current !== newUrl) {
      lastUrlRef.current = newUrl;
      window.history.replaceState(null, "", newUrl || window.location.pathname);
    }
  }, []);

  const debouncedUpdateUrl = useCallback(
    (sectionId: string) => {
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }

      debounceTimeoutRef.current = setTimeout(() => {
        updateUrl(sectionId);
      }, 150); // 150ms debounce delay
    },
    [updateUrl]
  );

  useEffect(() => {
    // Create intersection observer
    observerRef.current = new IntersectionObserver(
      (entries) => {
        // Find the section that's most in view
        const visibleSections = entries
          .filter(
            (entry) => entry.isIntersecting && entry.intersectionRatio > 0.3
          )
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio);

        if (visibleSections.length > 0) {
          const mostVisible = visibleSections[0];
          const sectionId = mostVisible.target.id;
          debouncedUpdateUrl(sectionId);
        }
      },
      {
        threshold: [0.3, 0.5, 0.7, 0.9],
        rootMargin: "-15% 0px -15% 0px", // Only consider middle 70% of viewport
      }
    );

    // Observe all sections
    sectionIds.forEach((id) => {
      const element = document.getElementById(id);
      if (element && observerRef.current) {
        observerRef.current.observe(element);
      }
    });

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }
    };
  }, [sectionIds, debouncedUpdateUrl]);
};
