import { useAuthStore } from "../store";

export const useAuth = () => {
  const { token, isAuthenticated, isLoading, error, isHydrated } =
    useAuthStore();

  return {
    // State
    token,
    isAuthenticated,
    isLoading,
    error,
    isHydrated,

    // Computed values
    isLoggedIn: isAuthenticated,
  };
};
