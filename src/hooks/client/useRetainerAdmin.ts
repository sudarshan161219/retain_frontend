import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api, { setAuthToken, clearAuthToken } from "@/lib/api/api";
import { toast } from "sonner";

export type ClientStatus = "ACTIVE" | "PAUSED" | "ARCHIVED";

export const useRetainerAdmin = (adminToken: string | undefined) => {
  const queryClient = useQueryClient();
  const queryKey = ["admin-client", adminToken];

  // 1. FETCH ADMIN DATA
  const query = useQuery({
    queryKey,
    queryFn: async () => {
      if (adminToken) setAuthToken(adminToken);
      const { data } = await api.get("/clients/admin");
      return data.data;
    },
    enabled: !!adminToken,
    staleTime: 1000 * 60 * 5, 
  });

  // 2. MUTATION: ADD LOG
  const addLogMutation = useMutation({
    mutationFn: async (payload: {
      description: string;
      hours: number;
      date?: string;
    }) => {
      const { data } = await api.post("/logs", payload);
      return data.data;
    },
    onSuccess: (newLog) => {
      toast.success("Hours logged successfully");
      queryClient.setQueryData(queryKey, (old: any) => {
        if (!old) return old;
        return {
          ...old,
          logs: [newLog, ...old.logs],
        };
      });
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || "Failed to log hours");
    },
  });

  // 3. MUTATION: DELETE LOG
  const deleteLogMutation = useMutation({
    mutationFn: async (logId: string) => {
      await api.delete(`/logs/${logId}`);
      return logId;
    },
    onSuccess: (deletedLogId) => {
      toast.success("Log removed");
      queryClient.setQueryData(queryKey, (old: any) => {
        if (!old) return old;
        return {
          ...old,
          logs: old.logs.filter((log: any) => log.id !== deletedLogId),
        };
      });
    },
  });

  // 4. MUTATION: UPDATE STATUS
  const updateStatusMutation = useMutation({
    mutationFn: async (status: ClientStatus) => {
      const { data } = await api.patch("/clients/status", { status });
      return data.data;
    },
    onSuccess: (updatedClient) => {
      toast.success(`Status updated to ${updatedClient.status}`);
      queryClient.setQueryData(queryKey, (old: any) => ({
        ...old,
        status: updatedClient.status,
      }));
    },
  });

  // 5. MUTATION: UPDATE DETAILS (Name, Link, Total Budget)
  const updateDetailsMutation = useMutation({
    mutationFn: async (payload: {
      name?: string;
      refillLink?: string;
      totalHours?: number;
    }) => {
      const { data } = await api.patch("/clients/details", payload);
      return data.data;
    },
    onSuccess: (updatedClient) => {
      toast.success("Project updated successfully");
      queryClient.setQueryData(queryKey, (old: any) => {
        if (!old) return updatedClient;
        return { ...old, ...updatedClient };
      });
    },
    onError: () => toast.error("Failed to update project"),
  });

  // 6. MUTATION: DELETE PROJECT (New)
  const deleteProjectMutation = useMutation({
    mutationFn: async () => {
      const { data } = await api.delete("/clients/details");
      return data;
    },
    onSuccess: () => {
      clearAuthToken();
      toast.success("Project deleted permanently");
      queryClient.removeQueries({ queryKey });
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || "Failed to delete project");
    },
  });

  // 7. ACTION: EXPORT EXCEL REPORT
  const exportReportMutation = useMutation({
    mutationFn: async () => {
      // ✅ No manual header needed; the interceptor handles it.
      const response = await api.get("/export", {
        responseType: "blob", // Critical for file downloads
      });
      return response;
    },
    onSuccess: (response) => {
      // Create a URL for the blob
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;

      // Extract filename from headers
      const contentDisposition = response.headers["content-disposition"];
      let fileName = "Retainer_Report.xlsx";

      if (contentDisposition) {
        const fileNameMatch = contentDisposition.match(/filename="?([^"]+)"?/);
        if (fileNameMatch && fileNameMatch.length === 2)
          fileName = fileNameMatch[1];
      }

      link.setAttribute("download", fileName);
      document.body.appendChild(link);
      link.click();

      // Cleanup
      link.remove();
      window.URL.revokeObjectURL(url);
      toast.success("Report downloaded");
    },
    onError: () => {
      toast.error("Failed to download report");
    },
  });

  return {
    // Data
    client: query.data,
    isLoading: query.isLoading,
    isError: query.isError,
    refetch: query.refetch,

    // Actions
    addLog: addLogMutation.mutate,
    isAddingLog: addLogMutation.isPending,

    deleteLog: deleteLogMutation.mutate,
    isDeletingLog: deleteLogMutation.isPending,

    updateDetails: updateDetailsMutation.mutate,
    isUpdatingDetails: updateDetailsMutation.isPending,

    updateStatus: updateStatusMutation.mutate,
    isUpdatingStatus: updateStatusMutation.isPending,

    deleteProject: deleteProjectMutation.mutate,
    isDeletingProject: deleteProjectMutation.isPending,

    exportReport: exportReportMutation.mutate,
    isExporting: exportReportMutation.isPending,
  };
};
