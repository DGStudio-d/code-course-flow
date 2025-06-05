
import api from "@/config/axios";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useToast } from "./use-toast";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";

interface InscriptionFormData {
  first_name: string;
  last_name: string;
  email: string;
  password: string;
  password_confirmation: string;
  phone: string;
  age: number;
  role: string;
  language_id: number;
  level: "beginner" | "intermediate" | "advanced";
  type: "group" | "individual";
  start_date: string;
}

interface UserFormData {
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  role: string;
  password: string;
}

interface UpdateUser {
  data: UserFormData;
  id: string;
}

const useUsers = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { t } = useTranslation();
  const navigate = useNavigate();

  const {
    data: usersResponse,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ["users"],
    queryFn: () => api.get("/users").then((res) => res.data.data),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) =>
      api.delete(`/users/${id}`).then((res) => res.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      toast({
        title: t("admin.users.messages.deleteSuccess"),
        description: t("admin.users.messages.deleteSuccessDesc"),
      });
    },
    onError: (error: any) => {
      toast({
        title: t("admin.users.messages.deleteError"),
        description: error.message || t("admin.users.messages.deleteErrorDesc"),
        variant: "destructive",
      });
    },
  });

  const createMutation = useMutation({
    mutationFn: (data: UserFormData) =>
      api.post("/users", data).then((res) => res.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      toast({
        title: t("admin.users.messages.createSuccess"),
        description: t("admin.users.messages.createSuccessDesc"),
      });
      navigate("/admin/users");
    },
    onError: (error: any) => {
      toast({
        title: t("admin.users.messages.createError"),
        description: error.message || t("admin.users.messages.createErrorDesc"),
        variant: "destructive",
      });
    },
  });

  const createInscriptionMutation = useMutation({
    mutationFn: (data: InscriptionFormData) =>
      api.post("/inscriptions", data).then((res) => res.data),
    onSuccess: () => {
      toast({
        title: "Inscription submitted successfully",
        description: "Your inscription has been processed",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Inscription failed",
        description: error.message || "An error occurred while processing your inscription",
        variant: "destructive",
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ data, id }: UpdateUser) =>
      api.put(`/users/${id}`, data).then((res) => res.data),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      queryClient.invalidateQueries({ queryKey: ["user", variables.id] });
      toast({
        title: t("admin.users.messages.updateSuccess"),
        description: t("admin.users.messages.updateSuccessDesc"),
      });
      navigate("/admin/users");
    },
    onError: (error: any) => {
      toast({
        title: t("admin.users.messages.updateError"),
        description: error.message || t("admin.users.messages.updateErrorDesc"),
        variant: "destructive",
      });
    },
  });

  return {
    createMutation,
    createInscriptionMutation,
    deleteMutation,
    updateMutation,
    usersResponse,
    isLoading,
    error,
    refetch,
  };
};

export default useUsers;
