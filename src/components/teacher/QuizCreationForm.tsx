import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Trash2, Plus, Eye, Save } from "lucide-react";
import { Quiz, Question } from "@/types";
import { useSelector } from "react-redux";
import type { RootState } from "@/config/store/store";

interface QuizCreationFormProps {
  onClose: () => void;
  onSave: (quiz: Partial<Quiz>) => void;
}

const QuizCreationForm = ({ onClose, onSave }: QuizCreationFormProps) => {
  const [quizData, setQuizData] = useState({
    title: "",
    difficulty: "beginner" as const,
    duration: 30,
    courseId: "",
    languageId: "1",
  });
  const languages = useSelector((state: RootState) => state.appData.languages);

  const [questions, setQuestions] = useState<Partial<Question>[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState<Partial<Question>>({
    type: "mcq",
    text: "",
    options: ["", "", "", ""],
    correctAnswer: "",
    explanation: "",
  });

  const [showPreview, setShowPreview] = useState(false);

  const addQuestion = () => {
    if (currentQuestion.text && currentQuestion.correctAnswer) {
      setQuestions([
        ...questions,
        { ...currentQuestion, id: Date.now().toString() },
      ]);
      setCurrentQuestion({
        type: "mcq",
        text: "",
        options: ["", "", "", ""],
        correctAnswer: "",
        explanation: "",
      });
    }
  };

  const removeQuestion = (index: number) => {
    setQuestions(questions.filter((_, i) => i !== index));
  };

  const updateCurrentQuestionOption = (index: number, value: string) => {
    const newOptions = [...(currentQuestion.options || ["", "", "", ""])];
    newOptions[index] = value;
    setCurrentQuestion({ ...currentQuestion, options: newOptions });
  };

  const handleSave = () => {
    const quiz: Partial<Quiz> = {
      ...quizData,
      questions: questions as Question[],
      id: Date.now().toString(),
    };
    onSave(quiz);
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>إنشاء اختبار جديد</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Quiz Basic Info */}
          <Card>
            <CardHeader>
              <CardTitle>معلومات الاختبار الأساسية</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="title">عنوان الاختبار</Label>
                  <Input
                    id="title"
                    value={quizData.title}
                    onChange={(e) =>
                      setQuizData({ ...quizData, title: e.target.value })
                    }
                    placeholder="أدخل عنوان الاختبار"
                  />
                </div>
                <div>
                  <Label htmlFor="difficulty">مستوى الصعوبة</Label>
                  <Select
                    value={quizData.difficulty}
                    onValueChange={(value: any) =>
                      setQuizData({ ...quizData, difficulty: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="beginner">مبتدئ</SelectItem>
                      <SelectItem value="intermediate">متوسط</SelectItem>
                      <SelectItem value="advanced">متقدم</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="duration">مدة الاختبار (بالدقائق)</Label>
                  <Input
                    id="duration"
                    type="number"
                    value={quizData.duration}
                    onChange={(e) =>
                      setQuizData({
                        ...quizData,
                        duration: parseInt(e.target.value),
                      })
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="language">اللغة</Label>
                  <Select
                    value={quizData.languageId}
                    onValueChange={(value) =>
                      setQuizData({ ...quizData, languageId: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {languages?.map((lang: any) => (
                        <SelectItem key={lang.id} value={String(lang.id)}>
                          {lang.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Question Creation */}
          <Card>
            <CardHeader>
              <CardTitle>إضافة سؤال جديد</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="questionType">نوع السؤال</Label>
                <Select
                  value={currentQuestion.type}
                  onValueChange={(value: any) =>
                    setCurrentQuestion({ ...currentQuestion, type: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="mcq">اختيار متعدد</SelectItem>
                    <SelectItem value="fill">ملء الفراغ</SelectItem>
                    <SelectItem value="audio">سؤال صوتي</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="questionText">نص السؤال</Label>
                <Textarea
                  id="questionText"
                  value={currentQuestion.text}
                  onChange={(e) =>
                    setCurrentQuestion({
                      ...currentQuestion,
                      text: e.target.value,
                    })
                  }
                  placeholder="أدخل نص السؤال"
                />
              </div>

              {currentQuestion.type === "mcq" && (
                <div>
                  <Label>الخيارات</Label>
                  <div className="grid grid-cols-2 gap-2">
                    {(currentQuestion.options || ["", "", "", ""]).map(
                      (option, index) => (
                        <Input
                          key={index}
                          value={option}
                          onChange={(e) =>
                            updateCurrentQuestionOption(index, e.target.value)
                          }
                          placeholder={`الخيار ${index + 1}`}
                        />
                      )
                    )}
                  </div>
                </div>
              )}

              <div>
                <Label htmlFor="correctAnswer">الإجابة الصحيحة</Label>
                <Input
                  id="correctAnswer"
                  value={currentQuestion.correctAnswer}
                  onChange={(e) =>
                    setCurrentQuestion({
                      ...currentQuestion,
                      correctAnswer: e.target.value,
                    })
                  }
                  placeholder="أدخل الإجابة الصحيحة"
                />
              </div>

              <div>
                <Label htmlFor="explanation">شرح الإجابة</Label>
                <Textarea
                  id="explanation"
                  value={currentQuestion.explanation}
                  onChange={(e) =>
                    setCurrentQuestion({
                      ...currentQuestion,
                      explanation: e.target.value,
                    })
                  }
                  placeholder="أدخل شرح الإجابة الصحيحة"
                />
              </div>

              <Button onClick={addQuestion} className="w-full">
                <Plus className="w-4 h-4 ml-2" />
                إضافة السؤال
              </Button>
            </CardContent>
          </Card>

          {/* Questions List */}
          {questions.length > 0 && (
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle>الأسئلة المضافة ({questions.length})</CardTitle>
                  <Button
                    variant="outline"
                    onClick={() => setShowPreview(!showPreview)}
                  >
                    <Eye className="w-4 h-4 ml-2" />
                    {showPreview ? "إخفاء المعاينة" : "معاينة"}
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {questions.map((question, index) => (
                    <div
                      key={index}
                      className="flex justify-between items-start p-4 border rounded-lg"
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge variant="secondary">
                            {question.type === "mcq"
                              ? "اختيار متعدد"
                              : question.type === "fill"
                              ? "ملء فراغ"
                              : "صوتي"}
                          </Badge>
                          <span className="text-sm text-gray-600">
                            السؤال {index + 1}
                          </span>
                        </div>
                        <p className="font-medium">{question.text}</p>
                        {showPreview && question.type === "mcq" && (
                          <div className="mt-2 space-y-1">
                            {question.options?.map((option, optIndex) => (
                              <div
                                key={optIndex}
                                className="text-sm text-gray-600"
                              >
                                {String.fromCharCode(65 + optIndex)}. {option}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => removeQuestion(index)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Actions */}
          <div className="flex justify-end gap-4">
            <Button variant="outline" onClick={onClose}>
              إلغاء
            </Button>
            <Button
              onClick={handleSave}
              disabled={!quizData.title || questions.length === 0}
            >
              <Save className="w-4 h-4 ml-2" />
              حفظ الاختبار
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default QuizCreationForm;
