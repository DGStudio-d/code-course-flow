
import React from "react";
import { Routes, Route } from "react-router-dom";
import {
  SidebarProvider,
  SidebarInset,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import AdminHeader from "@/components/admin/AdminHeader";
import AdminDashboardOverview from "@/components/admin/AdminDashboardOverview";
import AdminUsers from "@/components/admin/AdminUsers";
import AdminProfessors from "@/components/admin/AdminProfessors";
import AdminLanguages from "@/components/admin/AdminLanguages";
import AdminCourses from "@/components/admin/AdminCourses";
import AdminSettings from "@/components/admin/AdminSettings";
import CourseEdit from "./CourseEdit";
import QuizEdit from "./QuizEdit";
import TeacherManagement from "./TeacherManagement";
import StudentActivation from "./StudentActivation";
import AdminQuizzes from "@/components/admin/AdminQuizzes";

const AdminDashboard = () => {
  return (
    <div className="min-h-screen bg-gray-50 w-full">
      <SidebarProvider>
        <div className="min-h-screen flex w-full">
          <AdminSidebar />
          <SidebarInset>
            <AdminHeader />
            <div className="flex h-14 shrink-0 items-center gap-2 border-b px-4">
              <SidebarTrigger className="-ml-1" />
              <div className="ml-auto" />
            </div>
            <main className="flex-1 p-6">
              <Routes>
                <Route path="/" element={<AdminDashboardOverview />} />
                <Route path="/users" element={<AdminUsers />} />
                <Route path="/professors" element={<AdminProfessors />} />
                <Route path="/teacher-management" element={<TeacherManagement />} />
                <Route path="/student-activation" element={<StudentActivation />} />
                <Route path="/languages" element={<AdminLanguages />} />
                <Route path="/courses" element={<AdminCourses />} />
                <Route path="/courses/edit/:id" element={<CourseEdit />} />
                <Route path="/courses/new" element={<CourseEdit />} />
                <Route path="/quizzes" element={<AdminQuizzes />} />
                <Route path="/quizzes/edit/:id" element={<QuizEdit />} />
                <Route path="/quizzes/new" element={<QuizEdit />} />
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
