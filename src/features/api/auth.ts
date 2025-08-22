import { req } from "@/connection/axios";

export interface LoginCredentials {
  username: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  user: {
    id: string;
    username: string;
    email: string;
    role: string;
    permissions: string[];
  };
  expiresAt: string;
}

export interface RefreshTokenResponse {
  token: string;
  expiresAt: string;
}

// Authentication API endpoints
export const authApi = {
  // Login user
  login: async (credentials: LoginCredentials): Promise<LoginResponse> => {
    const response = await req.post<LoginResponse>("/auth/login", credentials);
    return response.data;
  },

  // Logout user
  logout: async (): Promise<void> => {
    await req.post("/auth/logout");
  },

  // Refresh access token
  refreshToken: async (): Promise<RefreshTokenResponse> => {
    const response = await req.post<RefreshTokenResponse>("/auth/refresh");
    return response.data;
  },

  // Get current user profile
  getProfile: async (): Promise<LoginResponse["user"]> => {
    const response = await req.get<LoginResponse["user"]>("/auth/profile");
    return response.data;
  },

  // Verify token validity
  verifyToken: async (): Promise<{ valid: boolean }> => {
    const response = await req.get<{ valid: boolean }>("/auth/verify");
    return response.data;
  },

  // Request password reset
  requestPasswordReset: async (email: string): Promise<{ message: string }> => {
    const response = await req.post<{ message: string }>(
      "/auth/forgot-password",
      {
        email,
      }
    );
    return response.data;
  },

  // Reset password with token
  resetPassword: async (
    token: string,
    newPassword: string
  ): Promise<{ message: string }> => {
    const response = await req.post<{ message: string }>(
      "/auth/reset-password",
      {
        token,
        password: newPassword,
      }
    );
    return response.data;
  },

  // Change password (authenticated user)
  changePassword: async (
    currentPassword: string,
    newPassword: string
  ): Promise<{ message: string }> => {
    const response = await req.put<{ message: string }>(
      "/auth/change-password",
      {
        currentPassword,
        newPassword,
      }
    );
    return response.data;
  },
};
