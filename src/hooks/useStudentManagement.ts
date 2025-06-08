
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/config/axios";
import { useToast } from "@/hooks/use-toast";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";

interface StudentFormData {
  first_name: string;
  last_name: string;
  email: string;
  password?: string;
  password_confirmation?: string;
  phone: string;
  age: number;
  language_id: number;
  level: "beginner" | "intermediate" | "advanced";
  type: "group" | "individual";
}

interface UpdateStudent {
  data: StudentFormData;
  id: string;
}

export const useStudentManagement = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { t } = useTranslation();
  const navigate = useNavigate();

  // Fetch students only
  const {
    data: studentsResponse,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ["students"],
    queryFn: () => api.get("/admin/users?role=student").then((res) => res.data.data),
  });

  // Create student mutation
  const createStudentMutation = useMutation({
    mutationFn: (data: StudentFormData) =>
      api.post("/admin/users", { ...data, role: "student" }).then((res) => res.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["students"] });
      toast({
        title: t("admin.students.messages.createSuccess", "Student created successfully"),
        description: t("admin.students.messages.createSuccessDesc", "The new student has been added to the system"),
      });
      navigate("/admin/students");
    },
    onError: (error: any) => {
      toast({
        title: t("admin.students.messages.createError", "Error creating student"),
        description: error.message || t("admin.students.messages.createErrorDesc", "Failed to create student"),
        variant: "destructive",
      });
    },
  });

  // Update student mutation
  const updateStudentMutation = useMutation({
    mutationFn: ({ data, id }: UpdateStudent) =>
      api.put(`/admin/users/${id}`, data).then((res) => res.data),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["students"] });
      queryClient.invalidateQueries({ queryKey: ["user", variables.id] });
      toast({
        title: t("admin.students.messages.updateSuccess", "Student updated successfully"),
        description: t("admin.students.messages.updateSuccessDesc", "The student information has been updated"),
      });
      navigate("/admin/students");
    },
    onError: (error: any) => {
      toast({
        title: t("admin.students.messages.updateError", "Error updating student"),
        description: error.message || t("admin.students.messages.updateErrorDesc", "Failed to update student"),
        variant: "destructive",
      });
    },
  });

  // Delete student mutation
  const deleteStudentMutation = useMutation({
    mutationFn: (id: string) =>
      api.delete(`/admin/users/${id}`).then((res) => res.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["students"] });
      toast({
        title: t("admin.students.messages.deleteSuccess", "Student deleted successfully"),
        description: t("admin.students.messages.deleteSuccessDesc", "The student has been removed from the system"),
      });
    },
    onError: (error: any) => {
      toast({
        title: t("admin.students.messages.deleteError", "Error deleting student"),
        description: error.message || t("admin.students.messages.deleteErrorDesc", "Failed to delete student"),
        variant: "destructive",
      });
    },
  });

  return {
    students: studentsResponse || [],
    isLoading,
    error,
    refetch,
    createStudentMutation,
    updateStudentMutation,
    deleteStudentMutation,
  };
};
