
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Search, Edit, Trash2, Eye } from 'lucide-react';

interface TeachersListProps {
  teachers: any[];
  searchTerm: string;
  onSearchChange: (value: string) => void;
  onDeleteTeacher: (id: number) => void;
  onViewTeacher: (teacher: any) => void;
  isLoading: boolean;
}

export const TeachersList = ({
  teachers,
  searchTerm,
  onSearchChange,
  onDeleteTeacher,
  onViewTeacher,
  isLoading
}: TeachersListProps) => {
  const filteredTeachers = teachers.filter((teacher: any) =>
    teacher.first_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    teacher.last_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    teacher.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>المعلمين المسجلين</CardTitle>
          <div className="flex space-x-2">
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="البحث عن معلم..."
                value={searchTerm}
                onChange={(e) => onSearchChange(e.target.value)}
                className="pl-8 w-64"
              />
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="text-center py-8">جاري التحميل...</div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>الاسم</TableHead>
                <TableHead>البريد الإلكتروني</TableHead>
                <TableHead>اللغة المُدرسة</TableHead>
                <TableHead>الحالة</TableHead>
                <TableHead>الطلاب</TableHead>
                <TableHead>تاريخ الانضمام</TableHead>
                <TableHead>الإجراءات</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredTeachers.map((teacher: any) => (
                <TableRow key={teacher.id}>
                  <TableCell className="font-medium">
                    {teacher.first_name} {teacher.last_name}
                  </TableCell>
                  <TableCell>{teacher.email}</TableCell>
                  <TableCell>
                    {teacher.taughtLanguages?.map((lang: any) => lang.name).join(', ') || 'غير محدد'}
                  </TableCell>
                  <TableCell>
                    <Badge variant={teacher.status === 'active' ? 'default' : 'secondary'}>
                      {teacher.status === 'active' ? 'نشط' : 'معلق'}
                    </Badge>
                  </TableCell>
                  <TableCell>{teacher.studentsCount || 0}</TableCell>
                  <TableCell>
                    {teacher.created_at ? new Date(teacher.created_at).toLocaleDateString() : 'غير محدد'}
                  </TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onViewTeacher(teacher)}
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="sm">
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="text-red-600"
                        onClick={() => onDeleteTeacher(teacher.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
};
