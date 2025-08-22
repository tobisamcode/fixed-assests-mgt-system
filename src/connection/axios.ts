import axios from "axios";
import { config } from "../lib/config";
import { useAuthStore } from "@/features/auth";

// Create axios instance with default configuration
export const req = axios.create({
  baseURL: config.api.baseURL,
  timeout: config.api.timeout,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor
req.interceptors.request.use(
  (config) => {
    // Add authentication token if available
    const token = useAuthStore.getState().token;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
req.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    // Handle global error responses here
    if (error.response?.status === 401) {
      // For now, just logout on 401 since we're only handling login
      const { logout } = useAuthStore.getState();
      logout();
    }
    return Promise.reject(error);
  }
);
