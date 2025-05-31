
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { StudentCoursesTab } from "./StudentCoursesTab";
import { StudentQuizzesTab } from "./StudentQuizzesTab";
import { StudentProgressTab } from "./StudentProgressTab";

interface Course {
  id: string;
  title: string;
  description: string;
  progress: number;
  totalLessons: number;
  completedLessons: number;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  thumbnail: string;
  estimatedTime: string;
}

interface Quiz {
  id: string;
  title: string;
  description: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  duration: number;
  questionsCount: number;
  bestScore?: number;
  completed: boolean;
  language: string;
}

interface ProgressData {
  skillName: string;
  progress: number;
  level: string;
  nextMilestone: string;
}

interface WeeklyGoal {
  target: number;
  completed: number;
  unit: string;
}

interface StudentDashboardTabsProps {
  courses: Course[];
  quizzes: Quiz[];
  progressData: ProgressData[];
  weeklyGoal: WeeklyGoal;
}

export const StudentDashboardTabs = ({ 
  courses, 
  quizzes, 
  progressData, 
  weeklyGoal 
}: StudentDashboardTabsProps) => {
  return (
    <Tabs defaultValue="courses" className="space-y-6">
      <TabsList className="grid w-full grid-cols-3">
        <TabsTrigger value="courses">دوراتي</TabsTrigger>
        <TabsTrigger value="quizzes">الاختبارات</TabsTrigger>
        <TabsTrigger value="progress">التقدم</TabsTrigger>
      </TabsList>
      
      <TabsContent value="courses" className="space-y-6">
        <StudentCoursesTab courses={courses} />
      </TabsContent>
      
      <TabsContent value="quizzes" className="space-y-6">
        <StudentQuizzesTab quizzes={quizzes} />
      </TabsContent>
      
      <TabsContent value="progress" className="space-y-6">
        <StudentProgressTab progressData={progressData} weeklyGoal={weeklyGoal} />
      </TabsContent>
    </Tabs>
  );
};
