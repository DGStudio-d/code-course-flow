
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useTeacherDashboard } from "@/hooks/useTeacherDashboard";
import { Users, FileText, Trophy, TrendingUp, BookOpen, Clock } from "lucide-react";

const TeacherDashboardOverview = () => {
  const { stats, recentQuizResults, upcomingTasks, isLoading } = useTeacherDashboard();

  if (isLoading) {
    return <div>Loading...</div>;
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'destructive';
      case 'medium': return 'default';
      case 'low': return 'secondary';
      default: return 'default';
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">لوحة التحكم</h1>
        <p className="text-gray-600 mt-2">مرحباً بك في لوحة المدرس</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">إجمالي الطلاب</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalStudents}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">الاختبارات النشطة</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activeQuizzes}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">متوسط النتائج</CardTitle>
            <Trophy className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.averageScore}%</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Quiz Results */}
        <Card>
          <CardHeader>
            <CardTitle>آخر نتائج الاختبارات</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentQuizResults.map((result) => (
                <div key={result.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium">{result.quizName}</p>
                    <p className="text-sm text-gray-600">{result.studentName}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-lg">{result.score}%</p>
                    <p className="text-xs text-gray-500">{result.date}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Upcoming Tasks */}
        <Card>
          <CardHeader>
            <CardTitle>المهام القادمة</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {upcomingTasks.map((task) => (
                <div key={task.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <p className="font-medium">{task.title}</p>
                    <p className="text-sm text-gray-600">استحقاق: {task.dueDate}</p>
                  </div>
                  <Badge variant={getPriorityColor(task.priority)}>
                    {task.priority === 'high' ? 'عالية' : 
                     task.priority === 'medium' ? 'متوسطة' : 'منخفضة'}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export { TeacherDashboardOverview };
