import { req } from "@/connection/axios";
import {
  UsersResponse,
  UsersQueryParams,
  CreateUserPayload,
  UserResponse,
  ContactsResponse,
  ContactsQueryParams,
  PlatformRolesResponse,
  PermissionsResponse,
  UpdateRolePermissionsPayload,
  UpdateRolePermissionsResponse,
  RolePermissionsQueryParams,
  RolePermissionsResponse,
  CreateRolePayload,
  CreateRoleResponse,
  UpdatePlatformUserPayload,
  UpdatePlatformUserResponse,
  DeactivatePlatformUserPayload,
  DeactivatePlatformUserResponse,
} from "@/features/dashboard/admin-management/type";

export const adminApi = {
  getUsers: async (params?: UsersQueryParams): Promise<UsersResponse> => {
    const response = await req.get("/admin-mgt/records", { params });
    return response.data;
  },

  createUser: async (payload: CreateUserPayload): Promise<UserResponse> => {
    const response = await req.post("/admin-mgt/admin/invite", payload);
    return response.data;
  },

  getContacts: async (
    params?: ContactsQueryParams
  ): Promise<ContactsResponse> => {
    const response = await req.get("/admin-mgt/contacts", { params });
    return response.data;
  },

  getPlatformRoles: async (): Promise<PlatformRolesResponse> => {
    const response = await req.get("/auth-mgt/platform-role");
    return response.data;
  },

  getAllPermissions: async (): Promise<PermissionsResponse> => {
    const response = await req.get("/auth-mgt/platform-permissions");
    return response.data;
  },

  updateRolePermissions: async (
    payload: UpdateRolePermissionsPayload
  ): Promise<UpdateRolePermissionsResponse> => {
    const response = await req.put(
      "/auth-mgt/platform-role/permissions",
      payload
    );
    return response.data;
  },

  getRolePermissions: async (
    params: RolePermissionsQueryParams
  ): Promise<RolePermissionsResponse> => {
    const response = await req.get("/auth-mgt/platform-role/permissions", {
      params,
    });
    return response.data;
  },

  createRole: async (
    payload: CreateRolePayload
  ): Promise<CreateRoleResponse> => {
    const response = await req.post(
      "/auth-mgt/platform-role/permissions",
      payload
    );
    return response.data;
  },

  updatePlatformUser: async (
    payload: UpdatePlatformUserPayload
  ): Promise<UpdatePlatformUserResponse> => {
    const response = await req.patch("/admin-mgt/update", payload);
    return response.data;
  },

  deactivatePlatformUser: async (
    payload: DeactivatePlatformUserPayload
  ): Promise<DeactivatePlatformUserResponse> => {
    const response = await req.patch("/admin-mgt/deactivate", payload);
    return response.data;
  },
};
