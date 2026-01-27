import { useQuery } from "@tanstack/react-query";
import { branchesApi } from "./api";
import { BranchesQueryParams } from "../type";

export const useBranches = (params?: BranchesQueryParams) => {
  return useQuery({
    queryKey: ["branches", params],
    queryFn: () => branchesApi.getBranches(params),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useBranchById = (guid: string) => {
  return useQuery({
    queryKey: ["branch", guid],
    queryFn: () => branchesApi.getBranchById(guid),
    staleTime: 5 * 60 * 1000, // 5 minutes
    enabled: !!guid, // Only run query if guid is provided
  });
};
