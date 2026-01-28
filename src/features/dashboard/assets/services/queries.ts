import { useQuery } from "@tanstack/react-query";
import { assetApi } from "./api";
import type { AssetsQueryParams } from "../type";

export const useAssetsQuery = (params?: AssetsQueryParams) => {
  return useQuery({
    queryKey: ["assets", params],
    queryFn: () => assetApi.getAssets(params),
    staleTime: 5 * 60 * 1000,
  });
};

export const useAssetByGuidQuery = (guid?: string) => {
  return useQuery({
    queryKey: ["asset", guid],
    queryFn: () => assetApi.getAssetByGuid(guid as string),
    enabled: Boolean(guid),
    staleTime: 5 * 60 * 1000,
  });
};

export const useCustodianHistoryQuery = (guid?: string) => {
  return useQuery({
    queryKey: ["custodian-history", guid],
    queryFn: () => assetApi.getCustodianHistory(guid as string),
    enabled: Boolean(guid),
    staleTime: 2 * 60 * 1000,
  });
};
