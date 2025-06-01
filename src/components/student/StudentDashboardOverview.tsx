
import React from "react";
import { DashboardStats } from "./DashboardStats";
import { useStudentData } from "@/hooks/useStudentData";

const StudentDashboardOverview = () => {
  const { stats, courses, quizzes, progressData, weeklyGoal } = useStudentData();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">مرحباً بك في لوحة التحكم</h1>
        <p className="text-gray-600 mt-2">تابع تقدمك في التعلم وإنجازاتك</p>
      </div>

      <DashboardStats stats={stats} />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg p-6 shadow-sm border">
          <h2 className="text-xl font-semibold mb-4">آخر الأنشطة</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
              <span>اكتمال درس جديد في اللغة الإنجليزية</span>
              <span className="text-sm text-gray-500">منذ ساعتين</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
              <span>نجح في اختبار القواعد المتوسط</span>
              <span className="text-sm text-gray-500">أمس</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg p-6 shadow-sm border">
          <h2 className="text-xl font-semibold mb-4">الهدف الأسبوعي</h2>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span>التقدم</span>
              <span>{weeklyGoal.current}/{weeklyGoal.target} ساعة</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-green-500 h-2 rounded-full"
                style={{ width: `${(weeklyGoal.current / weeklyGoal.target) * 100}%` }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export { StudentDashboardOverview };
