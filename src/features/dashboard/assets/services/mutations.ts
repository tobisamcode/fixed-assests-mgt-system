import { useMutation, useQueryClient } from "@tanstack/react-query";
import { assetApi } from "./api";
import { UpdateAssetRequest, CreateAssetRequest } from "../type";

export const useUpdateAssetMutation = () => {
  const queryClient = useQueryClient();

  return useMutation<unknown, Error, UpdateAssetRequest>({
    mutationFn: (data) => assetApi.updateAsset(data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["assets"] });
      if (variables?.guid) {
        queryClient.invalidateQueries({
          queryKey: ["asset", variables?.guid],
        });
      }
    },
  });
};

export const useCreateAssetMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateAssetRequest) => assetApi.createAsset(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["assets"] });
    },
  });
};
