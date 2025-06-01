
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";

export const useAdminDashboard = () => {
  const [stats] = useState({
    totalUsers: 23,
    totalTeachers: 3,
    totalLanguages: 5,
    pendingApprovals: 2,
    activeStudents: 18,
    totalCourses: 12,
    totalQuizzes: 25
  });

  const [recentRegistrations] = useState([
    {
      id: 1,
      name: "أحمد محمد",
      email: "ahmed@example.com",
      language: "الإنجليزية",
      date: "2025-05-05"
    },
    {
      id: 2,
      name: "سارة علي",
      email: "sara@example.com",
      language: "الفرنسية",
      date: "2025-05-04"
    },
    {
      id: 3,
      name: "محمد خالد",
      email: "mohamed@example.com",
      language: "الإسبانية",
      date: "2025-05-03"
    }
  ]);

  const [notifications] = useState([
    {
      id: 1,
      title: "مستخدم جديد",
      message: "انضم طالب جديد إلى المنصة",
      time: "منذ 5 دقائق",
      type: "user"
    },
    {
      id: 2,
      title: "تحديث النظام",
      message: "تم تحديث النظام بنجاح",
      time: "منذ ساعة",
      type: "system"
    },
    {
      id: 3,
      title: "دفعة جديدة",
      message: "تم استلام دفعة جديدة",
      time: "منذ 3 ساعات",
      type: "payment"
    }
  ]);

  return {
    stats,
    recentRegistrations,
    notifications,
    isLoading: false
  };
};
