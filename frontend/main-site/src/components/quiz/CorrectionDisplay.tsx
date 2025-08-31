import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  CheckCircle2, 
  XCircle, 
  AlertCircle, 
  Lightbulb,
  Target,
  TrendingUp,
  BookOpen,
  Eye,
  EyeOff,
  ChevronDown,
  ChevronUp,
  Award,
  Zap,
  Clock,
  MessageSquare
} from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

// Enhanced interfaces
interface QuizCorrection {
  question_id: string;
  is_correct: boolean;
  correct_answer: string;
  student_answer: string;
  explanation: string;
  improvement_suggestion: string;
  points_earned: number;
  max_points: number;
  difficulty_level?: 'easy' | 'medium' | 'hard';
  question_type: string;
  time_spent?: number;
  confidence_level?: number;
}i
nterface QuizQuestion {
  id: string;
  type: string;
  question: string;
  points: number;
  options?: Array<{
    id: string;
    option_text: string;
    is_correct: boolean;
  }>;
  explanation?: string;
}

interface CorrectionSummary {
  total_questions: number;
  correct_answers: number;
  incorrect_answers: number;
  partial_credit: number;
  total_points_earned: number;
  total_points_possible: number;
  accuracy_percentage: number;
  improvement_areas: string[];
  strengths: string[];
}

interface CorrectionDisplayProps {
  corrections: QuizCorrection[];
  questions: QuizQuestion[];
  summary: CorrectionSummary;
  showDetailedFeedback?: boolean;
  allowToggleVisibility?: boolean;
  onRequestHelp?: (questionId: string) => void;
}

export const CorrectionDisplay: React.FC<CorrectionDisplayProps> = ({
  corrections,
  questions,
  summary,
  showDetailedFeedback = true,
  allowToggleVisibility = true,
  onRequestHelp
}) => {
  const { t } = useLanguage();
  const [expandedQuestions, setExpandedQuestions] = useState<Set<string>>(new Set());
  const [showCorrectOnly, setShowCorrectOnly] = useState(false);
  const [showIncorrectOnly, setShowIncorrectOnly] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');

  const toggleQuestionExpansion = (questionId: string) => {
    const newExpanded = new Set(expandedQuestions);
    if (newExpanded.has(questionId)) {
      newExpanded.delete(questionId);
    } else {
      newExpanded.add(questionId);
    }
    setExpandedQuestions(newExpanded);
  };

  const getFilteredCorrections = () => {
    if (showCorrectOnly) {
      return corrections.filter(c => c.is_correct);
    }
    if (showIncorrectOnly) {
      return corrections.filter(c => !c.is_correct);
    }
    return corrections;
  };

  const getCorrectionStatusColor = (correction: QuizCorrection) => {
    if (correction.is_correct) return 'text-green-600 bg-green-50 border-green-200';
    if (correction.points_earned > 0) return 'text-yellow-600 bg-yellow-50 border-yellow-200';
    return 'text-red-600 bg-red-50 border-red-200';
  };

  const getCorrectionIcon = (correction: QuizCorrection) => {
    if (correction.is_correct) return <CheckCircle2 className="h-5 w-5 text-green-600" />;
    if (correction.points_earned > 0) return <AlertCircle className="h-5 w-5 text-yellow-600" />;
    return <XCircle className="h-5 w-5 text-red-600" />;
  };

  const getPerformanceLevel = (percentage: number) => {
    if (percentage >= 90) return { level: 'excellent', color: 'text-green-600', icon: Award };
    if (percentage >= 80) return { level: 'good', color: 'text-blue-600', icon: Target };
    if (percentage >= 70) return { level: 'satisfactory', color: 'text-yellow-600', icon: TrendingUp };
    return { level: 'needsImprovement', color: 'text-red-600', icon: AlertCircle };
  };

  const performance = getPerformanceLevel(summary.accuracy_percentage);
  const PerformanceIcon = performance.icon;

  return (
    <div className="space-y-6">
      {/* Correction Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <PerformanceIcon className={`h-5 w-5 ${performance.color}`} />
            {t('correction.summary')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="text-center p-4 bg-green-50 rounded-lg border border-green-200">
              <div className="text-2xl font-bold text-green-600">{summary.correct_answers}</div>
              <div className="text-sm text-gray-600">{t('correction.correct')}</div>
            </div>
            
            <div className="text-center p-4 bg-red-50 rounded-lg border border-red-200">
              <div className="text-2xl font-bold text-red-600">{summary.incorrect_answers}</div>
              <div className="text-sm text-gray-600">{t('correction.incorrect')}</div>
            </div>
            
            <div className="text-center p-4 bg-yellow-50 rounded-lg border border-yellow-200">
              <div className="text-2xl font-bold text-yellow-600">{summary.partial_credit}</div>
              <div className="text-sm text-gray-600">{t('correction.partial')}</div>
            </div>
            
            <div className="text-center p-4 bg-blue-50 rounded-lg border border-blue-200">
              <div className="text-2xl font-bold text-blue-600">
                {summary.total_points_earned}/{summary.total_points_possible}
              </div>
              <div className="text-sm text-gray-600">{t('correction.points')}</div>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="font-medium">{t('correction.accuracy')}</span>
                <span className={`font-bold ${performance.color}`}>
                  {summary.accuracy_percentage.toFixed(1)}%
                </span>
              </div>
              <Progress value={summary.accuracy_percentage} className="h-2" />
            </div>

            {summary.strengths.length > 0 && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <h4 className="font-medium text-green-800 mb-2 flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4" />
                  {t('correction.strengths')}
                </h4>
                <ul className="text-sm text-green-700 space-y-1">
                  {summary.strengths.map((strength, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <span className="text-green-600">•</span>
                      <span>{strength}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {summary.improvement_areas.length > 0 && (
              <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                <h4 className="font-medium text-orange-800 mb-2 flex items-center gap-2">
                  <TrendingUp className="h-4 w-4" />
                  {t('correction.improvementAreas')}
                </h4>
                <ul className="text-sm text-orange-700 space-y-1">
                  {summary.improvement_areas.map((area, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <span className="text-orange-600">•</span>
                      <span>{area}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Detailed Corrections */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5" />
              {t('correction.detailedReview')}
            </CardTitle>
            
            {allowToggleVisibility && (
              <div className="flex items-center gap-2">
                <Button
                  variant={showCorrectOnly ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => {
                    setShowCorrectOnly(!showCorrectOnly);
                    setShowIncorrectOnly(false);
                  }}
                  className="flex items-center gap-1"
                >
                  <CheckCircle2 className="h-3 w-3" />
                  {t('correction.correctOnly')}
                </Button>
                
                <Button
                  variant={showIncorrectOnly ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => {
                    setShowIncorrectOnly(!showIncorrectOnly);
                    setShowCorrectOnly(false);
                  }}
                  className="flex items-center gap-1"
                >
                  <XCircle className="h-3 w-3" />
                  {t('correction.incorrectOnly')}
                </Button>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setShowCorrectOnly(false);
                    setShowIncorrectOnly(false);
                  }}
                >
                  {t('correction.showAll')}
                </Button>
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {getFilteredCorrections().map((correction, index) => {
              const question = questions.find(q => q.id === correction.question_id);
              if (!question) return null;

              const isExpanded = expandedQuestions.has(correction.question_id);
              const questionNumber = corrections.findIndex(c => c.question_id === correction.question_id) + 1;

              return (
                <Card key={correction.question_id} className={`border-l-4 ${getCorrectionStatusColor(correction)}`}>
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        {getCorrectionIcon(correction)}
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-medium">
                              {t('quiz.question')} {questionNumber}
                            </span>
                            <Badge variant="outline">{t(`quiz.type.${question.type}`)}</Badge>
                            {correction.difficulty_level && (
                              <Badge variant="secondary">
                                {t(`quiz.difficulty.${correction.difficulty_level}`)}
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm text-gray-600 mt-1">
                            {correction.points_earned}/{correction.max_points} {t('quiz.points')}
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        {correction.time_spent && (
                          <Badge variant="outline" className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {correction.time_spent}s
                          </Badge>
                        )}
                        
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => toggleQuestionExpansion(correction.question_id)}
                          className="flex items-center gap-1"
                        >
                          {isExpanded ? (
                            <>
                              <ChevronUp className="h-4 w-4" />
                              {t('correction.collapse')}
                            </>
                          ) : (
                            <>
                              <ChevronDown className="h-4 w-4" />
                              {t('correction.expand')}
                            </>
                          )}
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  
                  <CardContent>
                    <div className="space-y-4">
                      {/* Question Text */}
                      <div className="bg-gray-50 p-3 rounded-lg">
                        <p className="text-gray-800 font-medium">{question.question}</p>
                      </div>

                      {isExpanded && (
                        <>
                          {/* Student vs Correct Answer */}
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <h5 className="font-medium text-gray-700 flex items-center gap-2">
                                <MessageSquare className="h-4 w-4" />
                                {t('correction.yourAnswer')}
                              </h5>
                              <div className={`p-3 rounded-lg border ${
                                correction.is_correct 
                                  ? 'bg-green-50 border-green-200' 
                                  : 'bg-red-50 border-red-200'
                              }`}>
                                <p className="text-sm">
                                  {correction.student_answer || t('correction.noAnswer')}
                                </p>
                              </div>
                            </div>
                            
                            <div className="space-y-2">
                              <h5 className="font-medium text-gray-700 flex items-center gap-2">
                                <Target className="h-4 w-4" />
                                {t('correction.correctAnswer')}
                              </h5>
                              <div className="p-3 rounded-lg border bg-green-50 border-green-200">
                                <p className="text-sm text-green-800">
                                  {correction.correct_answer}
                                </p>
                              </div>
                            </div>
                          </div>

                          {/* Explanation */}
                          {correction.explanation && (
                            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                              <h5 className="font-medium text-blue-800 mb-2 flex items-center gap-2">
                                <BookOpen className="h-4 w-4" />
                                {t('correction.explanation')}
                              </h5>
                              <p className="text-sm text-blue-700">{correction.explanation}</p>
                            </div>
                          )}

                          {/* Improvement Suggestion */}
                          {correction.improvement_suggestion && (
                            <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                              <h5 className="font-medium text-purple-800 mb-2 flex items-center gap-2">
                                <Lightbulb className="h-4 w-4" />
                                {t('correction.improvementSuggestion')}
                              </h5>
                              <p className="text-sm text-purple-700">{correction.improvement_suggestion}</p>
                            </div>
                          )}

                          {/* Additional Actions */}
                          <div className="flex items-center gap-2 pt-2 border-t">
                            {onRequestHelp && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => onRequestHelp(correction.question_id)}
                                className="flex items-center gap-2"
                              >
                                <MessageSquare className="h-3 w-3" />
                                {t('correction.requestHelp')}
                              </Button>
                            )}
                            
                            <Button
                              variant="outline"
                              size="sm"
                              className="flex items-center gap-2"
                            >
                              <BookOpen className="h-3 w-3" />
                              {t('correction.studyMaterial')}
                            </Button>
                          </div>
                        </>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};