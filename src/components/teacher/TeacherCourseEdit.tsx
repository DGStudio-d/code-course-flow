
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Save, ArrowLeft, Upload, Plus, X } from 'lucide-react';

interface TeacherCourseEditProps {
  courseId?: string;
  onBack: () => void;
}

const TeacherCourseEdit = ({ courseId, onBack }: TeacherCourseEditProps) => {
  const isNewCourse = !courseId;

  const [courseData, setCourseData] = useState({
    title: '',
    description: '',
    category: '',
    difficulty: '',
    duration: '',
    tags: [],
    startDate: '',
    endDate: '',
    maxStudents: '',
    certificate: false,
  });

  const [modules, setModules] = useState([]);
  const [newTag, setNewTag] = useState('');

  const handleSave = () => {
    console.log('Saving course:', courseData);
    // API call to save course
  };

  const addTag = () => {
    if (newTag.trim() && !courseData.tags.includes(newTag.trim())) {
      setCourseData({
        ...courseData,
        tags: [...courseData.tags, newTag.trim()]
      });
      setNewTag('');
    }
  };

  const removeTag = (tagToRemove) => {
    setCourseData({
      ...courseData,
      tags: courseData.tags.filter(tag => tag !== tagToRemove)
    });
  };

  const addModule = () => {
    setModules([...modules, {
      id: Date.now(),
      title: '',
      description: '',
      order: modules.length + 1
    }]);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button
            variant="ghost"
            onClick={onBack}
            className="flex items-center space-x-2"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>العودة</span>
          </Button>
          <h1 className="text-2xl font-bold">
            {isNewCourse ? 'إضافة دورة جديدة' : 'تعديل الدورة'}
          </h1>
        </div>
        
        <div className="flex space-x-2">
          <Button variant="outline">معاينة</Button>
          <Button onClick={handleSave} className="flex items-center space-x-2">
            <Save className="w-4 h-4" />
            <span>حفظ</span>
          </Button>
        </div>
      </div>

      <Tabs defaultValue="basic" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="basic">المعلومات الأساسية</TabsTrigger>
          <TabsTrigger value="content">إدارة المحتوى</TabsTrigger>
        </TabsList>

        <TabsContent value="basic" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>معلومات الدورة الأساسية</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="title">عنوان الدورة</Label>
                <Input
                  id="title"
                  value={courseData.title}
                  onChange={(e) => setCourseData({...courseData, title: e.target.value})}
                  placeholder="أدخل عنوان الدورة"
                />
              </div>

              <div>
                <Label htmlFor="description">وصف الدورة</Label>
                <Textarea
                  id="description"
                  value={courseData.description}
                  onChange={(e) => setCourseData({...courseData, description: e.target.value})}
                  placeholder="أدخل وصف تفصيلي للدورة"
                  rows={4}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="category">الفئة</Label>
                  <Select value={courseData.category} onValueChange={(value) => setCourseData({...courseData, category: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="اختر الفئة" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="languages">اللغات</SelectItem>
                      <SelectItem value="programming">البرمجة</SelectItem>
                      <SelectItem value="business">الأعمال</SelectItem>
                      <SelectItem value="design">التصميم</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="difficulty">مستوى الصعوبة</Label>
                  <Select value={courseData.difficulty} onValueChange={(value) => setCourseData({...courseData, difficulty: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="اختر المستوى" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="beginner">مبتدئ</SelectItem>
                      <SelectItem value="intermediate">متوسط</SelectItem>
                      <SelectItem value="advanced">متقدم</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="duration">مدة الدورة</Label>
                <Input
                  id="duration"
                  value={courseData.duration}
                  onChange={(e) => setCourseData({...courseData, duration: e.target.value})}
                  placeholder="مثال: 8 أسابيع أو 40 ساعة"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="startDate">تاريخ البداية</Label>
                  <Input
                    id="startDate"
                    type="date"
                    value={courseData.startDate}
                    onChange={(e) => setCourseData({...courseData, startDate: e.target.value})}
                  />
                </div>

                <div>
                  <Label htmlFor="endDate">تاريخ النهاية</Label>
                  <Input
                    id="endDate"
                    type="date"
                    value={courseData.endDate}
                    onChange={(e) => setCourseData({...courseData, endDate: e.target.value})}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="maxStudents">الحد الأقصى للطلاب</Label>
                <Input
                  id="maxStudents"
                  type="number"
                  value={courseData.maxStudents}
                  onChange={(e) => setCourseData({...courseData, maxStudents: e.target.value})}
                  placeholder="اتركه فارغاً للتسجيل المفتوح"
                />
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="certificate"
                  checked={courseData.certificate}
                  onCheckedChange={(checked) => setCourseData({...courseData, certificate: checked})}
                />
                <Label htmlFor="certificate">إصدار شهادة إتمام</Label>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="content" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                محتوى الدورة
                <Button onClick={addModule} className="flex items-center space-x-2">
                  <Plus className="w-4 h-4" />
                  <span>إضافة وحدة</span>
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {modules.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <p>لم يتم إضافة أي وحدات بعد</p>
                  <p className="text-sm">انقر على "إضافة وحدة" لبدء إنشاء محتوى الدورة</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {modules.map((module, index) => (
                    <Card key={module.id} className="p-4">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium">الوحدة {index + 1}</h4>
                        <Button variant="ghost" size="sm">
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                      <Input
                        placeholder="عنوان الوحدة"
                        className="mb-2"
                      />
                      <Textarea
                        placeholder="وصف الوحدة"
                        rows={2}
                      />
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default TeacherCourseEdit;
