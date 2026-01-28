"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { useEffect, useCallback, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/features/auth";
import { toast } from "sonner";

// Session Manager Component
function SessionManager() {
  const router = useRouter();
  const { token, tokenExpiredAt, isAuthenticated, logout, isHydrated } =
    useAuthStore();

  const logoutTimerRef = useRef<NodeJS.Timeout | null>(null);
  const warningTimerRef = useRef<NodeJS.Timeout | null>(null);
  const hasShownWarningRef = useRef(false);

  // Warning time before expiry (5 minutes)
  const warningBeforeExpiry = 5 * 60 * 1000;

  // Clear all timers
  const clearTimers = useCallback(() => {
    if (logoutTimerRef.current) {
      clearTimeout(logoutTimerRef.current);
      logoutTimerRef.current = null;
    }
    if (warningTimerRef.current) {
      clearTimeout(warningTimerRef.current);
      warningTimerRef.current = null;
    }
  }, []);

  // Handle logout
  const handleLogout = useCallback(
    (reason: "expired" | "manual" = "expired") => {
      clearTimers();
      logout();

      if (reason === "expired") {
        toast.error("Session Expired", {
          description: "Your session has expired. Please log in again.",
          duration: 5000,
        });
      }

      router.push("/");
    },
    [clearTimers, logout, router]
  );

  // Calculate time until expiry
  const getTimeUntilExpiry = useCallback((): number | null => {
    if (!tokenExpiredAt) return null;

    const expiryTime = new Date(tokenExpiredAt).getTime();
    const now = Date.now();
    return expiryTime - now;
  }, [tokenExpiredAt]);

  // Check if token is expired
  const isTokenExpired = useCallback((): boolean => {
    const timeUntilExpiry = getTimeUntilExpiry();
    if (timeUntilExpiry === null) return false;
    return timeUntilExpiry <= 0;
  }, [getTimeUntilExpiry]);

  // Setup session timers
  const setupSessionTimers = useCallback(() => {
    clearTimers();
    hasShownWarningRef.current = false;

    if (!isAuthenticated || !token || !tokenExpiredAt) {
      return;
    }

    const timeUntilExpiry = getTimeUntilExpiry();

    if (timeUntilExpiry === null) {
      return;
    }

    // If already expired, logout immediately
    if (timeUntilExpiry <= 0) {
      handleLogout("expired");
      return;
    }

    // Set logout timer
    logoutTimerRef.current = setTimeout(() => {
      handleLogout("expired");
    }, timeUntilExpiry);

    // Set warning timer (if there's enough time)
    if (timeUntilExpiry > warningBeforeExpiry) {
      const warningTime = timeUntilExpiry - warningBeforeExpiry;
      warningTimerRef.current = setTimeout(() => {
        if (!hasShownWarningRef.current) {
          hasShownWarningRef.current = true;
          const remainingMinutes = Math.ceil(warningBeforeExpiry / 60000);
          toast.warning("Session Expiring Soon", {
            description: `Your session will expire in ${remainingMinutes} minute${remainingMinutes !== 1 ? "s" : ""}. Please save your work.`,
            duration: 10000,
          });
        }
      }, warningTime);
    } else if (timeUntilExpiry > 60000 && !hasShownWarningRef.current) {
      // If less than warning time but more than 1 minute, show warning immediately
      hasShownWarningRef.current = true;
      const remainingMinutes = Math.ceil(timeUntilExpiry / 60000);
      toast.warning("Session Expiring Soon", {
        description: `Your session will expire in ${remainingMinutes} minute${remainingMinutes !== 1 ? "s" : ""}. Please save your work.`,
        duration: 10000,
      });
    }

    // Log session info (for debugging)
    if (process.env.NODE_ENV === "development") {
      const expiryDate = new Date(tokenExpiredAt);
      console.log(
        `[Session] Token expires at: ${expiryDate.toLocaleString()} (in ${Math.round(timeUntilExpiry / 60000)} minutes)`
      );
    }
  }, [
    clearTimers,
    isAuthenticated,
    token,
    tokenExpiredAt,
    getTimeUntilExpiry,
    handleLogout,
    warningBeforeExpiry,
  ]);

  // Setup timers on mount and when auth state changes
  useEffect(() => {
    if (isHydrated) {
      setupSessionTimers();
    }

    return () => {
      clearTimers();
    };
  }, [isHydrated, setupSessionTimers, clearTimers]);

  // Handle visibility change (when user returns to tab)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible" && isAuthenticated && isHydrated) {
        // Check if token expired while tab was hidden
        if (isTokenExpired()) {
          handleLogout("expired");
        } else {
          // Reset timers when tab becomes visible
          setupSessionTimers();
        }
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [isAuthenticated, isHydrated, isTokenExpired, handleLogout, setupSessionTimers]);

  // Check token on initial hydration
  useEffect(() => {
    if (isHydrated && isAuthenticated && isTokenExpired()) {
      handleLogout("expired");
    }
  }, [isHydrated, isAuthenticated, isTokenExpired, handleLogout]);

  return null;
}

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

  return (
    <QueryClientProvider client={queryClient}>
      <SessionManager />
      {children}
      <ReactQueryDevtools initialIsOpen={false} buttonPosition="bottom-right" />
    </QueryClientProvider>
  );
}
