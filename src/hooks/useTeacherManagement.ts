
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/config/axios";
import { useToast } from "@/hooks/use-toast";

interface TeacherFormData {
  first_name: string;
  last_name: string;
  email: string;
  password: string;
  phone: string;
  age: number;
  language_id: number;
  bio?: string;
  qualifications?: string;
  expertise?: string;
  socialLinks?: {
    linkedin: string;
    twitter: string;
    website: string;
  };
}

export const useTeacherManagement = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Fetch all teachers
  const { data: teachers, isLoading: teachersLoading } = useQuery({
    queryKey: ["teachers"],
    queryFn: async () => {
      const response = await api.get("/admin/users?includeteacher=true");
      console.log("Teachers", response.data);
      return response.data;
    },
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  });

  // Create teacher mutation with language assignment
  const createTeacherMutation = useMutation({
    mutationFn: async (teacherData: TeacherFormData) => {
      const response = await api.post("/admin/users", {
        ...teacherData,
        role: 'teacher' // Ensure role is set to teacher
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["teachers"] });
      toast({
        title: "Success",
        description: "Teacher created successfully with language assignment",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to create teacher",
        variant: "destructive",
      });
    },
  });

  // Update teacher mutation
  const updateTeacherMutation = useMutation({
    mutationFn: async ({ id, teacherData }: { id: number; teacherData: TeacherFormData }) => {
      const response = await api.put(`/admin/teachers/${id}`, teacherData);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["teachers"] });
      toast({
        title: "Success",
        description: "Teacher updated successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to update teacher",
        variant: "destructive",
      });
    },
  });

  // Delete teacher mutation
  const deleteTeacherMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await api.delete(`/admin/uers/${id}`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["teachers"] });
      toast({
        title: "Success",
        description: "Teacher deleted successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to delete teacher",
        variant: "destructive",
      });
    },
  });

  // Update teacher status
  const updateTeacherStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: number; status: string }) => {
      const response = await api.put(`/admin/teachers/${id}/status`, { status });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["teachers"] });
      toast({
        title: "Success",
        description: "Teacher status updated successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to update teacher status",
        variant: "destructive",
      });
    },
  });

  return {
    teachers,
    teachersLoading,
    createTeacherMutation,
    updateTeacherMutation,
    deleteTeacherMutation,
    updateTeacherStatusMutation,
  };
};
