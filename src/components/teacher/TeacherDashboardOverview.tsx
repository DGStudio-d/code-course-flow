
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, BarChart3, FileText, Users } from "lucide-react";
import QuizCreationForm from "./QuizCreationForm";

const TeacherDashboardOverview = () => {
  const [showCreateQuiz, setShowCreateQuiz] = useState(false);

  const dashboardStats = [
    { title: 'إجمالي الاختبارات', value: '24', icon: FileText, color: 'text-blue-600' },
    { title: 'الطلاب النشطون', value: '156', icon: Users, color: 'text-green-600' },
    { title: 'معدل النجاح', value: '78%', icon: BarChart3, color: 'text-purple-600' },
    { title: 'اختبارات هذا الشهر', value: '8', icon: Plus, color: 'text-orange-600' }
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">لوحة تحكم المعلم</h1>
          <p className="text-gray-600 mt-2">إدارة الاختبارات ومتابعة أداء الطلاب</p>
        </div>
        <Button 
          onClick={() => setShowCreateQuiz(true)}
          className="bg-green-gradient hover:opacity-90"
        >
          <Plus className="w-4 h-4 ml-2" />
          إنشاء اختبار جديد
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {dashboardStats.map((stat, index) => (
          <Card key={index}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                {stat.title}
              </CardTitle>
              <stat.icon className={`w-4 h-4 ${stat.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>الاختبارات الحديثة</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { title: 'اختبار القواعد المتقدم', students: 24, date: '2024-01-20' },
                { title: 'اختبار المحادثة اليومية', students: 18, date: '2024-01-18' },
                { title: 'اختبار المفردات الأساسية', students: 32, date: '2024-01-15' }
              ].map((quiz, index) => (
                <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium">{quiz.title}</p>
                    <p className="text-sm text-gray-600">{quiz.students} طالب • {quiz.date}</p>
                  </div>
                  <Button variant="outline" size="sm">عرض</Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>أداء الطلاب</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="text-center py-8 text-gray-500">
                <BarChart3 className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                <p>سيتم عرض الرسوم البيانية هنا</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {showCreateQuiz && (
        <QuizCreationForm 
          onClose={() => setShowCreateQuiz(false)}
          onSave={(quiz) => {
            console.log('Quiz created:', quiz);
            setShowCreateQuiz(false);
          }}
        />
      )}
    </div>
  );
};

export { TeacherDashboardOverview };
