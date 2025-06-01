
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";

export const useTeacherDashboard = () => {
  const [stats] = useState({
    totalStudents: 45,
    activeQuizzes: 8,
    completedQuizzes: 23,
    averageScore: 82,
    coursesCreated: 5,
    totalLessons: 67
  });

  const [recentQuizResults] = useState([
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
  ]);

  const [upcomingTasks] = useState([
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
  ]);

  const [studentProgress] = useState([
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
  ]);

  return {
    stats,
    recentQuizResults,
    upcomingTasks,
    studentProgress,
    isLoading: false
  };
};
