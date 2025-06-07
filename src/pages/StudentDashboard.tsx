
import React from "react";
import { Routes, Route } from "react-router-dom";
import {
  SidebarProvider,
  SidebarInset,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { StudentSidebar } from "@/components/student/StudentSidebar";
import StudentHeader from "@/components/student/StudentHeader";
import { StudentDashboardOverview } from "@/components/student/StudentDashboardOverview";
import { StudentCoursesPage } from "@/components/student/StudentCoursesPage";
import { StudentQuizzesPage } from "@/components/student/StudentQuizzesPage";
import { StudentProgressPage } from "@/components/student/StudentProgressPage";
import { useTranslation } from "react-i18next";

const StudentDashboard = () => {
  const { i18n } = useTranslation();
  const isRTL = i18n.language === "ar";

  return (
    <div className={`min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 w-full ${isRTL ? 'rtl-layout' : 'ltr-layout'}`} dir={isRTL ? "rtl" : "ltr"}>
      <SidebarProvider>
        <div className={`min-h-screen flex w-full ${isRTL ? 'flex-row-reverse' : ''}`}>
          <StudentSidebar />
          <SidebarInset>
            <StudentHeader />
            <div className={`flex h-14 shrink-0 items-center gap-2 border-b px-4 ${isRTL ? 'flex-row-reverse' : ''}`}>
              <SidebarTrigger className={isRTL ? "-mr-1" : "-ml-1"} />
              <div className={isRTL ? "mr-auto" : "ml-auto"} />
            </div>
            <main className="flex-1 p-6">
              <Routes>
                <Route path="/" element={<StudentDashboardOverview />} />
                <Route path="/courses" element={<StudentCoursesPage />} />
                <Route path="/quizzes" element={<StudentQuizzesPage />} />
                <Route path="/progress" element={<StudentProgressPage />} />
              </Routes>
            </main>
          </SidebarInset>
        </div>
      </SidebarProvider>
    </div>
  );
};

export default StudentDashboard;
