import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  TrendingUp, 
  TrendingDown,
  Target,
  Award,
  AlertCircle,
  CheckCircle2,
  XCircle,
  BookOpen,
  Lightbulb,
  BarChart3,
  PieChart,
  Clock,
  Zap,
  Star,
  ThumbsUp,
  ThumbsDown
} from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

interface CorrectionSummaryData {
  totalQuestions: number;
  correctAnswers: number;
  incorrectAnswers: number;
  partialCredit: number;
  totalPointsEarned: number;
  totalPointsPossible: number;
  accuracyPercentage: number;
  averageTimePerQuestion: number;
  questionTypeBreakdown: Record<string, {
    total: number;
    correct: number;
    accuracy: number;
  }>;
  difficultyBreakdown: Record<string, {
    total: number;
    correct: number;
    accuracy: number;
  }>;
  improvementAreas: Array<{
    area: string;
    description: string;
    priority: 'high' | 'medium' | 'low';
    suggestions: string[];
  }>;
  strengths: Array<{
    area: string;
    description: string;
    examples: string[];
  }>;
  studyRecommendations: Array<{
    topic: string;
    reason: string;
    resources: string[];
    estimatedTime: string;
  }>;
}

interface CorrectionSummaryProps {
  data: CorrectionSummaryData;
  showDetailedAnalysis?: boolean;
  onGenerateStudyPlan?: () => void;
  onRequestTutoring?: () => void;
}

export const CorrectionSummary: React.FC<CorrectionSummaryProps> = ({
  data,
  showDetailedAnalysis = true,
  onGenerateStudyPlan,
  onRequestTutoring
}) => {
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState('overview');

  const getPerformanceLevel = (percentage: number) => {
    if (percentage >= 90) return { 
      level: 'excellent', 
      color: 'text-green-600', 
      bgColor: 'bg-green-50',
      icon: Award,
      message: t('correction.performance.excellent')
    };
    if (percentage >= 80) return { 
      level: 'good', 
      color: 'text-blue-600', 
      bgColor: 'bg-blue-50',
      icon: Target,
      message: t('correction.performance.good')
    };
    if (percentage >= 70) return { 
      level: 'satisfactory', 
      color: 'text-yellow-600', 
      bgColor: 'bg-yellow-50',
      icon: TrendingUp,
      message: t('correction.performance.satisfactory')
    };
    if (percentage >= 60) return { 
      level: 'needsImprovement', 
      color: 'text-orange-600', 
      bgColor: 'bg-orange-50',
      icon: AlertCircle,
      message: t('correction.performance.needsImprovement')
    };
    return { 
      level: 'requiresAttention', 
      color: 'text-red-600', 
      bgColor: 'bg-red-50',
      icon: XCircle,
      message: t('correction.performance.requiresAttention')
    };
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'text-red-600 bg-red-50 border-red-200';
      case 'medium': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'low': return 'text-green-600 bg-green-50 border-green-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const performance = getPerformanceLevel(data.accuracyPercentage);
  const PerformanceIcon = performance.icon;

  return (
    <div className="space-y-6">
      {/* Overall Performance Card */}
      <Card className={`border-l-4 border-l-blue-500 ${performance.bgColor}`}>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <PerformanceIcon className={`h-6 w-6 ${performance.color}`} />
              <div>
                <CardTitle className={performance.color}>
                  {t('correction.overallPerformance')}
                </CardTitle>
                <p className="text-sm text-gray-600 mt-1">{performance.message}</p>
              </div>
            </div>
            <div className="text-right">
              <div className={`text-3xl font-bold ${performance.color}`}>
                {data.accuracyPercentage.toFixed(1)}%
              </div>
              <div className="text-sm text-gray-600">{t('correction.accuracy')}</div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-3 bg-white rounded-lg border">
              <div className="text-xl font-bold text-green-600">{data.correctAnswers}</div>
              <div className="text-xs text-gray-600">{t('correction.correct')}</div>
            </div>
            <div className="text-center p-3 bg-white rounded-lg border">
              <div className="text-xl font-bold text-red-600">{data.incorrectAnswers}</div>
              <div className="text-xs text-gray-600">{t('correction.incorrect')}</div>
            </div>
            <div className="text-center p-3 bg-white rounded-lg border">
              <div className="text-xl font-bold text-yellow-600">{data.partialCredit}</div>
              <div className="text-xs text-gray-600">{t('correction.partial')}</div>
            </div>
            <div className="text-center p-3 bg-white rounded-lg border">
              <div className="text-xl font-bold text-blue-600">
                {data.totalPointsEarned}/{data.totalPointsPossible}
              </div>
              <div className="text-xs text-gray-600">{t('correction.points')}</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {showDetailedAnalysis && (
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">{t('correction.overview')}</TabsTrigger>
            <TabsTrigger value="analysis">{t('correction.analysis')}</TabsTrigger>
            <TabsTrigger value="strengths">{t('correction.strengths')}</TabsTrigger>
            <TabsTrigger value="improvement">{t('correction.improvement')}</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <Clock className="h-8 w-8 text-blue-600" />
                    <div>
                      <div className="text-lg font-bold">{data.averageTimePerQuestion}s</div>
                      <div className="text-sm text-gray-600">{t('correction.avgTimePerQuestion')}</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <Target className="h-8 w-8 text-green-600" />
                    <div>
                      <div className="text-lg font-bold">{data.totalQuestions}</div>
                      <div className="text-sm text-gray-600">{t('correction.totalQuestions')}</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <Star className="h-8 w-8 text-yellow-600" />
                    <div>
                      <div className="text-lg font-bold">
                        {Math.round((data.correctAnswers / data.totalQuestions) * 100)}%
                      </div>
                      <div className="text-sm text-gray-600">{t('correction.successRate')}</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Progress Visualization */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  {t('correction.progressBreakdown')}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium">{t('correction.correct')}</span>
                      <span className="text-sm text-green-600">
                        {data.correctAnswers} ({Math.round((data.correctAnswers / data.totalQuestions) * 100)}%)
                      </span>
                    </div>
                    <Progress 
                      value={(data.correctAnswers / data.totalQuestions) * 100} 
                      className="h-2 bg-green-100"
                    />
                  </div>
                  
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium">{t('correction.partialCredit')}</span>
                      <span className="text-sm text-yellow-600">
                        {data.partialCredit} ({Math.round((data.partialCredit / data.totalQuestions) * 100)}%)
                      </span>
                    </div>
                    <Progress 
                      value={(data.partialCredit / data.totalQuestions) * 100} 
                      className="h-2 bg-yellow-100"
                    />
                  </div>
                  
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium">{t('correction.incorrect')}</span>
                      <span className="text-sm text-red-600">
                        {data.incorrectAnswers} ({Math.round((data.incorrectAnswers / data.totalQuestions) * 100)}%)
                      </span>
                    </div>
                    <Progress 
                      value={(data.incorrectAnswers / data.totalQuestions) * 100} 
                      className="h-2 bg-red-100"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analysis" className="space-y-4">
            {/* Question Type Analysis */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <PieChart className="h-5 w-5" />
                  {t('correction.questionTypeAnalysis')}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {Object.entries(data.questionTypeBreakdown).map(([type, stats]) => (
                    <div key={type} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <Badge variant="outline">{t(`quiz.type.${type}`)}</Badge>
                        <span className="text-sm text-gray-600">
                          {stats.correct}/{stats.total} {t('correction.correct')}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-20">
                          <Progress value={stats.accuracy} className="h-2" />
                        </div>
                        <span className={`text-sm font-medium ${
                          stats.accuracy >= 80 ? 'text-green-600' : 
                          stats.accuracy >= 60 ? 'text-yellow-600' : 'text-red-600'
                        }`}>
                          {stats.accuracy.toFixed(0)}%
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Difficulty Analysis */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5" />
                  {t('correction.difficultyAnalysis')}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {Object.entries(data.difficultyBreakdown).map(([level, stats]) => (
                    <div key={level} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <Badge variant="secondary">{t(`quiz.difficulty.${level}`)}</Badge>
                        <span className="text-sm text-gray-600">
                          {stats.correct}/{stats.total} {t('correction.correct')}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-20">
                          <Progress value={stats.accuracy} className="h-2" />
                        </div>
                        <span className={`text-sm font-medium ${
                          stats.accuracy >= 80 ? 'text-green-600' : 
                          stats.accuracy >= 60 ? 'text-yellow-600' : 'text-red-600'
                        }`}>
                          {stats.accuracy.toFixed(0)}%
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="strengths" className="space-y-4">
            {data.strengths.length > 0 ? (
              data.strengths.map((strength, index) => (
                <Card key={index} className="border-l-4 border-l-green-500">
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5" />
                      <div className="flex-1">
                        <h4 className="font-medium text-green-800">{strength.area}</h4>
                        <p className="text-sm text-green-700 mt-1">{strength.description}</p>
                        {strength.examples.length > 0 && (
                          <div className="mt-2">
                            <p className="text-xs text-green-600 font-medium mb-1">
                              {t('correction.examples')}:
                            </p>
                            <ul className="text-xs text-green-600 space-y-1">
                              {strength.examples.map((example, idx) => (
                                <li key={idx} className="flex items-start gap-1">
                                  <span>•</span>
                                  <span>{example}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <Card>
                <CardContent className="p-8 text-center">
                  <Star className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">{t('correction.noStrengthsIdentified')}</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="improvement" className="space-y-4">
            {/* Improvement Areas */}
            {data.improvementAreas.length > 0 && (
              <div className="space-y-4">
                {data.improvementAreas.map((area, index) => (
                  <Card key={index} className={`border-l-4 ${
                    area.priority === 'high' ? 'border-l-red-500' :
                    area.priority === 'medium' ? 'border-l-yellow-500' : 'border-l-green-500'
                  }`}>
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3">
                        <TrendingUp className={`h-5 w-5 mt-0.5 ${
                          area.priority === 'high' ? 'text-red-600' :
                          area.priority === 'medium' ? 'text-yellow-600' : 'text-green-600'
                        }`} />
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-medium text-gray-800">{area.area}</h4>
                            <Badge className={getPriorityColor(area.priority)}>
                              {t(`correction.priority.${area.priority}`)}
                            </Badge>
                          </div>
                          <p className="text-sm text-gray-700 mb-2">{area.description}</p>
                          <div className="space-y-1">
                            <p className="text-xs font-medium text-gray-600">
                              {t('correction.suggestions')}:
                            </p>
                            {area.suggestions.map((suggestion, idx) => (
                              <div key={idx} className="flex items-start gap-2 text-xs text-gray-600">
                                <Lightbulb className="h-3 w-3 mt-0.5 text-blue-500" />
                                <span>{suggestion}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}

            {/* Study Recommendations */}
            {data.studyRecommendations.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BookOpen className="h-5 w-5" />
                    {t('correction.studyRecommendations')}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {data.studyRecommendations.map((rec, index) => (
                      <div key={index} className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                        <div className="flex items-start justify-between mb-2">
                          <h5 className="font-medium text-blue-800">{rec.topic}</h5>
                          <Badge variant="outline" className="text-blue-600">
                            {rec.estimatedTime}
                          </Badge>
                        </div>
                        <p className="text-sm text-blue-700 mb-3">{rec.reason}</p>
                        <div className="space-y-1">
                          <p className="text-xs font-medium text-blue-600">
                            {t('correction.recommendedResources')}:
                          </p>
                          {rec.resources.map((resource, idx) => (
                            <div key={idx} className="flex items-center gap-2 text-xs text-blue-600">
                              <BookOpen className="h-3 w-3" />
                              <span>{resource}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Action Buttons */}
            <div className="flex gap-4">
              {onGenerateStudyPlan && (
                <Button onClick={onGenerateStudyPlan} className="flex items-center gap-2">
                  <BookOpen className="h-4 w-4" />
                  {t('correction.generateStudyPlan')}
                </Button>
              )}
              
              {onRequestTutoring && (
                <Button variant="outline" onClick={onRequestTutoring} className="flex items-center gap-2">
                  <Zap className="h-4 w-4" />
                  {t('correction.requestTutoring')}
                </Button>
              )}
            </div>
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
};