import { useMutation } from "@tanstack/react-query";
import { authApi, AuthorizeLoginRequest, AuthorizeLoginResponse } from "./api";
import { toast } from "sonner";
import { useAuthStore } from "../store";

// Complete OAuth by exchanging code for token
export const useAuthorizeLogin = () => {
  const { setAuthData } = useAuthStore();

  return useMutation<AuthorizeLoginResponse, Error, AuthorizeLoginRequest>({
    mutationFn: authApi.authorizeLogin,
    onSuccess: (data) => {
      if (data.responseData?.auth?.accessToken) {
        setAuthData(data.responseData);
      } else {
        toast.error("Authorization failed", {
          description: data.responseMessage || "No token returned",
        });
      }
    },
    onError: (error) => {
      toast.error("Authorization failed", { description: error.message });
    },
  });
};
