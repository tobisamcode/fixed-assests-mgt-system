import { req } from "@/connection/axios";
import {
  DepartmentApiResponse,
  DepartmentQueryParams,
  UpdateDepartmentRequest,
  UpdateDepartmentResponse,
  CreateDepartmentRequest,
  CreateDepartmentResponse,
  GetDepartmentResponse,
} from "../type";

export const departmentApi = {
  getDepartments: async (
    params?: DepartmentQueryParams
  ): Promise<DepartmentApiResponse> => {
    const response = await req.get<DepartmentApiResponse>("/department", {
      params,
    });
    return response.data;
  },

  updateDepartment: async (
    data: UpdateDepartmentRequest
  ): Promise<UpdateDepartmentResponse> => {
    const response = await req.put<UpdateDepartmentResponse>(
      "/department",
      data
    );
    return response.data;
  },

  createDepartment: async (
    data: CreateDepartmentRequest
  ): Promise<CreateDepartmentResponse> => {
    const response = await req.post<CreateDepartmentResponse>(
      "/department",
      data
    );
    return response.data;
  },

  getDepartment: async (guid: string): Promise<GetDepartmentResponse> => {
    const response = await req.get<GetDepartmentResponse>(
      `/department/department/${guid}`
    );
    return response.data;
  },
};
