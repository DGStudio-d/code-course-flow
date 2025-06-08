
import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Edit, Trash2, Eye } from "lucide-react";
import { Link } from "react-router-dom";
import { useAdminQuizzes } from "@/hooks/useAdminQuizzes";
import { useTranslation } from "react-i18next";

const AdminQuizzes = () => {
  const { quizzes, quizzesLoading, deleteQuizMutation } = useAdminQuizzes();
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === "ar";

  const handleDeleteQuiz = (id: number) => {
    if (window.confirm(t("admin.quiz.deleteConfirm", "Are you sure you want to delete this quiz?"))) {
      deleteQuizMutation.mutate(id);
    }
  };

  console.log('Quizzes:', quizzes?.data);

  if (quizzesLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-lg">{t("admin.quiz.loading", "Loading quizzes...")}</div>
      </div>
    );
  }

  const quizzesList = quizzes?.data?.data || [];

  return (
    <div className={`space-y-6 ${isRTL ? 'text-right rtl-layout' : 'text-left'}`} dir={isRTL ? "rtl" : "ltr"}>
      <div className={`flex justify-between items-center ${isRTL ? 'flex-row-reverse' : ''}`}>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            {t("admin.quiz.management", "Quiz Management")}
          </h1>
          <p className="text-gray-600 mt-2">
            {t("admin.quiz.description", "Create and manage quizzes for students")}
          </p>
        </div>
        <Button asChild>
          <Link to="/admin/quizzes/create" className={`flex items-center ${isRTL ? 'space-x-reverse space-x-2' : 'space-x-2'}`}>
            <Plus className="w-4 h-4" />
            <span>{t("admin.quiz.addNew", "Add New Quiz")}</span>
          </Link>
        </Button>
      </div>

      <div className="grid gap-6">
        {quizzesList.length === 0 ? (
          <Card>
            <CardContent className="py-8">
              <div className="text-center text-gray-500">
                <p>{t("admin.quiz.noQuizzes", "No quizzes found")}</p>
                <p className="text-sm mt-2">{t("admin.quiz.createFirst", "Create your first quiz to get started")}</p>
              </div>
            </CardContent>
          </Card>
        ) : (
          quizzesList.map((quiz: any) => (
            <Card key={quiz.id}>
              <CardHeader>
                <div className={`flex justify-between items-start ${isRTL ? 'flex-row-reverse' : ''}`}>
                  <div>
                    <CardTitle className="text-xl">{quiz?.title}</CardTitle>
                    <div className={`flex gap-4 mt-2 text-sm text-gray-600 ${isRTL ? 'flex-row-reverse' : ''}`}>
                      <span>{t("admin.quiz.language", "Language")}: {quiz?.language?.name || t("common.notSpecified", "Not specified")}</span>
                      <span>{t("admin.quiz.level", "Level")}: {quiz?.difficulty}</span>
                      <span>{t("admin.quiz.questionsCount", "Questions")}: {quiz?.questions?.length || 0}</span>
                      <span>{t("admin.quiz.duration", "Duration")}: {quiz?.time_limit || t("common.notSpecified", "Not specified")} {t("admin.quiz.minutes", "minutes")}</span>
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
                      {quiz?.status === "published" ? t("admin.quiz.published", "Published") : t("admin.quiz.draft", "Draft")}
                    </span>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className={`flex gap-2 ${isRTL ? 'justify-start flex-row-reverse' : 'justify-end'}`}>
                  <Button variant="outline" size="sm" className={`flex items-center ${isRTL ? 'space-x-reverse space-x-1' : 'space-x-1'}`}>
                    <Eye className="w-4 h-4" />
                    <span>{t("admin.quiz.preview", "Preview")}</span>
                  </Button>
                  <Button variant="outline" size="sm" asChild>
                    <Link to={`/admin/quizzes/edit/${quiz.id}`} className={`flex items-center ${isRTL ? 'space-x-reverse space-x-1' : 'space-x-1'}`}>
                      <Edit className="w-4 h-4" />
                      <span>{t("admin.quiz.edit", "Edit")}</span>
                    </Link>
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className={`text-red-600 hover:text-red-700 flex items-center ${isRTL ? 'space-x-reverse space-x-1' : 'space-x-1'}`}
                    onClick={() => handleDeleteQuiz(quiz.id)}
                    disabled={deleteQuizMutation.isPending}
                  >
                    <Trash2 className="w-4 h-4" />
                    <span>{t("admin.quiz.delete", "Delete")}</span>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};

export default AdminQuizzes;
