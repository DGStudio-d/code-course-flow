
import { useQuery } from "@tanstack/react-query";
import api from "@/config/axios";

export const useTeacherDashboard = () => {
  // Fetch teacher dashboard stats
  const { data: statsData, isLoading: statsLoading } = useQuery({
    queryKey: ["teacherDashboardStats"],
    queryFn: async () => {
      const response = await api.get("/teacher/dashboard-stats");
      console.log("Teacher Stats", response.data);
      return response.data;
    },
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  });

  // Fetch teacher quizzes
  const { data: quizzesData, isLoading: quizzesLoading } = useQuery({
    queryKey: ["teacherQuizzes"],
    queryFn: async () => {
      const response = await api.get("/teacher/quizzes");
      console.log("Teacher Quizzes", response.data);
      return response.data;
    },
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  });

  // Fetch teacher inscriptions
  const { data: inscriptionsData, isLoading: inscriptionsLoading } = useQuery({
    queryKey: ["teacherInscriptions"],
    queryFn: async () => {
      const response = await api.get("/teacher/inscriptions");
      console.log("Teacher Inscriptions", response.data);
      return response.data;
    },
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  });

  const isLoading = statsLoading || quizzesLoading || inscriptionsLoading;

  // Provide fallback values based on actual API data or mock data
  const stats = statsData || {
    totalStudents: 0,
    activeQuizzes: 0,
    completedQuizzes: 0,
    averageScore: 0,
    coursesCreated: 0,
    totalLessons: 0
  };

  const recentQuizResults = quizzesData?.recent_results || [
    {
      id: 1,
      quizName: "اختبار القواعد الأساسية",
      studentName: "أحمد محمد",
      score: 85,
      date: "2025-05-30",
      status: "completed"
    },
    {
      id: 2,
      quizName: "اختبار المفردات",
      studentName: "سارة علي",
      score: 92,
      date: "2025-05-29",
      status: "completed"
    },
    {
      id: 3,
      quizName: "اختبار المحادثة",
      studentName: "محمد خالد",
      score: 78,
      date: "2025-05-28",
      status: "completed"
    }
  ];

  const upcomingTasks = [
    {
      id: 1,
      title: "مراجعة اختبارات الأسبوع",
      dueDate: "2025-06-02",
      priority: "high",
      type: "review"
    },
    {
      id: 2,
      title: "إنشاء درس جديد",
      dueDate: "2025-06-05",
      priority: "medium",
      type: "create"
    },
    {
      id: 3,
      title: "تحديث المنهج",
      dueDate: "2025-06-10",
      priority: "low",
      type: "update"
    }
  ];

  const studentProgress = inscriptionsData?.student_progress || [
    {
      studentId: 1,
      studentName: "أحمد محمد",
      courseName: "الإنجليزية للمبتدئين",
      progress: 75,
      lastActivity: "2025-05-30"
    },
    {
      studentId: 2,
      studentName: "سارة علي",
      courseName: "الفرنسية المتوسطة",
      progress: 60,
      lastActivity: "2025-05-29"
    }
  ];

  return {
    stats,
    recentQuizResults,
    upcomingTasks,
    studentProgress,
    isLoading
  };
};
