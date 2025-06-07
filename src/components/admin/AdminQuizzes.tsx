
import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Edit, Trash2, Eye } from "lucide-react";
import { Link } from "react-router-dom";
import { useAdminQuizzes } from "@/hooks/useAdminQuizzes";

const AdminQuizzes = () => {
  const { quizzes, quizzesLoading, deleteQuizMutation } = useAdminQuizzes();

  const handleDeleteQuiz = (id: number) => {
    if (window.confirm("Are you sure you want to delete this quiz?")) {
      deleteQuizMutation.mutate(id);
    }
  };
  console.log('Quizzes :',quizzes?.data)

  if (quizzesLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-lg">Loading quizzes...</div>
      </div>
    );
  }

  const quizzesList = quizzes?.data?.data || [];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">إدارة الاختبارات</h1>
          <p className="text-gray-600 mt-2">إنشاء وإدارة الاختبارات للطلاب</p>
        </div>
        <Button asChild>
          <Link to="/admin/quizzes/create">
            <Plus className="w-4 h-4 mr-2" />
            إضافة اختبار جديد
          </Link>
        </Button>
      </div>

      <div className="grid gap-6">
        {quizzesList.length===0 ? "nothing":quizzesList?.map((quiz: any) => (
          <Card key={quiz.id}>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-xl">{quiz?.title}</CardTitle>
                  <div className="flex gap-4 mt-2 text-sm text-gray-600">
                    <span>اللغة: {quiz?.language?.name || "غير محدد"}</span>
                    <span>المستوى: {quiz?.difficulty}</span>
                    <span>الأسئلة: {quiz?.questions?.length || 0}</span>
                    <span>المدة: {quiz?.time_limit || "غير محدد"} دقيقة</span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <span
                    className={`px-2 py-1 rounded text-xs ${
                      quiz.status === "published"
                        ? "bg-green-100 text-green-800"
                        : "bg-gray-100 text-gray-800"
                    }`}
                  >
                    {quiz?.status === "published" ? "منشور" : "مسودة"}
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
                <Button
                  variant="outline"
                  size="sm"
                  className="text-red-600 hover:text-red-700"
                  onClick={() => handleDeleteQuiz(quiz.id)}
                  disabled={deleteQuizMutation.isPending}
                >
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
