<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class AnalyticsResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     */
    public function toArray(Request $request): array
    {
        return [
            'overview' => $this->formatOverview($this->resource['overview'] ?? []),
            'performance_trends' => $this->formatPerformanceTrends($this->resource['performance_trends'] ?? []),
            'proficiency_breakdown' => $this->formatProficiencyBreakdown($this->resource['proficiency_breakdown'] ?? []),
            'question_type_performance' => $this->formatQuestionTypePerformance($this->resource['question_type_performance'] ?? []),
            'improvement_areas' => $this->formatImprovementAreas($this->resource['improvement_areas'] ?? []),
            'achievements' => $this->formatAchievements($this->resource['achievements'] ?? []),
            'time_analysis' => $this->formatTimeAnalysis($this->resource['time_analysis'] ?? []),
        ];
    }

    /**
     * Format overview data
     */
    private function formatOverview(array $overview): array
    {
        return [
            'total_quizzes_taken' => $overview['total_quizzes_taken'] ?? 0,
            'unique_quizzes' => $overview['unique_quizzes'] ?? 0,
            'pass_rate' => $overview['pass_rate'] ?? 0,
            'average_score' => $overview['average_score'] ?? 0,
            'total_time_spent_hours' => $overview['total_time_spent_hours'] ?? 0,
            'current_streak' => $overview['current_streak'] ?? 0,
            'best_score' => $overview['best_score'] ?? 0,
            'recent_trend' => $overview['recent_trend'] ?? 'no_data',
            'grade_distribution' => $overview['grade_distribution'] ?? [],
            'performance_level' => $this->determinePerformanceLevel($overview['average_score'] ?? 0),
        ];
    }

    /**
     * Format performance trends data
     */
    private function formatPerformanceTrends(array $trends): array
    {
        return collect($trends)->map(function ($trend) {
            return [
                'period' => $trend['period'],
                'average_score' => $trend['average_score'],
                'quiz_count' => $trend['quiz_count'],
                'pass_rate' => $trend['pass_rate'],
                'improvement' => $trend['improvement'] ?? 0,
                'trend_indicator' => $this->getTrendIndicator($trend['improvement'] ?? 0),
            ];
        })->toArray();
    }

    /**
     * Format proficiency breakdown data
     */
    private function formatProficiencyBreakdown(array $breakdown): array
    {
        $formatted = [];
        
        foreach ($breakdown as $level => $data) {
            $formatted[$level] = [
                'quiz_count' => $data['quiz_count'],
                'average_score' => $data['average_score'],
                'pass_rate' => $data['pass_rate'],
                'best_score' => $data['best_score'],
                'recent_performance' => $data['recent_performance'] ?? [],
                'mastery_level' => $this->determineMasteryLevel($data['pass_rate'], $data['quiz_count']),
                'recommendation' => $this->getLevelRecommendation($level, $data['pass_rate']),
            ];
        }
        
        return $formatted;
    }

    /**
     * Format question type performance data
     */
    private function formatQuestionTypePerformance(array $performance): array
    {
        $formatted = [];
        
        foreach ($performance as $type => $data) {
            $formatted[$type] = [
                'total_questions' => $data['total_questions'],
                'correct_answers' => $data['correct_answers'],
                'accuracy_rate' => $data['accuracy_rate'],
                'partial_credit_rate' => $data['partial_credit_rate'] ?? 0,
                'average_points' => $data['average_points'],
                'strength_level' => $data['strength_level'],
                'improvement_potential' => $this->calculateImprovementPotential($data['accuracy_rate']),
                'practice_recommendation' => $this->getQuestionTypeRecommendation($type, $data['accuracy_rate']),
            ];
        }
        
        return $formatted;
    }

    /**
     * Format improvement areas data
     */
    private function formatImprovementAreas(array $areas): array
    {
        return collect($areas)->map(function ($area) {
            return [
                'area' => $area['area'],
                'type' => $area['type'] ?? null,
                'level' => $area['level'] ?? null,
                'current_performance' => $area['current_performance'],
                'suggestion' => $area['suggestion'],
                'priority' => $area['priority'],
                'priority_score' => $this->getPriorityScore($area['priority']),
                'estimated_improvement_time' => $this->estimateImprovementTime($area),
            ];
        })->sortByDesc('priority_score')->values()->toArray();
    }

    /**
     * Format achievements data
     */
    private function formatAchievements(array $achievements): array
    {
        return collect($achievements)->map(function ($achievement) {
            return [
                'type' => $achievement['type'],
                'title' => $achievement['title'],
                'description' => $achievement['description'],
                'count' => $achievement['count'] ?? null,
                'level' => $achievement['level'] ?? null,
                'earned_date' => now()->toDateString(), // This would be actual earned date
                'rarity' => $this->calculateAchievementRarity($achievement['type']),
                'points' => $this->getAchievementPoints($achievement['type']),
            ];
        })->toArray();
    }

    /**
     * Format time analysis data
     */
    private function formatTimeAnalysis(array $timeAnalysis): array
    {
        return [
            'needs_improvement' => $timeAnalysis['needs_improvement'] ?? false,
            'efficiency_score' => $timeAnalysis['efficiency_score'],
            'suggestion' => $timeAnalysis['suggestion'] ?? '',
            'time_distribution' => $timeAnalysis['time_distribution'] ?? [],
            'efficiency_rating' => $this->getEfficiencyRating($timeAnalysis['efficiency_score']),
            'time_management_tips' => $this->getTimeManagementTips($timeAnalysis['efficiency_score']),
        ];
    }

    /**
     * Helper methods for data enhancement
     */
    private function determinePerformanceLevel(float $averageScore): string
    {
        if ($averageScore >= 90) return 'excellent';
        if ($averageScore >= 80) return 'good';
        if ($averageScore >= 70) return 'satisfactory';
        if ($averageScore >= 60) return 'needs_improvement';
        return 'requires_attention';
    }

    private function getTrendIndicator(float $improvement): string
    {
        if ($improvement > 5) return 'strong_improvement';
        if ($improvement > 0) return 'slight_improvement';
        if ($improvement < -5) return 'declining';
        if ($improvement < 0) return 'slight_decline';
        return 'stable';
    }

    private function determineMasteryLevel(float $passRate, int $quizCount): string
    {
        if ($quizCount < 3) return 'insufficient_data';
        if ($passRate >= 90) return 'mastered';
        if ($passRate >= 80) return 'proficient';
        if ($passRate >= 70) return 'developing';
        return 'struggling';
    }

    private function getLevelRecommendation(string $level, float $passRate): string
    {
        if ($passRate >= 85) {
            $nextLevel = $this->getNextLevel($level);
            return $nextLevel ? "Ready to advance to {$nextLevel}" : "Excellent mastery of {$level}";
        }
        
        if ($passRate >= 70) {
            return "Continue practicing {$level} level materials";
        }
        
        return "Focus on strengthening {$level} fundamentals";
    }

    private function getNextLevel(string $level): ?string
    {
        $levels = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];
        $currentIndex = array_search($level, $levels);
        
        return $currentIndex !== false && $currentIndex < count($levels) - 1 
            ? $levels[$currentIndex + 1] 
            : null;
    }

    private function calculateImprovementPotential(float $accuracyRate): string
    {
        if ($accuracyRate >= 90) return 'minimal';
        if ($accuracyRate >= 75) return 'moderate';
        if ($accuracyRate >= 60) return 'significant';
        return 'high';
    }

    private function getQuestionTypeRecommendation(string $type, float $accuracyRate): string
    {
        $recommendations = [
            'multiple_choice' => [
                'high' => 'Practice elimination strategies and careful reading',
                'moderate' => 'Review common distractors and practice more',
                'low' => 'Focus on understanding question patterns'
            ],
            'fill_blank' => [
                'high' => 'Expand vocabulary and practice context clues',
                'moderate' => 'Review grammar rules and word forms',
                'low' => 'Start with basic vocabulary building'
            ],
            'short_answer' => [
                'high' => 'Practice concise and complete responses',
                'moderate' => 'Work on key point identification',
                'low' => 'Focus on understanding question requirements'
            ],
            'essay' => [
                'high' => 'Refine argumentation and structure',
                'moderate' => 'Practice organizing ideas clearly',
                'low' => 'Start with basic paragraph structure'
            ]
        ];

        $level = $accuracyRate >= 80 ? 'high' : ($accuracyRate >= 60 ? 'moderate' : 'low');
        
        return $recommendations[$type][$level] ?? 'Continue practicing this question type';
    }

    private function getPriorityScore(string $priority): int
    {
        return match ($priority) {
            'high' => 3,
            'medium' => 2,
            'low' => 1,
            default => 0
        };
    }

    private function estimateImprovementTime(array $area): string
    {
        $performance = $area['current_performance'];
        $priority = $area['priority'];
        
        if ($priority === 'high' && $performance < 50) {
            return '4-6 weeks with focused practice';
        }
        
        if ($priority === 'medium' && $performance < 70) {
            return '2-4 weeks with regular practice';
        }
        
        return '1-2 weeks with targeted practice';
    }

    private function calculateAchievementRarity(string $type): string
    {
        return match ($type) {
            'perfect_scores' => 'rare',
            'improvement_streak' => 'uncommon',
            'level_mastery' => 'common',
            default => 'common'
        };
    }

    private function getAchievementPoints(string $type): int
    {
        return match ($type) {
            'perfect_scores' => 100,
            'improvement_streak' => 50,
            'level_mastery' => 75,
            default => 25
        };
    }

    private function getEfficiencyRating(float $efficiencyScore): string
    {
        if ($efficiencyScore <= 30) return 'very_fast';
        if ($efficiencyScore <= 60) return 'efficient';
        if ($efficiencyScore <= 85) return 'adequate';
        return 'needs_improvement';
    }

    private function getTimeManagementTips(?float $efficiencyScore): array
    {
        if (!$efficiencyScore) {
            return ['Take timed practice quizzes to improve time awareness'];
        }

        if ($efficiencyScore <= 30) {
            return [
                'Take more time to review your answers',
                'Read questions more carefully',
                'Double-check your work before submitting'
            ];
        }

        if ($efficiencyScore >= 95) {
            return [
                'Practice working more efficiently',
                'Use time management techniques',
                'Prioritize difficult questions first'
            ];
        }

        return [
            'Your time management is good',
            'Continue maintaining your current pace',
            'Focus on accuracy over speed'
        ];
    }
}¬@:::