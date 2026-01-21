import { useQuery } from "@tanstack/react-query";
import api from "@/lib/api/api";

// 1. The Fetcher Function
const fetchClient = async (slug: string) => {
  const { data } = await api.get(`/clients/${slug}`);
  return data.data;
};

export const useRetainerClient = (slug: string | undefined) => {
  const queryKey = ["client", slug];

  // 2. React Query for Initial Data
  const query = useQuery({
    queryKey,
    queryFn: () => fetchClient(slug!),
    enabled: !!slug,
    staleTime: 1000 * 60 * 5,
    refetchOnWindowFocus: false,
  });

  return query;
};
