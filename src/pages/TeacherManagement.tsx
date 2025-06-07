import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Save, ArrowLeft, Upload, UserPlus, Search, Edit, Trash2, Eye } from 'lucide-react';
import { useTeacherManagement } from '@/hooks/useTeacherManagement';
import { useQuery } from '@tanstack/react-query';
import api from '@/config/axios';

const teacherSchema = z.object({
  first_name: z.string().min(1, "First name is required"),
  last_name: z.string().min(1, "Last name is required"),
  email: z.string().email("Invalid email address"),
  phone: z.string().min(1, "Phone number is required"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  age: z.number().min(18, "Age must be at least 18"),
  language_id: z.number().min(1, "Language is required"),
  bio: z.string().optional(),
  qualifications: z.string().optional(),
  expertise: z.string().optional(),
});

type TeacherFormData = z.infer<typeof teacherSchema>;

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

  const form = useForm<TeacherFormData>({
    resolver: zodResolver(teacherSchema),
    defaultValues: {
      first_name: "",
      last_name: "",
      email: "",
      phone: "",
      password: "",
      age: 18,
      language_id: 0,
      bio: "",
      qualifications: "",
      expertise: "",
    },
  });

  const onSubmit = (data: TeacherFormData) => {
    createTeacherMutation.mutate(data, {
      onSuccess: () => {
        setIsCreateDialogOpen(false);
        form.reset();
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
  const filteredTeachers = teachersList.filter((teacher: any) =>
    teacher.first_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    teacher.last_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    teacher.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
          
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button className="flex items-center space-x-2">
                <UserPlus className="w-4 h-4" />
                <span>إضافة معلم جديد</span>
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>إضافة معلم جديد</DialogTitle>
              </DialogHeader>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="first_name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>الاسم الأول</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="أدخل الاسم الأول" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="last_name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>الاسم الأخير</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="أدخل الاسم الأخير" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>البريد الإلكتروني</FormLabel>
                        <FormControl>
                          <Input {...field} type="email" placeholder="example@domain.com" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="phone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>رقم الهاتف</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="050-1234567" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="age"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>العمر</FormLabel>
                          <FormControl>
                            <Input 
                              {...field} 
                              type="number"
                              onChange={(e) => field.onChange(parseInt(e.target.value))}
                              placeholder="العمر" 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>كلمة المرور</FormLabel>
                        <FormControl>
                          <Input {...field} type="password" placeholder="أدخل كلمة المرور" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="language_id"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>اللغة المُدرسة</FormLabel>
                        <Select 
                          onValueChange={(value) => field.onChange(parseInt(value))}
                          value={field.value?.toString()}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="اختر اللغة" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {languages?.data?.map((language: any) => (
                              <SelectItem key={language.id} value={language.id.toString()}>
                                {language.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="flex justify-end space-x-4">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setIsCreateDialogOpen(false)}
                    >
                      إلغاء
                    </Button>
                    <Button
                      type="submit"
                      disabled={createTeacherMutation.isPending}
                    >
                      {createTeacherMutation.isPending ? "جاري الإنشاء..." : "إنشاء المعلم"}
                    </Button>
                  </div>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </div>

        <Tabs defaultValue="list" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="list">قائمة المعلمين</TabsTrigger>
            <TabsTrigger value="profile">إدارة الملف الشخصي</TabsTrigger>
          </TabsList>

          <TabsContent value="list" className="space-y-6">
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
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-8 w-64"
                      />
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {teachersLoading ? (
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
                                onClick={() => setSelectedTeacher(teacher)}
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
                                onClick={() => handleDeleteTeacher(teacher.id)}
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
          </TabsContent>

          <TabsContent value="profile" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>الملف الشخصي للمعلم</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <Label>صورة الملف الشخصي</Label>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                    <Upload className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                    <p className="text-sm text-gray-600">انقر لرفع صورة أو اسحب الملف هنا</p>
                    <p className="text-xs text-gray-400 mt-1">PNG، JPG بحد أقصى 2MB</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="name">الاسم الكامل</Label>
                    <Input
                      id="name"
                      value={teacherProfile.name}
                      onChange={(e) => setTeacherProfile({...teacherProfile, name: e.target.value})}
                      placeholder="أدخل الاسم الكامل"
                    />
                  </div>

                  <div>
                    <Label htmlFor="email">البريد الإلكتروني</Label>
                    <Input
                      id="email"
                      type="email"
                      value={teacherProfile.email}
                      onChange={(e) => setTeacherProfile({...teacherProfile, email: e.target.value})}
                      placeholder="example@domain.com"
                    />
                  </div>

                  <div>
                    <Label htmlFor="phone">رقم الهاتف</Label>
                    <Input
                      id="phone"
                      value={teacherProfile.phone}
                      onChange={(e) => setTeacherProfile({...teacherProfile, phone: e.target.value})}
                      placeholder="050-1234567"
                    />
                  </div>

                  <div>
                    <Label htmlFor="department">القسم</Label>
                    <Select value={teacherProfile.department} onValueChange={(value) => setTeacherProfile({...teacherProfile, department: value})}>
                      <SelectTrigger>
                        <SelectValue placeholder="اختر القسم" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="english">اللغة الإنجليزية</SelectItem>
                        <SelectItem value="french">اللغة الفرنسية</SelectItem>
                        <SelectItem value="german">اللغة الألمانية</SelectItem>
                        <SelectItem value="spanish">اللغة الإسبانية</SelectItem>
                        <SelectItem value="chinese">اللغة الصينية</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <Label htmlFor="bio">نبذة شخصية</Label>
                  <Textarea
                    id="bio"
                    value={teacherProfile.bio}
                    onChange={(e) => setTeacherProfile({...teacherProfile, bio: e.target.value})}
                    placeholder="أدخل نبذة شخصية عن المعلم"
                    rows={4}
                  />
                </div>

                <div>
                  <Label htmlFor="qualifications">المؤهلات والشهادات</Label>
                  <Textarea
                    id="qualifications"
                    value={teacherProfile.qualifications}
                    onChange={(e) => setTeacherProfile({...teacherProfile, qualifications: e.target.value})}
                    placeholder="أدخل المؤهلات والشهادات"
                    rows={3}
                  />
                </div>

                <div>
                  <Label htmlFor="expertise">مجالات الخبرة</Label>
                  <Textarea
                    id="expertise"
                    value={teacherProfile.expertise}
                    onChange={(e) => setTeacherProfile({...teacherProfile, expertise: e.target.value})}
                    placeholder="أدخل مجالات الخبرة"
                    rows={3}
                  />
                </div>

                <div>
                  <Label>روابط وسائل التواصل الاجتماعي</Label>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-2">
                    <div>
                      <Label htmlFor="linkedin">LinkedIn</Label>
                      <Input
                        id="linkedin"
                        value={teacherProfile.socialLinks.linkedin}
                        onChange={(e) => setTeacherProfile({
                          ...teacherProfile,
                          socialLinks: {...teacherProfile.socialLinks, linkedin: e.target.value}
                        })}
                        placeholder="https://linkedin.com/in/username"
                      />
                    </div>
                    <div>
                      <Label htmlFor="twitter">Twitter</Label>
                      <Input
                        id="twitter"
                        value={teacherProfile.socialLinks.twitter}
                        onChange={(e) => setTeacherProfile({
                          ...teacherProfile,
                          socialLinks: {...teacherProfile.socialLinks, twitter: e.target.value}
                        })}
                        placeholder="https://twitter.com/username"
                      />
                    </div>
                    <div>
                      <Label htmlFor="website">الموقع الشخصي</Label>
                      <Input
                        id="website"
                        value={teacherProfile.socialLinks.website}
                        onChange={(e) => setTeacherProfile({
                          ...teacherProfile,
                          socialLinks: {...teacherProfile.socialLinks, website: e.target.value}
                        })}
                        placeholder="https://website.com"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex justify-end">
                  <Button onClick={handleSaveProfile} className="flex items-center space-x-2">
                    <Save className="w-4 h-4" />
                    <span>حفظ الملف الشخصي</span>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="settings" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>إعدادات الحساب</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <Label htmlFor="role">الدور</Label>
                  <Select value={teacherProfile.role} onValueChange={(value) => setTeacherProfile({...teacherProfile, role: value})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="teacher">معلم</SelectItem>
                      <SelectItem value="senior_teacher">معلم أول</SelectItem>
                      <SelectItem value="department_head">رئيس قسم</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>إعدادات الإشعارات</Label>
                  <div className="space-y-4 mt-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="email-notifications">إشعارات البريد الإلكتروني</Label>
                      <Switch
                        id="email-notifications"
                        checked={teacherProfile.notifications.email}
                        onCheckedChange={(checked) => setTeacherProfile({
                          ...teacherProfile,
                          notifications: {...teacherProfile.notifications, email: checked}
                        })}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label htmlFor="sms-notifications">إشعارات الرسائل النصية</Label>
                      <Switch
                        id="sms-notifications"
                        checked={teacherProfile.notifications.sms}
                        onCheckedChange={(checked) => setTeacherProfile({
                          ...teacherProfile,
                          notifications: {...teacherProfile.notifications, sms: checked}
                        })}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label htmlFor="push-notifications">الإشعارات الفورية</Label>
                      <Switch
                        id="push-notifications"
                        checked={teacherProfile.notifications.push}
                        onCheckedChange={(checked) => setTeacherProfile({
                          ...teacherProfile,
                          notifications: {...teacherProfile.notifications, push: checked}
                        })}
                      />
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="two-factor">المصادقة الثنائية</Label>
                    <p className="text-sm text-gray-600">إضافة طبقة حماية إضافية للحساب</p>
                  </div>
                  <Switch
                    id="two-factor"
                    checked={teacherProfile.twoFactor}
                    onCheckedChange={(checked) => setTeacherProfile({...teacherProfile, twoFactor: checked})}
                  />
                </div>

                <div className="flex justify-end">
                  <Button onClick={handleSaveProfile} className="flex items-center space-x-2">
                    <Save className="w-4 h-4" />
                    <span>حفظ الإعدادات</span>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default TeacherManagement;
