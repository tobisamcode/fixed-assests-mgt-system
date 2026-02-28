import { useMutation, useQueryClient } from "@tanstack/react-query";
import { adminApi } from "./api";
import type {
  CreateUserPayload,
  UpdateRolePermissionsPayload,
  CreateRolePayload,
  UpdatePlatformUserPayload,
  DeactivatePlatformUserPayload,
} from "../type";

export const useCreateUserMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateUserPayload) => adminApi.createUser(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      queryClient.invalidateQueries({ queryKey: ["platformRoles"] });
    },
  });
};

export const useUpdateRolePermissionsMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: UpdateRolePermissionsPayload) =>
      adminApi.updateRolePermissions(payload),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["platformRoles"] });
      queryClient.invalidateQueries({
        queryKey: ["rolePermissions", variables.roleGuid],
      });
    },
  });
};

export const useCreateRoleMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateRolePayload) => adminApi.createRole(payload),
    onSuccess: () => {
      // Invalidate and refetch platform roles to include the new role
      queryClient.invalidateQueries({ queryKey: ["platformRoles"] });
    },
  });
};

export const useUpdatePlatformUserMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: UpdatePlatformUserPayload) =>
      adminApi.updatePlatformUser(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      queryClient.invalidateQueries({ queryKey: ["platformRoles"] });
      queryClient.invalidateQueries({ queryKey: ["platformUser"] });
    },
  });
};

export const useDeactivatePlatformUserMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: DeactivatePlatformUserPayload) =>
      adminApi.deactivatePlatformUser(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      queryClient.invalidateQueries({ queryKey: ["platformRoles"] });
    },
  });
};
