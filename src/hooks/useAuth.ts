
import { setUser, logout as logoutAction } from "@/config/store/auth";
import { loginUser, logoutUser, registerUser, resetPassword } from "@/services/api";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import type { RootState } from "@/config/store/store";

export const useAuth = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const user = useSelector((state: RootState) => state?.auth?.user);
  const role = useSelector((state: RootState) => state?.auth?.role);

  const CheckRoleNavigation = () => {
    if(role === 'admin') navigate('/admin/*')
    else if(role === 'teacher') navigate("/teacher-dashboard/*");
    else if (role === "student") navigate("/student-dashboard");
  }

  const loginMutation = useMutation({
    mutationFn: loginUser,
    onSuccess: (data) => {
      dispatch(setUser(data?.data?.data));
      CheckRoleNavigation()
    },
    onError: (error) => {
      console.error("Error fetching user data:", error);
    },
  });

  const registerMutation = useMutation({
    mutationFn: registerUser,
    onSuccess: (data) => {
      dispatch(setUser(data));
      CheckRoleNavigation();
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

  const isAuthenticated = !!user;
  const isLoading = loginMutation.isPending || registerMutation.isPending;

  const logout = useMutation({
    mutationFn: logoutUser,
    onSuccess: () => {
      dispatch(logoutAction());
      navigate('/');
    },
  });

  return {
    loginMutation,
    registerMutation,
    resetPasswordMutation,
    user,
    isAuthenticated,
    isLoading,
    logout,
    CheckRoleNavigation,
  };
};
