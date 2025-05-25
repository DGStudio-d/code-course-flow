
import React from "react";
import { useNavigate } from "react-router-dom";
import { 
  Table, 
  TableHeader, 
  TableRow, 
  TableHead, 
  TableBody, 
  TableCell 
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { BookOpen, Search } from "lucide-react";

// Dummy data for courses
const courses = [
  { id: 1, name: "اللغة الإنجليزية للمبتدئين", language: "الإنجليزية", professor: "د. محمد أحمد", students: 15, startDate: "2023-06-10" },
  { id: 2, name: "اللغة الفرنسية - المستوى المتوسط", language: "الفرنسية", professor: "د. سارة علي", students: 12, startDate: "2023-07-15" },
  { id: 3, name: "اللغة الألمانية للمسافرين", language: "الألمانية", professor: "د. أحمد محمود", students: 8, startDate: "2023-08-20" },
  { id: 4, name: "اللغة الإسبانية - مستوى متقدم", language: "الإسبانية", professor: "د. ليلى خالد", students: 10, startDate: "2023-09-05" },
  { id: 5, name: "اللغة الصينية للمبتدئين", language: "الصينية", professor: "د. فاطمة حسن", students: 6, startDate: "2023-10-12" },
];

const AdminCourses = () => {
  const navigate = useNavigate();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">الدورات</h2>
        <div className="flex space-x-2 rtl:space-x-reverse">
          <div className="relative w-64">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="بحث عن دورة..." 
              className="pl-8 rtl:pr-8 rtl:pl-3"
            />
          </div>
          <Button onClick={() => navigate("/admin/add-course")}>
            <BookOpen className="mr-2 h-4 w-4 rtl:ml-2 rtl:mr-0" />
            إضافة دورة
          </Button>
        </div>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>الرقم</TableHead>
              <TableHead>اسم الدورة</TableHead>
              <TableHead>اللغة</TableHead>
              <TableHead>المدرس</TableHead>
              <TableHead>عدد الطلاب</TableHead>
              <TableHead>تاريخ البداية</TableHead>
              <TableHead className="text-left rtl:text-right">الإجراءات</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {courses.map((course) => (
              <TableRow key={course.id}>
                <TableCell>{course.id}</TableCell>
                <TableCell>{course.name}</TableCell>
                <TableCell>{course.language}</TableCell>
                <TableCell>{course.professor}</TableCell>
                <TableCell>{course.students}</TableCell>
                <TableCell>{course.startDate}</TableCell>
                <TableCell className="flex gap-2">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => navigate(`/admin/edit-course/${course.id}`)}
                  >
                    تعديل
                  </Button>
                  <Button variant="destructive" size="sm">حذف</Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default AdminCourses;
