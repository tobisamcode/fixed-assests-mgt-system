"use client";

import { useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "./store";
import { toast } from "sonner";

interface UseSessionManagerOptions {
  /** Warning time before expiry in milliseconds (default: 5 minutes) */
  warningBeforeExpiry?: number;
  /** Redirect path after logout (default: "/") */
  redirectPath?: string;
  /** Show warning toast before expiry (default: true) */
  showWarning?: boolean;
}

export const useSessionManager = (options: UseSessionManagerOptions = {}) => {
  const {
    warningBeforeExpiry = 5 * 60 * 1000, // 5 minutes
    redirectPath = "/",
    showWarning = true,
  } = options;

  const router = useRouter();
  const { token, tokenExpiredAt, isAuthenticated, logout } = useAuthStore();
  
  const logoutTimerRef = useRef<NodeJS.Timeout | null>(null);
  const warningTimerRef = useRef<NodeJS.Timeout | null>(null);
  const hasShownWarningRef = useRef(false);

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
      
      router.push(redirectPath);
    },
    [clearTimers, logout, router, redirectPath]
  );

  // Show expiry warning
  const showExpiryWarning = useCallback(
    (remainingMinutes: number) => {
      if (!hasShownWarningRef.current && showWarning) {
        hasShownWarningRef.current = true;
        toast.warning("Session Expiring Soon", {
          description: `Your session will expire in ${remainingMinutes} minute${remainingMinutes !== 1 ? "s" : ""}. Please save your work.`,
          duration: 10000,
        });
      }
    },
    [showWarning]
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
        const remainingMinutes = Math.ceil(warningBeforeExpiry / 60000);
        showExpiryWarning(remainingMinutes);
      }, warningTime);
    } else if (timeUntilExpiry > 60000) {
      // If less than warning time but more than 1 minute, show warning immediately
      const remainingMinutes = Math.ceil(timeUntilExpiry / 60000);
      showExpiryWarning(remainingMinutes);
    }

    // Log session info (for debugging, can be removed in production)
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
    showExpiryWarning,
  ]);

  // Setup timers on mount and when auth state changes
  useEffect(() => {
    setupSessionTimers();

    // Cleanup on unmount
    return () => {
      clearTimers();
    };
  }, [setupSessionTimers, clearTimers]);

  // Handle visibility change (when user returns to tab)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible" && isAuthenticated) {
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
  }, [isAuthenticated, isTokenExpired, handleLogout, setupSessionTimers]);

  // Get remaining session time in a readable format
  const getRemainingTime = useCallback((): string | null => {
    const timeUntilExpiry = getTimeUntilExpiry();
    if (timeUntilExpiry === null || timeUntilExpiry <= 0) return null;

    const hours = Math.floor(timeUntilExpiry / 3600000);
    const minutes = Math.floor((timeUntilExpiry % 3600000) / 60000);
    const seconds = Math.floor((timeUntilExpiry % 60000) / 1000);

    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    } else if (minutes > 0) {
      return `${minutes}m ${seconds}s`;
    } else {
      return `${seconds}s`;
    }
  }, [getTimeUntilExpiry]);

  return {
    isTokenExpired,
    handleLogout,
    getRemainingTime,
    getTimeUntilExpiry,
  };
};
