import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { AuthorizeLoginResponse } from "./services/api";

interface DepartmentInfo {
  guid: string;
  departmentName: string;
  description: string;
}

interface AuthUser {
  emailAddress: string;
  firstName: string;
  lastName: string;
  fullName: string;
  displayName: string;
  department?: DepartmentInfo | null;
}

interface AuthState {
  token: string | null;
  tokenType?: string;
  tokenIssuedAt?: string;
  tokenExpiredAt?: string;
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isHydrated: boolean;
  rolesAndPermissions: Array<{
    guid: string;
    name: string;
    users: number;
    description?: string;
    permissions?: Array<{
      guid: string;
      name: string;
      description?: string;
      requireChecker?: boolean;
      noOfCheckerRequired?: number;
    }>;
  }> | null;
  setToken: (token: string) => void;
  setAuthData: (
    responseData: AuthorizeLoginResponse["responseData"] | undefined
  ) => void;
  setLoading: (loading: boolean) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      tokenType: undefined,
      tokenIssuedAt: undefined,
      tokenExpiredAt: undefined,
      user: null,
      isAuthenticated: false,
      isLoading: false,
      isHydrated: false,
      rolesAndPermissions: null,
      setToken: (token: string) =>
        set({
          token,
          isAuthenticated: true,
          isLoading: false,
        }),
      setAuthData: (responseData) =>
        set(() => {
          const accessToken = responseData?.auth?.accessToken ?? null;
          const nextUser: AuthUser | null = responseData
            ? {
                emailAddress: responseData.emailAddress ?? "",
                firstName:
                  (responseData as { firstName?: string }).firstName ?? "",
                lastName:
                  (responseData as { lastName?: string }).lastName ?? "",
                fullName:
                  (responseData as { fullName?: string }).fullName ?? "",
                displayName:
                  (responseData as { displayName?: string }).displayName ?? "",
                department:
                  (responseData as { department?: DepartmentInfo })
                    .department ?? null,
              }
            : null;

          return {
            token: accessToken,
            tokenType: responseData?.auth?.type,
            tokenIssuedAt: responseData?.auth?.tokenIssuedAt,
            tokenExpiredAt: responseData?.auth?.tokenExpiredAt,
            user: nextUser,
            rolesAndPermissions:
              (responseData as Record<string, unknown>)?.rolesAndPermissions ??
              null,
            isAuthenticated: Boolean(accessToken),
            isLoading: false,
          } as Partial<AuthState> as AuthState;
        }),
      setLoading: (loading: boolean) => set({ isLoading: loading }),
      logout: () =>
        set({
          token: null,
          tokenType: undefined,
          tokenIssuedAt: undefined,
          tokenExpiredAt: undefined,
          user: null,
          isAuthenticated: false,
          isLoading: false,
          rolesAndPermissions: null,
        }),
    }),
    {
      name: "auth-storage",
      partialize: (state) => ({
        token: state.token,
        tokenType: state.tokenType,
        tokenIssuedAt: state.tokenIssuedAt,
        tokenExpiredAt: state.tokenExpiredAt,
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
      onRehydrateStorage: () => (state) => {
        if (state) state.isHydrated = true;
      },
    }
  )
);
