
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users } from "lucide-react";

const TeacherStudentsPage = () => {
  const students = [
    { id: 1, name: "أحمد محمد", email: "ahmed@example.com", progress: 85, lastActivity: "منذ ساعتين" },
    { id: 2, name: "فاطمة علي", email: "fatima@example.com", progress: 92, lastActivity: "منذ يوم" },
    { id: 3, name: "محمد عبدالله", email: "mohammed@example.com", progress: 78, lastActivity: "منذ 3 أيام" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">قائمة الطلاب</h1>
        <p className="text-gray-600 mt-2">متابعة تقدم وأداء الطلاب</p>
      </div>

      <div className="grid gap-4">
        {students.map((student) => (
          <Card key={student.id}>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-lg">{student.name}</CardTitle>
                  <p className="text-gray-600">{student.email}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-500">آخر نشاط: {student.lastActivity}</p>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>التقدم العام</span>
                  <span>{student.progress}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-green-500 h-2 rounded-full"
                    style={{ width: `${student.progress}%` }}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export { TeacherStudentsPage };
