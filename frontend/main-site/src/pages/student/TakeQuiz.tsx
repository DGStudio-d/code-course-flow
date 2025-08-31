import React, { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useLanguage } from "@/contexts/LanguageContext";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { 
  ArrowLeft, 
  ArrowRight, 
  Send,
  AlertTriangle,
  CheckCircle,
  BookOpen,
  Target,
  Timer,
  Users,
  Lightbulb,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Zap,
  Save
} from "lucide-react";
import { fetchQuizById, startQuiz, submitQuiz } from "@/services/api";
import { useToast } from "@/components/ui/use-toast";
import { 
  MultipleChoiceQuestion,
  TrueFalseQuestion,
  FillBlankQuestion,
  ShortAnswerQuestion,
  EssayQuestion,
  QuestionTypeIcon,
  DifficultyBadge,
  QuestionProgress
} from "@/components/quiz/QuestionComponents";
import { QuizTimer, CompactTimer } from "@/components/quiz/QuizTimer";
import { QuizResults } from "@/components/quiz/QuizResults";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Label } from "@/components/ui/label";
import { RadioGroup } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Label } from "@/components/ui/label";
import { RadioGroupItem } from "@/components/ui/radio-group";
import { RadioGroup } from "@/components/ui/radio-group";
import { RadioGroup } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Label } from "@/components/ui/label";
import { RadioGroupItem } from "@/components/ui/radio-group";
import { Textarea } from "@/components/ui/textarea";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Label } from "@/components/ui/label";
import { RadioGroupItem } from "@/components/ui/radio-group";
import { RadioGroup } from "@/components/ui/radio-group";
import { RadioGroup } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Label } from "@/components/ui/label";
import { RadioGroupItem } from "@/components/ui/radio-group";
import { RadioGroup } from "@/components/ui/radio-group";
import { Progress } from "@/components/ui/progress";
import { RadioGroup } from "@/components/ui/radio-group";

// Enhanced TypeScript interfaces
interface QuizOption {
  id: string;
  option_text: string;
  is_correct: boolean;
}

interface QuizQuestion {
  id: string;
  type: 'multiple_choice' | 'true_false' | 'fill_blank' | 'short_answer' | 'essay';
  question: string;
  points: number;
  options?: QuizOption[];
  explanation?: string;
}

interface Quiz {
  id: string;
  title: string;
  description?: string;
  time_limit_minutes?: number;
  max_attempts: number;
  passing_score: number;
  total_questions: number;
  proficiency_level: string;
  correction_mode: 'immediate' | 'end_of_quiz' | 'manual';
  show_results_immediately: boolean;
  questions: QuizQuestion[];
  program?: {
    title: string;
  };
}

interface QuizSubmission {
  id: string;
  quiz_id: string;
  student_id: string;
  attempt_number: number;
  started_at: string;
}

interface SubmissionAnswer {
  question_id: string;
  selected_option_id?: string;
  answer_text?: string;
}

interface QuizCorrection {
  question_id: string;
  is_correct: boolean;
  correct_answer: string;
  explanation: string;
  improvement_suggestion: string;
}

interface SubmissionResponse {
  id: string;
  total_score: number;
  max_possible_score: number;
  percentage: number;
  is_passed: boolean;
  corrections?: QuizCorrection[];
  summary?: {
    correct_answers: number;
    total_questions: number;
    time_taken: number;
  };
}

const TakeQuiz = () => {
  const { quizId } = useParams<{ quizId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { t, dir } = useLanguage();

  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, SubmissionAnswer>>({});
  const [timeLeft, setTimeLeft] = useState<number | null>(null);
  const [submission, setSubmission] = useState<QuizSubmission | null>(null);
  const [isStarted, setIsStarted] = useState(false);
  const [showCorrections, setShowCorrections] = useState(false);
  const [corrections, setCorrections] = useState<QuizCorrection[]>([]);
  const [submissionResult, setSubmissionResult] = useState<SubmissionResponse | null>(null);
  const [startTime, setStartTime] = useState<Date | null>(null);
  const [autoSaveEnabled, setAutoSaveEnabled] = useState(true);

  const { data: quizData, isLoading, error } = useQuery({
    queryKey: ['quiz', quizId],
    queryFn: () => fetchQuizById(quizId!),
    enabled: !!quizId,
    retry: 2,
  });

  const startQuizMutation = useMutation({
    mutationFn: () => startQuiz(quizId!),
    onSuccess: (response: { data: QuizSubmission }) => {
      setSubmission(response.data);
      setIsStarted(true);
      setStartTime(new Date());
      if (quiz?.time_limit_minutes) {
        setTimeLeft(quiz.time_limit_minutes * 60);
      }
      toast({
        title: t("toast.quizStarted"),
        description: t("toast.quizStartedDesc"),
      });
    },
    onError: (error: any) => {
      toast({
        title: t("toast.error"),
        description: error.response?.data?.message || t("toast.quizStartError"),
        variant: "destructive",
      });
    },
  });

  const submitQuizMutation = useMutation({
    mutationFn: (submissionData: { answers: SubmissionAnswer[]; time_taken_minutes?: number }) => 
      submitQuiz(quizId!, submissionData),
    onSuccess: (response: { 
      data: SubmissionResponse; 
      show_results_immediately: boolean; 
      correction_mode: string;
      corrections?: QuizCorrection[];
      summary?: any;
    }) => {
      setSubmissionResult(response.data);
      
      // Handle immediate corrections
      if (response.correction_mode === 'immediate' && response.corrections) {
        setCorrections(response.corrections);
        setShowCorrections(true);
      }
      
      toast({
        title: t("toast.quizSubmitted"),
        description: t("toast.quizSubmittedDesc"),
      });
      
      // Navigate based on quiz settings
      if (response.show_results_immediately || response.correction_mode === 'immediate') {
        // Stay on page to show results/corrections
        return;
      } else {
        navigate('/student/quizzes');
      }
    },
    onError: (error: any) => {
      toast({
        title: t("toast.error"),
        description: error.response?.data?.message || t("toast.quizSubmitError"),
        variant: "destructive",
      });
    },
  });

  const quiz: Quiz | undefined = quizData?.data;
  const questions = quiz?.questions || [];
  const currentQuestion = questions[currentQuestionIndex];

  // Timer effect
  useEffect(() => {
    if (timeLeft === null || timeLeft <= 0) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev === null || prev <= 1) {
          handleSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft]);

  // Auto-save effect
  useEffect(() => {
    if (!autoSaveEnabled || !isStarted || Object.keys(answers).length === 0) return;

    const autoSaveTimer = setInterval(() => {
      autoSave();
    }, 30000); // Auto-save every 30 seconds

    return () => clearInterval(autoSaveTimer);
  }, [answers, autoSaveEnabled, isStarted, autoSave]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      if (!isStarted || showCorrections) return;

      if (event.ctrlKey || event.metaKey) {
        switch (event.key) {
          case 'ArrowLeft':
            event.preventDefault();
            if (currentQuestionIndex > 0) {
              setCurrentQuestionIndex(prev => prev - 1);
            }
            break;
          case 'ArrowRight':
            event.preventDefault();
            if (currentQuestionIndex < questions.length - 1) {
              setCurrentQuestionIndex(prev => prev + 1);
            }
            break;
          case 'Enter':
            event.preventDefault();
            if (currentQuestionIndex === questions.length - 1) {
              // Trigger submit confirmation
            } else {
              setCurrentQuestionIndex(prev => Math.min(questions.length - 1, prev + 1));
            }
            break;
        }
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [isStarted, showCorrections, currentQuestionIndex, questions.length]);

  const formatTime = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const handleAnswerChange = useCallback((questionId: string, answerData: Partial<SubmissionAnswer>) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: {
        question_id: questionId,
        ...prev[questionId],
        ...answerData
      }
    }));
  }, []);

  const handleMultipleChoiceAnswer = useCallback((questionId: string, optionId: string) => {
    handleAnswerChange(questionId, { selected_option_id: optionId });
  }, [handleAnswerChange]);

  const handleTextAnswer = useCallback((questionId: string, text: string) => {
    handleAnswerChange(questionId, { answer_text: text });
  }, [handleAnswerChange]);

  const handleFillBlankAnswer = useCallback((questionId: string, blanks: string[]) => {
    handleAnswerChange(questionId, { answer_text: blanks.join('|') }); // Use pipe separator for multiple blanks
  }, [handleAnswerChange]);

  const handleSubmit = useCallback(() => {
    if (!submission) return;

    const timeTaken = startTime ? Math.floor((new Date().getTime() - startTime.getTime()) / 60000) : undefined;

    const submissionData = {
      answers: Object.values(answers).map(answer => ({
        question_id: answer.question_id,
        selected_option_id: answer.selected_option_id || undefined,
        answer_text: answer.answer_text || undefined,
      })),
      time_taken_minutes: timeTaken
    };

    submitQuizMutation.mutate(submissionData);
  }, [submission, answers, startTime, submitQuizMutation]);

  const getQuestionProgress = useCallback(() => {
    const answered = Object.keys(answers).length;
    const total = questions.length;
    return { answered, total, percentage: total > 0 ? (answered / total) * 100 : 0 };
  }, [answers, questions.length]);

  const isQuestionAnswered = useCallback((questionId: string) => {
    const answer = answers[questionId];
    if (!answer) return false;
    
    return !!(answer.selected_option_id || (answer.answer_text && answer.answer_text.trim()));
  }, [answers]);

  // Auto-save functionality
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const autoSave = useCallback(async () => {
    if (!isStarted || Object.keys(answers).length === 0) return;
    
    setIsSaving(true);
    try {
      // Auto-save logic would go here
      // For now, just simulate saving
      await new Promise(resolve => setTimeout(resolve, 500));
      setLastSaved(new Date());
    } catch (error) {
      console.error('Auto-save failed:', error);
    } finally {
      setIsSaving(false);
    }
  }, [isStarted, answers]);

  const progress = questions.length > 0 ? ((currentQuestionIndex + 1) / questions.length) * 100 : 0;
  const { answered: answeredQuestions } = getQuestionProgress();

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="animate-pulse">
          <Card>
            <CardContent className="p-6">
              <div className="h-8 bg-gray-300 rounded w-1/3 mb-4"></div>
              <div className="h-4 bg-gray-200 rounded w-1/4 mb-6"></div>
              <div className="grid grid-cols-2 gap-4 mb-6">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="h-20 bg-gray-200 rounded"></div>
                ))}
              </div>
              <div className="h-32 bg-gray-200 rounded"></div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-2xl mx-auto text-center py-8">
        <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
        <h2 className="text-xl font-semibold text-gray-900 mb-2">{t("quiz.loadError")}</h2>
        <p className="text-gray-600 mb-4">{t("quiz.loadErrorDesc")}</p>
        <Button onClick={() => navigate('/student/quizzes')} variant="outline">
          {t("quiz.backToQuizzes")}
        </Button>
      </div>
    );
  }

  if (!quiz) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">{t("quiz.notFound")}</p>
        <Button onClick={() => navigate('/student/quizzes')} className="mt-4">
          {t("quiz.backToQuizzes")}
        </Button>
      </div>
    );
  }

  if (!isStarted) {
    return (
      <div className="max-w-3xl mx-auto space-y-6" dir={dir}>
        <Card>
          <CardHeader className="text-center">
            <CardTitle className="text-3xl">{quiz.title}</CardTitle>
            <div className="flex items-center justify-center gap-2 text-gray-600">
              <BookOpen className="h-4 w-4" />
              <span>{quiz.program?.title}</span>
            </div>
            {quiz.proficiency_level && (
              <Badge variant="outline" className="w-fit mx-auto">
                {t("quiz.level")}: {quiz.proficiency_level}
              </Badge>
            )}
          </CardHeader>
          <CardContent className="space-y-6">
            {quiz.description && (
              <div className="text-center">
                <p className="text-gray-700 text-lg">{quiz.description}</p>
              </div>
            )}

            <Separator />

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-4 bg-blue-50 rounded-lg border border-blue-200">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <Target className="h-5 w-5 text-blue-600" />
                </div>
                <p className="text-2xl font-bold text-blue-600">{quiz.total_questions}</p>
                <p className="text-sm text-gray-600">{t("quiz.questions")}</p>
              </div>
              
              <div className="text-center p-4 bg-green-50 rounded-lg border border-green-200">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                </div>
                <p className="text-2xl font-bold text-green-600">{quiz.passing_score}%</p>
                <p className="text-sm text-gray-600">{t("quiz.passingGrade")}</p>
              </div>
              
              {quiz.time_limit_minutes && (
                <div className="text-center p-4 bg-orange-50 rounded-lg border border-orange-200">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <Timer className="h-5 w-5 text-orange-600" />
                  </div>
                  <p className="text-2xl font-bold text-orange-600">{quiz.time_limit_minutes}</p>
                  <p className="text-sm text-gray-600">{t("quiz.minutes")}</p>
                </div>
              )}
              
              <div className="text-center p-4 bg-purple-50 rounded-lg border border-purple-200">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <Users className="h-5 w-5 text-purple-600" />
                </div>
                <p className="text-2xl font-bold text-purple-600">{quiz.max_attempts}</p>
                <p className="text-sm text-gray-600">{t("quiz.attempts")}</p>
              </div>
            </div>

            <Separator />

            {/* Question Types Preview */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="font-medium text-gray-800 mb-3">{t("quiz.questionTypes")}</h4>
              <div className="flex flex-wrap gap-2">
                {Array.from(new Set(questions.map(q => q.type))).map(type => (
                  <Badge key={type} variant="secondary" className="flex items-center gap-1">
                    <QuestionTypeIcon type={type} />
                    {t(`quiz.type.${type}`)}
                  </Badge>
                ))}
              </div>
            </div>

            {/* Correction Mode Info */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <Lightbulb className="h-5 w-5 text-blue-600 mt-0.5" />
                <div>
                  <h4 className="font-medium text-blue-800">{t("quiz.correctionMode")}</h4>
                  <p className="text-sm text-blue-700 mt-1">
                    {quiz.correction_mode === 'immediate' && t("quiz.correctionImmediate")}
                    {quiz.correction_mode === 'end_of_quiz' && t("quiz.correctionEndOfQuiz")}
                    {quiz.correction_mode === 'manual' && t("quiz.correctionManual")}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5" />
                <div>
                  <h4 className="font-medium text-yellow-800">{t("quiz.importantInstructions")}</h4>
                  <ul className="mt-2 text-sm text-yellow-700 space-y-1">
                    <li>• {t("quiz.instruction1")}</li>
                    <li>• {t("quiz.instruction2")}</li>
                    {quiz.time_limit_minutes && (
                      <li>• {t("quiz.instruction3").replace('{minutes}', quiz.time_limit_minutes.toString())}</li>
                    )}
                    <li>• {t("quiz.instruction4")}</li>
                    <li>• {t("quiz.instruction5")}</li>
                    <li>• {t("quiz.keyboardShortcuts")}</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="flex gap-4">
              <Button
                variant="outline"
                onClick={() => navigate('/student/quizzes')}
                className="flex-1"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                {t("button.cancel")}
              </Button>
              <Button
                onClick={() => startQuizMutation.mutate()}
                disabled={startQuizMutation.isPending}
                className="flex-1 bg-academy-green hover:bg-academy-green/90"
              >
                {startQuizMutation.isPending ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    {t("quiz.starting")}
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4 mr-2" />
                    {t("quiz.startQuizButton")}
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Show results/corrections if quiz is submitted
  if (submissionResult && showCorrections) {
    return (
      <QuizResults
        quiz={quiz}
        result={submissionResult}
        answers={answers}
        corrections={corrections}
        onBackToQuizzes={() => navigate('/student/quizzes')}
        onRetakeQuiz={quiz.max_attempts > 1 ? () => {
          // Reset quiz state for retake
          setIsStarted(false);
          setCurrentQuestionIndex(0);
          setAnswers({});
          setTimeLeft(null);
          setSubmission(null);
          setSubmissionResult(null);
          setShowCorrections(false);
          setCorrections([]);
          setStartTime(null);
        } : undefined}
        onDownloadResults={() => {
          // Implement download functionality
          console.log('Download results');
        }}
        onShareResults={() => {
          // Implement share functionality
          console.log('Share results');
        }}
      />
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6" dir={dir}>
      {/* Enhanced Header with Timer */}
      <Card>
        <CardContent className="p-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-xl font-bold flex items-center gap-2">
                {quiz.title}
                <Badge variant="outline">{quiz.proficiency_level}</Badge>
              </h1>
              <p className="text-sm text-gray-600">
                {t("quiz.question")} {currentQuestionIndex + 1} {t("quiz.of")} {questions.length}
              </p>
            </div>
            <div className="flex items-center gap-4">
              {timeLeft !== null && (
                <CompactTimer 
                  timeLeft={timeLeft}
                  totalTime={quiz.time_limit_minutes! * 60}
                  isActive={true}
                />
              )}
              <Badge variant="outline" className="flex items-center gap-1">
                <CheckCircle2 className="h-3 w-3" />
                {answeredQuestions} / {questions.length} {t("quiz.answered")}
              </Badge>
            </div>
          </div>
          
          {/* Progress bar */}
          <div className="mt-4 space-y-2">
            <Progress value={progress} className="h-2" />
            <div className="flex justify-between items-center text-xs text-gray-500">
              <span>{t("quiz.progress")}: {Math.round(progress)}%</span>
              {autoSaveEnabled && (
                <div className="flex items-center gap-1">
                  {isSaving ? (
                    <>
                      <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-blue-600"></div>
                      <span>{t("quiz.saving")}</span>
                    </>
                  ) : lastSaved ? (
                    <>
                      <Save className="h-3 w-3 text-green-600" />
                      <span>{t("quiz.savedAt")} {lastSaved.toLocaleTimeString()}</span>
                    </>
                  ) : (
                    <>
                      <Zap className="h-3 w-3" />
                      <span>{t("quiz.autoSaveEnabled")}</span>
                    </>
                  )}
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Enhanced Question Display */}
      {currentQuestion && (
        <Card className="overflow-hidden">
          <CardHeader>
            <div className="flex justify-between items-start">
              <div className="flex items-center gap-3">
                <CardTitle className="text-lg">
                  {t("quiz.question")} {currentQuestionIndex + 1}
                </CardTitle>
                <div className="flex items-center gap-2">
                  <QuestionTypeIcon type={currentQuestion.type} />
                  <Badge variant="outline">{t(`quiz.type.${currentQuestion.type}`)}</Badge>
                </div>
              </div>
              <Badge variant="secondary" className="flex items-center gap-1">
                <Target className="h-3 w-3" />
                {currentQuestion.points} {t("quiz.points")}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="text-lg leading-relaxed text-gray-800">
              {currentQuestion.question}
            </div>

            {/* Multiple Choice Questions */}
            {currentQuestion.type === 'multiple_choice' && currentQuestion.options && (
              <RadioGroup
                value={answers[currentQuestion.id]?.selected_option_id || ''}
                onValueChange={(value) => handleMultipleChoiceAnswer(currentQuestion.id, value)}
                className="space-y-3"
              >
                {currentQuestion.options.map((option, index) => (
                  <div key={option.id} className="flex items-center space-x-3 p-3 rounded-lg border hover:bg-gray-50 transition-colors">
                    <RadioGroupItem value={option.id} id={option.id} />
                    <Label 
                      htmlFor={option.id} 
                      className="flex-1 cursor-pointer text-base"
                    >
                      <span className="font-medium text-gray-700 mr-2">
                        {String.fromCharCode(65 + index)}.
                      </span>
                      {option.option_text}
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            )}

            {/* True/False Questions */}
            {currentQuestion.type === 'true_false' && currentQuestion.options && (
              <RadioGroup
                value={answers[currentQuestion.id]?.selected_option_id || ''}
                onValueChange={(value) => handleMultipleChoiceAnswer(currentQuestion.id, value)}
                className="space-y-3"
              >
                {currentQuestion.options.map((option) => (
                  <div key={option.id} className="flex items-center space-x-3 p-4 rounded-lg border hover:bg-gray-50 transition-colors">
                    <RadioGroupItem value={option.id} id={option.id} />
                    <Label 
                      htmlFor={option.id} 
                      className="flex-1 cursor-pointer text-lg font-medium"
                    >
                      {option.option_text}
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            )}

            {/* Fill in the Blank Questions */}
            {currentQuestion.type === 'fill_blank' && (
              <FillBlankQuestion question={currentQuestion} />
            )}

            {/* Short Answer Questions */}
            {currentQuestion.type === 'short_answer' && (
              <div className="space-y-4">
                <Textarea
                  value={answers[currentQuestion.id]?.answer_text || ''}
                  onChange={(e) => handleTextAnswer(currentQuestion.id, e.target.value)}
                  placeholder={t("quiz.writeYourAnswer")}
                  className="min-h-[120px] text-base"
                  maxLength={500}
                />
                <div className="flex justify-between text-sm text-gray-500">
                  <span>{t("quiz.shortAnswerHint")}</span>
                  <span>
                    {(answers[currentQuestion.id]?.answer_text || '').length}/500
                  </span>
                </div>
              </div>
            )}

            {/* Essay Questions */}
            {currentQuestion.type === 'essay' && (
              <div className="space-y-4">
                <Textarea
                  value={answers[currentQuestion.id]?.answer_text || ''}
                  onChange={(e) => handleTextAnswer(currentQuestion.id, e.target.value)}
                  placeholder={t("quiz.writeYourEssay")}
                  className="min-h-[200px] text-base"
                  maxLength={2000}
                />
                <div className="flex justify-between text-sm text-gray-500">
                  <span>{t("quiz.essayHint")}</span>
                  <span>
                    {(answers[currentQuestion.id]?.answer_text || '').length}/2000
                  </span>
                </div>
              </div>
            )}

            {/* Question explanation (if available) */}
            {currentQuestion.explanation && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <Lightbulb className="h-5 w-5 text-blue-600 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-blue-800">{t("quiz.hint")}</h4>
                    <p className="text-sm text-blue-700 mt-1">{currentQuestion.explanation}</p>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Enhanced Question Navigator */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-wrap gap-2 mb-4">
            {questions.map((question, index) => (
              <Button
                key={question.id}
                variant={currentQuestionIndex === index ? "default" : "outline"}
                size="sm"
                onClick={() => setCurrentQuestionIndex(index)}
                className={`w-10 h-10 p-0 ${
                  isQuestionAnswered(question.id) 
                    ? 'bg-green-50 border-green-300 text-green-700 hover:bg-green-100' 
                    : currentQuestionIndex === index 
                      ? 'bg-blue-600 text-white' 
                      : 'hover:bg-gray-50'
                }`}
              >
                {index + 1}
                {isQuestionAnswered(question.id) && (
                  <CheckCircle2 className="h-3 w-3 absolute -top-1 -right-1 text-green-600" />
                )}
              </Button>
            ))}
          </div>

          {/* Navigation Controls */}
          <div className="flex justify-between items-center">
            <Button
              variant="outline"
              onClick={() => setCurrentQuestionIndex(prev => Math.max(0, prev - 1))}
              disabled={currentQuestionIndex === 0}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              {t("quiz.previousQuestion")}
            </Button>

            <div className="flex items-center gap-4">
              {/* Keyboard shortcuts hint */}
              <div className="hidden md:flex items-center gap-2 text-xs text-gray-500">
                <kbd className="px-2 py-1 bg-gray-100 rounded text-xs">Ctrl</kbd>
                <span>+</span>
                <kbd className="px-2 py-1 bg-gray-100 rounded text-xs">←</kbd>
                <span>/</span>
                <kbd className="px-2 py-1 bg-gray-100 rounded text-xs">→</kbd>
                <span>{t("quiz.navigate")}</span>
              </div>

              {currentQuestionIndex === questions.length - 1 ? (
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button 
                      className="bg-academy-green hover:bg-academy-green/90 flex items-center gap-2"
                      disabled={submitQuizMutation.isPending}
                    >
                      <Send className="h-4 w-4" />
                      {t("quiz.submitQuiz")}
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>{t("quiz.confirmSubmission")}</AlertDialogTitle>
                      <AlertDialogDescription className="space-y-3">
                        <p>{t("quiz.submissionWarning")}</p>
                        <div className="bg-gray-50 p-3 rounded-lg">
                          <div className="flex justify-between text-sm">
                            <span>{t("quiz.questionsAnswered")}:</span>
                            <span className="font-medium">{answeredQuestions} / {questions.length}</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span>{t("quiz.questionsRemaining")}:</span>
                            <span className="font-medium text-orange-600">
                              {questions.length - answeredQuestions}
                            </span>
                          </div>
                          {timeLeft !== null && (
                            <div className="flex justify-between text-sm">
                              <span>{t("quiz.timeRemaining")}:</span>
                              <span className="font-medium">{formatTime(timeLeft)}</span>
                            </div>
                          )}
                        </div>
                        {answeredQuestions < questions.length && (
                          <p className="text-orange-600 text-sm">
                            {t("quiz.unansweredWarning")}
                          </p>
                        )}
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>{t("button.cancel")}</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={handleSubmit}
                        disabled={submitQuizMutation.isPending}
                        className="bg-academy-green hover:bg-academy-green/90"
                      >
                        {submitQuizMutation.isPending ? (
                          <>
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                            {t("quiz.submitting")}
                          </>
                        ) : (
                          <>
                            <Send className="h-4 w-4 mr-2" />
                            {t("quiz.submitQuiz")}
                          </>
                        )}
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              ) : (
                <Button
                  onClick={() => setCurrentQuestionIndex(prev => Math.min(questions.length - 1, prev + 1))}
                  className="flex items-center gap-2"
                >
                  {t("quiz.nextQuestion")}
                  <ArrowRight className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Progress Summary */}
      <Card className="bg-gray-50">
        <CardContent className="p-4">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-4">
              <span className="text-gray-600">
                {t("quiz.progress")}: {Math.round(progress)}%
              </span>
              <span className="text-gray-600">
                {t("quiz.answered")}: {answeredQuestions}/{questions.length}
              </span>
            </div>
            {timeLeft !== null && (
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-gray-500" />
                <span className="text-gray-600">
                  {t("quiz.timeLeft")}: {formatTime(timeLeft)}
                </span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>ected_option_id || ""}
                onValueChange={(value) => handleMultipleChoiceAnswer(currentQuestion.id, value)}
                className="space-y-3"
              >
                {currentQuestion.options.map((option, index) => (
                  <div key={option.id} className="flex items-start space-x-3 p-3 rounded-lg border border-gray-200 hover:border-blue-300 transition-colors">
                    <RadioGroupItem value={option.id} id={option.id} className="mt-1" />
                    <Label htmlFor={option.id} className="flex-1 cursor-pointer">
                      <div className="flex items-start gap-2">
                        <span className="font-medium text-blue-600 min-w-[24px]">
                          {String.fromCharCode(65 + index)}.
                        </span>
                        <span className="text-gray-800">{option.option_text}</span>
                      </div>
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            )}

            {/* True/False Questions */}
            {currentQuestion.type === 'true_false' && currentQuestion.options && (
              <RadioGroup
                value={answers[currentQuestion.id]?.selected_option_id || ""}
                onValueChange={(value) => handleMultipleChoiceAnswer(currentQuestion.id, value)}
                className="space-y-3"
              >
                {currentQuestion.options.map((option) => (
                  <div key={option.id} className="flex items-center space-x-3 p-4 rounded-lg border border-gray-200 hover:border-blue-300 transition-colors">
                    <RadioGroupItem value={option.id} id={option.id} />
                    <Label htmlFor={option.id} className="flex-1 cursor-pointer font-medium">
                      {option.option_text}
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            )}

            {/* Fill in the Blank Questions */}
            {currentQuestion.type === 'fill_blank' && (
              <FillBlankQuestion question={currentQuestion} />
            )}

            {/* Short Answer Questions */}
            {currentQuestion.type === 'short_answer' && (
              <div className="space-y-3">
                <Label htmlFor="short-answer" className="text-sm font-medium text-gray-700">
                  {t("quiz.shortAnswerInstruction")}
                </Label>
                <Textarea
                  id="short-answer"
                  value={answers[currentQuestion.id]?.answer_text || ""}
                  onChange={(e) => handleTextAnswer(currentQuestion.id, e.target.value)}
                  placeholder={t("quiz.writeAnswerHere")}
                  className="min-h-[100px] resize-none"
                  maxLength={500}
                />
                <div className="text-xs text-gray-500 text-right">
                  {(answers[currentQuestion.id]?.answer_text || "").length}/500 {t("quiz.characters")}
                </div>
              </div>
            )}

            {/* Essay Questions */}
            {currentQuestion.type === 'essay' && (
              <div className="space-y-3">
                <Label htmlFor="essay-answer" className="text-sm font-medium text-gray-700">
                  {t("quiz.essayInstruction")}
                </Label>
                <Textarea
                  id="essay-answer"
                  value={answers[currentQuestion.id]?.answer_text || ""}
                  onChange={(e) => handleTextAnswer(currentQuestion.id, e.target.value)}
                  placeholder={t("quiz.writeEssayHere")}
                  className="min-h-[200px] resize-y"
                  maxLength={2000}
                />
                <div className="text-xs text-gray-500 text-right">
                  {(answers[currentQuestion.id]?.answer_text || "").length}/2000 {t("quiz.characters")}
                </div>
              </div>
            )}

            {/* Answer Status Indicator */}
            <div className="flex items-center gap-2 pt-2 border-t border-gray-100">
              {isQuestionAnswered(currentQuestion.id) ? (
                <>
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                  <span className="text-sm text-green-600 font-medium">{t("quiz.answered")}</span>
                </>
              ) : (
                <>
                  <AlertCircle className="h-4 w-4 text-orange-600" />
                  <span className="text-sm text-orange-600">{t("quiz.notAnswered")}</span>
                </>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Question Progress Navigator */}
      <QuestionProgress
        currentIndex={currentQuestionIndex}
        totalQuestions={questions.length}
        answeredQuestions={answeredQuestions}
        onQuestionSelect={setCurrentQuestionIndex}
        isQuestionAnswered={(index) => isQuestionAnswered(questions[index]?.id)}
      />

      {/* Enhanced Navigation */}
      <Card>
        <CardContent className="p-4">
          <div className="flex justify-between items-center">
            <Button
              variant="outline"
              onClick={() => setCurrentQuestionIndex(prev => Math.max(0, prev - 1))}
              disabled={currentQuestionIndex === 0}
              className="flex items-center gap-2"
            >
              {dir === 'rtl' ? (
                <>
                  <ArrowRight className="h-4 w-4" />
                  {t("quiz.previousQuestion")}
                </>
              ) : (
                <>
                  <ArrowLeft className="h-4 w-4" />
                  {t("quiz.previousQuestion")}
                </>
              )}
            </Button>

            {/* Submit or Next Button */}
            {currentQuestionIndex === questions.length - 1 ? (
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button 
                    className="bg-academy-green hover:bg-academy-green/90 flex items-center gap-2"
                    disabled={submitQuizMutation.isPending}
                  >
                    {submitQuizMutation.isPending ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        {t("quiz.submitting")}
                      </>
                    ) : (
                      <>
                        <Send className="h-4 w-4" />
                        {t("quiz.submitQuiz")}
                      </>
                    )}
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle className="flex items-center gap-2">
                      <Send className="h-5 w-5" />
                      {t("quiz.confirmSubmission")}
                    </AlertDialogTitle>
                    <AlertDialogDescription className="space-y-3">
                      <p>
                        {t("quiz.submissionConfirmation")
                          .replace('{answered}', answeredQuestions.toString())
                          .replace('{total}', questions.length.toString())}
                      </p>
                      
                      {answeredQuestions < questions.length && (
                        <div className="bg-orange-50 border border-orange-200 rounded-lg p-3">
                          <div className="flex items-center gap-2">
                            <AlertTriangle className="h-4 w-4 text-orange-600" />
                            <span className="text-sm text-orange-700 font-medium">
                              {t("quiz.unansweredWarning")}
                            </span>
                          </div>
                          <p className="text-sm text-orange-600 mt-1">
                            {questions.length - answeredQuestions} {t("quiz.questionsRemaining")}
                          </p>
                        </div>
                      )}

                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                        <div className="flex items-center gap-2">
                          <Lightbulb className="h-4 w-4 text-blue-600" />
                          <span className="text-sm text-blue-700 font-medium">
                            {quiz.correction_mode === 'immediate' && t("quiz.immediateCorrectionsNote")}
                            {quiz.correction_mode === 'end_of_quiz' && t("quiz.endOfQuizCorrectionsNote")}
                            {quiz.correction_mode === 'manual' && t("quiz.manualCorrectionsNote")}
                          </span>
                        </div>
                      </div>
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel className="flex items-center gap-2">
                      <ArrowLeft className="h-4 w-4" />
                      {t("quiz.reviewAnswers")}
                    </AlertDialogCancel>
                    <AlertDialogAction
                      onClick={handleSubmit}
                      className="bg-academy-green hover:bg-academy-green/90 flex items-center gap-2"
                    >
                      <Send className="h-4 w-4" />
                      {t("quiz.submitQuiz")}
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            ) : (
              <Button
                onClick={() => setCurrentQuestionIndex(prev => Math.min(questions.length - 1, prev + 1))}
                disabled={currentQuestionIndex === questions.length - 1}
                className="flex items-center gap-2"
              >
                {dir === 'rtl' ? (
                  <>
                    {t("quiz.nextQuestion")}
                    <ArrowLeft className="h-4 w-4" />
                  </>
                ) : (
                  <>
                    {t("quiz.nextQuestion")}
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </Button>
            )}
          </div>

          {/* Keyboard Shortcuts Help */}
          <div className="mt-3 pt-3 border-t border-gray-100">
            <div className="flex items-center justify-center gap-4 text-xs text-gray-500">
              <span className="flex items-center gap-1">
                <kbd className="px-1.5 py-0.5 bg-gray-100 rounded text-xs">Ctrl</kbd>
                <kbd className="px-1.5 py-0.5 bg-gray-100 rounded text-xs">←</kbd>
                {t("quiz.previousShortcut")}
              </span>
              <span className="flex items-center gap-1">
                <kbd className="px-1.5 py-0.5 bg-gray-100 rounded text-xs">Ctrl</kbd>
                <kbd className="px-1.5 py-0.5 bg-gray-100 rounded text-xs">→</kbd>
                {t("quiz.nextShortcut")}
              </span>
              <span className="flex items-center gap-1">
                <kbd className="px-1.5 py-0.5 bg-gray-100 rounded text-xs">Ctrl</kbd>
                <kbd className="px-1.5 py-0.5 bg-gray-100 rounded text-xs">Enter</kbd>
                {t("quiz.submitShortcut")}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default TakeQuiz;