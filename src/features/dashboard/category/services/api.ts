import { req } from "@/connection/axios";
import {
  CategoryApiResponse,
  CategoryQueryParams,
  UpdateCategoryRequest,
  UpdateCategoryResponse,
  CreateCategoryRequest,
  CreateCategoryResponse,
  GetCategoryResponse,
  CategoryAssetsCountResponse,
} from "../type";

export const categoryApi = {
  getCategories: async (
    params?: CategoryQueryParams
  ): Promise<CategoryApiResponse> => {
    const response = await req.get<CategoryApiResponse>("/asset-category", {
      params,
    });
    return response.data;
  },

  updateCategory: async (
    data: UpdateCategoryRequest
  ): Promise<UpdateCategoryResponse> => {
    const response = await req.put<UpdateCategoryResponse>(
      "/asset-category",
      data
    );
    return response.data;
  },

  createCategory: async (
    data: CreateCategoryRequest
  ): Promise<CreateCategoryResponse> => {
    const response = await req.post<CreateCategoryResponse>(
      "/asset-category",
      data
    );
    return response.data;
  },

  getCategory: async (guid: string): Promise<GetCategoryResponse> => {
    const response = await req.get<GetCategoryResponse>(
      `/asset-category/asset-category/${guid}`
    );
    return response.data;
  },

  getCategoryAssetsCount: async (): Promise<CategoryAssetsCountResponse> => {
    const response = await req.get<CategoryAssetsCountResponse>(
      "/asset-category/assets/count"
    );
    return response.data;
  },
};
