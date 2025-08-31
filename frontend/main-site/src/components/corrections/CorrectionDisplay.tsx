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
  BookOpen,
  TrendingUp,
  Award,
  Eye,
  EyeOff,
  ChevronDown,
  ChevronUp,
  Star,
  ThumbsUp,
  ThumbsDown,
  MessageSquare,
  Zap,
  Brain,
  Clock,
  BarChart3
} from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

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
  difficulty_level?: 'easy' | 'medium' | 'hard';
}

interface SubmissionAnswer {
  question_id: string;
  selected_option_id?: string;
  answer_text?: string;
}

interface QuizCorrection {
  id: string;
  question_id: string;
  is_correct: boolean;
  points_earned: number;
  max_points: number;
  correct_answer: string;
  explanation: string;
  improvement_suggestion: string;
  detailed_feedback?: string;
  common_mistakes?: string[];
  learning_resources?: Array<{
    title: string;
    url: string;
    type: 'video' | 'article' | 'exercise';
  }>;
  difficulty_analysis?: {
    student_level: 'below' | 'at' | 'above';
    question_difficulty: 'easy' | 'medium' | 'hard';
    success_rate: number;
  };
}

interface CorrectionDisplayProps {
  question: QuizQuestion;
  userAnswer?: SubmissionAnswer;
  correction: QuizCorrection;
  showDetailedFeedback?: boolean;
  showImprovementSuggestions?: boolean;
  showLearningResources?: boolean;
  isExpandable?: boolean;
  onFeedbackRating?: (correctionId: string, rating: 'helpful' | 'not_helpful') => void;
}

export const CorrectionDisplay: React.FC<CorrectionDisplayProps> = ({
  question,
  userAnswer,
  correction,
  showDetailedFeedback = true,
  showImprovementSuggestions = true,
  showLearningResources = true,
  isExpandable = false,
  onFeedbackRating
}) => {
  const { t } = useLanguage();
  const [isExpanded, setIsExpanded] = useState(!isExpandable);
  const [showResources, setShowResources] = useState(false);

  const getScorePercentage = () => {
    return correction.max_points > 0 ? (correction.points_earned / correction.max_points) * 100 : 0;
  };

  const getScoreColor = () => {
    const percentage = getScorePercentage();
    if (percentage >= 90) return 'text-green-600 bg-green-100';
    if (percentage >= 70) return 'text-blue-600 bg-blue-100';
    if (percentage >= 50) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

  const getQuestionTypeIcon = (type: string) => {
    switch (type) {
      case 'multiple_choice': return <Target className="h-4 w-4" />;
      case 'true_false': return <CheckCircle2 className="h-4 w-4" />;
      case 'fill_blank': return <BookOpen className="h-4 w-4" />;
      case 'short_answer': return <MessageSquare className="h-4 w-4" />;
      case 'essay': return <BookOpen className="h-4 w-4" />;
      default: return <AlertCircle className="h-4 w-4" />;
    }
  };

  const getDifficultyColor = (level?: string) => {
    switch (level) {
      case 'easy': return 'text-green-600 bg-green-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      case 'hard': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const formatUserAnswer = () => {
    if (!userAnswer) return t('corrections.noAnswer');

    if (userAnswer.selected_option_id && question.options) {
      const selectedOption = question.options.find(opt => opt.id === userAnswer.selected_option_id);
      return selectedOption?.option_text || t('corrections.unknownOption');
    }

    if (userAnswer.answer_text) {
      return userAnswer.answer_text.length > 100 
        ? `${userAnswer.answer_text.substring(0, 100)}...`
        : userAnswer.answer_text;
    }

    return t('corrections.noAnswer');
  };

  return (
    <Card className={`overflow-hidden border-l-4 ${
      correction.is_correct ? 'border-l-green-500' : 'border-l-red-500'
    }`}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-full ${correction.is_correct ? 'bg-green-100' : 'bg-red-100'}`}>
              {correction.is_correct ? (
                <CheckCircle2 className="h-5 w-5 text-green-600" />
              ) : (
                <XCircle className="h-5 w-5 text-red-600" />
              )}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className={`font-semibold ${correction.is_correct ? 'text-green-700' : 'text-red-700'}`}>
                  {correction.is_correct ? t('corrections.correct') : t('corrections.incorrect')}
                </span>
                <Badge variant="outline" className="flex items-center gap-1">
                  {getQuestionTypeIcon(question.type)}
                  {t(`quiz.type.${question.type}`)}
                </Badge>
                {question.difficulty_level && (
                  <Badge variant="outline" className={getDifficultyColor(question.difficulty_level)}>
                    {t(`quiz.difficulty.${question.difficulty_level}`)}
                  </Badge>
                )}
              </div>
              <p className="text-sm text-gray-600 mt-1">
                {t('corrections.question')} • {correction.points_earned}/{correction.max_points} {t('corrections.points')}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className={`px-3 py-1 rounded-full text-sm font-medium ${getScoreColor()}`}>
              {getScorePercentage().toFixed(0)}%
            </div>
            {isExpandable && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsExpanded(!isExpanded)}
                className="p-1"
              >
                {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              </Button>
            )}
          </div>
        </div>

        {/* Progress bar for partial credit */}
        {correction.points_earned > 0 && correction.points_earned < correction.max_points && (
          <div className="mt-3">
            <Progress value={getScorePercentage()} className="h-2" />
            <p className="text-xs text-gray-500 mt-1">{t('corrections.partialCredit')}</p>
          </div>
        )}
      </CardHeader>

      {isExpanded && (
        <CardContent className="space-y-6">
          {/* Question Display */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h4 className="font-medium text-gray-800 mb-2">{t('corrections.question')}</h4>
            <p className="text-gray-700">{question.question}</p>
          </div>

          {/* Answer Comparison */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* User's Answer */}
            <div className={`p-4 rounded-lg border-2 ${
              correction.is_correct ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'
            }`}>
              <div className="flex items-center gap-2 mb-2">
                <span className="font-medium text-gray-800">{t('corrections.yourAnswer')}</span>
                {correction.is_correct ? (
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                ) : (
                  <XCircle className="h-4 w-4 text-red-600" />
                )}
              </div>
              <p className="text-gray-700">{formatUserAnswer()}</p>
            </div>

            {/* Correct Answer */}
            {!correction.is_correct && (
              <div className="p-4 rounded-lg border-2 border-green-200 bg-green-50">
                <div className="flex items-center gap-2 mb-2">
                  <span className="font-medium text-gray-800">{t('corrections.correctAnswer')}</span>
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                </div>
                <p className="text-green-700 font-medium">{correction.correct_answer}</p>
              </div>
            )}
          </div>

          {/* Detailed Feedback Tabs */}
          <Tabs defaultValue="explanation" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="explanation" className="flex items-center gap-2">
                <Lightbulb className="h-4 w-4" />
                {t('corrections.explanation')}
              </TabsTrigger>
              <TabsTrigger value="improvement" className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4" />
                {t('corrections.improvement')}
              </TabsTrigger>
              <TabsTrigger value="analysis" className="flex items-center gap-2">
                <BarChart3 className="h-4 w-4" />
                {t('corrections.analysis')}
              </TabsTrigger>
            </TabsList>

            {/* Explanation Tab */}
            <TabsContent value="explanation" className="space-y-4">
              {correction.explanation && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <Lightbulb className="h-5 w-5 text-blue-600 mt-0.5" />
                    <div>
                      <h4 className="font-medium text-blue-800 mb-2">{t('corrections.explanation')}</h4>
                      <p className="text-blue-700">{correction.explanation}</p>
                    </div>
                  </div>
                </div>
              )}

              {showDetailedFeedback && correction.detailed_feedback && (
                <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <MessageSquare className="h-5 w-5 text-purple-600 mt-0.5" />
                    <div>
                      <h4 className="font-medium text-purple-800 mb-2">{t('corrections.detailedFeedback')}</h4>
                      <p className="text-purple-700">{correction.detailed_feedback}</p>
                    </div>
                  </div>
                </div>
              )}

              {question.explanation && (
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <BookOpen className="h-5 w-5 text-gray-600 mt-0.5" />
                    <div>
                      <h4 className="font-medium text-gray-800 mb-2">{t('corrections.questionExplanation')}</h4>
                      <p className="text-gray-700">{question.explanation}</p>
                    </div>
                  </div>
                </div>
              )}
            </TabsContent>

            {/* Improvement Tab */}
            <TabsContent value="improvement" className="space-y-4">
              {showImprovementSuggestions && correction.improvement_suggestion && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <TrendingUp className="h-5 w-5 text-green-600 mt-0.5" />
                    <div>
                      <h4 className="font-medium text-green-800 mb-2">{t('corrections.improvementSuggestion')}</h4>
                      <p className="text-green-700">{correction.improvement_suggestion}</p>
                    </div>
                  </div>
                </div>
              )}

              {correction.common_mistakes && correction.common_mistakes.length > 0 && (
                <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="h-5 w-5 text-orange-600 mt-0.5" />
                    <div>
                      <h4 className="font-medium text-orange-800 mb-2">{t('corrections.commonMistakes')}</h4>
                      <ul className="text-orange-700 space-y-1">
                        {correction.common_mistakes.map((mistake, index) => (
                          <li key={index} className="flex items-start gap-2">
                            <span className="text-orange-600 mt-1">•</span>
                            <span>{mistake}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              )}

              {/* Learning Resources */}
              {showLearningResources && correction.learning_resources && correction.learning_resources.length > 0 && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium text-gray-800">{t('corrections.learningResources')}</h4>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setShowResources(!showResources)}
                      className="flex items-center gap-2"
                    >
                      {showResources ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      {showResources ? t('corrections.hideResources') : t('corrections.showResources')}
                    </Button>
                  </div>

                  {showResources && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {correction.learning_resources.map((resource, index) => (
                        <div key={index} className="p-3 border rounded-lg hover:bg-gray-50 transition-colors">
                          <div className="flex items-start gap-3">
                            <div className={`p-1 rounded ${
                              resource.type === 'video' ? 'bg-red-100 text-red-600' :
                              resource.type === 'article' ? 'bg-blue-100 text-blue-600' :
                              'bg-green-100 text-green-600'
                            }`}>
                              {resource.type === 'video' ? <BookOpen className="h-4 w-4" /> :
                               resource.type === 'article' ? <BookOpen className="h-4 w-4" /> :
                               <Zap className="h-4 w-4" />}
                            </div>
                            <div className="flex-1">
                              <h5 className="font-medium text-gray-800 text-sm">{resource.title}</h5>
                              <p className="text-xs text-gray-600 capitalize">{resource.type}</p>
                              <Button
                                variant="link"
                                size="sm"
                                className="p-0 h-auto text-xs"
                                onClick={() => window.open(resource.url, '_blank')}
                              >
                                {t('corrections.openResource')}
                              </Button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </TabsContent>

            {/* Analysis Tab */}
            <TabsContent value="analysis" className="space-y-4">
              {correction.difficulty_analysis && (
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <Brain className="h-5 w-5 text-gray-600 mt-0.5" />
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-800 mb-3">{t('corrections.difficultyAnalysis')}</h4>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="text-center p-3 bg-white rounded border">
                          <div className="text-sm text-gray-600 mb-1">{t('corrections.yourLevel')}</div>
                          <div className={`font-medium ${
                            correction.difficulty_analysis.student_level === 'above' ? 'text-green-600' :
                            correction.difficulty_analysis.student_level === 'at' ? 'text-blue-600' :
                            'text-orange-600'
                          }`}>
                            {t(`corrections.level.${correction.difficulty_analysis.student_level}`)}
                          </div>
                        </div>

                        <div className="text-center p-3 bg-white rounded border">
                          <div className="text-sm text-gray-600 mb-1">{t('corrections.questionDifficulty')}</div>
                          <div className={`font-medium ${getDifficultyColor(correction.difficulty_analysis.question_difficulty)}`}>
                            {t(`quiz.difficulty.${correction.difficulty_analysis.question_difficulty}`)}
                          </div>
                        </div>

                        <div className="text-center p-3 bg-white rounded border">
                          <div className="text-sm text-gray-600 mb-1">{t('corrections.successRate')}</div>
                          <div className="font-medium text-blue-600">
                            {correction.difficulty_analysis.success_rate}%
                          </div>
                        </div>
                      </div>

                      <div className="mt-3 p-3 bg-blue-50 rounded">
                        <p className="text-sm text-blue-700">
                          {correction.difficulty_analysis.student_level === 'above' && 
                            t('corrections.analysis.above')}
                          {correction.difficulty_analysis.student_level === 'at' && 
                            t('corrections.analysis.at')}
                          {correction.difficulty_analysis.student_level === 'below' && 
                            t('corrections.analysis.below')}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Performance Metrics */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-3 bg-white border rounded">
                  <div className="text-2xl font-bold text-blue-600">{correction.points_earned}</div>
                  <div className="text-xs text-gray-600">{t('corrections.pointsEarned')}</div>
                </div>

                <div className="text-center p-3 bg-white border rounded">
                  <div className="text-2xl font-bold text-purple-600">{getScorePercentage().toFixed(0)}%</div>
                  <div className="text-xs text-gray-600">{t('corrections.accuracy')}</div>
                </div>

                <div className="text-center p-3 bg-white border rounded">
                  <div className="text-2xl font-bold text-green-600">
                    {question.difficulty_level ? t(`quiz.difficulty.${question.difficulty_level}`) : 'N/A'}
                  </div>
                  <div className="text-xs text-gray-600">{t('corrections.difficulty')}</div>
                </div>

                <div className="text-center p-3 bg-white border rounded">
                  <div className="text-2xl font-bold text-orange-600">
                    {correction.difficulty_analysis?.success_rate || 'N/A'}%
                  </div>
                  <div className="text-xs text-gray-600">{t('corrections.classAverage')}</div>
                </div>
              </div>
            </TabsContent>
          </Tabs>

          {/* Feedback Rating */}
          {onFeedbackRating && (
            <div className="border-t pt-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">{t('corrections.wasThisHelpful')}</span>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onFeedbackRating(correction.id, 'helpful')}
                    className="flex items-center gap-2"
                  >
                    <ThumbsUp className="h-4 w-4" />
                    {t('corrections.helpful')}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onFeedbackRating(correction.id, 'not_helpful')}
                    className="flex items-center gap-2"
                  >
                    <ThumbsDown className="h-4 w-4" />
                    {t('corrections.notHelpful')}
                  </Button>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      )}
    </Card>
  );
};