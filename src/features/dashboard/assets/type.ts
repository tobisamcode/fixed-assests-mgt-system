import { StandardApiResponse, PaginatedApiResponse } from "@/lib/types";

export interface AssetCategory {
  guid: string;
  categoryName: string;
  description: string;
}

export interface AssetDepartment {
  guid: string;
  departmentName: string;
  description: string;
}

export interface AssetBranch {
  guid: string;
  branchName: string;
  address: string;
  description: string;
}

export interface AssetSupplier {
  guid: string;
  supplierName: string;
  contactPerson: string;
  contactNumber: string;
  email: string;
  description: string;
}

export interface Asset {
  guid: string;
  assetName: string;
  serialNumber: string;
  tagNumber: string;
  categoryGuid: string;
  departmentGuid: string;
  branchGuid: string;
  supplierGuid: string;
  category: AssetCategory;
  department: AssetDepartment;
  branch: AssetBranch;
  supplier: AssetSupplier;
  acquisitionDate: string;
  acquisitionCost: number;
  currentBookValue: number;
  locationDetail: string;
  condition: string;
  status: string;
  depreciationMethod: string;
  usefulLifeYears: number;
  salvageValue: number;
  t24AssetReference: string;
  lastT24ValuationDate: string;
  custodianGuid: string;
  custodianName?: string;
  oem?: string;
  model?: string;
  brand?: string;
  operatingSystemVersion?: string;
  releaseVersion?: string;
  eolEoslDate?: string;
  locationStatus?: string;
  returnDate?: string;
  collectionDate?: string;
}

export type AssetApiResponse = PaginatedApiResponse<Asset>;

export interface AssetsQueryParams {
  searchKey?: string;
  pageNumber?: number;
  pageSize?: number;
}

export type AssetSingleResponse = StandardApiResponse<Asset>;

export interface UpdateAssetRequest {
  guid: string;
  assetName: string;
  serialNumber: string;
  tagNumber: string;
  categoryGuid: string;
  departmentGuid: string;
  branchGuid: string;
  supplierGuid: string;
  acquisitionDate: string;
  acquisitionCost: number;
  currentBookValue?: number;
  locationDetail: string;
  condition: string;
  status: string;
  depreciationMethod: string;
  usefulLifeYears: number;
  salvageValue: number;
  t24AssetReference: string;
  lastT24ValuationDate: string;
  custodianGuid: string;
  oem?: string;
  model?: string;
  brand?: string;
  operatingSystemVersion?: string;
  releaseVersion?: string;
  eolEoslDate?: string;
  locationStatus?: string;
  returnDate?: string;
  collectionDate?: string;
}

export type UpdateAssetResponse = StandardApiResponse<Asset>;

export interface CreateAssetRequest {
  assetName: string;
  serialNumber: string;
  tagNumber: string;
  categoryGuid: string;
  departmentGuid: string;
  branchGuid: string;
  supplierGuid: string;
  acquisitionDate: string;
  acquisitionCost: number;
  currentBookValue: number;
  locationDetail: string;
  condition: string;
  status: string;
  depreciationMethod: string;
  usefulLifeYears: number;
  salvageValue: number;
  t24AssetReference: string;
  lastT24ValuationDate: string;
  custodianGuid: string;
  oem?: string;
  model?: string;
  brand?: string;
  operatingSystemVersion?: string;
  releaseVersion?: string;
  eolEoslDate?: string;
  locationStatus?: string;
  returnDate?: string;
  collectionDate?: string;
}

export type CreateAssetResponse = StandardApiResponse<Asset>;

// Custodian History Types
export interface CustodianUser {
  guid: string;
  emailAddress: string;
  fullName: string;
  displayName: string;
  department: AssetDepartment;
  branch: AssetBranch;
}

export interface CustodianHistoryRecord {
  guid: string;
  custodian: CustodianUser;
  custodianName: string;
  branch: AssetBranch;
  department: AssetDepartment;
  assignedAt: string;
  assignedBy: CustodianUser;
  notes: string;
}

export interface CustodianHistoryResponse {
  responseCode: string;
  responseMessage: string;
  errors: string[];
  responseData: CustodianHistoryRecord[];
}
