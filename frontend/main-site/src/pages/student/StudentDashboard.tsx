import React from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";
import {
  BookOpen,
  ClipboardList,
  Users,
  Trophy,
  Calendar,
  MessageCircle,
} from "lucide-react";

const StudentDashboard = () => {
  const navigate = useNavigate();
  const { t, dir } = useLanguage();

  const quickActions = [
    {
      title: t("student.quizzes"),
      description: t("student.quizzesDesc"),
      icon: ClipboardList,
      color: "bg-blue-500",
      href: "/student/quizzes",
    },
    {
      title: t("student.programs"),
      description: t("student.programsDesc"),
      icon: BookOpen,
      color: "bg-green-500",
      href: "/programs",
    },
    {
      title: t("student.liveSessions"),
      description: t("student.liveSessionsDesc"),
      icon: Users,
      color: "bg-purple-500",
      href: "/live-sessions",
    },
    {
      title: t("quiz.results"),
      description: t("student.resultsDesc"),
      icon: Trophy,
      color: "bg-orange-500",
      href: "/student/results",
    },
  ];

  return (
    <div className="space-y-6" dir={dir}>
      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl font-bold mb-2">{t("student.dashboard")}</h1>
        <p className="text-gray-600">{t("student.welcome")}</p>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {quickActions.map((action, index) => (
          <Card
            key={index}
            className="hover:shadow-lg transition-shadow cursor-pointer"
          >
            <CardContent className="p-6">
              <div className="flex flex-col items-center text-center space-y-4">
                <div className={`p-4 rounded-full ${action.color}`}>
                  <action.icon className="h-8 w-8 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg">{action.title}</h3>
                  <p className="text-sm text-gray-600 mt-1">
                    {action.description}
                  </p>
                </div>
                <Button
                  onClick={() => navigate(action.href)}
                  className="w-full"
                  variant="outline"
                >
                  {t("student.goTo")}
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>{t("student.recentActivity")}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-gray-500">
            <Calendar className="h-12 w-12 mx-auto mb-4 text-gray-400" />
            <p>{t("student.noRecentActivity")}</p>
          </div>
        </CardContent>
      </Card>

      {/* Quick Links */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>{t("student.quickLinks")}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button
              variant="ghost"
              className="w-full justify-start"
              onClick={() => navigate("/student/quizzes")}
            >
              <ClipboardList className={`h-4 w-4 ${dir === 'rtl' ? 'ml-2' : 'mr-2'}`} />
              {t("student.availableQuizzes")}
            </Button>
            <Button
              variant="ghost"
              className="w-full justify-start"
              onClick={() => navigate("/programs")}
            >
              <BookOpen className={`h-4 w-4 ${dir === 'rtl' ? 'ml-2' : 'mr-2'}`} />
              {t("student.myPrograms")}
            </Button>
            <Button
              variant="ghost"
              className="w-full justify-start"
              onClick={() => navigate("/contact")}
            >
              <MessageCircle className={`h-4 w-4 ${dir === 'rtl' ? 'ml-2' : 'mr-2'}`} />
              {t("nav.contact")}
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{t("student.statistics")}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">
                  {t("student.completedQuizzes")}
                </span>
                <span className="font-semibold">0</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">
                  {t("student.enrolledPrograms")}
                </span>
                <span className="font-semibold">0</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">{t("student.averageGrade")}</span>
                <span className="font-semibold">-</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default StudentDashboard;
