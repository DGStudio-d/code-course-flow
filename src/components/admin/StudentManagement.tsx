
import React, { useState, useMemo } from "react";
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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { UserPlus, Search, Edit, Trash2, ArrowLeft } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { useTranslation } from "react-i18next";
import api from "@/config/axios";

const StudentManagement = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const { toast } = useToast();
  const { t, i18n } = useTranslation();
  const queryClient = useQueryClient();
  const isRTL = i18n.language === "ar";

  // Fetch students only
  const { data: studentsResponse, isLoading, error } = useQuery({
    queryKey: ["students"],
    queryFn: () => api.get("/admin/users?role=student").then((res) => res.data.data),
  });

  const students = studentsResponse || [];

  // Delete student mutation
  const deleteMutation = useMutation({
    mutationFn: (id: string) =>
      api.delete(`/admin/users/${id}`).then((res) => res.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["students"] });
      toast({
        title: t("admin.students.messages.deleteSuccess", "Student deleted successfully"),
        description: t("admin.students.messages.deleteSuccessDesc", "The student has been removed from the system"),
      });
    },
    onError: (error: any) => {
      toast({
        title: t("admin.students.messages.deleteError", "Error deleting student"),
        description: error.message || t("admin.students.messages.deleteErrorDesc", "Failed to delete student"),
        variant: "destructive",
      });
    },
  });

  // Filter students based on search term
  const filteredStudents = useMemo(() => {
    if (!searchTerm) return students;
    
    return students.filter((student) =>
      student.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.lastName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.phone?.includes(searchTerm)
    );
  }, [students, searchTerm]);

  const handleDelete = (id: string) => {
    if (confirm(t("admin.students.messages.deleteConfirm", "Are you sure you want to delete this student?"))) {
      deleteMutation.mutate(id);
    }
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  if (isLoading) {
    return (
      <div className="space-y-6" dir={isRTL ? "rtl" : "ltr"}>
        <div className={`flex items-center justify-between ${isRTL ? 'flex-row-reverse' : ''}`}>
          <h2 className="text-2xl font-bold">{t("admin.students.title", "Student Management")}</h2>
        </div>
        <Card>
          <CardHeader>
            <CardTitle>{t("admin.students.loading", "Loading students...")}</CardTitle>
          </CardHeader>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6" dir={isRTL ? "rtl" : "ltr"}>
        <div className={`flex items-center justify-between ${isRTL ? 'flex-row-reverse' : ''}`}>
          <h2 className="text-2xl font-bold">{t("admin.students.title", "Student Management")}</h2>
        </div>
        <Card>
          <CardHeader>
            <CardTitle className="text-red-600">{t("admin.students.loadError", "Error loading students")}</CardTitle>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6" dir={isRTL ? "rtl" : "ltr"}>
      <div className={`flex items-center justify-between ${isRTL ? 'flex-row-reverse' : ''}`}>
        <div className={`flex items-center ${isRTL ? 'space-x-reverse space-x-4' : 'space-x-4'}`}>
          <Button
            variant="ghost"
            onClick={() => navigate('/admin')}
            className={`flex items-center ${isRTL ? 'space-x-reverse space-x-2' : 'space-x-2'}`}
          >
            <ArrowLeft className="w-4 h-4" />
            <span>{t('admin.students.backToDashboard', 'Back to Dashboard')}</span>
          </Button>
          <h2 className="text-2xl font-bold">{t("admin.students.title", "Student Management")}</h2>
        </div>
        <div className={`flex ${isRTL ? 'space-x-reverse space-x-2' : 'space-x-2'}`}>
          <div className="relative w-64">
            <Search className={`absolute top-2.5 h-4 w-4 text-muted-foreground ${isRTL ? 'right-2' : 'left-2'}`} />
            <Input
              placeholder={t("admin.students.search", "Search students...")}
              value={searchTerm}
              onChange={handleSearch}
              className={isRTL ? "pr-8 pl-3" : "pl-8 pr-3"}
            />
          </div>
          <Button onClick={() => navigate("/admin/add-user")}>
            <UserPlus className={`h-4 w-4 ${isRTL ? 'ml-2' : 'mr-2'}`} />
            {t("admin.students.addNew", "Add New Student")}
          </Button>
        </div>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className={isRTL ? 'text-right' : 'text-left'}>{t("admin.students.table.id", "ID")}</TableHead>
              <TableHead className={isRTL ? 'text-right' : 'text-left'}>{t("admin.students.table.name", "Name")}</TableHead>
              <TableHead className={isRTL ? 'text-right' : 'text-left'}>{t("admin.students.table.email", "Email")}</TableHead>
              <TableHead className={isRTL ? 'text-right' : 'text-left'}>{t("admin.students.table.phone", "Phone")}</TableHead>
              <TableHead className={isRTL ? 'text-right' : 'text-left'}>{t("admin.students.table.level", "Level")}</TableHead>
              <TableHead className={isRTL ? 'text-right' : 'text-left'}>{t("admin.students.table.registrationDate", "Registration Date")}</TableHead>
              <TableHead className={isRTL ? 'text-right' : 'text-left'}>
                {t("admin.students.table.actions", "Actions")}
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredStudents.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8">
                  {searchTerm
                    ? t("admin.students.noSearchResults", "No students found matching your search")
                    : t("admin.students.noStudents", "No students found")}
                </TableCell>
              </TableRow>
            ) : (
              filteredStudents.map((student) => (
                <TableRow key={student.id}>
                  <TableCell className={isRTL ? 'text-right' : 'text-left'}>{student.id}</TableCell>
                  <TableCell className={isRTL ? 'text-right' : 'text-left'}>{student.firstName + " " + student.lastName}</TableCell>
                  <TableCell className={isRTL ? 'text-right' : 'text-left'}>{student.email}</TableCell>
                  <TableCell className={isRTL ? 'text-right' : 'text-left'}>{student.phone}</TableCell>
                  <TableCell className={isRTL ? 'text-right' : 'text-left'}>{student.level}</TableCell>
                  <TableCell className={isRTL ? 'text-right' : 'text-left'}>
                    {new Date(
                      student.registrationDate || student.createdAt
                    ).toLocaleDateString()}
                  </TableCell>
                  <TableCell className={`${isRTL ? 'flex-row-reverse' : ''} flex gap-2`}>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => navigate(`/admin/edit-user/${student.id}`)}
                    >
                      <Edit className={`w-4 h-4 ${isRTL ? 'ml-1' : 'mr-1'}`} />
                      {t("admin.students.table.edit", "Edit")}
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDelete(student.id)}
                      disabled={deleteMutation.isPending}
                    >
                      <Trash2 className={`w-4 h-4 ${isRTL ? 'ml-1' : 'mr-1'}`} />
                      {t("admin.students.table.delete", "Delete")}
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default StudentManagement;
