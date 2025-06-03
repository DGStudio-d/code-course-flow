
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ArrowLeft, Search, UserCheck, UserX, Mail, Upload, Download, Eye, Filter } from 'lucide-react';
import AdminHeader from '@/components/admin/AdminHeader';

const StudentActivation = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStudents, setSelectedStudents] = useState([]);
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterCourse, setFilterCourse] = useState('all');

  // Mock data for students
  const students = [
    {
      id: 1,
      name: 'أحمد محمد',
      email: 'ahmed@example.com',
      phone: '050-1234567',
      status: 'active',
      verified: true,
      course: 'اللغة الإنجليزية',
      registrationDate: '2024-01-15',
      lastActivity: '2024-01-20',
      progress: 75
    },
    {
      id: 2,
      name: 'فاطمة علي',
      email: 'fatima@example.com',
      phone: '055-7654321',
      status: 'pending',
      verified: false,
      course: 'اللغة الفرنسية',
      registrationDate: '2024-01-18',
      lastActivity: '2024-01-18',
      progress: 0
    },
    {
      id: 3,
      name: 'عبدالله سالم',
      email: 'abdullah@example.com',
      phone: '054-9876543',
      status: 'inactive',
      verified: true,
      course: 'اللغة الألمانية',
      registrationDate: '2024-01-10',
      lastActivity: '2024-01-12',
      progress: 25
    },
    {
      id: 4,
      name: 'نورا خالد',
      email: 'nora@example.com',
      phone: '056-3216549',
      status: 'active',
      verified: true,
      course: 'اللغة الإسبانية',
      registrationDate: '2024-01-12',
      lastActivity: '2024-01-20',
      progress: 90
    }
  ];

  const getStatusBadge = (status) => {
    const statusConfig = {
      active: { label: 'نشط', variant: 'default' },
      pending: { label: 'معلق', variant: 'secondary' },
      inactive: { label: 'غير نشط', variant: 'destructive' }
    };
    
    const config = statusConfig[status] || statusConfig.pending;
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const filteredStudents = students.filter(student => {
    const matchesSearch = student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         student.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         student.course.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = filterStatus === 'all' || student.status === filterStatus;
    const matchesCourse = filterCourse === 'all' || student.course === filterCourse;
    
    return matchesSearch && matchesStatus && matchesCourse;
  });

  const handleStudentSelection = (studentId, checked) => {
    if (checked) {
      setSelectedStudents([...selectedStudents, studentId]);
    } else {
      setSelectedStudents(selectedStudents.filter(id => id !== studentId));
    }
  };

  const handleSelectAll = (checked) => {
    if (checked) {
      setSelectedStudents(filteredStudents.map(student => student.id));
    } else {
      setSelectedStudents([]);
    }
  };

  const handleBulkActivation = (activate) => {
    console.log(`${activate ? 'Activating' : 'Deactivating'} students:`, selectedStudents);
    // API call for bulk activation/deactivation
    setSelectedStudents([]);
  };

  const handleBulkEmail = () => {
    console.log('Sending bulk email to students:', selectedStudents);
    // API call for bulk email
  };

  const handleStatusChange = (studentId, newStatus) => {
    console.log(`Changing student ${studentId} status to ${newStatus}`);
    // API call to update student status
  };

  const handleResendVerification = (studentId) => {
    console.log(`Resending verification email to student ${studentId}`);
    // API call to resend verification email
  };

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
            <h1 className="text-2xl font-bold">إدارة تفعيل الطلاب</h1>
          </div>
          
          <div className="flex space-x-2">
            <Button variant="outline" className="flex items-center space-x-2">
              <Upload className="w-4 h-4" />
              <span>استيراد طلاب</span>
            </Button>
            <Button variant="outline" className="flex items-center space-x-2">
              <Download className="w-4 h-4" />
              <span>تصدير البيانات</span>
            </Button>
          </div>
        </div>

        <Tabs defaultValue="management" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="management">إدارة الطلاب</TabsTrigger>
            <TabsTrigger value="bulk">العمليات المجمعة</TabsTrigger>
            <TabsTrigger value="reports">التقارير</TabsTrigger>
          </TabsList>

          <TabsContent value="management" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>قائمة الطلاب</CardTitle>
                  <div className="flex space-x-2">
                    <div className="relative">
                      <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="البحث عن طالب..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-8 w-64"
                      />
                    </div>
                    <Select value={filterStatus} onValueChange={setFilterStatus}>
                      <SelectTrigger className="w-32">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">كل الحالات</SelectItem>
                        <SelectItem value="active">نشط</SelectItem>
                        <SelectItem value="pending">معلق</SelectItem>
                        <SelectItem value="inactive">غير نشط</SelectItem>
                      </SelectContent>
                    </Select>
                    <Select value={filterCourse} onValueChange={setFilterCourse}>
                      <SelectTrigger className="w-40">
                        <SelectValue placeholder="كل الدورات" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">كل الدورات</SelectItem>
                        <SelectItem value="اللغة الإنجليزية">اللغة الإنجليزية</SelectItem>
                        <SelectItem value="اللغة الفرنسية">اللغة الفرنسية</SelectItem>
                        <SelectItem value="اللغة الألمانية">اللغة الألمانية</SelectItem>
                        <SelectItem value="اللغة الإسبانية">اللغة الإسبانية</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="mb-4 flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      checked={selectedStudents.length === filteredStudents.length && filteredStudents.length > 0}
                      onCheckedChange={handleSelectAll}
                    />
                    <span className="text-sm text-gray-600">
                      تحديد الكل ({selectedStudents.length} محدد)
                    </span>
                  </div>
                  
                  {selectedStudents.length > 0 && (
                    <div className="flex space-x-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleBulkActivation(true)}
                        className="flex items-center space-x-1"
                      >
                        <UserCheck className="w-4 h-4" />
                        <span>تفعيل المحدد</span>
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleBulkActivation(false)}
                        className="flex items-center space-x-1"
                      >
                        <UserX className="w-4 h-4" />
                        <span>إلغاء تفعيل المحدد</span>
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={handleBulkEmail}
                        className="flex items-center space-x-1"
                      >
                        <Mail className="w-4 h-4" />
                        <span>إرسال بريد إلكتروني</span>
                      </Button>
                    </div>
                  )}
                </div>

                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-12">
                        <Checkbox
                          checked={selectedStudents.length === filteredStudents.length && filteredStudents.length > 0}
                          onCheckedChange={handleSelectAll}
                        />
                      </TableHead>
                      <TableHead>الاسم</TableHead>
                      <TableHead>البريد الإلكتروني</TableHead>
                      <TableHead>الدورة</TableHead>
                      <TableHead>الحالة</TableHead>
                      <TableHead>التحقق</TableHead>
                      <TableHead>التقدم</TableHead>
                      <TableHead>تاريخ التسجيل</TableHead>
                      <TableHead>الإجراءات</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredStudents.map((student) => (
                      <TableRow key={student.id}>
                        <TableCell>
                          <Checkbox
                            checked={selectedStudents.includes(student.id)}
                            onCheckedChange={(checked) => handleStudentSelection(student.id, checked)}
                          />
                        </TableCell>
                        <TableCell className="font-medium">{student.name}</TableCell>
                        <TableCell>{student.email}</TableCell>
                        <TableCell>{student.course}</TableCell>
                        <TableCell>{getStatusBadge(student.status)}</TableCell>
                        <TableCell>
                          {student.verified ? (
                            <Badge variant="outline" className="text-green-600">محقق</Badge>
                          ) : (
                            <Badge variant="outline" className="text-orange-600">غير محقق</Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <div className="w-16 bg-gray-200 rounded-full h-2">
                              <div
                                className="bg-blue-600 h-2 rounded-full"
                                style={{ width: `${student.progress}%` }}
                              ></div>
                            </div>
                            <span className="text-xs text-gray-600">{student.progress}%</span>
                          </div>
                        </TableCell>
                        <TableCell>{student.registrationDate}</TableCell>
                        <TableCell>
                          <div className="flex space-x-1">
                            <Button variant="ghost" size="sm">
                              <Eye className="w-4 h-4" />
                            </Button>
                            {student.status === 'active' ? (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleStatusChange(student.id, 'inactive')}
                                className="text-red-600"
                              >
                                <UserX className="w-4 h-4" />
                              </Button>
                            ) : (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleStatusChange(student.id, 'active')}
                                className="text-green-600"
                              >
                                <UserCheck className="w-4 h-4" />
                              </Button>
                            )}
                            {!student.verified && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleResendVerification(student.id)}
                                className="text-blue-600"
                              >
                                <Mail className="w-4 h-4" />
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="bulk" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>العمليات المجمعة</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Button className="w-full flex items-center justify-center space-x-2">
                    <Upload className="w-4 h-4" />
                    <span>استيراد ملف CSV</span>
                  </Button>
                  <Button variant="outline" className="w-full flex items-center justify-center space-x-2">
                    <UserCheck className="w-4 h-4" />
                    <span>تفعيل جميع المعلقين</span>
                  </Button>
                  <Button variant="outline" className="w-full flex items-center justify-center space-x-2">
                    <Mail className="w-4 h-4" />
                    <span>إرسال تذكير للجميع</span>
                  </Button>
                  <Button variant="outline" className="w-full flex items-center justify-center space-x-2">
                    <Download className="w-4 h-4" />
                    <span>تصدير قائمة الطلاب</span>
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>إحصائيات سريعة</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between">
                      <span>إجمالي الطلاب:</span>
                      <span className="font-bold">{students.length}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>الطلاب النشطون:</span>
                      <span className="font-bold text-green-600">
                        {students.filter(s => s.status === 'active').length}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>الطلاب المعلقون:</span>
                      <span className="font-bold text-orange-600">
                        {students.filter(s => s.status === 'pending').length}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>الطلاب غير النشطون:</span>
                      <span className="font-bold text-red-600">
                        {students.filter(s => s.status === 'inactive').length}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>غير محققين:</span>
                      <span className="font-bold text-gray-600">
                        {students.filter(s => !s.verified).length}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="reports" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>تقارير الطلاب</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-gray-500">
                  <p>ستظهر التقارير والرسوم البيانية هنا</p>
                  <p className="text-sm">تتضمن تقارير التقدم والنشاط والإنجازات</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default StudentActivation;
