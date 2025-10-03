import { req } from "@/connection/axios";
import {
  BranchesResponse,
  BranchesQueryParams,
  CreateBranchPayload,
  BranchResponse,
} from "../type";

export const branchesApi = {
  getBranches: async (
    params?: BranchesQueryParams
  ): Promise<BranchesResponse> => {
    const response = await req.get("/branch", { params });
    return response.data;
  },

  getBranchById: async (guid: string): Promise<BranchResponse> => {
    const response = await req.get(`/branch/branch/${guid}`);
    return response.data;
  },

  createBranch: async (
    payload: CreateBranchPayload
  ): Promise<BranchResponse> => {
    const response = await req.post("/branch", payload);
    return response.data;
  },

  UpdateBranch: async (
    payload: CreateBranchPayload
  ): Promise<BranchResponse> => {
    const response = await req.put("/branch", payload);
    return response.data;
  },
};
