import { useQuery } from "@tanstack/react-query";
import { auditApi } from "./api";
import type { AuditQueryParams } from "../type";

export const useAuditLogsQuery = (params?: AuditQueryParams) => {
  return useQuery({
    queryKey: ["auditLogs", params],
    queryFn: () => auditApi.getAuditLogs(params),
    staleTime: 5 * 60 * 1000,
  });
};

