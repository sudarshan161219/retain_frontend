import { useMutation, useQueryClient } from "@tanstack/react-query";
import api, { setAuthToken } from "@/lib/api/api";
import { toast } from "sonner";

export const useClientRefill = (adminToken: string | undefined) => {
  const queryClient = useQueryClient();
  const queryKey = ["admin-client", adminToken];

  const refillMutation = useMutation({
    // 👇 CHANGED: Input is 'hours' (amount to add), not 'totalHours'
    mutationFn: async (payload: { hours: number; createLog: boolean }) => {
      if (adminToken) setAuthToken(adminToken);

      // 👇 CHANGED: Hit the specific Refill endpoint (POST), not Details (PATCH)
      const { data } = await api.post("/clients/refill", payload);
      return data;
    },
    onSuccess: (_, variables) => {
      toast.success(`Added ${variables.hours} hours to budget`);
      queryClient.invalidateQueries({ queryKey });
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || "Failed to add hours");
    },
  });

  return {
    refillBalance: refillMutation.mutate,
    isRefilling: refillMutation.isPending,
  };
};
