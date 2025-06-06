
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/config/axios";
import { useToast } from "@/hooks/use-toast";

export const useTeacherQuizzes = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Fetch teacher's quizzes
  const { data: quizzes, isLoading: quizzesLoading } = useQuery({
    queryKey: ["teacher-quizzes"],
    queryFn: async () => {
      const response = await api.get("/teacher/quizzes");
      console.log("Teacher Quizzes", response.data);
      return response.data;
    },
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  });

  // Create quiz mutation
  const createQuizMutation = useMutation({
    mutationFn: async (quizData: any) => {
      const response = await api.post("/teacher/quizzes", quizData);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["teacher-quizzes"] });
      toast({
        title: "Success",
        description: "Quiz created successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to create quiz",
        variant: "destructive",
      });
    },
  });

  // Update quiz mutation
  const updateQuizMutation = useMutation({
    mutationFn: async ({ id, quizData }: { id: number; quizData: any }) => {
      const response = await api.put(`/teacher/quizzes/${id}`, quizData);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["teacher-quizzes"] });
      toast({
        title: "Success",
        description: "Quiz updated successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to update quiz",
        variant: "destructive",
      });
    },
  });

  // Delete quiz mutation
  const deleteQuizMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await api.delete(`/teacher/quizzes/${id}`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["teacher-quizzes"] });
      toast({
        title: "Success",
        description: "Quiz deleted successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to delete quiz",
        variant: "destructive",
      });
    },
  });

  return {
    quizzes,
    quizzesLoading,
    createQuizMutation,
    updateQuizMutation,
    deleteQuizMutation,
  };
};
