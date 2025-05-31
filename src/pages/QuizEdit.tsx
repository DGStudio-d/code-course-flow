
import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Save, ArrowLeft, Plus, Trash2, GripVertical } from 'lucide-react';
import AdminHeader from '@/components/admin/AdminHeader';

const QuizEdit = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isNewQuiz = id === 'new';

  const [quizData, setQuizData] = useState({
    title: '',
    description: '',
    instructions: '',
    timeLimit: '',
    attempts: '',
    passingScore: '',
    showResults: true,
    randomizeQuestions: false,
    startDate: '',
    endDate: '',
    allowLateSubmission: false,
  });

  const [questions, setQuestions] = useState([]);

  const addQuestion = (type) => {
    const newQuestion = {
      id: Date.now(),
      type,
      text: '',
      points: 1,
      options: type === 'mcq' ? ['', ''] : [],
      correctAnswer: '',
      explanation: '',
    };
    setQuestions([...questions, newQuestion]);
  };

  const updateQuestion = (questionId, field, value) => {
    setQuestions(questions.map(q => 
      q.id === questionId ? { ...q, [field]: value } : q
    ));
  };

  const deleteQuestion = (questionId) => {
    setQuestions(questions.filter(q => q.id !== questionId));
  };

  const addOption = (questionId) => {
    setQuestions(questions.map(q => 
      q.id === questionId ? { ...q, options: [...q.options, ''] } : q
    ));
  };

  const updateOption = (questionId, optionIndex, value) => {
    setQuestions(questions.map(q => 
      q.id === questionId ? {
        ...q,
        options: q.options.map((opt, idx) => idx === optionIndex ? value : opt)
      } : q
    ));
  };

  const removeOption = (questionId, optionIndex) => {
    setQuestions(questions.map(q => 
      q.id === questionId ? {
        ...q,
        options: q.options.filter((_, idx) => idx !== optionIndex)
      } : q
    ));
  };

  const handleSave = () => {
    console.log('Saving quiz:', { quizData, questions });
    // API call to save quiz
  };

  const renderQuestionEditor = (question, index) => {
    return (
      <Card key={question.id} className="mb-4">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <div className="flex items-center space-x-2">
            <GripVertical className="w-4 h-4 text-gray-400 cursor-move" />
            <CardTitle className="text-base">السؤال {index + 1}</CardTitle>
            <Select value={question.type} onValueChange={(value) => updateQuestion(question.id, 'type', value)}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="mcq">اختيار متعدد</SelectItem>
                <SelectItem value="truefalse">صح/خطأ</SelectItem>
                <SelectItem value="shortanswer">إجابة قصيرة</SelectItem>
                <SelectItem value="essay">مقال</SelectItem>
                <SelectItem value="fillblank">ملء الفراغات</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="flex items-center space-x-2">
            <Label htmlFor={`points-${question.id}`}>النقاط:</Label>
            <Input
              id={`points-${question.id}`}
              type="number"
              value={question.points}
              onChange={(e) => updateQuestion(question.id, 'points', parseInt(e.target.value))}
              className="w-16"
              min="1"
            />
            <Button
              variant="ghost"
              size="sm"
              onClick={() => deleteQuestion(question.id)}
              className="text-red-600 hover:text-red-700"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor={`question-text-${question.id}`}>نص السؤال</Label>
            <Textarea
              id={`question-text-${question.id}`}
              value={question.text}
              onChange={(e) => updateQuestion(question.id, 'text', e.target.value)}
              placeholder="أدخل نص السؤال"
              rows={2}
            />
          </div>

          {question.type === 'mcq' && (
            <div>
              <Label>الخيارات</Label>
              <div className="space-y-2">
                {question.options.map((option, optionIndex) => (
                  <div key={optionIndex} className="flex items-center space-x-2">
                    <Input
                      value={option}
                      onChange={(e) => updateOption(question.id, optionIndex, e.target.value)}
                      placeholder={`الخيار ${optionIndex + 1}`}
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => updateQuestion(question.id, 'correctAnswer', optionIndex.toString())}
                      className={question.correctAnswer === optionIndex.toString() ? 'bg-green-100' : ''}
                    >
                      صحيح
                    </Button>
                    {question.options.length > 2 && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeOption(question.id, optionIndex)}
                        className="text-red-600"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                ))}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => addOption(question.id)}
                  className="w-full"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  إضافة خيار
                </Button>
              </div>
            </div>
          )}

          {question.type === 'truefalse' && (
            <div>
              <Label>الإجابة الصحيحة</Label>
              <Select value={question.correctAnswer} onValueChange={(value) => updateQuestion(question.id, 'correctAnswer', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="اختر الإجابة الصحيحة" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="true">صحيح</SelectItem>
                  <SelectItem value="false">خطأ</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

          {(question.type === 'shortanswer' || question.type === 'fillblank') && (
            <div>
              <Label htmlFor={`correct-answer-${question.id}`}>الإجابة الصحيحة</Label>
              <Input
                id={`correct-answer-${question.id}`}
                value={question.correctAnswer}
                onChange={(e) => updateQuestion(question.id, 'correctAnswer', e.target.value)}
                placeholder="أدخل الإجابة الصحيحة"
              />
            </div>
          )}

          <div>
            <Label htmlFor={`explanation-${question.id}`}>شرح الإجابة (اختياري)</Label>
            <Textarea
              id={`explanation-${question.id}`}
              value={question.explanation}
              onChange={(e) => updateQuestion(question.id, 'explanation', e.target.value)}
              placeholder="أدخل شرح للإجابة الصحيحة"
              rows={2}
            />
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminHeader />
      
      <div className="container mx-auto px-4 py-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              onClick={() => navigate('/admin/quizzes')}
              className="flex items-center space-x-2"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>العودة للاختبارات</span>
            </Button>
            <h1 className="text-2xl font-bold">
              {isNewQuiz ? 'إنشاء اختبار جديد' : 'تعديل الاختبار'}
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

        <Tabs defaultValue="config" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="config">إعدادات الاختبار</TabsTrigger>
            <TabsTrigger value="questions">إدارة الأسئلة</TabsTrigger>
            <TabsTrigger value="advanced">الإعدادات المتقدمة</TabsTrigger>
          </TabsList>

          <TabsContent value="config" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>إعدادات الاختبار الأساسية</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="title">عنوان الاختبار</Label>
                  <Input
                    id="title"
                    value={quizData.title}
                    onChange={(e) => setQuizData({...quizData, title: e.target.value})}
                    placeholder="أدخل عنوان الاختبار"
                  />
                </div>

                <div>
                  <Label htmlFor="description">وصف الاختبار</Label>
                  <Textarea
                    id="description"
                    value={quizData.description}
                    onChange={(e) => setQuizData({...quizData, description: e.target.value})}
                    placeholder="أدخل وصف الاختبار"
                    rows={3}
                  />
                </div>

                <div>
                  <Label htmlFor="instructions">تعليمات الاختبار</Label>
                  <Textarea
                    id="instructions"
                    value={quizData.instructions}
                    onChange={(e) => setQuizData({...quizData, instructions: e.target.value})}
                    placeholder="أدخل تعليمات الاختبار للطلاب"
                    rows={3}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="timeLimit">المدة الزمنية (دقيقة)</Label>
                    <Input
                      id="timeLimit"
                      type="number"
                      value={quizData.timeLimit}
                      onChange={(e) => setQuizData({...quizData, timeLimit: e.target.value})}
                      placeholder="60"
                    />
                  </div>

                  <div>
                    <Label htmlFor="attempts">عدد المحاولات</Label>
                    <Input
                      id="attempts"
                      type="number"
                      value={quizData.attempts}
                      onChange={(e) => setQuizData({...quizData, attempts: e.target.value})}
                      placeholder="1"
                    />
                  </div>

                  <div>
                    <Label htmlFor="passingScore">درجة النجاح (%)</Label>
                    <Input
                      id="passingScore"
                      type="number"
                      value={quizData.passingScore}
                      onChange={(e) => setQuizData({...quizData, passingScore: e.target.value})}
                      placeholder="70"
                      min="0"
                      max="100"
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="showResults"
                      checked={quizData.showResults}
                      onCheckedChange={(checked) => setQuizData({...quizData, showResults: checked})}
                    />
                    <Label htmlFor="showResults">إظهار النتائج فور الانتهاء</Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Switch
                      id="randomizeQuestions"
                      checked={quizData.randomizeQuestions}
                      onCheckedChange={(checked) => setQuizData({...quizData, randomizeQuestions: checked})}
                    />
                    <Label htmlFor="randomizeQuestions">ترتيب الأسئلة عشوائياً</Label>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="questions" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  أسئلة الاختبار
                  <div className="flex space-x-2">
                    <Select onValueChange={(value) => addQuestion(value)}>
                      <SelectTrigger className="w-48">
                        <SelectValue placeholder="إضافة سؤال جديد" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="mcq">اختيار متعدد</SelectItem>
                        <SelectItem value="truefalse">صح/خطأ</SelectItem>
                        <SelectItem value="shortanswer">إجابة قصيرة</SelectItem>
                        <SelectItem value="essay">مقال</SelectItem>
                        <SelectItem value="fillblank">ملء الفراغات</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {questions.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <p>لم يتم إضافة أي أسئلة بعد</p>
                    <p className="text-sm">استخدم القائمة أعلاه لإضافة أسئلة جديدة</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {questions.map((question, index) => renderQuestionEditor(question, index))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="advanced" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>الإعدادات المتقدمة</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="startDate">تاريخ بداية الاختبار</Label>
                    <Input
                      id="startDate"
                      type="datetime-local"
                      value={quizData.startDate}
                      onChange={(e) => setQuizData({...quizData, startDate: e.target.value})}
                    />
                  </div>

                  <div>
                    <Label htmlFor="endDate">تاريخ نهاية الاختبار</Label>
                    <Input
                      id="endDate"
                      type="datetime-local"
                      value={quizData.endDate}
                      onChange={(e) => setQuizData({...quizData, endDate: e.target.value})}
                    />
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    id="allowLateSubmission"
                    checked={quizData.allowLateSubmission}
                    onCheckedChange={(checked) => setQuizData({...quizData, allowLateSubmission: checked})}
                  />
                  <Label htmlFor="allowLateSubmission">السماح بالتسليم المتأخر</Label>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default QuizEdit;
