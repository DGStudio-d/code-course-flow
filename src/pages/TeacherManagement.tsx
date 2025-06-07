
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowLeft, UserPlus } from 'lucide-react';
import { useTeacherManagement } from '@/hooks/useTeacherManagement';
import { useQuery } from '@tanstack/react-query';
import api from '@/config/axios';
import { TeacherCreateDialog } from '@/components/admin/teacher/TeacherCreateDialog';
import { TeachersList } from '@/components/admin/teacher/TeachersList';
import { TeacherProfile } from '@/components/admin/teacher/TeacherProfile';

const TeacherManagement = () => {
  const navigate = useNavigate();
  const [selectedTeacher, setSelectedTeacher] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

  const {
    teachers,
    teachersLoading,
    createTeacherMutation,
    updateTeacherStatusMutation,
    deleteTeacherMutation
  } = useTeacherManagement();

  // Fetch languages for the dropdown
  const { data: languages } = useQuery({
    queryKey: ["languages"],
    queryFn: async () => {
      const response = await api.get("/languages");
      return response.data;
    },
  });

  const handleCreateTeacher = (data: any) => {
    createTeacherMutation.mutate(data, {
      onSuccess: () => {
        setIsCreateDialogOpen(false);
      },
    });
  };

  const handleStatusChange = (teacherId: number, newStatus: string) => {
    updateTeacherStatusMutation.mutate({ id: teacherId, status: newStatus });
  };

  const handleDeleteTeacher = (id: number) => {
    if (window.confirm('Are you sure you want to delete this teacher?')) {
      deleteTeacherMutation.mutate(id);
    }
  };

  const teachersList = teachers?.data || [];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              onClick={() => navigate('/admin')}
              className="flex items-center space-x-2"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>العودة للوحة الرئيسية</span>
            </Button>
            <h1 className="text-2xl font-bold">إدارة المعلمين</h1>
          </div>
          
          <Button 
            className="flex items-center space-x-2"
            onClick={() => setIsCreateDialogOpen(true)}
          >
            <UserPlus className="w-4 h-4" />
            <span>إضافة معلم جديد</span>
          </Button>
        </div>

        <Tabs defaultValue="list" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="list">قائمة المعلمين</TabsTrigger>
            <TabsTrigger value="profile">إدارة الملف الشخصي</TabsTrigger>
          </TabsList>

          <TabsContent value="list" className="space-y-6">
            <TeachersList
              teachers={teachersList}
              searchTerm={searchTerm}
              onSearchChange={setSearchTerm}
              onDeleteTeacher={handleDeleteTeacher}
              onViewTeacher={setSelectedTeacher}
              isLoading={teachersLoading}
            />
          </TabsContent>

          <TabsContent value="profile" className="space-y-6">
            <TeacherProfile />
          </TabsContent>
        </Tabs>

        <TeacherCreateDialog
          open={isCreateDialogOpen}
          onOpenChange={setIsCreateDialogOpen}
          onSubmit={handleCreateTeacher}
          languages={languages?.data || []}
          isLoading={createTeacherMutation.isPending}
        />
      </div>
    </div>
  );
};

export default TeacherManagement;
