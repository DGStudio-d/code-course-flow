import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  CheckCircle2, 
  XCircle, 
  AlertCircle, 
  Trophy, 
  Target, 
  Clock, 
  TrendingUp,
  BookOpen,
  Lightbulb,
  BarChart3,
  Award,
  RefreshCw,
  Home,
  Download,
  Share2
} from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { 
  MultipleChoiceQuestion,
  TrueFalseQuestion,
  FillBlankQuestion,
  ShortAnswerQuestion,
  EssayQuestion,
  QuestionTypeIcon
} from './QuestionComponents';

// Enhanced interfaces
interface QuizQuestion {
  id: string;
  type: 'multiple_choice' | 'true_false' | 'fill_blank' | 'short_answer' | 'essay';
  question: string;
  points: number;
  options?: Array<{
    id: string;
    option_text: string;
    is_correct: boolean;
  }>;
  explanation?: string;
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
  points_earned: number;
  max_points: number;
}

interface SubmissionResult {
  id: string;
  total_score: number;
  max_possible_score: number;
  percentage: number;
  is_passed: boolean;
  time_taken_minutes?: number;
  grade_letter: string;
  performance_summary: {
    total_questions: number;
    correct_answers: number;
    incorrect_answers: number;
    partial_credit_answers: number;
    accuracy_rate: number;
  };
  time_efficiency?: {
    rating: string;
    percentage_used: number;
    feedback: string;
  };
}

interface QuizResultsProps {
  quiz: {
    id: string;
    title: string;
    proficiency_level: string;
    passing_score: number;
    time_limit_minutes?: number;
    correction_mode: string;
    questions: QuizQuestion[];
  };
  result: SubmissionResult;
  answers: Record<string, SubmissionAnswer>;
  corrections?: QuizCorrection[];
  onRetakeQuiz?: () => void;
  onBackToQuizzes: () => void;
  onDownloadResults?: () => void;
  onShareResults?: () => void;
}

export const QuizResults: React.FC<QuizResultsProps> = ({
  quiz,
  result,
  answers,
  corrections = [],
  onRetakeQuiz,
  onBackToQuizzes,
  onDownloadResults,
  onShareResults
}) => {
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState('overview');

  const getGradeColor = (grade: string) => {
    if (grade.startsWith('A')) return 'text-green-600 bg-green-100';
    if (grade.startsWith('B')) return 'text-blue-600 bg-blue-100';
    if (grade.startsWith('C')) return 'text-yellow-600 bg-yellow-100';
    if (grade.startsWith('D')) return 'text-orange-600 bg-orange-100';
    return 'text-red-600 bg-red-100';
  };

  const getPerformanceLevel = (percentage: number) => {
    if (percentage >= 90) return { level: 'excellent', color: 'text-green-600', icon: Trophy };
    if (percentage >= 80) return { level: 'good', color: 'text-blue-600', icon: Target };
    if (percentage >= 70) return { level: 'satisfactory', color: 'text-yellow-600', icon: CheckCircle2 };
    if (percentage >= 60) return { level: 'needsImprovement', color: 'text-orange-600', icon: AlertCircle };
    return { level: 'requiresAttention', color: 'text-red-600', icon: XCircle };
  };

  const performance = getPerformanceLevel(result.percentage);
  const PerformanceIcon = performance.icon;

  const getQuestionTypeStats = () => {
    const stats: Record<string, { total: number; correct: number; partial: number }> = {};
    
    quiz.questions.forEach(question => {
      const correction = corrections.find(c => c.question_id === question.id);
      if (!stats[question.type]) {
        stats[question.type] = { total: 0, correct: 0, partial: 0 };
      }
      
      stats[question.type].total++;
      
      if (correction) {
        if (correction.is_correct) {
          stats[question.type].correct++;
        } else if (correction.points_earned > 0) {
          stats[question.type].partial++;
        }
      }
    });
    
    return stats;
  };

  const questionTypeStats = getQuestionTypeStats();

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header with Results Summary */}
      <Card className="overflow-hidden">
        <CardHeader className="text-center bg-gradient-to-r from-blue-50 to-purple-50">
          <div className="flex items-center justify-center gap-3 mb-4">
            <PerformanceIcon className={`h-8 w-8 ${performance.color}`} />
            <CardTitle className="text-3xl">
              {result.is_passed ? (
                <span className="text-green-600">{t('quiz.congratulations')}</span>
              ) : (
                <span className="text-orange-600">{t('quiz.keepTrying')}</span>
              )}
            </CardTitle>
          </div>
          
          <div className="flex items-center justify-center gap-2 mb-4">
            <h2 className="text-xl text-gray-700">{quiz.title}</h2>
            <Badge variant="outline">{quiz.proficiency_level}</Badge>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
            <div className="text-center">
              <div className={`text-4xl font-bold ${getGradeColor(result.grade_letter)} rounded-lg p-3 inline-block`}>
                {result.grade_letter}
              </div>
              <p className="text-sm text-gray-600 mt-2">{t('quiz.grade')}</p>
            </div>
            
            <div className="text-center">
              <div className="text-4xl font-bold text-blue-600">
                {result.percentage.toFixed(1)}%
              </div>
              <p className="text-sm text-gray-600">{t('quiz.score')}</p>
            </div>
            
            <div className="text-center">
              <div className="text-4xl font-bold text-purple-600">
                {result.total_score}/{result.max_possible_score}
              </div>
              <p className="text-sm text-gray-600">{t('quiz.points')}</p>
            </div>
            
            {result.time_taken_minutes && (
              <div className="text-center">
                <div className="text-4xl font-bold text-orange-600">
                  {result.time_taken_minutes}m
                </div>
                <p className="text-sm text-gray-600">{t('quiz.timeTaken')}</p>
              </div>
            )}
          </div>

          {/* Pass/Fail Status */}
          <div className="mt-6">
            <Badge 
              variant={result.is_passed ? 'default' : 'destructive'}
              className="text-lg px-4 py-2"
            >
              {result.is_passed ? (
                <>
                  <CheckCircle2 className="h-5 w-5 mr-2" />
                  {t('quiz.passed')} ({quiz.passing_score}% {t('quiz.required')})
                </>
              ) : (
                <>
                  <XCircle className="h-5 w-5 mr-2" />
                  {t('quiz.failed')} ({quiz.passing_score}% {t('quiz.required')})
                </>
              )}
            </Badge>
          </div>
        </CardHeader>
      </Card>

      {/* Detailed Results Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            {t('quiz.overview')}
          </TabsTrigger>
          <TabsTrigger value="questions" className="flex items-center gap-2">
            <BookOpen className="h-4 w-4" />
            {t('quiz.questions')}
          </TabsTrigger>
          <TabsTrigger value="analysis" className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            {t('quiz.analysis')}
          </TabsTrigger>
          <TabsTrigger value="recommendations" className="flex items-center gap-2">
            <Lightbulb className="h-4 w-4" />
            {t('quiz.recommendations')}
          </TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Performance Summary */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5" />
                  {t('quiz.performanceSummary')}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span>{t('quiz.totalQuestions')}</span>
                    <Badge variant="outline">{result.performance_summary.total_questions}</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-green-600">{t('quiz.correctAnswers')}</span>
                    <Badge className="bg-green-100 text-green-800">{result.performance_summary.correct_answers}</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-red-600">{t('quiz.incorrectAnswers')}</span>
                    <Badge className="bg-red-100 text-red-800">{result.performance_summary.incorrect_answers}</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-yellow-600">{t('quiz.partialCredit')}</span>
                    <Badge className="bg-yellow-100 text-yellow-800">{result.performance_summary.partial_credit_answers}</Badge>
                  </div>
                </div>
                
                <div className="pt-4 border-t">
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-medium">{t('quiz.accuracyRate')}</span>
                    <span className="font-bold text-blue-600">{result.performance_summary.accuracy_rate}%</span>
                  </div>
                  <Progress value={result.performance_summary.accuracy_rate} className="h-2" />
                </div>
              </CardContent>
            </Card>

            {/* Time Analysis */}
            {result.time_efficiency && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Clock className="h-5 w-5" />
                    {t('quiz.timeAnalysis')}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600 mb-2">
                      {result.time_efficiency.rating}
                    </div>
                    <p className="text-sm text-gray-600">{result.time_efficiency.feedback}</p>
                  </div>
                  
                  {result.time_efficiency.percentage_used && (
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <span>{t('quiz.timeUsed')}</span>
                        <span className="font-medium">{result.time_efficiency.percentage_used}%</span>
                      </div>
                      <Progress value={result.time_efficiency.percentage_used} className="h-2" />
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </div>

          {/* Question Type Breakdown */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="h-5 w-5" />
                {t('quiz.questionTypeBreakdown')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {Object.entries(questionTypeStats).map(([type, stats]) => {
                  const accuracy = stats.total > 0 ? (stats.correct / stats.total) * 100 : 0;
                  
                  return (
                    <div key={type} className="p-4 border rounded-lg">
                      <div className="flex items-center gap-2 mb-3">
                        <QuestionTypeIcon type={type} />
                        <span className="font-medium">{t(`quiz.type.${type}`)}</span>
                      </div>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span>{t('quiz.total')}</span>
                          <span>{stats.total}</span>
                        </div>
                        <div className="flex justify-between text-green-600">
                          <span>{t('quiz.correct')}</span>
                          <span>{stats.correct}</span>
                        </div>
                        {stats.partial > 0 && (
                          <div className="flex justify-between text-yellow-600">
                            <span>{t('quiz.partial')}</span>
                            <span>{stats.partial}</span>
                          </div>
                        )}
                        <div className="pt-2 border-t">
                          <div className="flex justify-between font-medium">
                            <span>{t('quiz.accuracy')}</span>
                            <span>{accuracy.toFixed(1)}%</span>
                          </div>
                          <Progress value={accuracy} className="h-1 mt-1" />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Questions Tab */}
        <TabsContent value="questions" className="space-y-4">
          {quiz.questions.map((question, index) => {
            const correction = corrections.find(c => c.question_id === question.id);
            const userAnswer = answers[question.id];
            
            return (
              <Card key={question.id} className="overflow-hidden">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <span className="font-medium text-lg">{t('quiz.question')} {index + 1}</span>
                      <QuestionTypeIcon type={question.type} />
                      <Badge variant="outline">{question.points} {t('quiz.points')}</Badge>
                    </div>
                    {correction && (
                      <div className="flex items-center gap-2">
                        <Badge variant={correction.is_correct ? 'default' : 'destructive'}>
                          {correction.is_correct ? t('quiz.correct') : t('quiz.incorrect')}
                        </Badge>
                        <span className="text-sm text-gray-600">
                          {correction.points_earned}/{correction.max_points} {t('quiz.points')}
                        </span>
                      </div>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-800 mb-4 text-lg leading-relaxed">{question.question}</p>
                  
                  {/* Render appropriate question component */}
                  {question.type === 'multiple_choice' && (
                    <MultipleChoiceQuestion
                      question={question}
                      answer={userAnswer}
                      onAnswerChange={() => {}} // Read-only
                      isReadOnly={true}
                      showCorrection={!!correction}
                      correction={correction}
                    />
                  )}
                  
                  {question.type === 'true_false' && (
                    <TrueFalseQuestion
                      question={question}
                      answer={userAnswer}
                      onAnswerChange={() => {}} // Read-only
                      isReadOnly={true}
                      showCorrection={!!correction}
                      correction={correction}
                    />
                  )}
                  
                  {question.type === 'fill_blank' && (
                    <FillBlankQuestion
                      question={question}
                      answer={userAnswer}
                      onAnswerChange={() => {}} // Read-only
                      isReadOnly={true}
                      showCorrection={!!correction}
                      correction={correction}
                    />
                  )}
                  
                  {question.type === 'short_answer' && (
                    <ShortAnswerQuestion
                      question={question}
                      answer={userAnswer}
                      onAnswerChange={() => {}} // Read-only
                      isReadOnly={true}
                      showCorrection={!!correction}
                      correction={correction}
                    />
                  )}
                  
                  {question.type === 'essay' && (
                    <EssayQuestion
                      question={question}
                      answer={userAnswer}
                      onAnswerChange={() => {}} // Read-only
                      isReadOnly={true}
                      showCorrection={!!correction}
                      correction={correction}
                    />
                  )}
                </CardContent>
              </Card>
            );
          })}
        </TabsContent>

        {/* Analysis Tab */}
        <TabsContent value="analysis" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                {t('quiz.performanceAnalysis')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {/* Strengths */}
                <div>
                  <h4 className="font-medium text-green-700 mb-3 flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4" />
                    {t('quiz.strengths')}
                  </h4>
                  <div className="space-y-2">
                    {Object.entries(questionTypeStats)
                      .filter(([_, stats]) => stats.total > 0 && (stats.correct / stats.total) >= 0.8)
                      .map(([type, stats]) => (
                        <div key={type} className="flex items-center gap-2 text-sm text-green-600">
                          <CheckCircle2 className="h-3 w-3" />
                          <span>{t(`quiz.strength.${type}`)}</span>
                          <Badge variant="outline" className="text-green-600 border-green-300">
                            {((stats.correct / stats.total) * 100).toFixed(0)}%
                          </Badge>
                        </div>
                      ))}
                  </div>
                </div>

                {/* Areas for Improvement */}
                <div>
                  <h4 className="font-medium text-orange-700 mb-3 flex items-center gap-2">
                    <AlertCircle className="h-4 w-4" />
                    {t('quiz.areasForImprovement')}
                  </h4>
                  <div className="space-y-2">
                    {Object.entries(questionTypeStats)
                      .filter(([_, stats]) => stats.total > 0 && (stats.correct / stats.total) < 0.7)
                      .map(([type, stats]) => (
                        <div key={type} className="flex items-center gap-2 text-sm text-orange-600">
                          <AlertCircle className="h-3 w-3" />
                          <span>{t(`quiz.improvement.${type}`)}</span>
                          <Badge variant="outline" className="text-orange-600 border-orange-300">
                            {((stats.correct / stats.total) * 100).toFixed(0)}%
                          </Badge>
                        </div>
                      ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Recommendations Tab */}
        <TabsContent value="recommendations" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lightbulb className="h-5 w-5" />
                {t('quiz.studyRecommendations')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* General recommendations based on performance */}
                {result.percentage < 70 && (
                  <div className="p-4 bg-orange-50 border border-orange-200 rounded-lg">
                    <h4 className="font-medium text-orange-800 mb-2">{t('quiz.generalRecommendations')}</h4>
                    <ul className="text-sm text-orange-700 space-y-1">
                      <li>• {t('quiz.recommendation.reviewBasics')}</li>
                      <li>• {t('quiz.recommendation.practiceMore')}</li>
                      <li>• {t('quiz.recommendation.seekHelp')}</li>
                    </ul>
                  </div>
                )}

                {/* Specific recommendations from corrections */}
                {corrections.filter(c => c.improvement_suggestion).length > 0 && (
                  <div className="space-y-3">
                    <h4 className="font-medium text-blue-800">{t('quiz.specificRecommendations')}</h4>
                    {corrections
                      .filter(c => c.improvement_suggestion)
                      .map((correction, index) => (
                        <div key={index} className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                          <p className="text-sm text-blue-700">{correction.improvement_suggestion}</p>
                        </div>
                      ))}
                  </div>
                )}

                {/* Next steps */}
                <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                  <h4 className="font-medium text-green-800 mb-2">{t('quiz.nextSteps')}</h4>
                  <ul className="text-sm text-green-700 space-y-1">
                    {result.is_passed ? (
                      <>
                        <li>• {t('quiz.nextStep.advance')}</li>
                        <li>• {t('quiz.nextStep.practice')}</li>
                        <li>• {t('quiz.nextStep.challenge')}</li>
                      </>
                    ) : (
                      <>
                        <li>• {t('quiz.nextStep.review')}</li>
                        <li>• {t('quiz.nextStep.retake')}</li>
                        <li>• {t('quiz.nextStep.study')}</li>
                      </>
                    )}
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Action Buttons */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-wrap gap-3 justify-center">
            <Button onClick={onBackToQuizzes} variant="outline" className="flex items-center gap-2">
              <Home className="h-4 w-4" />
              {t('quiz.backToQuizzes')}
            </Button>
            
            {onRetakeQuiz && (
              <Button onClick={onRetakeQuiz} className="flex items-center gap-2">
                <RefreshCw className="h-4 w-4" />
                {t('quiz.retakeQuiz')}
              </Button>
            )}
            
            {onDownloadResults && (
              <Button onClick={onDownloadResults} variant="outline" className="flex items-center gap-2">
                <Download className="h-4 w-4" />
                {t('quiz.downloadResults')}
              </Button>
            )}
            
            {onShareResults && (
              <Button onClick={onShareResults} variant="outline" className="flex items-center gap-2">
                <Share2 className="h-4 w-4" />
                {t('quiz.shareResults')}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};