"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  ThemeProvider as NextThemesProvider,
  ThemeProviderProps,
} from "next-themes";
import { useState } from "react";

type ProvidersProps = Omit<ThemeProviderProps, "children"> & {
  children: React.ReactNode;
};

export function Providers({ children, ...themeProps }: ProvidersProps) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 5 * 60 * 1000, // 5 minutes
            gcTime: 10 * 60 * 1000, // 10 minutes
            retry: 1,
            refetchOnWindowFocus: false,
          },
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>
      <NextThemesProvider {...themeProps}>{children}</NextThemesProvider>
    </QueryClientProvider>
  );
}
