import { req } from "@/connection/axios";
import { AuditApiResponse, AuditQueryParams } from "../type";

export const auditApi = {
  getAuditLogs: async (
    params?: AuditQueryParams
  ): Promise<AuditApiResponse> => {
    const response = await req.get<AuditApiResponse>("/audit", { params });
    return response.data;
  },
};

