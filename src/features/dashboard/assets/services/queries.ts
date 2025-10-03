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
