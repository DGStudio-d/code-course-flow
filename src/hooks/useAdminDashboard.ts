
import api from "@/config/axios";
import { useQuery } from "@tanstack/react-query";

export const useAdminDashboard = () => {
  // Fetch dashboard stats
  const { data: statsData, isLoading: statsLoading } = useQuery({
    queryKey: ["adminDashboardStats"],
    queryFn: async () => {
      const response = await api.get("/admin/dashboard-stats");
      console.log("Stats", response.data);
      return response.data;
    },
    staleTime: 5 * 60 * 1000, // Cache data for 5 minutes
    refetchOnWindowFocus: false, // Prevent refetching on window focus
  });

  // Fetch recent registrations
  const { data: registrationsData, isLoading: registrationsLoading } = useQuery({
    queryKey: ["adminDashboardRecentRegistrations"],
    queryFn: async () => {
      const response = await api.get("/admin/recent-registrations");
      console.log('recent user', response.data)
      return response.data;
    },
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  });

  // Fetch notifications
  const { data: notificationsData, isLoading: notificationsLoading } = useQuery({
    queryKey: ["adminDashboardNotifications"],
    queryFn: async () => {
      const response = await api.get("/admin/notifications");
      console.log("notification", response);
      return response.data;
    },
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  });

  // Combine loading states
  const isLoading = statsLoading || registrationsLoading || notificationsLoading;

  // Provide fallback values if data is not yet available
  const stats = statsData || {
    totalUsers: 0,
    totalTeachers: 0,
    totalLanguages: 0,
    pendingApprovals: 0,
    activeStudents: 0,
    totalCourses: 0,
    totalQuizzes: 0,
  };

  const recentRegistrations = registrationsData || [];
  const notifications = notificationsData || [];

  return {
    stats,
    recentRegistrations,
    notifications,
    isLoading,
  };
};
