
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Calendar, Users, Clock, BookOpen, Star, Edit } from 'lucide-react';

interface CourseViewProps {
  courseId: string;
  userRole: 'teacher' | 'admin';
  onEdit?: () => void;
}

const CourseView = ({ courseId, userRole, onEdit }: CourseViewProps) => {
  // Mock course data
  const course = {
    id: courseId,
    title: 'دورة اللغة الإنجليزية للمبتدئين',
    description: 'دورة شاملة لتعلم أساسيات اللغة الإنجليزية من الصفر حتى المستوى المتوسط',
    instructor: 'أحمد محمد علي',
    category: 'اللغات',
    level: 'مبتدئ',
    duration: '8 أسابيع',
    price: 500,
    thumbnail: '/placeholder.svg',
    enrolledStudents: 24,
    maxStudents: 30,
    startDate: '2024-02-01',
    endDate: '2024-03-30',
    rating: 4.8,
    reviewsCount: 15,
    status: 'active',
    modules: [
      { id: 1, title: 'مقدمة في اللغة الإنجليزية', lessons: 5, completed: 5 },
      { id: 2, title: 'القواعد الأساسية', lessons: 8, completed: 3 },
      { id: 3, title: 'المفردات اليومية', lessons: 6, completed: 0 },
      { id: 4, title: 'المحادثة العملية', lessons: 7, completed: 0 }
    ]
  };

  const progressPercentage = (course.enrolledStudents / course.maxStudents) * 100;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <h1 className="text-3xl font-bold text-gray-900">{course.title}</h1>
            <Badge variant={course.status === 'active' ? 'default' : 'secondary'}>
              {course.status === 'active' ? 'نشطة' : 'مسودة'}
            </Badge>
          </div>
          <p className="text-gray-600 mb-4">{course.description}</p>
          <div className="flex items-center gap-4 text-sm text-gray-500">
            <div className="flex items-center gap-1">
              <Users className="w-4 h-4" />
              <span>{course.enrolledStudents}/{course.maxStudents} طالب</span>
            </div>
            <div className="flex items-center gap-1">
              <Clock className="w-4 h-4" />
              <span>{course.duration}</span>
            </div>
            <div className="flex items-center gap-1">
              <Calendar className="w-4 h-4" />
              <span>{course.startDate} - {course.endDate}</span>
            </div>
            <div className="flex items-center gap-1">
              <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
              <span>{course.rating} ({course.reviewsCount} تقييم)</span>
            </div>
          </div>
        </div>
        {onEdit && (
          <Button onClick={onEdit} className="flex items-center gap-2">
            <Edit className="w-4 h-4" />
            تعديل الدورة
          </Button>
        )}
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">الطلاب المسجلين</p>
                <p className="text-2xl font-bold">{course.enrolledStudents}</p>
              </div>
              <Users className="w-8 h-8 text-blue-500" />
            </div>
            <Progress value={progressPercentage} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">الوحدات</p>
                <p className="text-2xl font-bold">{course.modules.length}</p>
              </div>
              <BookOpen className="w-8 h-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">التقييم</p>
                <p className="text-2xl font-bold">{course.rating}</p>
              </div>
              <Star className="w-8 h-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">السعر</p>
                <p className="text-2xl font-bold">{course.price} ر.س</p>
              </div>
              <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                <span className="text-purple-600 font-bold">₹</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Information */}
      <Tabs defaultValue="content" className="space-y-4">
        <TabsList>
          <TabsTrigger value="content">المحتوى</TabsTrigger>
          <TabsTrigger value="students">الطلاب</TabsTrigger>
          <TabsTrigger value="analytics">الإحصائيات</TabsTrigger>
          <TabsTrigger value="settings">الإعدادات</TabsTrigger>
        </TabsList>

        <TabsContent value="content">
          <Card>
            <CardHeader>
              <CardTitle>محتوى الدورة</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {course.modules.map((module) => (
                  <div key={module.id} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium">{module.title}</h4>
                      <Badge variant="outline">
                        {module.completed}/{module.lessons} دروس
                      </Badge>
                    </div>
                    <Progress 
                      value={(module.completed / module.lessons) * 100} 
                      className="h-2"
                    />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="students">
          <Card>
            <CardHeader>
              <CardTitle>الطلاب المسجلين</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">قائمة الطلاب وتقدمهم في الدورة</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics">
          <Card>
            <CardHeader>
              <CardTitle>إحصائيات الدورة</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">تحليلات مفصلة عن أداء الدورة</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings">
          <Card>
            <CardHeader>
              <CardTitle>إعدادات الدورة</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">إعدادات متقدمة للدورة</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default CourseView;
