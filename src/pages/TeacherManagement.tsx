
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
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
import { Save, ArrowLeft, Upload, UserPlus, Search, Edit, Trash2, Eye } from 'lucide-react';
import AdminHeader from '@/components/admin/AdminHeader';

const TeacherManagement = () => {
  const navigate = useNavigate();
  const [selectedTeacher, setSelectedTeacher] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  // Mock data for teachers
  const teachers = [
    {
      id: 1,
      name: 'د. محمد أحمد',
      email: 'mohamed@example.com',
      phone: '050-1234567',
      department: 'اللغة الإنجليزية',
      status: 'active',
      coursesCount: 5,
      studentsCount: 120,
      joinDate: '2023-01-15'
    },
    {
      id: 2,
      name: 'د. سارة علي',
      email: 'sarah@example.com',
      phone: '055-7654321',
      department: 'اللغة الفرنسية',
      status: 'active',
      coursesCount: 3,
      studentsCount: 85,
      joinDate: '2023-03-20'
    },
    {
      id: 3,
      name: 'د. أحمد محمود',
      email: 'ahmed@example.com',
      phone: '054-9876543',
      department: 'اللغة الألمانية',
      status: 'pending',
      coursesCount: 0,
      studentsCount: 0,
      joinDate: '2024-01-10'
    }
  ];

  const [teacherProfile, setTeacherProfile] = useState({
    name: '',
    email: '',
    phone: '',
    bio: '',
    qualifications: '',
    expertise: '',
    socialLinks: {
      linkedin: '',
      twitter: '',
      website: ''
    },
    department: '',
    role: 'teacher',
    notifications: {
      email: true,
      sms: false,
      push: true
    },
    twoFactor: false
  });

  const handleSaveProfile = () => {
    console.log('Saving teacher profile:', teacherProfile);
    // API call to save teacher profile
  };

  const handleStatusChange = (teacherId, newStatus) => {
    console.log(`Changing teacher ${teacherId} status to ${newStatus}`);
    // API call to update teacher status
  };

  const filteredTeachers = teachers.filter(teacher =>
    teacher.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    teacher.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    teacher.department.toLowerCase().includes(searchTerm.toLowerCase())
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
          
          <Button className="flex items-center space-x-2">
            <UserPlus className="w-4 h-4" />
            <span>إضافة معلم جديد</span>
          </Button>
        </div>

        <Tabs defaultValue="list" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="list">قائمة المعلمين</TabsTrigger>
            <TabsTrigger value="profile">إدارة الملف الشخصي</TabsTrigger>
            <TabsTrigger value="settings">إعدادات الحساب</TabsTrigger>
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
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>الاسم</TableHead>
                      <TableHead>البريد الإلكتروني</TableHead>
                      <TableHead>القسم</TableHead>
                      <TableHead>الحالة</TableHead>
                      <TableHead>الدورات</TableHead>
                      <TableHead>الطلاب</TableHead>
                      <TableHead>تاريخ الانضمام</TableHead>
                      <TableHead>الإجراءات</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredTeachers.map((teacher) => (
                      <TableRow key={teacher.id}>
                        <TableCell className="font-medium">{teacher.name}</TableCell>
                        <TableCell>{teacher.email}</TableCell>
                        <TableCell>{teacher.department}</TableCell>
                        <TableCell>
                          <Badge variant={teacher.status === 'active' ? 'default' : 'secondary'}>
                            {teacher.status === 'active' ? 'نشط' : 'معلق'}
                          </Badge>
                        </TableCell>
                        <TableCell>{teacher.coursesCount}</TableCell>
                        <TableCell>{teacher.studentsCount}</TableCell>
                        <TableCell>{teacher.joinDate}</TableCell>
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
                            <Button variant="ghost" size="sm" className="text-red-600">
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
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
