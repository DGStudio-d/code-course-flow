
import React from "react";
import { Routes, Route } from "react-router-dom";
import {
  SidebarProvider,
  SidebarInset,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { TeacherSidebar } from "@/components/teacher/TeacherSidebar";
import Header from '@/components/Header';
import { TeacherDashboardOverview } from "@/components/teacher/TeacherDashboardOverview";
import QuizManagement from '@/components/teacher/QuizManagement';
import QuizAnalytics from '@/components/teacher/QuizAnalytics';
import { TeacherStudentsPage } from "@/components/teacher/TeacherStudentsPage";
import { useTranslation } from "react-i18next";

const TeacherDashboard = () => {
  const { i18n } = useTranslation();
  const isRTL = i18n.language === "ar";

  return (
    <div className={`min-h-screen bg-gray-50 w-full ${isRTL ? 'rtl-layout' : 'ltr-layout'}`} dir={isRTL ? "rtl" : "ltr"}>
      <Header />
      <SidebarProvider>
        <div className={`min-h-screen flex w-full ${isRTL ? 'flex-row-reverse' : ''}`}>
          <TeacherSidebar />
          <SidebarInset>
            <div className={`flex h-14 shrink-0 items-center gap-2 border-b px-4 ${isRTL ? 'flex-row-reverse' : ''}`}>
              <SidebarTrigger className={isRTL ? "-mr-1" : "-ml-1"} />
              <div className={isRTL ? "mr-auto" : "ml-auto"} />
            </div>
            <main className="flex-1 p-6">
              <Routes>
                <Route path="/" element={<TeacherDashboardOverview />} />
                <Route path="/quizzes" element={<QuizManagement />} />
                <Route path="/analytics" element={<QuizAnalytics />} />
                <Route path="/students" element={<TeacherStudentsPage />} />
              </Routes>
            </main>
          </SidebarInset>
        </div>
      </SidebarProvider>
    </div>
  );
};

export default TeacherDashboard;
