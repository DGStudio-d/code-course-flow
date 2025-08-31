<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ClassAnalyticsResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     */
    public function toArray(Request $request): array
    {
        return [
            'class_overview' => $this->formatClassOverview($this->resource['class_overview'] ?? []),
            'student_rankings' => $this->formatStudentRankings($this->resource['student_rankings'] ?? []),
            'quiz_effectiveness' => $this->formatQuizEffectiveness($this->resource['quiz_effectiveness'] ?? []),
            'question_difficulty' => $this->formatQuestionDifficulty($this->resource['question_difficulty'] ?? []),
            'engagement_metrics' => $this->formatEngagementMetrics($this->resource['engagement_metrics'] ?? []),
            'progress_tracking' => $this->formatProgressTracking($this->resource['progress_tracking'] ?? []),
            'common_mistakes' => $this->formatCommonMistakes($this->resource['common_mistakes'] ?? []),
            'insights' => $this->generateClassInsights(),
        ];
    }

    /**
     * Format class overview data
     */
    private function formatClassOverview(array $overview): array
    {
        return [
            'total_students' => $overview['total_students'] ?? 0,
            'active_students' => $overview['active_students'] ?? 0,
            'participation_rate' => $overview['participation_rate'] ?? 0,
            'total_submissions' => $overview['total_submissions'] ?? 0,
            'average_class_score' => $overview['average_class_score'] ?? 0,
            'class_pass_rate' => $overview['class_pass_rate'] ?? 0,
            'top_performers' => $overview['top_performers'] ?? [],
            'struggling_students' => $overview['struggling_students'] ?? [],
            'class_performance_level' => $this->determineClassPerformanceLevel($overview['average_class_score'] ?? 0),
            'engagement_level' => $this->determineEngagementLevel($overview['participation_rate'] ?? 0),
        ];
    }

    /**
     * Format student rankings data
     */
    private function formatStudentRankings(array $rankings): array
    {
        return collect($rankings)->map(function ($student, $index) {
            return [
                'rank' => $index + 1,
                'student_id' => $student['student_id'],
                'student_name' => $student['student_name'],
                'average_score' => $student['average_score'],
                'total_quizzes' => $student['total_quizzes'] ?? 0,
                'pass_rate' => $student['pass_rate'] ?? 0,
                'improvement_trend' => $student['improvement_trend'] ?? 'stable',
                'performance_badge' => $this->getPerformanceBadge($index, $student['average_score']),
                'trend_indicator' => $this->getTrendIndicator($student['improvement_trend'] ?? 'stable'),
            ];
        })->toArray();
    }

    /**
     * Format quiz effectiveness data
     */
    private function formatQuizEffectiveness(array $effectiveness): array
    {
        return collect($effectiveness)->map(function ($quiz) {
            return [
                'quiz_id' => $quiz['quiz_id'],
                'quiz_title' => $quiz['quiz_title'],
                'completion_rate' => $quiz['completion_rate'] ?? 0,
                'average_score' => $quiz['average_score'] ?? 0,
                'pass_rate' => $quiz['pass_rate'] ?? 0,
                'difficulty_rating' => $quiz['difficulty_rating'] ?? 'moderate',
                'engagement_score' => $quiz['engagement_score'] ?? 0,
                'effectiveness_rating' => $quiz['effectiveness_rating'] ?? 0,
                'effectiveness_level' => $this->getEffectivenessLevel($quiz['effectiveness_rating'] ?? 0),
                'recommendations' => $this->getQuizRecommendations($quiz),
            ];
        })->toArray();
    }

    /**
     * Format question difficulty data
     */
    private function formatQuestionDifficulty(array $difficulty): array
    {
        return collect($difficulty)->map(function ($question) {
            return [
                'question_id' => $question['question_id'],
                'quiz_title' => $question['quiz_title'] ?? 'Unknown Quiz',
                'question_type' => $question['question_type'],
                'question_preview' => $question['question_text'] ?? '',
                'total_attempts' => $question['total_attempts'] ?? 0,
                'correct_rate' => $question['correct_rate'] ?? 0,
                'difficulty_level' => $question['difficulty_level'] ?? 'moderate',
                'average_points_earned' => $question['average_points_earned'] ?? 0,
                'needs_review' => $question['needs_review'] ?? false,
                'difficulty_score' => $this->calculateDifficultyScore($question['correct_rate'] ?? 0),
                'improvement_suggestions' => $this->getQuestionImprovementSuggestions($question),
            ];
        })->toArray();
    }

    /**
     * Format engagement metrics data
     */
    private function formatEngagementMetrics(array $metrics): array
    {
        return [
            'overall_participation' => $metrics['overall_participation'] ?? 0,
            'average_attempts_per_student' => $metrics['average_attempts_per_student'] ?? 0,
            'weekly_engagement' => $metrics['weekly_engagement'] ?? [],
            'peak_activity_day' => $metrics['peak_activity_day'] ?? 'No data',
            'retention_rate' => $metrics['retention_rate'] ?? 0,
            'engagement_trend' => $this->calculateEngagementTrend($metrics['weekly_engagement'] ?? []),
            'engagement_recommendations' => $this->getEngagementRecommendations($metrics),
        ];
    }

    /**
     * Format progress tracking data
     */
    private function formatProgressTracking(array $progress): array
    {
        return [
            'monthly_progress' => collect($progress['monthly_progress'] ?? [])->map(function ($month) {
                return [
                    'period' => $month['period'] ?? 'Unknown',
                    'average_score' => $month['average_score'] ?? 0,
                    'pass_rate' => $month['pass_rate'] ?? 0,
                    'participation' => $month['participation'] ?? 0,
                    'total_submissions' => $month['total_submissions'] ?? 0,
                    'improvement_from_previous' => $this->calculateMonthlyImprovement($month),
                ];
            })->toArray(),
            'overall_trend' => $progress['overall_trend'] ?? 'stable',
            'improvement_rate' => $progress['improvement_rate'] ?? 0,
            'trend_analysis' => $this->analyzeTrend($progress['overall_trend'] ?? 'stable'),
            'projected_performance' => $this->projectFuturePerformance($progress),
        ];
    }

    /**
     * Format common mistakes data
     */
    private function formatCommonMistakes(array $mistakes): array
    {
        return collect($mistakes)->map(function ($mistake) {
            return [
                'question_id' => $mistake['question_id'],
                'question_preview' => $mistake['question_text'] ?? '',
                'question_type' => $mistake['question_type'] ?? 'unknown',
                'mistake_count' => $mistake['mistake_count'] ?? 0,
                'mistake_rate' => $mistake['mistake_rate'] ?? 0,
                'common_wrong_answers' => $mistake['common_wrong_answers'] ?? [],
                'severity_level' => $this->getMistakeSeverityLevel($mistake['mistake_rate'] ?? 0),
                'teaching_focus' => $this->getTeachingFocus($mistake),
                'remediation_suggestions' => $this->getRemediationSuggestions($mistake),
            ];
        })->toArray();
    }

    /**
     * Generate class insights
     */
    private function generateClassInsights(): array
    {
        $overview = $this->resource['class_overview'] ?? [];
        $rankings = $this->resource['student_rankings'] ?? [];
        $engagement = $this->resource['engagement_metrics'] ?? [];
        
        $insights = [];
        
        // Performance insights
        if (($overview['average_class_score'] ?? 0) >= 85) {
            $insights[] = [
                'type' => 'positive',
                'category' => 'performance',
                'message' => 'Class is performing exceptionally well with high average scores',
                'action' => 'Consider introducing more challenging material'
            ];
        } elseif (($overview['average_class_score'] ?? 0) < 70) {
            $insights[] = [
                'type' => 'concern',
                'category' => 'performance',
                'message' => 'Class average is below target - students may need additional support',
                'action' => 'Review teaching methods and provide extra practice materials'
            ];
        }
        
        // Engagement insights
        if (($engagement['overall_participation'] ?? 0) < 70) {
            $insights[] = [
                'type' => 'concern',
                'category' => 'engagement',
                'message' => 'Low participation rate indicates potential engagement issues',
                'action' => 'Consider gamification or interactive elements to boost engagement'
            ];
        }
        
        // Progress insights
        $progressTrend = $this->resource['progress_tracking']['overall_trend'] ?? 'stable';
        if ($progressTrend === 'improving') {
            $insights[] = [
                'type' => 'positive',
                'category' => 'progress',
                'message' => 'Class is showing consistent improvement over time',
                'action' => 'Continue current teaching approach and maintain momentum'
            ];
        } elseif ($progressTrend === 'declining') {
            $insights[] = [
                'type' => 'concern',
                'category' => 'progress',
                'message' => 'Class performance is declining - intervention needed',
                'action' => 'Identify struggling students and adjust teaching strategy'
            ];
        }
        
        return $insights;
    }

    /**
     * Helper methods
     */
    private function determineClassPerformanceLevel(float $averageScore): string
    {
        if ($averageScore >= 90) return 'exceptional';
        if ($averageScore >= 80) return 'strong';
        if ($averageScore >= 70) return 'satisfactory';
        if ($averageScore >= 60) return 'needs_support';
        return 'requires_intervention';
    }

    private function determineEngagementLevel(float $participationRate): string
    {
        if ($participationRate >= 90) return 'highly_engaged';
        if ($participationRate >= 75) return 'well_engaged';
        if ($participationRate >= 60) return 'moderately_engaged';
        if ($participationRate >= 40) return 'low_engagement';
        return 'disengaged';
    }

    private function getPerformanceBadge(int $rank, float $score): string
    {
        if ($rank === 0 && $score >= 95) return 'top_performer';
        if ($rank < 3 && $score >= 85) return 'high_achiever';
        if ($score >= 80) return 'strong_student';
        if ($score >= 70) return 'steady_progress';
        return 'needs_support';
    }

    private function getTrendIndicator(string $trend): string
    {
        return match ($trend) {
            'improving' => '📈',
            'declining' => '📉',
            'stable' => '➡️',
            default => '❓'
        };
    }

    private function getEffectivenessLevel(float $rating): string
    {
        if ($rating >= 80) return 'highly_effective';
        if ($rating >= 70) return 'effective';
        if ($rating >= 60) return 'moderately_effective';
        return 'needs_improvement';
    }

    private function getQuizRecommendations(array $quiz): array
    {
        $recommendations = [];
        
        if (($quiz['completion_rate'] ?? 0) < 70) {
            $recommendations[] = 'Consider reducing quiz length or difficulty';
        }
        
        if (($quiz['average_score'] ?? 0) < 60) {
            $recommendations[] = 'Review question clarity and provide additional study materials';
        }
        
        if (($quiz['engagement_score'] ?? 0) < 50) {
            $recommendations[] = 'Add more interactive or varied question types';
        }
        
        return $recommendations;
    }

    private function calculateDifficultyScore(float $correctRate): int
    {
        return (int) round((100 - $correctRate) / 10);
    }

    private function getQuestionImprovementSuggestions(array $question): array
    {
        $suggestions = [];
        
        if (($question['correct_rate'] ?? 0) < 40) {
            $suggestions[] = 'Consider rewording the question for clarity';
            $suggestions[] = 'Review if the question matches the learning objective';
        }
        
        if (($question['correct_rate'] ?? 0) > 95) {
            $suggestions[] = 'Question may be too easy - consider increasing difficulty';
        }
        
        return $suggestions;
    }

    private function calculateEngagementTrend(array $weeklyEngagement): string
    {
        if (count($weeklyEngagement) < 2) return 'insufficient_data';
        
        $recent = collect($weeklyEngagement)->slice(-2)->avg('submissions');
        $previous = collect($weeklyEngagement)->slice(-4, 2)->avg('submissions');
        
        if ($recent > $previous * 1.1) return 'increasing';
        if ($recent < $previous * 0.9) return 'decreasing';
        return 'stable';
    }

    private function getEngagementRecommendations(array $metrics): array
    {
        $recommendations = [];
        
        if (($metrics['overall_participation'] ?? 0) < 70) {
            $recommendations[] = 'Send reminders to inactive students';
            $recommendations[] = 'Consider offering incentives for participation';
        }
        
        if (($metrics['retention_rate'] ?? 0) < 80) {
            $recommendations[] = 'Follow up with students who haven\'t participated recently';
        }
        
        return $recommendations;
    }

    private function calculateMonthlyImprovement(array $month): float
    {
        // This would calculate improvement from previous month
        // For now, return a placeholder
        return 0.0;
    }

    private function analyzeTrend(string $trend): array
    {
        return match ($trend) {
            'improving' => [
                'status' => 'positive',
                'description' => 'Class performance is consistently improving',
                'confidence' => 'high'
            ],
            'declining' => [
                'status' => 'concerning',
                'description' => 'Class performance is declining and needs attention',
                'confidence' => 'high'
            ],
            'stable' => [
                'status' => 'neutral',
                'description' => 'Class performance is stable with minimal variation',
                'confidence' => 'medium'
            ],
            default => [
                'status' => 'unknown',
                'description' => 'Insufficient data to determine trend',
                'confidence' => 'low'
            ]
        };
    }

    private function projectFuturePerformance(array $progress): array
    {
        // This would use trend analysis to project future performance
        return [
            'next_month_prediction' => 'stable',
            'confidence_level' => 'medium',
            'factors' => ['current_trend', 'historical_data', 'engagement_level']
        ];
    }

    private function getMistakeSeverityLevel(float $mistakeRate): string
    {
        if ($mistakeRate >= 70) return 'critical';
        if ($mistakeRate >= 50) return 'high';
        if ($mistakeRate >= 30) return 'moderate';
        return 'low';
    }

    private function getTeachingFocus(array $mistake): string
    {
        $type = $mistake['question_type'] ?? 'unknown';
        
        return match ($type) {
            'multiple_choice' => 'Focus on reading comprehension and elimination strategies',
            'fill_blank' => 'Emphasize vocabulary and context clues',
            'short_answer' => 'Practice concise and complete responses',
            'essay' => 'Work on structure and argumentation',
            default => 'Review fundamental concepts'
        };
    }

    private function getRemediationSuggestions(array $mistake): array
    {
        return [
            'Provide additional practice materials for this topic',
            'Consider one-on-one tutoring for struggling students',
            'Review the concept in the next class session',
            'Create supplementary exercises targeting this skill'
        ];
    }
}