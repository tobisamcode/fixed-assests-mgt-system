import { useQuery } from "@tanstack/react-query";
import { categoryApi } from "./api";
import type { CategoryAssetsCountResponse, CategoryQueryParams } from "../type";

export const useCategoriesQuery = (params?: CategoryQueryParams) => {
  return useQuery({
    queryKey: ["categories", params],
    queryFn: () => categoryApi.getCategories(params),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useCategoryAssetsCountQuery = () => {
  return useQuery<CategoryAssetsCountResponse>({
    queryKey: ["categoryAssetsCount"],
    queryFn: categoryApi.getCategoryAssetsCount,
    staleTime: 5 * 60 * 1000,
  });
};

export const useCategoryQuery = (guid: string) => {
  return useQuery({
    queryKey: ["categories", guid],
    queryFn: () => categoryApi.getCategory(guid),
    staleTime: 5 * 60 * 1000, // 5 minutes
    enabled: !!guid, // Only run query if guid is provided
  });
};
