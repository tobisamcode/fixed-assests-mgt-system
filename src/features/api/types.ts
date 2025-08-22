// Base API types
export interface ApiResponse<T> {
  data: T;
  message: string;
  success: boolean;
}

// Pagination interfaces
export interface PaginationParams {
  page?: number;
  limit?: number;
  search?: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  hasNext: boolean;
  hasPrev: boolean;
}

// Example entity interface - replace with your actual data models
export interface Entity {
  _id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
}
