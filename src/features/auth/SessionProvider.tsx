"use client";

import { useEffect } from "react";
import { useSessionManager } from "./useSessionManager";
import { useAuthStore } from "./store";

interface SessionProviderProps {
  children: React.ReactNode;
  /** Warning time before expiry in milliseconds (default: 5 minutes) */
  warningBeforeExpiry?: number;
  /** Redirect path after logout (default: "/") */
  redirectPath?: string;
  /** Show warning toast before expiry (default: true) */
  showWarning?: boolean;
}

export const SessionProvider = ({
  children,
  warningBeforeExpiry = 5 * 60 * 1000,
  redirectPath = "/",
  showWarning = true,
}: SessionProviderProps) => {
  const { isAuthenticated, isHydrated } = useAuthStore();

  // Only use session manager when authenticated
  const sessionManager = useSessionManager({
    warningBeforeExpiry,
    redirectPath,
    showWarning,
  });

  // Check token on initial hydration
  useEffect(() => {
    if (isHydrated && isAuthenticated) {
      // Check if token is already expired when app loads
      if (sessionManager.isTokenExpired()) {
        sessionManager.handleLogout("expired");
      }
    }
  }, [isHydrated, isAuthenticated, sessionManager]);

  return <>{children}</>;
};
