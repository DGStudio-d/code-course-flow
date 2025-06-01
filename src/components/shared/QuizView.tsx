
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Clock, Users, FileText, Edit, BarChart3, CheckCircle } from 'lucide-react';

interface QuizViewProps {
  quizId: string;
  userRole: 'teacher' | 'admin';
  onEdit?: () => void;
}

const QuizView = ({ quizId, userRole, onEdit }: QuizViewProps) => {
  // Mock quiz data
  const quiz = {
    id: quizId,
    title: 'اختبار القواعد الأساسية في اللغة الإنجليزية',
    description: 'اختبار شامل لقياس فهم الطلاب للقواعد الأساسية في اللغة الإنجليزية',
    category: 'اللغة الإنجليزية',
    difficulty: 'متوسط',
    timeLimit: 45,
    totalQuestions: 20,
    passingScore: 70,
    attempts: 156,
    avgScore: 78,
    status: 'active',
    createdDate: '2024-01-15',
    lastUpdated: '2024-01-20',
    questions: [
      {
        id: 1,
        type: 'mcq',
        text: 'ما هو الفعل المساعد المناسب في الجملة التالية؟',
        options: ['do', 'does', 'did', 'done'],
        correctAnswer: 1,
        points: 2
      },
      {
        id: 2,
        type: 'truefalse',
        text: 'الجملة "She go to school everyday" صحيحة نحوياً',
        correctAnswer: false,
        points: 1
      }
    ],
    analytics: {
      completionRate: 89,
      averageTime: 38,
      topScorers: [
        { name: 'أحمد محمد', score: 95 },
        { name: 'فاطمة علي', score: 92 },
        { name: 'محمد خالد', score: 88 }
      ]
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <h1 className="text-3xl font-bold text-gray-900">{quiz.title}</h1>
            <Badge variant={quiz.status === 'active' ? 'default' : 'secondary'}>
              {quiz.status === 'active' ? 'نشط' : 'مسودة'}
            </Badge>
          </div>
          <p className="text-gray-600 mb-4">{quiz.description}</p>
          <div className="flex items-center gap-4 text-sm text-gray-500">
            <div className="flex items-center gap-1">
              <FileText className="w-4 h-4" />
              <span>{quiz.totalQuestions} سؤال</span>
            </div>
            <div className="flex items-center gap-1">
              <Clock className="w-4 h-4" />
              <span>{quiz.timeLimit} دقيقة</span>
            </div>
            <div className="flex items-center gap-1">
              <Users className="w-4 h-4" />
              <span>{quiz.attempts} محاولة</span>
            </div>
            <div className="flex items-center gap-1">
              <CheckCircle className="w-4 h-4" />
              <span>درجة النجاح: {quiz.passingScore}%</span>
            </div>
          </div>
        </div>
        {onEdit && (
          <Button onClick={onEdit} className="flex items-center gap-2">
            <Edit className="w-4 h-4" />
            تعديل الاختبار
          </Button>
        )}
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">إجمالي المحاولات</p>
                <p className="text-2xl font-bold">{quiz.attempts}</p>
              </div>
              <Users className="w-8 h-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">متوسط النتيجة</p>
                <p className="text-2xl font-bold">{quiz.avgScore}%</p>
              </div>
              <BarChart3 className="w-8 h-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">معدل الإكمال</p>
                <p className="text-2xl font-bold">{quiz.analytics.completionRate}%</p>
              </div>
              <CheckCircle className="w-8 h-8 text-purple-500" />
            </div>
            <Progress value={quiz.analytics.completionRate} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">متوسط الوقت</p>
                <p className="text-2xl font-bold">{quiz.analytics.averageTime} د</p>
              </div>
              <Clock className="w-8 h-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Information */}
      <Tabs defaultValue="questions" className="space-y-4">
        <TabsList>
          <TabsTrigger value="questions">الأسئلة</TabsTrigger>
          <TabsTrigger value="results">النتائج</TabsTrigger>
          <TabsTrigger value="analytics">التحليلات</TabsTrigger>
          <TabsTrigger value="settings">الإعدادات</TabsTrigger>
        </TabsList>

        <TabsContent value="questions">
          <Card>
            <CardHeader>
              <CardTitle>أسئلة الاختبار ({quiz.totalQuestions} سؤال)</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {quiz.questions.map((question, index) => (
                  <div key={question.id} className="border rounded-lg p-4">
                    <div className="flex items-start justify-between mb-2">
                      <h4 className="font-medium">السؤال {index + 1}</h4>
                      <Badge variant="outline">{question.points} نقطة</Badge>
                    </div>
                    <p className="text-gray-700 mb-3">{question.text}</p>
                    {question.type === 'mcq' && question.options && (
                      <div className="space-y-2">
                        {question.options.map((option, optIndex) => (
                          <div 
                            key={optIndex} 
                            className={`p-2 rounded border ${
                              optIndex === question.correctAnswer 
                                ? 'bg-green-50 border-green-200' 
                                : 'bg-gray-50'
                            }`}
                          >
                            {optIndex === question.correctAnswer && (
                              <CheckCircle className="w-4 h-4 text-green-600 inline mr-2" />
                            )}
                            {option}
                          </div>
                        ))}
                      </div>
                    )}
                    {question.type === 'truefalse' && (
                      <div className="flex gap-2">
                        <Badge variant={question.correctAnswer ? 'default' : 'outline'}>
                          صحيح
                        </Badge>
                        <Badge variant={!question.correctAnswer ? 'default' : 'outline'}>
                          خطأ
                        </Badge>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="results">
          <Card>
            <CardHeader>
              <CardTitle>نتائج الطلاب</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <h4 className="font-medium">أفضل النتائج</h4>
                {quiz.analytics.topScorers.map((scorer, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                    <span className="font-medium">{scorer.name}</span>
                    <Badge variant="default">{scorer.score}%</Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics">
          <Card>
            <CardHeader>
              <CardTitle>تحليلات مفصلة</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">إحصائيات وتحليلات شاملة لأداء الاختبار</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings">
          <Card>
            <CardHeader>
              <CardTitle>إعدادات الاختبار</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-medium">تاريخ الإنشاء:</span>
                    <p className="text-gray-600">{quiz.createdDate}</p>
                  </div>
                  <div>
                    <span className="font-medium">آخر تحديث:</span>
                    <p className="text-gray-600">{quiz.lastUpdated}</p>
                  </div>
                  <div>
                    <span className="font-medium">الصعوبة:</span>
                    <p className="text-gray-600">{quiz.difficulty}</p>
                  </div>
                  <div>
                    <span className="font-medium">الفئة:</span>
                    <p className="text-gray-600">{quiz.category}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default QuizView;
