
import { setUser, logout as logoutAction } from "@/config/store/auth";
import { loginUser, registerUser, resetPassword } from "@/services/api";
import { useQuery, useMutation } from "@tanstack/react-query";
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

  const registerMutation = useMutation({
    mutationFn: registerUser,
    onSuccess: (data) => {
      dispatch(setUser(data));
    },
    onError: (error) => {
      console.error("Error registering user:", error);
    },
  });

  const resetPasswordMutation = useMutation({
    mutationFn: resetPassword,
    onError: (error) => {
      console.error("Error resetting password:", error);
    },
  });

  const user = useSelector((state: any) => state.auth.user);
  const isAuthenticated = !!user;
  const isLoading = loginMutation.isPending || registerMutation.isPending;

  const logout = () => {
    dispatch(logoutAction());
  };

  return {
    loginMutation,
    registerMutation,
    resetPasswordMutation,
    user,
    isAuthenticated,
    isLoading,
    logout,
  };
};
