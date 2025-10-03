import { StandardApiResponse, PaginatedApiResponse } from "@/lib/types";

export interface Supplier {
  guid: string;
  supplierName: string;
  contactPerson: string;
  contactNumber: string;
  email: string;
  description: string;
}

export type SupplierApiResponse = PaginatedApiResponse<Supplier>;

export interface SupplierQueryParams {
  searchKey?: string;
  pageNumber?: number;
  pageSize?: number;
}

export interface UpdateSupplierRequest {
  guid: string;
  supplierName: string;
  contactPerson: string;
  contactNumber: string;
  email: string;
  description: string;
}

export type UpdateSupplierResponse = StandardApiResponse<Supplier>;

export interface CreateSupplierRequest {
  supplierName: string;
  contactPerson: string;
  contactNumber: string;
  email: string;
  description: string;
}

export type CreateSupplierResponse = StandardApiResponse<Supplier>;
