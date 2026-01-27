"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { useEffect, useMemo, useRef, useState } from "react";
import { useAuthStore } from "@/features/auth";
import { toast } from "sonner";

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000, // 1 minute
            gcTime: 10 * 60 * 1000, // 10 minutes (formerly cacheTime)
            retry: 1,
            refetchOnWindowFocus: false,
          },
        },
      })
  );

  // Auto-logout when token expires
  const { tokenExpiredAt, isAuthenticated, logout, isHydrated } =
    useAuthStore();
  const timeoutRef = useRef<number | null>(null);

  const msUntilExpiry = useMemo(() => {
    if (!tokenExpiredAt) return null;
    const expiry = new Date(tokenExpiredAt).getTime();
    const now = Date.now();
    return Math.max(0, expiry - now);
  }, [tokenExpiredAt]);

  useEffect(() => {
    if (!isHydrated) return;
    if (timeoutRef.current) {
      window.clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    if (isAuthenticated && msUntilExpiry !== null) {
      timeoutRef.current = window.setTimeout(() => {
        toast.info("Session expired", { description: "Please sign in again." });
        logout();
      }, msUntilExpiry);
    }
    return () => {
      if (timeoutRef.current) window.clearTimeout(timeoutRef.current);
    };
  }, [isAuthenticated, msUntilExpiry, logout, isHydrated]);

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      <ReactQueryDevtools initialIsOpen={false} buttonPosition="bottom-right" />
    </QueryClientProvider>
  );
}
