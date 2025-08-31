import React, { useState } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  CheckCircle2, 
  XCircle, 
  AlertCircle, 
  Lightbulb,
  Target,
  BookOpen,
  MessageSquare,
  TrendingUp,
  Clock,
  Zap,
  Award,
  Eye,
  ThumbsUp,
  ThumbsDown,
  Star
} from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

interface QuestionCorrectionProps {
  questionId: string;
  questionText: string;
  questionType: string;
  points: number;
  studentAnswer: string;
  correctAnswer: string;
  isCorrect: boolean;
  pointsEarned: number;
  explanation?: string;
  improvementSuggestion?: string;
  difficultyLevel?: 'easy' | 'medium' | 'hard';
  timeSpent?: number;
  confidenceLevel?: number;
  options?: Array<{
    id: string;
    text: string;
    isCorrect: boolean;
    isSelected: boolean;
  }>;
  onFeedback?: (questionId: string, helpful: boolean) => void;
  onRequestHelp?: (questionId: string) => void;
  showDetailedAnalysis?: boolean;
}

export const QuestionCorrection: React.FC<QuestionCorrectionProps> = ({
  questionId,
  questionText,
  questionType,
  points,
  studentAnswer,
  correctAnswer,
  isCorrect,
  pointsEarned,
  explanation,
  improvementSuggestion,
  difficultyLevel,
  timeSpent,
  confidenceLevel,
  options,
  onFeedback,
  onRequestHelp,
  showDetailedAnalysis = true
}) => {
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState('answer');
  const [feedbackGiven, setFeedbackGiven] = useState<boolean | null>(null);

  const getCorrectionStatus = () => {
    if (isCorrect) {
      return {
        icon: <CheckCircle2 className="h-5 w-5 text-green-600" />,
        color: 'text-green-600',
        bgColor: 'bg-green-50',
        borderColor: 'border-green-200',
        status: t('correction.correct')
      };
    }
    
    if (pointsEarned > 0) {
      return {
        icon: <AlertCircle className="h-5 w-5 text-yellow-600" />,
        color: 'text-yellow-600',
        bgColor: 'bg-yellow-50',
        borderColor: 'border-yellow-200',
        status: t('correction.partialCredit')
      };
    }
    
    return {
      icon: <XCircle className="h-5 w-5 text-red-600" />,
      color: 'text-red-600',
      bgColor: 'bg-red-50',
      borderColor: 'border-red-200',
      status: t('correction.incorrect')
    };
  };

  const getPerformanceInsight = () => {
    const percentage = (pointsEarned / points) * 100;
    
    if (percentage === 100) {
      return {
        level: 'excellent',
        message: t('correction.insight.excellent'),
        icon: <Award className="h-4 w-4 text-green-600" />
      };
    }
    
    if (percentage >= 50) {
      return {
        level: 'partial',
        message: t('correction.insight.partial'),
        icon: <TrendingUp className="h-4 w-4 text-yellow-600" />
      };
    }
    
    return {
      level: 'needs_work',
      message: t('correction.insight.needsWork'),
      icon: <Target className="h-4 w-4 text-red-600" />
    };
  };

  const handleFeedback = (helpful: boolean) => {
    setFeedbackGiven(helpful);
    if (onFeedback) {
      onFeedback(questionId, helpful);
    }
  };

  const status = getCorrectionStatus();
  const insight = getPerformanceInsight();

  return (
    <Card className={`border-l-4 ${status.borderColor} ${status.bgColor}`}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            {status.icon}
            <div>
              <div className="flex items-center gap-2">
                <span className={`font-medium ${status.color}`}>{status.status}</span>
                <Badge variant="outline">{t(`quiz.type.${questionType}`)}</Badge>
                {difficultyLevel && (
                  <Badge variant="secondary">
                    {t(`quiz.difficulty.${difficultyLevel}`)}
                  </Badge>
                )}
              </div>
              <div className="flex items-center gap-4 mt-1 text-sm text-gray-600">
                <span>{pointsEarned}/{points} {t('quiz.points')}</span>
                {timeSpent && (
                  <span className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {timeSpent}s
                  </span>
                )}
                {confidenceLevel && (
                  <span className="flex items-center gap-1">
                    <Star className="h-3 w-3" />
                    {confidenceLevel}% {t('correction.confidence')}
                  </span>
                )}
              </div>
            </div>
          </div>
          
          <div className="text-right">
            <div className="text-lg font-bold text-gray-900">
              {Math.round((pointsEarned / points) * 100)}%
            </div>
            <div className="text-xs text-gray-500">{t('correction.score')}</div>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        <div className="space-y-4">
          {/* Question Text */}
          <div className="bg-white p-4 rounded-lg border">
            <h4 className="font-medium text-gray-800 mb-2">{t('correction.question')}</h4>
            <p className="text-gray-700">{questionText}</p>
          </div>

          {showDetailedAnalysis ? (
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="answer">{t('correction.answer')}</TabsTrigger>
                <TabsTrigger value="explanation">{t('correction.explanation')}</TabsTrigger>
                <TabsTrigger value="improvement">{t('correction.improvement')}</TabsTrigger>
              </TabsList>

              <TabsContent value="answer" className="space-y-4">
                {/* Answer Comparison */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <h5 className="font-medium text-gray-700 flex items-center gap-2">
                      <MessageSquare className="h-4 w-4" />
                      {t('correction.yourAnswer')}
                    </h5>
                    <div className={`p-3 rounded-lg border ${
                      isCorrect 
                        ? 'bg-green-50 border-green-200' 
                        : 'bg-red-50 border-red-200'
                    }`}>
                      <p className="text-sm">
                        {studentAnswer || t('correction.noAnswer')}
                      </p>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <h5 className="font-medium text-gray-700 flex items-center gap-2">
                      <Target className="h-4 w-4" />
                      {t('correction.correctAnswer')}
                    </h5>
                    <div className="p-3 rounded-lg border bg-green-50 border-green-200">
                      <p className="text-sm text-green-800">{correctAnswer}</p>
                    </div>
                  </div>
                </div>

                {/* Multiple Choice Options Analysis */}
                {options && options.length > 0 && (
                  <div className="space-y-2">
                    <h5 className="font-medium text-gray-700">{t('correction.optionAnalysis')}</h5>
                    <div className="space-y-2">
                      {options.map((option, index) => (
                        <div 
                          key={option.id}
                          className={`p-3 rounded-lg border flex items-center justify-between ${
                            option.isCorrect 
                              ? 'bg-green-50 border-green-200' 
                              : option.isSelected 
                                ? 'bg-red-50 border-red-200'
                                : 'bg-gray-50 border-gray-200'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <span className="font-medium text-blue-600">
                              {String.fromCharCode(65 + index)}.
                            </span>
                            <span className="text-sm">{option.text}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            {option.isCorrect && (
                              <Badge variant="default" className="bg-green-600">
                                {t('correction.correct')}
                              </Badge>
                            )}
                            {option.isSelected && (
                              <Badge variant={option.isCorrect ? 'default' : 'destructive'}>
                                {t('correction.selected')}
                              </Badge>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Performance Insight */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    {insight.icon}
                    <div>
                      <h5 className="font-medium text-blue-800">{t('correction.insight')}</h5>
                      <p className="text-sm text-blue-700 mt-1">{insight.message}</p>
                    </div>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="explanation" className="space-y-4">
                {explanation ? (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <h5 className="font-medium text-blue-800 mb-2 flex items-center gap-2">
                      <BookOpen className="h-4 w-4" />
                      {t('correction.detailedExplanation')}
                    </h5>
                    <p className="text-sm text-blue-700">{explanation}</p>
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <BookOpen className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p>{t('correction.noExplanation')}</p>
                  </div>
                )}

                {/* Additional Learning Resources */}
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                  <h5 className="font-medium text-gray-800 mb-3">{t('correction.learningResources')}</h5>
                  <div className="space-y-2">
                    <Button variant="outline" size="sm" className="w-full justify-start">
                      <BookOpen className="h-4 w-4 mr-2" />
                      {t('correction.relatedMaterial')}
                    </Button>
                    <Button variant="outline" size="sm" className="w-full justify-start">
                      <Eye className="h-4 w-4 mr-2" />
                      {t('correction.videoExplanation')}
                    </Button>
                    <Button variant="outline" size="sm" className="w-full justify-start">
                      <Zap className="h-4 w-4 mr-2" />
                      {t('correction.practiceQuestions')}
                    </Button>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="improvement" className="space-y-4">
                {improvementSuggestion ? (
                  <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                    <h5 className="font-medium text-purple-800 mb-2 flex items-center gap-2">
                      <Lightbulb className="h-4 w-4" />
                      {t('correction.improvementSuggestion')}
                    </h5>
                    <p className="text-sm text-purple-700">{improvementSuggestion}</p>
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <Lightbulb className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p>{t('correction.noSuggestion')}</p>
                  </div>
                )}

                {/* Study Plan */}
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <h5 className="font-medium text-green-800 mb-3 flex items-center gap-2">
                    <TrendingUp className="h-4 w-4" />
                    {t('correction.studyPlan')}
                  </h5>
                  <div className="space-y-2 text-sm text-green-700">
                    <div className="flex items-start gap-2">
                      <span className="text-green-600 mt-1">1.</span>
                      <span>{t('correction.studyStep1')}</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="text-green-600 mt-1">2.</span>
                      <span>{t('correction.studyStep2')}</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="text-green-600 mt-1">3.</span>
                      <span>{t('correction.studyStep3')}</span>
                    </div>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          ) : (
            /* Simplified View */
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <h5 className="font-medium text-gray-700">{t('correction.yourAnswer')}</h5>
                  <div className={`p-3 rounded-lg border ${
                    isCorrect ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'
                  }`}>
                    <p className="text-sm">{studentAnswer || t('correction.noAnswer')}</p>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <h5 className="font-medium text-gray-700">{t('correction.correctAnswer')}</h5>
                  <div className="p-3 rounded-lg border bg-green-50 border-green-200">
                    <p className="text-sm text-green-800">{correctAnswer}</p>
                  </div>
                </div>
              </div>

              {(explanation || improvementSuggestion) && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  {explanation && (
                    <p className="text-sm text-blue-700 mb-2">{explanation}</p>
                  )}
                  {improvementSuggestion && (
                    <p className="text-sm text-purple-700">{improvementSuggestion}</p>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex items-center justify-between pt-4 border-t">
            <div className="flex items-center gap-2">
              {onRequestHelp && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onRequestHelp(questionId)}
                  className="flex items-center gap-2"
                >
                  <MessageSquare className="h-3 w-3" />
                  {t('correction.requestHelp')}
                </Button>
              )}
            </div>

            {/* Feedback Buttons */}
            {onFeedback && (
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600">{t('correction.wasHelpful')}</span>
                <Button
                  variant={feedbackGiven === true ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => handleFeedback(true)}
                  className="flex items-center gap-1"
                >
                  <ThumbsUp className="h-3 w-3" />
                  {t('correction.yes')}
                </Button>
                <Button
                  variant={feedbackGiven === false ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => handleFeedback(false)}
                  className="flex items-center gap-1"
                >
                  <ThumbsDown className="h-3 w-3" />
                  {t('correction.no')}
                </Button>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};