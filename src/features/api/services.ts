import { req } from "@/connection/axios";
import type {
  ApiResponse,
  PaginatedResponse,
  Entity,
  PaginationParams,
} from "./types";

// Example API service - replace with your actual endpoints
export const apiService = {
  // Example: Get entities with pagination
  getEntities: async (
    params?: PaginationParams
  ): Promise<PaginatedResponse<Entity>> => {
    const searchParams = new URLSearchParams();

    if (params?.page) {
      searchParams.append("page", params.page.toString());
    }
    if (params?.limit) {
      searchParams.append("limit", params.limit.toString());
    }
    if (params?.search) {
      searchParams.append("search", params.search);
    }

    const queryString = searchParams.toString();
    const url = `/entities${queryString ? `?${queryString}` : ""}`;

    const response = await req.get<ApiResponse<PaginatedResponse<Entity>>>(url);
    return response.data.data;
  },

  // Example: Get single entity
  getEntity: async (id: string): Promise<Entity> => {
    const response = await req.get<ApiResponse<Entity>>(`/entities/${id}`);
    return response.data.data;
  },

  // Example: Create entity
  createEntity: async (
    data: Omit<Entity, "_id" | "createdAt" | "updatedAt">
  ): Promise<Entity> => {
    const response = await req.post<ApiResponse<Entity>>("/entities", data);
    return response.data.data;
  },

  // Example: Update entity
  updateEntity: async (id: string, data: Partial<Entity>): Promise<Entity> => {
    const response = await req.put<ApiResponse<Entity>>(
      `/entities/${id}`,
      data
    );
    return response.data.data;
  },

  // Example: Delete entity
  deleteEntity: async (id: string): Promise<void> => {
    await req.delete(`/entities/${id}`);
  },
};
