import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useLanguage } from "@/contexts/LanguageContext";
import { 
  CheckCircle, 
  XCircle, 
  ArrowRight,
  Trophy,
  Clock,
  Target,
  BookOpen
} from "lucide-react";
import { fetchQuizResults } from "@/services/api";

const QuizResults = () => {
  const { quizId, submissionId } = useParams<{ quizId: string; submissionId: string }>();
  const navigate = useNavigate();
  const { t, dir } = useLanguage();

  const { data: resultsData, isLoading } = useQuery({
    queryKey: ['quiz-results', submissionId],
    queryFn: () => fetchQuizResults(submissionId!),
    enabled: !!submissionId,
  });

  const submission = resultsData?.data;
  const quiz = submission?.quiz;
  const answers = submission?.answers || [];

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-300 rounded w-1/4 mb-4"></div>
          <div className="h-64 bg-gray-300 rounded"></div>
        </div>
      </div>
    );
  }

  if (!submission) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">النتائج غير متاحة</p>
        <Button onClick={() => navigate('/student/quizzes')} className="mt-4">
          العودة إلى الاختبارات
        </Button>
      </div>
    );
  }

  const isPassed = submission.is_passed;
  const correctAnswers = answers.filter((answer: any) => answer.is_correct).length;
  const totalQuestions = answers.length;

  return (
    <div className="max-w-4xl mx-auto space-y-6" dir="rtl">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          onClick={() => navigate('/student/quizzes')}
          className="flex items-center gap-2"
        >
          <ArrowRight className="h-4 w-4" />
          العودة إلى الاختبارات
        </Button>
        <div>
          <h1 className="text-3xl font-bold">{quiz?.title}</h1>
          <p className="text-gray-600">نتائج الاختبار</p>
        </div>
      </div>

      {/* Results Summary */}
      <Card className={`border-l-4 ${isPassed ? 'border-l-green-500' : 'border-l-red-500'}`}>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              {isPassed ? (
                <>
                  <Trophy className="h-6 w-6 text-green-600" />
                  <span className="text-green-600">نجحت في الاختبار!</span>
                </>
              ) : (
                <>
                  <XCircle className="h-6 w-6 text-red-600" />
                  <span className="text-red-600">لم تنجح في الاختبار</span>
                </>
              )}
            </CardTitle>
            <Badge variant={isPassed ? "default" : "destructive"} className="text-lg px-4 py-2">
              {submission.percentage}%
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600">{submission.total_score}</div>
              <div className="text-sm text-gray-600">النقاط المحصلة</div>
              <div className="text-xs text-gray-500">من {submission.max_possible_score}</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600">{correctAnswers}</div>
              <div className="text-sm text-gray-600">إجابات صحيحة</div>
              <div className="text-xs text-gray-500">من {totalQuestions}</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-purple-600">{submission.time_taken_minutes}</div>
              <div className="text-sm text-gray-600">دقيقة</div>
              <div className="text-xs text-gray-500">الوقت المستغرق</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-orange-600">{quiz?.passing_score}%</div>
              <div className="text-sm text-gray-600">درجة النجاح</div>
              <div className="text-xs text-gray-500">المطلوبة</div>
            </div>
          </div>
          
          <div className="mt-6">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium">النتيجة</span>
              <span className="text-sm text-gray-600">{submission.percentage}%</span>
            </div>
            <Progress value={submission.percentage} className="h-3" />
          </div>
        </CardContent>
      </Card>

      {/* Detailed Results */}
      <Card>
        <CardHeader>
          <CardTitle>تفاصيل الإجابات</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {answers.map((answer: any, index: number) => (
            <div key={answer.id} className="border rounded-lg p-4">
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="font-bold text-academy-green">السؤال {index + 1}</span>
                    <Badge variant="outline">{answer.question.points} نقطة</Badge>
                    {answer.is_correct ? (
                      <CheckCircle className="h-5 w-5 text-green-600" />
                    ) : (
                      <XCircle className="h-5 w-5 text-red-600" />
                    )}
                  </div>
                  <p className="text-gray-800 mb-3">{answer.question.question}</p>
                </div>
                <div className="text-right">
                  <div className={`text-lg font-bold ${answer.is_correct ? 'text-green-600' : 'text-red-600'}`}>
                    {answer.points_earned} / {answer.question.points}
                  </div>
                </div>
              </div>

              {/* Multiple Choice / True False */}
              {answer.question.options && answer.question.options.length > 0 && (
                <div className="space-y-2">
                  {answer.question.options.map((option: any, optionIndex: number) => {
                    const isSelected = answer.selected_option_id === option.id;
                    const isCorrect = option.is_correct;
                    
                    let bgColor = 'bg-gray-50 border-gray-200';
                    if (isCorrect) {
                      bgColor = 'bg-green-50 border-green-200';
                    } else if (isSelected && !isCorrect) {
                      bgColor = 'bg-red-50 border-red-200';
                    }

                    return (
                      <div key={option.id} className={`p-3 rounded border ${bgColor}`}>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="font-medium">
                              {String.fromCharCode(65 + optionIndex)}.
                            </span>
                            <span>{option.option_text}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            {isSelected && (
                              <Badge variant="outline" className="text-xs">
                                إجابتك
                              </Badge>
                            )}
                            {isCorrect && (
                              <Badge className="bg-green-600 text-xs">
                                الإجابة الصحيحة
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Text Answer */}
              {answer.answer_text && (
                <div className="mt-3">
                  <p className="text-sm font-medium mb-2">إجابتك:</p>
                  <div className="p-3 bg-gray-50 border rounded">
                    <p className="text-gray-800">{answer.answer_text}</p>
                  </div>
                </div>
              )}

              {/* Explanation */}
              {answer.question.explanation && (
                <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded">
                  <p className="text-sm font-medium text-blue-800 mb-1">التفسير:</p>
                  <p className="text-sm text-blue-700">{answer.question.explanation}</p>
                </div>
              )}
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Actions */}
      <Card>
        <CardContent className="p-6">
          <div className="flex justify-center gap-4">
            <Button
              variant="outline"
              onClick={() => navigate('/student/quizzes')}
            >
              <BookOpen className="h-4 w-4 ml-2" />
              العودة إلى الاختبارات
            </Button>
            {!isPassed && submission.quiz.max_attempts > submission.attempt_number && (
              <Button
                onClick={() => navigate(`/student/quiz/${quizId}`)}
                className="bg-academy-green hover:bg-academy-green/90"
              >
                <Target className="h-4 w-4 ml-2" />
                إعادة المحاولة
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default QuizResults;