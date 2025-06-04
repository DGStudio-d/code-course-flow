import api from "@/config/axios";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useToast } from "./use-toast";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { UserFormData } from "@/types";
interface upUers{
  data:UserFormData,
  id:string
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
  const updateMutation = useMutation({
    mutationFn: ({ data, id }: upUers) =>
      api.put(`/users/${id}`, data).then((res) => res.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      queryClient.invalidateQueries({ queryKey: ["user", id] });
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
    deleteMutation,
    updateMutation,
    usersResponse,
    isLoading,
    error,
    refetch,
  };
};

export default useUsers;
