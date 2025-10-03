import { useQuery } from "@tanstack/react-query";
import { supplierApi } from "./api";
import { SupplierQueryParams } from "../type";

export const useSuppliersQuery = (params?: SupplierQueryParams) => {
  return useQuery({
    queryKey: ["suppliers", params],
    queryFn: () => supplierApi.getSuppliers(params),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};
