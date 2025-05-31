
import { DashboardStats } from "@/components/student/DashboardStats";
import { StudentDashboardTabs } from "@/components/student/StudentDashboardTabs";
import { useStudentData } from "@/hooks/useStudentData";

const StudentDashboard = () => {
  const { stats, courses, quizzes, progressData, weeklyGoal } = useStudentData();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">لوحة تحكم الطالب</h1>
        
        <DashboardStats stats={stats} />
        
        <StudentDashboardTabs 
          courses={courses}
          quizzes={quizzes}
          progressData={progressData}
          weeklyGoal={weeklyGoal}
        />
      </div>
    </div>
  );
};

export default StudentDashboard;
