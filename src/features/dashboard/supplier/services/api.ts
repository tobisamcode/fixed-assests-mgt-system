import { req } from "@/connection/axios";
import {
  SupplierApiResponse,
  SupplierQueryParams,
  UpdateSupplierRequest,
  UpdateSupplierResponse,
  CreateSupplierRequest,
  CreateSupplierResponse,
} from "../type";

export const supplierApi = {
  getSuppliers: async (
    params?: SupplierQueryParams
  ): Promise<SupplierApiResponse> => {
    const response = await req.get<SupplierApiResponse>("/supplier", {
      params,
    });
    return response.data;
  },

  updateSupplier: async (
    data: UpdateSupplierRequest
  ): Promise<UpdateSupplierResponse> => {
    const response = await req.put<UpdateSupplierResponse>("/supplier", data);
    return response.data;
  },

  createSupplier: async (
    data: CreateSupplierRequest
  ): Promise<CreateSupplierResponse> => {
    const response = await req.post<CreateSupplierResponse>("/supplier", data);
    return response.data;
  },
};
