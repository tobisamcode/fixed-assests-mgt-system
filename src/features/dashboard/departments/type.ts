import { StandardApiResponse, PaginatedApiResponse } from "@/lib/types";

export interface Department {
  guid: string;
  departmentName: string;
  description: string;
}

export type DepartmentApiResponse = PaginatedApiResponse<Department>;

export interface DepartmentQueryParams {
  searchKey?: string;
  pageNumber?: number;
  pageSize?: number;
}

export interface CreateDepartmentRequest {
  departmentName: string;
  description: string;
}

export interface UpdateDepartmentRequest extends CreateDepartmentRequest {
  guid: string;
}

export type UpdateDepartmentResponse = StandardApiResponse<Department>;

export type CreateDepartmentResponse = StandardApiResponse<Department>;

export type GetDepartmentResponse = StandardApiResponse<Department>;
