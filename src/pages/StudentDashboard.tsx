
import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DashboardStats } from "@/components/student/DashboardStats";
import { CourseCard } from "@/components/student/CourseCard";
import { QuizCard } from "@/components/student/QuizCard";
import { ProgressSection } from "@/components/student/ProgressSection";

const StudentDashboard = () => {
  // Mock data - in a real app, this would come from API calls
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">لوحة تحكم الطالب</h1>
        
        <DashboardStats stats={stats} />
        
        <Tabs defaultValue="courses" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="courses">دوراتي</TabsTrigger>
            <TabsTrigger value="quizzes">الاختبارات</TabsTrigger>
            <TabsTrigger value="progress">التقدم</TabsTrigger>
          </TabsList>
          
          <TabsContent value="courses" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {courses.map((course) => (
                <CourseCard key={course.id} course={course} />
              ))}
            </div>
          </TabsContent>
          
          <TabsContent value="quizzes" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {quizzes.map((quiz) => (
                <QuizCard key={quiz.id} quiz={quiz} />
              ))}
            </div>
          </TabsContent>
          
          <TabsContent value="progress" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <ProgressSection 
                  progressData={progressData}
                  overallProgress={76}
                  weeklyGoal={weeklyGoal}
                />
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default StudentDashboard;
