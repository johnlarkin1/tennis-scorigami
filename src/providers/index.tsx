"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ThemeProvider as NextThemesProvider, ThemeProviderProps } from "next-themes";
import { useState } from "react";

type ProvidersProps = Omit<ThemeProviderProps, "children"> & {
  children: React.ReactNode;
};

export function Providers({ children, ...themeProps }: ProvidersProps) {
  const [queryClient] = useState(() => new QueryClient());

  return (
    <QueryClientProvider client={queryClient}>
      <NextThemesProvider {...themeProps}>{children}</NextThemesProvider>
    </QueryClientProvider>
  );
}
