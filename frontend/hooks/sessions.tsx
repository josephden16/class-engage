import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/axios";

export const useSessions = () => {
  return useQuery({
    queryKey: ["sessions"],
    queryFn: async () => {
      const { data } = await api.get("/sessions");
      return data.data;
    },
  });
};

export const useCreateSession = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (newSession: {
      title: string;
      courseId: string;
      questions: any[];
    }) => {
      const { data } = await api.post("/sessions", newSession);
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sessions"] });
    },
  });
};
