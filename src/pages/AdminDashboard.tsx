
import React from "react";
import { Routes, Route } from "react-router-dom";
import AdminHeader from "@/components/admin/AdminHeader";
import AdminSidebar from "@/components/admin/AdminSidebar";
import AdminDashboardOverview from "@/components/admin/AdminDashboardOverview";
import AdminUsers from "@/components/admin/AdminUsers";
import AdminProfessors from "@/components/admin/AdminProfessors";
import AdminLanguages from "@/components/admin/AdminLanguages";
import AdminCourses from "@/components/admin/AdminCourses";
import AdminSettings from "@/components/admin/AdminSettings";

const AdminDashboard = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <AdminHeader />
      <div className="flex">
        <AdminSidebar />
        <main className="flex-1 p-6">
          <Routes>
            <Route path="/" element={<AdminDashboardOverview />} />
            <Route path="/users" element={<AdminUsers />} />
            <Route path="/professors" element={<AdminProfessors />} />
            <Route path="/languages" element={<AdminLanguages />} />
            <Route path="/courses" element={<AdminCourses />} />
            <Route path="/settings" element={<AdminSettings />} />
          </Routes>
        </main>
      </div>
    </div>
  );
};

export default AdminDashboard;
