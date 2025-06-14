
import React from "react";
import { Routes, Route } from "react-router-dom";
import {
  SidebarProvider,
  SidebarInset,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import AdminSidebar from "@/components/admin/AdminSidebar";
import AdminHeader from "@/components/admin/AdminHeader";
import AdminDashboardOverview from "@/components/admin/AdminDashboardOverview";
import AdminUserEdit from "@/components/admin/AdminUserEdit";
import AdminUserAdd from "@/components/admin/AdminUserAdd";
import AdminProfessors from "@/components/admin/AdminProfessors";
import AdminLanguages from "@/components/admin/AdminLanguages";
import AdminInscriptions from "@/components/admin/AdminInscriptions";
import AdminSettings from "@/components/admin/AdminSettings";
import TeacherManagement from "./TeacherManagement";
import AdminQuizzes from "@/components/admin/AdminQuizzes";
import QuizEdit from "./QuizEdit";
import QuizCreation from "./QuizCreation";
import StudentManagement from "@/components/admin/StudentManagement";
import { useTranslation } from "react-i18next";

const AdminDashboard = () => {
  const { i18n } = useTranslation();
  const isRTL = i18n.language === "ar";

  return (
    <div
      className={`min-h-screen bg-gray-50 w-full ${
        isRTL ? "rtl-layout" : "ltr-layout"
      }`}
      dir={isRTL ? "rtl" : "ltr"}
    >
      <SidebarProvider>
        <div className={`min-h-screen flex w-full ${isRTL ? 'flex-row-reverse' : ''}`}>
          <AdminSidebar />
          
          <SidebarInset className="flex-1">
            <AdminHeader />
            
            <div
              className={`flex h-14 shrink-0 items-center gap-2 border-b px-4 ${
                isRTL ? "flex-row-reverse" : ""
              }`}
            >
              <SidebarTrigger className={isRTL ? "-mr-1" : "-ml-1"} />
              <div className={isRTL ? "mr-auto" : "ml-auto"} />
            </div>

            <main className="flex-1 p-6">
              <Routes>
                <Route path="/" element={<AdminDashboardOverview />} />
                <Route path="/students" element={<StudentManagement />} />
                <Route path="/edit-user/:id" element={<AdminUserEdit />} />
                <Route path="/add-user" element={<AdminUserAdd />} />
                <Route
                  path="/teacher-management"
                  element={<TeacherManagement />}
                />
                <Route path="/languages" element={<AdminLanguages />} />
                <Route path="/inscriptions" element={<AdminInscriptions />} />
                <Route path="/quizzes" element={<AdminQuizzes />} />
                <Route path="/quizzes/edit/:id" element={<QuizEdit />} />
                <Route path="/quizzes/new" element={<QuizEdit />} />
                <Route path="/quizzes/create" element={<QuizCreation />} />
                <Route path="/settings" element={<AdminSettings />} />
              </Routes>
            </main>
          </SidebarInset>
        </div>
      </SidebarProvider>
    </div>
  );
};

export default AdminDashboard;
