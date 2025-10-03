// Audit Log Types
export interface AuditRecord {
  id: string;
  guid: string;
  actor: string;
  action: AuditAction;
  actionMessage: string;
  entity: string;
  entityId: string;
  ipAddress: string;
  actionDateTime: string;
}

export type AuditAction =
  | "ASSIGN_ROLE"
  | "CHANGE_PASSWORD"
  | "PLATFORM_USER_LOGIN"
  | "CREATE_PLATFORM_USER"
  | "CREATE_PLATFORM_ROLE"
  | "SET_ROLE_PERMISSIONS"
  | "CREATE_ROLE_PERMISSION_MAPPING"
  | "OTP_REQUEST"
  | "UPDATE_SYSTEM_CONFIGURATION"
  | "CREATE_ASSET"
  | "UPDATE_ASSET"
  | "CREATE_CATEGORY"
  | "UPDATE_CATEGORY"
  | "CREATE_DEPARTMENT"
  | "UPDATE_DEPARTMENT"
  | "CREATE_BRANCH"
  | "UPDATE_BRANCH"
  | "CREATE_SUPPLIER"
  | "UPDATE_SUPPLIER"
  | "ADD_PERMISSIONS_TO_ROLE"
  | "DEACTIVATE_PLATFORM_USER"
  | "UPDATE_PLATFORM_USER";

export interface AuditQueryParams {
  pageNumber?: number;
  pageSize?: number;
  action?: AuditAction;
  actor?: string;
  searchKey?: string;
}

export interface AuditMeta {
  pageNumber: number;
  pageSize: number;
  totalCount: number;
  numberOfPages: number;
  pageCount: number; // Legacy field, use numberOfPages instead
}

export interface AuditResponseData {
  meta: AuditMeta;
  records: AuditRecord[];
}

export interface AuditApiResponse {
  responseCode: string;
  responseMessage: string;
  errors: unknown[];
  responseData: AuditResponseData;
}
