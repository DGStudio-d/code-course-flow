import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  Calendar,
  Clock,
  Target,
  TrendingUp,
  TrendingDown,
  Eye,
  Download,
  Filter,
  Search,
  BarChart3,
  Award,
  CheckCircle2,
  XCircle,
  AlertCircle,
  BookOpen,
  Users,
  Zap,
  RefreshCw,
  ArrowUp,
  ArrowDown,
  Minus,
  Star
} from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useQuery } from '@tanstack/react-query';

// Enhanced interfaces
interface QuizAttempt {
  id: string;
  quiz_id: string;
  quiz_title: string;
  quiz_proficiency_level: string;
  program_name: string;
  attempt_number: number;
  submitted_at: string;
  total_score: number;
  max_possible_score: number;
  percentage: number;
  is_passed: boolean;
  time_taken_minutes?: number;
  time_limit_minutes?: number;
  grade_letter: string;
  correction_status: 'pending' | 'available' | 'reviewed';
  performance_summary: {
    total_questions: number;
    correct_answers: number;
    incorrect_answers: number;
    partial_credit_answers: number;
    accuracy_rate: number;
  };
  question_type_breakdown: Record<string, {
    total: number;
    correct: number;
    accuracy: number;
  }>;
  improvement_from_previous?: number;
  class_rank?: number;
  class_percentile?: number;
}

interface QuizHistoryStats {
  total_attempts: number;
  total_quizzes: number;
  average_score: number;
  best_score: number;
  improvement_trend: 'improving' | 'stable' | 'declining';
  current_streak: number;
  total_time_spent: number;
  favorite_proficiency_level: string;
  strongest_question_type: string;
  weakest_question_type: string;
}

interface QuizHistoryProps {
  studentId?: string;
  programId?: string;
  onViewAttempt?: (attemptId: string) => void;
  onRetakeQuiz?: (quizId: string) => void;
  showComparativeData?: boolean;
}

export const QuizHistory: React.FC<QuizHistoryProps> = ({
  studentId,
  programId,
  onViewAttempt,
  onRetakeQuiz,
  showComparativeData = true
}) => {
  const { t } = useLanguage();

  // State management
  const [searchTerm, setSearchTerm] = useState('');
  const [filterLevel, setFilterLevel] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('date_desc');
  const [selectedTimeframe, setSelectedTimeframe] = useState<string>('all');
  const [activeTab, setActiveTab] = useState('attempts');

  // Fetch quiz history
  const { data: historyData, isLoading, refetch } = useQuery({
    queryKey: ['quiz-history', studentId, programId, selectedTimeframe],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (studentId) params.append('student_id', studentId);
      if (programId) params.append('program_id', programId);
      if (selectedTimeframe !== 'all') params.append('timeframe', selectedTimeframe);

      const response = await fetch(`/api/v1/student/quiz-history?${params}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });
      if (!response.ok) throw new Error('Failed to fetch quiz history');
      return response.json();
    },
  });

  const attempts: QuizAttempt[] = historyData?.data?.attempts || [];
  const stats: QuizHistoryStats = historyData?.data?.stats || {
    total_attempts: 0,
    total_quizzes: 0,
    average_score: 0,
    best_score: 0,
    improvement_trend: 'stable',
    current_streak: 0,
    total_time_spent: 0,
    favorite_proficiency_level: 'B1',
    strongest_question_type: 'multiple_choice',
    weakest_question_type: 'essay'
  };

  // Filter and sort attempts
  const filteredAttempts = attempts
    .filter(attempt => {
      const matchesSearch = attempt.quiz_title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           attempt.program_name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesLevel = filterLevel === 'all' || attempt.quiz_proficiency_level === filterLevel;
      const matchesStatus = filterStatus === 'all' || 
                           (filterStatus === 'passed' && attempt.is_passed) ||
                           (filterStatus === 'failed' && !attempt.is_passed) ||
                           (filterStatus === 'corrections' && attempt.correction_status === 'available');
      return matchesSearch && matchesLevel && matchesStatus;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'date_desc':
          return new Date(b.submitted_at).getTime() - new Date(a.submitted_at).getTime();
        case 'date_asc':
          return new Date(a.submitted_at).getTime() - new Date(b.submitted_at).getTime();
        case 'score_desc':
          return b.percentage - a.percentage;
        case 'score_asc':
          return a.percentage - b.percentage;
        case 'title':
          return a.quiz_title.localeCompare(b.quiz_title);
        default:
          return 0;
      }
    });

  const getGradeColor = (grade: string) => {
    if (grade.startsWith('A')) return 'text-green-600 bg-green-100';
    if (grade.startsWith('B')) return 'text-blue-600 bg-blue-100';
    if (grade.startsWith('C')) return 'text-yellow-600 bg-yellow-100';
    if (grade.startsWith('D')) return 'text-orange-600 bg-orange-100';
    return 'text-red-600 bg-red-100';
  };

  const getTrendIcon = (improvement?: number) => {
    if (!improvement) return <Minus className="h-4 w-4 text-gray-500" />;
    if (improvement > 5) return <ArrowUp className="h-4 w-4 text-green-600" />;
    if (improvement < -5) return <ArrowDown className="h-4 w-4 text-red-600" />;
    return <Minus className="h-4 w-4 text-gray-500" />;
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'available': return <Eye className="h-4 w-4 text-blue-600" />;
      case 'reviewed': return <CheckCircle2 className="h-4 w-4 text-green-600" />;
      default: return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) {
      return `${hours}h ${mins}m`;
    }
    return `${mins}m`;
  };

  const getTimeEfficiency = (timeTaken?: number, timeLimit?: number) => {
    if (!timeTaken || !timeLimit) return null;
    const efficiency = (timeTaken / timeLimit) * 100;
    if (efficiency <= 50) return { rating: 'very_fast', color: 'text-blue-600' };
    if (efficiency <= 75) return { rating: 'good_pace', color: 'text-green-600' };
    if (efficiency <= 90) return { rating: 'adequate', color: 'text-yellow-600' };
    return { rating: 'time_pressure', color: 'text-red-600' };
  };

  if (isLoading) {
    return (
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="animate-pulse">
          <Card>
            <CardContent className="p-6">
              <div className="h-8 bg-gray-300 rounded w-1/3 mb-4"></div>
              <div className="grid grid-cols-4 gap-4 mb-6">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="h-20 bg-gray-200 rounded"></div>
                ))}
              </div>
              <div className="space-y-3">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="h-16 bg-gray-200 rounded"></div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl flex items-center gap-2">
                <BookOpen className="h-6 w-6" />
                {t('history.title')}
              </CardTitle>
              <p className="text-gray-600 mt-1">{t('history.description')}</p>
            </div>
            <div className="flex items-center gap-2">
              <Select value={selectedTimeframe} onValueChange={setSelectedTimeframe}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t('history.allTime')}</SelectItem>
                  <SelectItem value="week">{t('history.thisWeek')}</SelectItem>
                  <SelectItem value="month">{t('history.thisMonth')}</SelectItem>
                  <SelectItem value="year">{t('history.thisYear')}</SelectItem>
                </SelectContent>
              </Select>
              <Button
                variant="outline"
                onClick={() => refetch()}
                className="flex items-center gap-2"
              >
                <RefreshCw className="h-4 w-4" />
                {t('history.refresh')}
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Statistics Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            {t('history.overview')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="text-center p-4 bg-blue-50 rounded-lg border border-blue-200">
              <div className="text-3xl font-bold text-blue-600">{stats.total_attempts}</div>
              <div className="text-sm text-gray-600">{t('history.totalAttempts')}</div>
              <div className="text-xs text-blue-600 mt-1">
                {stats.total_quizzes} {t('history.uniqueQuizzes')}
              </div>
            </div>

            <div className="text-center p-4 bg-green-50 rounded-lg border border-green-200">
              <div className="text-3xl font-bold text-green-600">{stats.average_score.toFixed(1)}%</div>
              <div className="text-sm text-gray-600">{t('history.averageScore')}</div>
              <div className="text-xs text-green-600 mt-1">
                {t('history.best')}: {stats.best_score}%
              </div>
            </div>

            <div className="text-center p-4 bg-purple-50 rounded-lg border border-purple-200">
              <div className="flex items-center justify-center gap-1 mb-2">
                <span className="text-3xl font-bold text-purple-600">{stats.current_streak}</span>
                {stats.improvement_trend === 'improving' && <TrendingUp className="h-5 w-5 text-green-600" />}
                {stats.improvement_trend === 'declining' && <TrendingDown className="h-5 w-5 text-red-600" />}
              </div>
              <div className="text-sm text-gray-600">{t('history.currentStreak')}</div>
              <div className="text-xs text-purple-600 mt-1">
                {t(`history.trend.${stats.improvement_trend}`)}
              </div>
            </div>

            <div className="text-center p-4 bg-orange-50 rounded-lg border border-orange-200">
              <div className="text-3xl font-bold text-orange-600">
                {formatDuration(stats.total_time_spent)}
              </div>
              <div className="text-sm text-gray-600">{t('history.totalTimeSpent')}</div>
              <div className="text-xs text-orange-600 mt-1">
                {t('history.averagePerQuiz')}: {formatDuration(Math.round(stats.total_time_spent / Math.max(stats.total_attempts, 1)))}
              </div>
            </div>
          </div>

          {/* Performance Insights */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Star className="h-4 w-4 text-yellow-600" />
                <span className="font-medium text-gray-800">{t('history.favoriteLevel')}</span>
              </div>
              <Badge variant="outline" className="text-blue-600">
                {stats.favorite_proficiency_level}
              </Badge>
            </div>

            <div className="p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle2 className="h-4 w-4 text-green-600" />
                <span className="font-medium text-gray-800">{t('history.strongestType')}</span>
              </div>
              <Badge variant="outline" className="text-green-600">
                {t(`quiz.type.${stats.strongest_question_type}`)}
              </Badge>
            </div>

            <div className="p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <AlertCircle className="h-4 w-4 text-orange-600" />
                <span className="font-medium text-gray-800">{t('history.needsWork')}</span>
              </div>
              <Badge variant="outline" className="text-orange-600">
                {t(`quiz.type.${stats.weakest_question_type}`)}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Filters and Search */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2">
              <Search className="h-4 w-4 text-gray-500" />
              <Input
                placeholder={t('history.searchQuizzes')}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-64"
              />
            </div>

            <Select value={filterLevel} onValueChange={setFilterLevel}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder={t('history.allLevels')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t('history.allLevels')}</SelectItem>
                <SelectItem value="A1">A1</SelectItem>
                <SelectItem value="A2">A2</SelectItem>
                <SelectItem value="B1">B1</SelectItem>
                <SelectItem value="B2">B2</SelectItem>
                <SelectItem value="C1">C1</SelectItem>
                <SelectItem value="C2">C2</SelectItem>
              </SelectContent>
            </Select>

            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t('history.allResults')}</SelectItem>
                <SelectItem value="passed">{t('history.passed')}</SelectItem>
                <SelectItem value="failed">{t('history.failed')}</SelectItem>
                <SelectItem value="corrections">{t('history.hasCorrections')}</SelectItem>
              </SelectContent>
            </Select>

            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="date_desc">{t('history.newestFirst')}</SelectItem>
                <SelectItem value="date_asc">{t('history.oldestFirst')}</SelectItem>
                <SelectItem value="score_desc">{t('history.highestScore')}</SelectItem>
                <SelectItem value="score_asc">{t('history.lowestScore')}</SelectItem>
                <SelectItem value="title">{t('history.alphabetical')}</SelectItem>
              </SelectContent>
            </Select>

            <div className="ml-auto text-sm text-gray-600">
              {filteredAttempts.length} {t('history.results')}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quiz Attempts List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            {t('history.quizAttempts')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredAttempts.map(attempt => {
              const timeEfficiency = getTimeEfficiency(attempt.time_taken_minutes, attempt.time_limit_minutes);
              
              return (
                <Card key={attempt.id} className={`border-l-4 ${
                  attempt.is_passed ? 'border-l-green-500' : 'border-l-red-500'
                }`}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h4 className="font-semibold text-gray-900">{attempt.quiz_title}</h4>
                          <Badge variant="outline">{attempt.quiz_proficiency_level}</Badge>
                          <Badge className={attempt.is_passed ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                            {attempt.is_passed ? t('history.passed') : t('history.failed')}
                          </Badge>
                          {attempt.attempt_number > 1 && (
                            <Badge variant="outline" className="text-blue-600">
                              {t('history.attempt')} #{attempt.attempt_number}
                            </Badge>
                          )}
                        </div>

                        <div className="flex items-center gap-6 text-sm text-gray-600 mb-3">
                          <div className="flex items-center gap-1">
                            <Calendar className="h-4 w-4" />
                            <span>{new Date(attempt.submitted_at).toLocaleDateString()}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Clock className="h-4 w-4" />
                            <span>{new Date(attempt.submitted_at).toLocaleTimeString()}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <BookOpen className="h-4 w-4" />
                            <span>{attempt.program_name}</span>
                          </div>
                          {attempt.time_taken_minutes && (
                            <div className="flex items-center gap-1">
                              <Target className="h-4 w-4" />
                              <span>{formatDuration(attempt.time_taken_minutes)}</span>
                              {timeEfficiency && (
                                <span className={`ml-1 ${timeEfficiency.color}`}>
                                  ({t(`history.${timeEfficiency.rating}`)})
                                </span>
                              )}
                            </div>
                          )}
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                          <div className="text-center p-3 bg-gray-50 rounded">
                            <div className={`text-2xl font-bold ${getGradeColor(attempt.grade_letter)}`}>
                              {attempt.grade_letter}
                            </div>
                            <div className="text-xs text-gray-600">{attempt.percentage.toFixed(1)}%</div>
                          </div>

                          <div className="text-center p-3 bg-gray-50 rounded">
                            <div className="text-2xl font-bold text-blue-600">
                              {attempt.total_score}/{attempt.max_possible_score}
                            </div>
                            <div className="text-xs text-gray-600">{t('history.points')}</div>
                          </div>

                          <div className="text-center p-3 bg-gray-50 rounded">
                            <div className="text-2xl font-bold text-green-600">
                              {attempt.performance_summary.correct_answers}
                            </div>
                            <div className="text-xs text-gray-600">
                              {t('history.correct')} / {attempt.performance_summary.total_questions}
                            </div>
                          </div>

                          <div className="text-center p-3 bg-gray-50 rounded">
                            <div className="flex items-center justify-center gap-1">
                              <span className="text-2xl font-bold text-purple-600">
                                {attempt.performance_summary.accuracy_rate.toFixed(0)}%
                              </span>
                              {getTrendIcon(attempt.improvement_from_previous)}
                            </div>
                            <div className="text-xs text-gray-600">{t('history.accuracy')}</div>
                          </div>
                        </div>

                        {/* Question Type Breakdown */}
                        <div className="mt-4 pt-4 border-t border-gray-200">
                          <div className="flex flex-wrap gap-2">
                            {Object.entries(attempt.question_type_breakdown).map(([type, data]) => (
                              <div key={type} className="flex items-center gap-2 text-xs">
                                <span className="text-gray-600">{t(`quiz.type.${type}`)}:</span>
                                <span className={`font-medium ${
                                  data.accuracy >= 80 ? 'text-green-600' : 
                                  data.accuracy >= 60 ? 'text-yellow-600' : 'text-red-600'
                                }`}>
                                  {data.correct}/{data.total} ({data.accuracy.toFixed(0)}%)
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Comparative Data */}
                        {showComparativeData && (attempt.class_rank || attempt.class_percentile) && (
                          <div className="mt-3 pt-3 border-t border-gray-200">
                            <div className="flex items-center gap-4 text-sm">
                              {attempt.class_rank && (
                                <div className="flex items-center gap-1">
                                  <Users className="h-4 w-4 text-blue-600" />
                                  <span className="text-gray-600">{t('history.classRank')}:</span>
                                  <span className="font-medium text-blue-600">#{attempt.class_rank}</span>
                                </div>
                              )}
                              {attempt.class_percentile && (
                                <div className="flex items-center gap-1">
                                  <BarChart3 className="h-4 w-4 text-purple-600" />
                                  <span className="text-gray-600">{t('history.percentile')}:</span>
                                  <span className="font-medium text-purple-600">{attempt.class_percentile}th</span>
                                </div>
                              )}
                            </div>
                          </div>
                        )}
                      </div>

                      <div className="flex flex-col gap-2 ml-4">
                        <div className="flex items-center gap-1">
                          {getStatusIcon(attempt.correction_status)}
                          <span className="text-xs text-gray-600">
                            {t(`history.corrections.${attempt.correction_status}`)}
                          </span>
                        </div>

                        <div className="flex flex-col gap-2">
                          {onViewAttempt && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => onViewAttempt(attempt.id)}
                              className="flex items-center gap-2"
                            >
                              <Eye className="h-4 w-4" />
                              {t('history.viewDetails')}
                            </Button>
                          )}

                          {onRetakeQuiz && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => onRetakeQuiz(attempt.quiz_id)}
                              className="flex items-center gap-2"
                            >
                              <RefreshCw className="h-4 w-4" />
                              {t('history.retake')}
                            </Button>
                          )}

                          <Button
                            variant="outline"
                            size="sm"
                            className="flex items-center gap-2"
                          >
                            <Download className="h-4 w-4" />
                            {t('history.export')}
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}

            {filteredAttempts.length === 0 && (
              <div className="text-center py-12 text-gray-500">
                <BookOpen className="h-16 w-16 mx-auto mb-4 text-gray-400" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">{t('history.noAttempts')}</h3>
                <p className="text-gray-600">{t('history.noAttemptsDesc')}</p>
                {(searchTerm || filterLevel !== 'all' || filterStatus !== 'all') && (
                  <Button
                    variant="outline"
                    onClick={() => {
                      setSearchTerm('');
                      setFilterLevel('all');
                      setFilterStatus('all');
                    }}
                    className="mt-4"
                  >
                    {t('history.clearFilters')}
                  </Button>
                )}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};