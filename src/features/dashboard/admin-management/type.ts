// Base response structure
interface BaseResponse {
  responseCode: string;
  responseMessage: string;
  errors?: string[];
}

// Meta information for paginated responses
interface Meta {
  pageNumber: number;
  pageSize: number;
  pageCount: number;
  totalCount: number;
  numberOfPages: number;
}

// User record structure
export interface User {
  username: string;
  email: string;
  firstName: string;
  middleName: string;
  lastName: string;
  name: string;
  status: "ACTIVE" | "DEACTIVATED" | string;
}

// Query parameters for getting users
export interface UsersQueryParams {
  pageNumber?: number;
  pageSize?: number;
  search?: string;
}

// Response structure for getting users
export interface UsersResponse extends BaseResponse {
  responseData?: {
    meta: Meta;
    records: User[];
  };
}

// Payload for creating a new user
export interface CreateUserPayload {
  emailAddress: string;
  fullName: string;
  username: string;
  departmentGuid: string;
  roleGuids: string[];
}

// Response structure for single user operations
export interface UserResponse extends BaseResponse {
  responseData?: string;
}

// Contact structure from /admin-mgt/contacts
export interface Contact {
  id: number;
  name: string;
  email: string;
  username: string;
}

// Query parameters for getting contacts
export interface ContactsQueryParams {
  pageNumber?: number;
  pageSize?: number;
  search?: string;
}

// Response structure for getting contacts
export interface ContactsResponse extends BaseResponse {
  responseData?: {
    meta: Meta;
    records: Contact[];
  };
}

// Platform role structure
export interface PlatformRole {
  guid: string;
  name: string;
  users: number;
  description: string;
  permissions?: [
    {
      guid: string;
      name: string;
      description: string;
      requireChecker: boolean;
      noOfCheckerRequired: number;
    }
  ];
}

// Response structure for getting platform roles
export interface PlatformRolesResponse extends BaseResponse {
  responseData?: PlatformRole[];
}

// Permission structure for all available permissions
export interface Permission {
  guid: string;
  name: string;
  description: string;
  requireChecker: boolean;
  noOfCheckerRequired: number;
}

// Response structure for getting all permissions
export interface PermissionsResponse extends BaseResponse {
  responseData?: Permission[];
}

// Payload for updating role permissions
export interface UpdateRolePermissionsPayload {
  roleGuid: string;
  permissionEnums: string[];
}

// Response structure for updating role permissions
export interface UpdateRolePermissionsResponse extends BaseResponse {
  responseData?: string;
}

// Query parameters for getting role permissions
export interface RolePermissionsQueryParams {
  roleGuid: string;
}

// Response structure for getting role permissions by roleGuid
export interface RolePermissionsResponse extends BaseResponse {
  responseData?: {
    guid: string;
    name: string;
    users: number;
    description: string;
    permissions: Permission[];
  };
}

// Payload for creating a new role
export interface CreateRolePayload {
  roleName: string;
  description: string;
  permissionEnums: string[];
}

// Response structure for creating a role
export interface CreateRoleResponse extends BaseResponse {
  responseData?: string;
}

// Payload for updating a platform user
export interface UpdatePlatformUserPayload {
  emailAddress: string;
  departmentGuid: string;
  roles: string[];
}

// Response for updating a platform user
export interface UpdatePlatformUserResponse extends BaseResponse {
  responseData?: User;
}

// Payload to deactivate a platform user
export interface DeactivatePlatformUserPayload {
  emailAddress: string;
}

export interface DeactivatePlatformUserResponse extends BaseResponse {
  responseData?: User;
}
