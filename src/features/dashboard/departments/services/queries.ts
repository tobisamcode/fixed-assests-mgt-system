import { useQuery } from "@tanstack/react-query";
import { departmentApi } from "./api";
import { DepartmentQueryParams } from "../type";

export const useDepartmentsQuery = (params?: DepartmentQueryParams) => {
  return useQuery({
    queryKey: ["departments", params],
    queryFn: () => departmentApi.getDepartments(params),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useDepartmentQuery = (guid: string) => {
  return useQuery({
    queryKey: ["departments", guid],
    queryFn: () => departmentApi.getDepartment(guid),
    staleTime: 5 * 60 * 1000, // 5 minutes
    enabled: !!guid, // Only run query if guid is provided
  });
};
