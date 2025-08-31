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
  AlertTriangle,
  CheckCircle2,
  XCircle,
  BarChart3,
  PieChart,
  BookOpen,
  Lightbulb,
  Star,
  Clock,
  Zap,
  Brain,
  Users,
  Trophy,
  ArrowUp,
  ArrowDown,
  Minus
} from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

// Enhanced interfaces
interface QuestionTypePerformance {
  type: string;
  total: number;
  correct: number;
  partial: number;
  accuracy: number;
  improvement_needed: boolean;
}

interface StrengthArea {
  area: string;
  score: number;
  description: string;
  questions: number;
}

interface ImprovementArea {
  area: string;
  current_score: number;
  target_score: number;
  priority: 'high' | 'medium' | 'low';
  suggestions: string[];
  estimated_study_time: string;
}

interface LearningInsight {
  type: 'strength' | 'weakness' | 'trend' | 'recommendation';
  title: string;
  description: string;
  action_items?: string[];
  confidence: number;
}

interface CorrectionSummaryData {
  overall_performance: {
    total_questions: number;
    correct_answers: number;
    partial_credit: number;
    total_points: number;
    max_points: number;
    accuracy_rate: number;
    improvement_from_last: number;
  };
  question_type_performance: QuestionTypePerformance[];
  strength_areas: StrengthArea[];
  improvement_areas: ImprovementArea[];
  learning_insights: LearningInsight[];
  study_recommendations: {
    immediate_focus: string[];
    long_term_goals: string[];
    estimated_study_time: string;
    next_quiz_readiness: 'ready' | 'needs_practice' | 'needs_significant_work';
  };
  comparative_analysis: {
    class_average: number;
    your_percentile: number;
    difficulty_level_performance: Record<string, number>;
    time_efficiency: {
      your_time: number;
      average_time: number;
      efficiency_rating: string;
    };
  };
}

interface CorrectionSummaryProps {
  data: CorrectionSummaryData;
  quizTitle: string;
  proficiencyLevel: string;
  showComparative?: boolean;
  showDetailedInsights?: boolean;
  onViewDetailedCorrections?: () => void;
  onStartStudyPlan?: () => void;
}

export const CorrectionSummary: React.FC<CorrectionSummaryProps> = ({
  data,
  quizTitle,
  proficiencyLevel,
  showComparative = true,
  showDetailedInsights = true,
  onViewDetailedCorrections,
  onStartStudyPlan
}) => {
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState('overview');

  const getPerformanceColor = (score: number) => {
    if (score >= 90) return 'text-green-600 bg-green-100';
    if (score >= 80) return 'text-blue-600 bg-blue-100';
    if (score >= 70) return 'text-yellow-600 bg-yellow-100';
    if (score >= 60) return 'text-orange-600 bg-orange-100';
    return 'text-red-600 bg-red-100';
  };

  const getGradeFromScore = (score: number) => {
    if (score >= 97) return 'A+';
    if (score >= 93) return 'A';
    if (score >= 90) return 'A-';
    if (score >= 87) return 'B+';
    if (score >= 83) return 'B';
    if (score >= 80) return 'B-';
    if (score >= 77) return 'C+';
    if (score >= 73) return 'C';
    if (score >= 70) return 'C-';
    if (score >= 67) return 'D+';
    if (score >= 65) return 'D';
    return 'F';
  };

  const getTrendIcon = (improvement: number) => {
    if (improvement > 5) return <ArrowUp className="h-4 w-4 text-green-600" />;
    if (improvement < -5) return <ArrowDown className="h-4 w-4 text-red-600" />;
    return <Minus className="h-4 w-4 text-gray-600" />;
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800 border-red-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getReadinessColor = (readiness: string) => {
    switch (readiness) {
      case 'ready': return 'text-green-600 bg-green-100';
      case 'needs_practice': return 'text-yellow-600 bg-yellow-100';
      case 'needs_significant_work': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <Card>
        <CardHeader className="text-center bg-gradient-to-r from-blue-50 to-purple-50">
          <CardTitle className="text-2xl flex items-center justify-center gap-2">
            <Trophy className="h-6 w-6 text-yellow-600" />
            {t('corrections.summaryTitle')}
          </CardTitle>
          <div className="flex items-center justify-center gap-2 mt-2">
            <span className="text-lg text-gray-700">{quizTitle}</span>
            <Badge variant="outline">{proficiencyLevel}</Badge>
          </div>
        </CardHeader>
      </Card>

      {/* Overall Performance */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            {t('corrections.overallPerformance')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="text-center p-4 bg-blue-50 rounded-lg border border-blue-200">
              <div className={`text-3xl font-bold mb-2 ${getPerformanceColor(data.overall_performance.accuracy_rate)}`}>
                {getGradeFromScore(data.overall_performance.accuracy_rate)}
              </div>
              <div className="text-sm text-gray-600">{t('corrections.grade')}</div>
              <div className="text-xs text-blue-600 mt-1">
                {data.overall_performance.accuracy_rate.toFixed(1)}%
              </div>
            </div>

            <div className="text-center p-4 bg-green-50 rounded-lg border border-green-200">
              <div className="text-3xl font-bold text-green-600 mb-2">
                {data.overall_performance.correct_answers}
              </div>
              <div className="text-sm text-gray-600">{t('corrections.correctAnswers')}</div>
              <div className="text-xs text-green-600 mt-1">
                {t('corrections.outOf')} {data.overall_performance.total_questions}
              </div>
            </div>

            <div className="text-center p-4 bg-purple-50 rounded-lg border border-purple-200">
              <div className="text-3xl font-bold text-purple-600 mb-2">
                {data.overall_performance.total_points}
              </div>
              <div className="text-sm text-gray-600">{t('corrections.pointsEarned')}</div>
              <div className="text-xs text-purple-600 mt-1">
                {t('corrections.outOf')} {data.overall_performance.max_points}
              </div>
            </div>

            <div className="text-center p-4 bg-orange-50 rounded-lg border border-orange-200">
              <div className="flex items-center justify-center gap-1 mb-2">
                <span className="text-3xl font-bold text-orange-600">
                  {Math.abs(data.overall_performance.improvement_from_last).toFixed(1)}%
                </span>
                {getTrendIcon(data.overall_performance.improvement_from_last)}
              </div>
              <div className="text-sm text-gray-600">{t('corrections.improvement')}</div>
              <div className="text-xs text-orange-600 mt-1">
                {data.overall_performance.improvement_from_last > 0 ? 
                  t('corrections.fromLast') : t('corrections.fromLast')}
              </div>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>{t('corrections.overallAccuracy')}</span>
              <span className="font-medium">{data.overall_performance.accuracy_rate.toFixed(1)}%</span>
            </div>
            <Progress value={data.overall_performance.accuracy_rate} className="h-3" />
          </div>
        </CardContent>
      </Card>

      {/* Detailed Analysis Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            {t('corrections.overview')}
          </TabsTrigger>
          <TabsTrigger value="strengths" className="flex items-center gap-2">
            <Star className="h-4 w-4" />
            {t('corrections.strengths')}
          </TabsTrigger>
          <TabsTrigger value="improvements" className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            {t('corrections.improvements')}
          </TabsTrigger>
          <TabsTrigger value="insights" className="flex items-center gap-2">
            <Brain className="h-4 w-4" />
            {t('corrections.insights')}
          </TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          {/* Question Type Performance */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <PieChart className="h-5 w-5" />
                {t('corrections.questionTypePerformance')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {data.question_type_performance.map((performance, index) => (
                  <div key={index} className="space-y-2">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{t(`quiz.type.${performance.type}`)}</span>
                        <Badge variant="outline">{performance.total} {t('corrections.questions')}</Badge>
                        {performance.improvement_needed && (
                          <Badge variant="destructive" className="text-xs">
                            {t('corrections.needsWork')}
                          </Badge>
                        )}
                      </div>
                      <span className="font-medium">{performance.accuracy.toFixed(1)}%</span>
                    </div>
                    <Progress value={performance.accuracy} className="h-2" />
                    <div className="flex justify-between text-xs text-gray-600">
                      <span>{performance.correct} {t('corrections.correct')}</span>
                      {performance.partial > 0 && (
                        <span>{performance.partial} {t('corrections.partial')}</span>
                      )}
                      <span>{performance.total - performance.correct - performance.partial} {t('corrections.incorrect')}</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Comparative Analysis */}
          {showComparative && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  {t('corrections.comparativeAnalysis')}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center p-4 border rounded-lg">
                    <div className="text-2xl font-bold text-blue-600 mb-2">
                      {data.comparative_analysis.your_percentile}th
                    </div>
                    <div className="text-sm text-gray-600">{t('corrections.percentile')}</div>
                    <div className="text-xs text-blue-600 mt-1">
                      {t('corrections.betterThan')} {data.comparative_analysis.your_percentile}% {t('corrections.ofClass')}
                    </div>
                  </div>

                  <div className="text-center p-4 border rounded-lg">
                    <div className="text-2xl font-bold text-green-600 mb-2">
                      {data.comparative_analysis.class_average.toFixed(1)}%
                    </div>
                    <div className="text-sm text-gray-600">{t('corrections.classAverage')}</div>
                    <div className={`text-xs mt-1 ${
                      data.overall_performance.accuracy_rate > data.comparative_analysis.class_average 
                        ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {data.overall_performance.accuracy_rate > data.comparative_analysis.class_average 
                        ? t('corrections.aboveAverage') : t('corrections.belowAverage')}
                    </div>
                  </div>

                  <div className="text-center p-4 border rounded-lg">
                    <div className="text-2xl font-bold text-purple-600 mb-2">
                      {data.comparative_analysis.time_efficiency.efficiency_rating}
                    </div>
                    <div className="text-sm text-gray-600">{t('corrections.timeEfficiency')}</div>
                    <div className="text-xs text-purple-600 mt-1">
                      {data.comparative_analysis.time_efficiency.your_time}m vs {data.comparative_analysis.time_efficiency.average_time}m {t('corrections.average')}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Strengths Tab */}
        <TabsContent value="strengths" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Star className="h-5 w-5 text-yellow-600" />
                {t('corrections.yourStrengths')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {data.strength_areas.map((strength, index) => (
                  <div key={index} className="p-4 bg-green-50 border border-green-200 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium text-green-800">{strength.area}</h4>
                      <Badge className="bg-green-100 text-green-800">{strength.score}%</Badge>
                    </div>
                    <p className="text-sm text-green-700 mb-2">{strength.description}</p>
                    <div className="text-xs text-green-600">
                      {strength.questions} {t('corrections.questionsInArea')}
                    </div>
                  </div>
                ))}
              </div>

              {data.strength_areas.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <Lightbulb className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                  <p>{t('corrections.noStrongAreasYet')}</p>
                  <p className="text-sm mt-2">{t('corrections.keepPracticing')}</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Improvements Tab */}
        <TabsContent value="improvements" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-blue-600" />
                {t('corrections.areasForImprovement')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {data.improvement_areas.map((area, index) => (
                  <div key={index} className="p-4 border rounded-lg">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h4 className="font-medium text-gray-800">{area.area}</h4>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant="outline" className={getPriorityColor(area.priority)}>
                            {t(`corrections.priority.${area.priority}`)}
                          </Badge>
                          <span className="text-sm text-gray-600">
                            {area.estimated_study_time}
                          </span>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm text-gray-600">{t('corrections.current')}</div>
                        <div className="font-bold text-red-600">{area.current_score}%</div>
                        <div className="text-xs text-gray-500">
                          {t('corrections.target')}: {area.target_score}%
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2 mb-3">
                      <div className="flex justify-between text-sm">
                        <span>{t('corrections.progress')}</span>
                        <span>{area.current_score}% / {area.target_score}%</span>
                      </div>
                      <Progress value={(area.current_score / area.target_score) * 100} className="h-2" />
                    </div>

                    <div className="space-y-2">
                      <h5 className="font-medium text-sm text-gray-800">{t('corrections.suggestions')}:</h5>
                      <ul className="space-y-1">
                        {area.suggestions.map((suggestion, suggestionIndex) => (
                          <li key={suggestionIndex} className="text-sm text-gray-700 flex items-start gap-2">
                            <span className="text-blue-600 mt-1">•</span>
                            <span>{suggestion}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Study Recommendations */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="h-5 w-5 text-purple-600" />
                {t('corrections.studyRecommendations')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <h4 className="font-medium text-blue-800 mb-2">{t('corrections.immediateFocus')}</h4>
                  <ul className="space-y-1">
                    {data.study_recommendations.immediate_focus.map((item, index) => (
                      <li key={index} className="text-sm text-blue-700 flex items-start gap-2">
                        <Zap className="h-4 w-4 text-blue-600 mt-0.5" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                  <h4 className="font-medium text-green-800 mb-2">{t('corrections.longTermGoals')}</h4>
                  <ul className="space-y-1">
                    {data.study_recommendations.long_term_goals.map((goal, index) => (
                      <li key={index} className="text-sm text-green-700 flex items-start gap-2">
                        <Target className="h-4 w-4 text-green-600 mt-0.5" />
                        <span>{goal}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="flex items-center justify-between p-4 bg-gray-50 border border-gray-200 rounded-lg">
                  <div>
                    <h4 className="font-medium text-gray-800">{t('corrections.nextQuizReadiness')}</h4>
                    <p className="text-sm text-gray-600 mt-1">
                      {t('corrections.estimatedStudyTime')}: {data.study_recommendations.estimated_study_time}
                    </p>
                  </div>
                  <Badge className={getReadinessColor(data.study_recommendations.next_quiz_readiness)}>
                    {t(`corrections.readiness.${data.study_recommendations.next_quiz_readiness}`)}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Insights Tab */}
        <TabsContent value="insights" className="space-y-6">
          {showDetailedInsights && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Brain className="h-5 w-5 text-purple-600" />
                  {t('corrections.learningInsights')}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {data.learning_insights.map((insight, index) => (
                    <div key={index} className={`p-4 rounded-lg border-l-4 ${
                      insight.type === 'strength' ? 'border-l-green-500 bg-green-50' :
                      insight.type === 'weakness' ? 'border-l-red-500 bg-red-50' :
                      insight.type === 'trend' ? 'border-l-blue-500 bg-blue-50' :
                      'border-l-purple-500 bg-purple-50'
                    }`}>
                      <div className="flex items-start justify-between mb-2">
                        <h4 className="font-medium text-gray-800">{insight.title}</h4>
                        <div className="flex items-center gap-1">
                          <Star className="h-4 w-4 text-yellow-500" />
                          <span className="text-sm text-gray-600">{insight.confidence}%</span>
                        </div>
                      </div>
                      <p className="text-sm text-gray-700 mb-3">{insight.description}</p>
                      
                      {insight.action_items && insight.action_items.length > 0 && (
                        <div>
                          <h5 className="font-medium text-sm text-gray-800 mb-2">{t('corrections.actionItems')}:</h5>
                          <ul className="space-y-1">
                            {insight.action_items.map((action, actionIndex) => (
                              <li key={actionIndex} className="text-sm text-gray-700 flex items-start gap-2">
                                <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5" />
                                <span>{action}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>

      {/* Action Buttons */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-wrap gap-3 justify-center">
            {onViewDetailedCorrections && (
              <Button
                onClick={onViewDetailedCorrections}
                variant="outline"
                className="flex items-center gap-2"
              >
                <BookOpen className="h-4 w-4" />
                {t('corrections.viewDetailedCorrections')}
              </Button>
            )}
            
            {onStartStudyPlan && (
              <Button
                onClick={onStartStudyPlan}
                className="bg-academy-green hover:bg-academy-green/90 flex items-center gap-2"
              >
                <TrendingUp className="h-4 w-4" />
                {t('corrections.startStudyPlan')}
              </Button>
            )}
            
            <Button
              variant="outline"
              className="flex items-center gap-2"
              onClick={() => window.print()}
            >
              <BarChart3 className="h-4 w-4" />
              {t('corrections.printSummary')}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};