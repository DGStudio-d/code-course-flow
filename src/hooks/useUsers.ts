import api from "@/config/axios";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useToast } from "./use-toast";

const useUsers = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();


  const {
    data: usersResponse,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["users"],
    queryFn: ()=>api.get('/users').then((res)=>res.data),
  });
  const deleteMutation = useMutation({
    mutationFn: (id:string) => api.post(`/users/${id}`).then((res) => res.data),
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
  return{deleteMutation,usersResponse,isLoading,error}
};
export default useUsers;
