import { useMutation, useQueryClient } from "@tanstack/react-query";
import { branchesApi } from "./api";
import { CreateBranchPayload } from "../type";

export const useCreateBranch = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateBranchPayload) =>
      branchesApi.createBranch(payload),
    onSuccess: () => {
      // Invalidate and refetch branches list
      queryClient.invalidateQueries({ queryKey: ["branches"] });
    },
  });
};

export const useUpdateBranch = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateBranchPayload) =>
      branchesApi.UpdateBranch(payload),
    onSuccess: () => {
      // Invalidate and refetch branches list
      queryClient.invalidateQueries({ queryKey: ["branches"] });
    },
  });
};
