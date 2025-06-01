
import React from "react";
import { StudentCoursesTab } from "./StudentCoursesTab";
import { useStudentData } from "@/hooks/useStudentData";

const StudentCoursesPage = () => {
  const { courses } = useStudentData();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">دوراتي</h1>
        <p className="text-gray-600 mt-2">تابع تقدمك في الدورات المسجل بها</p>
      </div>

      <StudentCoursesTab courses={courses} />
    </div>
  );
};

export { StudentCoursesPage };
