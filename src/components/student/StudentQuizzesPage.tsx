
import React from "react";
import { StudentQuizzesTab } from "./StudentQuizzesTab";
import { useStudentData } from "@/hooks/useStudentData";

const StudentQuizzesPage = () => {
  const { quizzes } = useStudentData();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">الاختبارات</h1>
        <p className="text-gray-600 mt-2">اختبر معرفتك وتابع نتائجك</p>
      </div>

      <StudentQuizzesTab quizzes={quizzes} />
    </div>
  );
};

export { StudentQuizzesPage };
