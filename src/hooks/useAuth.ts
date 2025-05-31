import { setUser } from "@/config/store/auth";
import { loginUser, registerUser } from "@/services/api";
import { useQuery,useMutation } from "@tanstack/react-query";
import { useDispatch, useSelector } from "react-redux";




export const useAuth = () => {
  const dispatch = useDispatch();

  const loginMutation = useMutation({
    mutationFn: loginUser,
    onSuccess: (data) => {
      dispatch(setUser(data?.data?.data));
    },
    onError: (error) => {
      console.error("Error fetching user data:", error);
    },
  });
  const registerMutation = useMutation({mutationFn:registerUser,
    onSuccess: (data) => {
      dispatch(setUser(data));
    },
    onError: (error) => {
      console.error("Error registering user:", error);
    },
  });
  const user =useSelector((state: any) => state.auth.user);
  const role =useSelector((state: any) => state.auth.role);


  

  return {loginMutation, registerMutation,user,role};
}