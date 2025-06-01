
import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Edit, Trash2, Eye } from "lucide-react";
import { Link } from "react-router-dom";

const AdminQuizzes = () => {
  const quizzes = [
    {
      id: 1,
      title: "اختبار القواعد المتقدم",
      language: "العربية",
      difficulty: "متقدم",
      questions: 20,
      duration: 45,
      status: "منشور"
    },
    {
      id: 2,
      title: "English Grammar Basic",
      language: "English",
      difficulty: "مبتدئ",
      questions: 15,
      duration: 30,
      status: "مسودة"
    },
    {
      id: 3,
      title: "French Vocabulary",
      language: "Français",
      difficulty: "متوسط",
      questions: 25,
      duration: 40,
      status: "منشور"
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">إدارة الاختبارات</h1>
          <p className="text-gray-600 mt-2">إنشاء وإدارة الاختبارات للطلاب</p>
        </div>
        <Button asChild>
          <Link to="/admin/quizzes/new">
            <Plus className="w-4 h-4 mr-2" />
            إضافة اختبار جديد
          </Link>
        </Button>
      </div>

      <div className="grid gap-6">
        {quizzes.map((quiz) => (
          <Card key={quiz.id}>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-xl">{quiz.title}</CardTitle>
                  <div className="flex gap-4 mt-2 text-sm text-gray-600">
                    <span>اللغة: {quiz.language}</span>
                    <span>المستوى: {quiz.difficulty}</span>
                    <span>الأسئلة: {quiz.questions}</span>
                    <span>المدة: {quiz.duration} دقيقة</span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <span className={`px-2 py-1 rounded text-xs ${
                    quiz.status === 'منشور' 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    {quiz.status}
                  </span>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex justify-end gap-2">
                <Button variant="outline" size="sm">
                  <Eye className="w-4 h-4 mr-1" />
                  معاينة
                </Button>
                <Button variant="outline" size="sm" asChild>
                  <Link to={`/admin/quizzes/edit/${quiz.id}`}>
                    <Edit className="w-4 h-4 mr-1" />
                    تعديل
                  </Link>
                </Button>
                <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700">
                  <Trash2 className="w-4 h-4 mr-1" />
                  حذف
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default AdminQuizzes;
