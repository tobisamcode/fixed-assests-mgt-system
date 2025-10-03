import { StandardApiResponse, PaginatedApiResponse } from "@/lib/types";

export interface Category {
  guid: string;
  categoryName: string;
  description: string;
}

export type CategoryApiResponse = PaginatedApiResponse<Category>;

export interface CategoryQueryParams {
  searchKey?: string;
  pageNumber?: number;
  pageSize?: number;
}

export interface UpdateCategoryRequest {
  guid: string;
  categoryName: string;
  description: string;
}

export type UpdateCategoryResponse = StandardApiResponse<Category>;

export interface CreateCategoryRequest {
  categoryName: string;
  description: string;
}

export type CreateCategoryResponse = StandardApiResponse<Category>;

export type GetCategoryResponse = StandardApiResponse<Category>;

// Metrics
export interface CategoryAssetsCountItem {
  assetCategoryName: string;
  count: number;
}

export type CategoryAssetsCountResponse = StandardApiResponse<
  CategoryAssetsCountItem[]
>;
