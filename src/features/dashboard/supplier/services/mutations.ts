import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supplierApi } from "./api";
import type { UpdateSupplierRequest, CreateSupplierRequest } from "../type";

export const useUpdateSupplierMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: UpdateSupplierRequest) =>
      supplierApi.updateSupplier(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["suppliers"] });
    },
  });
};

export const useCreateSupplierMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateSupplierRequest) =>
      supplierApi.createSupplier(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["suppliers"] });
    },
  });
};
