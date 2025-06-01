
import React from "react";
import { StudentProgressTab } from "./StudentProgressTab";
import { useStudentData } from "@/hooks/useStudentData";

const StudentProgressPage = () => {
  const { progressData, weeklyGoal } = useStudentData();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">تقدمي في التعلم</h1>
        <p className="text-gray-600 mt-2">تابع إحصائياتك وتقدمك الشامل</p>
      </div>

      <StudentProgressTab progressData={progressData} weeklyGoal={weeklyGoal} />
    </div>
  );
};

export { StudentProgressPage };
