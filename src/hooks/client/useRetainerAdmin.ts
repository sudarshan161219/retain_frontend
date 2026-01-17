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
    staleTime: 1000 * 60 * 5, // 5 mins (Socket handles updates)
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
        // Merge new details (name, totalHours, link) into existing cache
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
  };
};
