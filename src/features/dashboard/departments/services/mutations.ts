import { useMutation, useQueryClient } from "@tanstack/react-query";
import { departmentApi } from "./api";
import { UpdateDepartmentRequest, CreateDepartmentRequest } from "../type";

export const useUpdateDepartmentMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: UpdateDepartmentRequest) =>
      departmentApi.updateDepartment(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["departments"] });
    },
  });
};

export const useCreateDepartmentMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateDepartmentRequest) =>
      departmentApi.createDepartment(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["departments"] });
    },
  });
};
