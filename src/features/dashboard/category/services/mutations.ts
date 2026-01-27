import { useMutation, useQueryClient } from "@tanstack/react-query";
import { categoryApi } from "./api";
import { UpdateCategoryRequest, CreateCategoryRequest } from "../type";

export const useUpdateCategoryMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: UpdateCategoryRequest) =>
      categoryApi.updateCategory(data),
    onSuccess: () => {
      // Invalidate and refetch categories after successful update
      queryClient.invalidateQueries({ queryKey: ["categories"] });
    },
  });
};

export const useCreateCategoryMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateCategoryRequest) =>
      categoryApi.createCategory(data),
    onSuccess: () => {
      // Invalidate and refetch categories after successful creation
      queryClient.invalidateQueries({ queryKey: ["categories"] });
    },
  });
};
