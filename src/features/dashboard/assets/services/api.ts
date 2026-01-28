import { req } from "@/connection/axios";
import {
  AssetApiResponse,
  UpdateAssetRequest,
  UpdateAssetResponse,
  CreateAssetRequest,
  CreateAssetResponse,
  AssetsQueryParams,
  AssetSingleResponse,
  CustodianHistoryResponse,
} from "../type";

export const assetApi = {
  getAssets: async (params?: AssetsQueryParams): Promise<AssetApiResponse> => {
    const response = await req.get<AssetApiResponse>("/asset", { params });
    return response.data;
  },

  updateAsset: async (
    data: UpdateAssetRequest
  ): Promise<UpdateAssetResponse> => {
    const response = await req.put<UpdateAssetResponse>("/asset", data);
    return response.data;
  },

  createAsset: async (
    data: CreateAssetRequest
  ): Promise<CreateAssetResponse> => {
    const response = await req.post<CreateAssetResponse>("/asset", data);
    return response.data;
  },

  getAssetByGuid: async (guid: string): Promise<AssetSingleResponse> => {
    const response = await req.get<AssetSingleResponse>(`/asset/asset/${guid}`);
    return response.data;
  },

  getCustodianHistory: async (guid: string): Promise<CustodianHistoryResponse> => {
    const response = await req.get<CustodianHistoryResponse>(
      `/asset/asset/${guid}/custodian-history`
    );
    return response.data;
  },
};
