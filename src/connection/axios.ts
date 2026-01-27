import axios from "axios";
import { config } from "../lib/config";
import { useAuthStore } from "@/features/auth";

export const req = axios.create({
  baseURL: config.api.baseURL,
  timeout: config.api.timeout,
  headers: {
    "Content-Type": "application/json",
  },
});

req.interceptors.request.use(
  (config) => {
    config.headers["Channel-ID"] = process.env.NEXT_PUBLIC_CHANNEL_ID || "";
    config.headers["Channel-Secret"] =
      process.env.NEXT_PUBLIC_CHANNEL_SECRET || "";

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

req.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    if (error.response?.status === 401) {
      const { logout } = useAuthStore.getState();
      logout();
    }
    return Promise.reject(error);
  }
);
