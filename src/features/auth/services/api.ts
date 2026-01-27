import { req } from "@/connection/axios";

export interface InitiateLoginRequest {
  redirectUrl: string;
  provider: "LOCAL" | "GOOGLE" | "LINKEDIN" | "ZOHO";
}

export interface InitiateLoginResponse {
  responseCode: string;
  responseMessage: string;
  errors?: string[];
  responseData?: {
    authorizationUrl: string;
    provider: string;
  };
}

export interface AuthorizeLoginRequest {
  authorizationCode: string;
  redirectUrl: string;
  state?: string;
  provider: "LOCAL" | "GOOGLE" | "LINKEDIN" | "ZOHO";
}

export interface AuthorizeLoginResponse {
  responseCode: string;
  responseMessage: string;
  errors?: string[];
  responseData?: {
    emailAddress?: string;
    rolesAndPermissions?: Array<{
      guid: string;
      name: string;
      users: number;
      description?: string;
      permissions?: Array<{
        guid: string;
        name: string;
        description?: string;
        requireChecker?: boolean;
        noOfCheckerRequired?: number;
      }>;
    }>;
    auth?: {
      accessToken: string;
      type?: string;
      tokenIssuedAt?: string;
      tokenExpiredAt?: string;
    };
  };
}

export const authApi = {
  initiateLogin: async (
    data: InitiateLoginRequest
  ): Promise<InitiateLoginResponse> => {
    const response = await req.post<InitiateLoginResponse>(
      "/auth/initiate-login",
      data
    );
    return response.data;
  },
  authorizeLogin: async (
    body: AuthorizeLoginRequest
  ): Promise<AuthorizeLoginResponse> => {
    const response = await req.post<AuthorizeLoginResponse>(
      "/auth/authorize",
      body
    );
    return response.data;
  },
};
