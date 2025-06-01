
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

const TeacherDashboard = () => {
  return (
    <div className="min-h-screen bg-gray-50 w-full">
      <Header />
      <SidebarProvider>
        <div className="min-h-screen flex w-full">
          <TeacherSidebar />
          <SidebarInset>
            <div className="flex h-14 shrink-0 items-center gap-2 border-b px-4">
              <SidebarTrigger className="-ml-1" />
              <div className="ml-auto" />
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
