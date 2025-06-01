
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";

export const useStudentDashboardLogic = () => {
  const [stats] = useState({
    coursesEnrolled: 3,
    hoursStudied: 45,
    quizzesCompleted: 12,
    averageScore: 87
  });

  const [courses] = useState([
    {
      id: "1",
      title: "دورة الإنجليزية للمبتدئين",
      description: "تعلم أساسيات اللغة الإنجليزية من الصفر",
      progress: 65,
      totalLessons: 20,
      completedLessons: 13,
      difficulty: "beginner" as const,
      thumbnail: "/lovable-uploads/cec2c3f2-aa59-4991-911a-debb45524167.png",
      estimatedTime: "8 أسابيع"
    },
    {
      id: "2",
      title: "دورة الفرنسية المتوسطة",
      description: "طور مهاراتك في اللغة الفرنسية",
      progress: 30,
      totalLessons: 25,
      completedLessons: 7,
      difficulty: "intermediate" as const,
      thumbnail: "/lovable-uploads/cec2c3f2-aa59-4991-911a-debb45524167.png",
      estimatedTime: "10 أسابيع"
    }
  ]);

  const [quizzes] = useState([
    {
      id: "1",
      title: "اختبار الإنجليزية - المستوى المبتدئ",
      description: "اختبار شامل لقياس مستواك في اللغة الإنجليزية",
      difficulty: "beginner" as const,
      duration: 900,
      questionsCount: 15,
      bestScore: 92,
      completed: true,
      language: "الإنجليزية"
    },
    {
      id: "2",
      title: "اختبار الفرنسية - قواعد النحو",
      description: "اختبار متخصص في قواعد النحو الفرنسية",
      difficulty: "intermediate" as const,
      duration: 1200,
      questionsCount: 20,
      completed: false,
      language: "الفرنسية"
    }
  ]);

  const [progressData] = useState([
    {
      skillName: "القراءة",
      progress: 85,
      level: "متوسط",
      nextMilestone: "متقدم"
    },
    {
      skillName: "الكتابة",
      progress: 70,
      level: "مبتدئ متقدم",
      nextMilestone: "متوسط"
    },
    {
      skillName: "الاستماع",
      progress: 90,
      level: "متقدم",
      nextMilestone: "خبير"
    },
    {
      skillName: "المحادثة",
      progress: 60,
      level: "مبتدئ",
      nextMilestone: "مبتدئ متقدم"
    }
  ]);

  const [weeklyGoal] = useState({
    target: 10,
    completed: 7,
    unit: "ساعات دراسة"
  });

  const [recentActivities] = useState([
    {
      id: 1,
      title: "اكتمال درس جديد في اللغة الإنجليزية",
      time: "منذ ساعتين",
      type: "lesson"
    },
    {
      id: 2,
      title: "نجح في اختبار القواعد المتوسط",
      time: "أمس",
      type: "quiz"
    }
  ]);

  return {
    stats,
    courses,
    quizzes,
    progressData,
    weeklyGoal,
    recentActivities,
    isLoading: false
  };
};
