import { useQuery } from "@tanstack/react-query";
import { adminApi } from "./api";
import type {
  UsersQueryParams,
  ContactsQueryParams,
  RolePermissionsQueryParams,
} from "../type";

export const useUsersQuery = (params?: UsersQueryParams) => {
  return useQuery({
    queryKey: ["users", params],
    queryFn: () => adminApi.getUsers(params),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
};

export const useContactsQuery = (params?: ContactsQueryParams) => {
  return useQuery({
    queryKey: ["contacts", params],
    queryFn: () => adminApi.getContacts(params),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
};

export const usePlatformRolesQuery = () => {
  return useQuery({
    queryKey: ["platformRoles"],
    queryFn: () => adminApi.getPlatformRoles(),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
};

export const useAllPermissionsQuery = () => {
  return useQuery({
    queryKey: ["allPermissions"],
    queryFn: () => adminApi.getAllPermissions(),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
};

export const useRolePermissionsQuery = (params: RolePermissionsQueryParams) => {
  return useQuery({
    queryKey: ["rolePermissions", params.roleGuid],
    queryFn: () => adminApi.getRolePermissions(params),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    enabled: !!params.roleGuid, // Only run when roleGuid is provided
  });
};
