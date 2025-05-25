
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Search, Edit, Trash2, Eye, Copy } from 'lucide-react';

const QuizManagement = () => {
  const [searchTerm, setSearchTerm] = useState('');

  // Sample quiz data
  const quizzes = [
    {
      id: '1',
      title: 'اختبار القواعد الأساسية',
      difficulty: 'beginner',
      questions: 15,
      duration: 30,
      students: 24,
      avgScore: 78,
      created: '2024-01-15',
      status: 'active'
    },
    {
      id: '2',
      title: 'اختبار المحادثة المتقدم',
      difficulty: 'advanced',
      questions: 20,
      duration: 45,
      students: 12,
      avgScore: 85,
      created: '2024-01-10',
      status: 'active'
    },
    {
      id: '3',
      title: 'اختبار المفردات المتوسط',
      difficulty: 'intermediate',
      questions: 18,
      duration: 35,
      students: 31,
      avgScore: 72,
      created: '2024-01-08',
      status: 'draft'
    }
  ];

  const filteredQuizzes = quizzes.filter(quiz =>
    quiz.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return 'bg-green-100 text-green-800';
      case 'intermediate': return 'bg-yellow-100 text-yellow-800';
      case 'advanced': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getDifficultyLabel = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return 'مبتدئ';
      case 'intermediate': return 'متوسط';
      case 'advanced': return 'متقدم';
      default: return difficulty;
    }
  };

  const getStatusColor = (status: string) => {
    return status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800';
  };

  const getStatusLabel = (status: string) => {
    return status === 'active' ? 'نشط' : 'مسودة';
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle>إدارة الاختبارات</CardTitle>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="البحث في الاختبارات..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 w-64"
            />
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>عنوان الاختبار</TableHead>
                <TableHead>المستوى</TableHead>
                <TableHead>الأسئلة</TableHead>
                <TableHead>المدة</TableHead>
                <TableHead>الطلاب</TableHead>
                <TableHead>متوسط النتيجة</TableHead>
                <TableHead>الحالة</TableHead>
                <TableHead>الإجراءات</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredQuizzes.map((quiz) => (
                <TableRow key={quiz.id}>
                  <TableCell className="font-medium">{quiz.title}</TableCell>
                  <TableCell>
                    <Badge className={getDifficultyColor(quiz.difficulty)}>
                      {getDifficultyLabel(quiz.difficulty)}
                    </Badge>
                  </TableCell>
                  <TableCell>{quiz.questions} سؤال</TableCell>
                  <TableCell>{quiz.duration} دقيقة</TableCell>
                  <TableCell>{quiz.students} طالب</TableCell>
                  <TableCell>
                    <div className="flex items-center">
                      <span className="font-medium">{quiz.avgScore}%</span>
                      <div className="w-16 h-2 bg-gray-200 rounded-full ml-2">
                        <div 
                          className="h-2 bg-green-500 rounded-full" 
                          style={{ width: `${quiz.avgScore}%` }}
                        />
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge className={getStatusColor(quiz.status)}>
                      {getStatusLabel(quiz.status)}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm">
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button variant="outline" size="sm">
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button variant="outline" size="sm">
                        <Copy className="w-4 h-4" />
                      </Button>
                      <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700">
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {filteredQuizzes.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-400 text-6xl mb-4">📝</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              لا توجد اختبارات
            </h3>
            <p className="text-gray-600">
              {searchTerm ? 'لم يتم العثور على اختبارات تطابق البحث' : 'ابدأ بإنشاء اختبار جديد'}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default QuizManagement;
