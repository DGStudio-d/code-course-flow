<?php

namespace App\Services;

use App\Models\User;
use App\Models\Quiz;
use App\Models\QuizSubmissions;
use App\Models\QuizQuestions;
use App\Models\SubmissionAnswers;
use App\Models\Programs;
use App\Models\Enrollment;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class AnalyticsService
{
    /**
     * Get comprehensive student performance analytics
     */
    public function getStudentPerformance(int $studentId, array $options = []): array
    {
        $timeframe = $options['timeframe'] ?? 'all'; // all, month, week, year
        $programId = $options['program_id'] ?? null;
        $proficiencyLevel = $options['proficiency_level'] ?? null;

        $query = QuizSubmissions::where('student_id', $studentId)
            ->with(['quiz', 'answers.question']);

        // Apply filters
        if ($programId) {
            $query->whereHas('quiz', fn($q) => $q->where('program_id', $programId));
        }

        if ($proficiencyLevel) {
            $query->whereHas('quiz', fn($q) => $q->where('proficiency_level', $proficiencyLevel));
        }

        if ($timeframe !== 'all') {
            $query->where('submitted_at', '>=', $this->getTimeframeStart($timeframe));
        }

        $submissions = $query->orderBy('submitted_at', 'desc')->get();

        return [
            'overview' => $this->calculateStudentOverview($submissions),
            'performance_trends' => $this->calculatePerformanceTrends($submissions),
            'proficiency_breakdown' => $this->calculateProficiencyBreakdown($submissions),
            'question_type_performance' => $this->calculateQuestionTypePerformance($submissions),
            'improvement_areas' => $this->identifyImprovementAreas($submissions),
            'achievements' => $this->calculateAchievements($submissions),
            'time_analysis' => $this->analyzeTimeManagement($submissions),
        ];
    }

    /**
     * Get class-wide analytics for teachers
     */
    public function getClassAnalytics(int $programId, array $options = []): array
    {
        $timeframe = $options['timeframe'] ?? 'all';
        $proficiencyLevel = $options['proficiency_level'] ?? null;

        $enrollments = Enrollment::where('program_id', $programId)
            ->where('status', 'active')
            ->with('student')
            ->get();

        $studentIds = $enrollments->pluck('student_id');

        $query = QuizSubmissions::whereIn('student_id', $studentIds)
            ->with(['quiz', 'student', 'answers.question']);

        if ($proficiencyLevel) {
            $query->whereHas('quiz', fn($q) => $q->where('proficiency_level', $proficiencyLevel));
        }

        if ($timeframe !== 'all') {
            $query->where('submitted_at', '>=', $this->getTimeframeStart($timeframe));
        }

        $submissions = $query->get();

        return [
            'class_overview' => $this->calculateClassOverview($submissions, $enrollments),
            'student_rankings' => $this->calculateStudentRankings($submissions, $studentIds),
            'quiz_effectiveness' => $this->analyzeQuizEffectiveness($programId, $proficiencyLevel),
            'question_difficulty' => $this->analyzeQuestionDifficulty($programId, $proficiencyLevel),
            'engagement_metrics' => $this->calculateEngagementMetrics($submissions, $enrollments),
            'progress_tracking' => $this->trackClassProgress($submissions, $enrollments),
            'common_mistakes' => $this->identifyCommonMistakes($submissions),
        ];
    }

    /**
     * Analyze individual quiz performance
     */
    public function getQuizAnalytics(int $quizId): array
    {
        $quiz = Quiz::with(['questions.options', 'submissions.answers'])->findOrFail($quizId);
        $submissions = $quiz->submissions;

        return [
            'quiz_overview' => $this->calculateQuizOverview($quiz, $submissions),
            'question_analysis' => $this->analyzeQuizQuestions($quiz),
            'performance_distribution' => $this->calculatePerformanceDistribution($submissions),
            'completion_metrics' => $this->calculateCompletionMetrics($submissions),
            'time_analysis' => $this->analyzeQuizTiming($submissions),
            'difficulty_assessment' => $this->assessQuizDifficulty($submissions),
        ];
    }

    /**
     * Calculate student overview metrics
     */
    private function calculateStudentOverview(Collection $submissions): array
    {
        if ($submissions->isEmpty()) {
            return $this->getEmptyOverview();
        }

        $totalSubmissions = $submissions->count();
        $passedSubmissions = $submissions->where('is_passed', true)->count();
        $averageScore = $submissions->avg('percentage');
        $totalTimeSpent = $submissions->sum('time_taken_minutes');
        $uniqueQuizzes = $submissions->unique('quiz_id')->count();

        $recentSubmissions = $submissions->take(5);
        $trend = $this->calculateScoreTrend($recentSubmissions);

        return [
            'total_quizzes_taken' => $totalSubmissions,
            'unique_quizzes' => $uniqueQuizzes,
            'pass_rate' => $totalSubmissions > 0 ? round(($passedSubmissions / $totalSubmissions) * 100, 1) : 0,
            'average_score' => round($averageScore, 1),
            'total_time_spent_hours' => round($totalTimeSpent / 60, 1),
            'current_streak' => $this->calculateCurrentStreak($submissions),
            'best_score' => $submissions->max('percentage'),
            'recent_trend' => $trend,
            'grade_distribution' => $this->calculateGradeDistribution($submissions),
        ];
    }

    /**
     * Calculate performance trends over time
     */
    private function calculatePerformanceTrends(Collection $submissions): array
    {
        $trends = [];
        $groupedByMonth = $submissions->groupBy(function ($submission) {
            return Carbon::parse($submission->submitted_at)->format('Y-m');
        });

        foreach ($groupedByMonth as $month => $monthSubmissions) {
            $trends[] = [
                'period' => $month,
                'average_score' => round($monthSubmissions->avg('percentage'), 1),
                'quiz_count' => $monthSubmissions->count(),
                'pass_rate' => round(($monthSubmissions->where('is_passed', true)->count() / $monthSubmissions->count()) * 100, 1),
                'improvement' => $this->calculateMonthlyImprovement($monthSubmissions),
            ];
        }

        return array_reverse($trends); // Most recent first
    }

    /**
     * Calculate proficiency level breakdown
     */
    private function calculateProficiencyBreakdown(Collection $submissions): array
    {
        $breakdown = [];
        $levels = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];

        foreach ($levels as $level) {
            $levelSubmissions = $submissions->filter(function ($submission) use ($level) {
                return $submission->quiz->proficiency_level === $level;
            });

            if ($levelSubmissions->isNotEmpty()) {
                $breakdown[$level] = [
                    'quiz_count' => $levelSubmissions->count(),
                    'average_score' => round($levelSubmissions->avg('percentage'), 1),
                    'pass_rate' => round(($levelSubmissions->where('is_passed', true)->count() / $levelSubmissions->count()) * 100, 1),
                    'best_score' => $levelSubmissions->max('percentage'),
                    'recent_performance' => $this->getRecentPerformance($levelSubmissions, 3),
                ];
            }
        }

        return $breakdown;
    }

    /**
     * Calculate question type performance
     */
    private function calculateQuestionTypePerformance(Collection $submissions): array
    {
        $typePerformance = [];
        $questionTypes = ['multiple_choice', 'true_false', 'fill_blank', 'short_answer', 'essay'];

        foreach ($questionTypes as $type) {
            $answers = $submissions->flatMap->answers->filter(function ($answer) use ($type) {
                return $answer->question->type === $type;
            });

            if ($answers->isNotEmpty()) {
                $totalAnswers = $answers->count();
                $correctAnswers = $answers->where('is_correct', true)->count();
                $partialCredit = $answers->where('is_correct', false)->where('points_earned', '>', 0)->count();

                $typePerformance[$type] = [
                    'total_questions' => $totalAnswers,
                    'correct_answers' => $correctAnswers,
                    'accuracy_rate' => round(($correctAnswers / $totalAnswers) * 100, 1),
                    'partial_credit_rate' => round(($partialCredit / $totalAnswers) * 100, 1),
                    'average_points' => round($answers->avg('points_earned'), 2),
                    'strength_level' => $this->determineStrengthLevel($correctAnswers / $totalAnswers),
                ];
            }
        }

        return $typePerformance;
    }

    /**
     * Identify areas for improvement
     */
    private function identifyImprovementAreas(Collection $submissions): array
    {
        $areas = [];

        // Analyze question types with low performance
        $questionTypePerf = $this->calculateQuestionTypePerformance($submissions);
        foreach ($questionTypePerf as $type => $performance) {
            if ($performance['accuracy_rate'] < 70) {
                $areas[] = [
                    'area' => 'question_type',
                    'type' => $type,
                    'current_performance' => $performance['accuracy_rate'],
                    'suggestion' => $this->getQuestionTypeImprovement($type),
                    'priority' => $this->calculatePriority($performance['accuracy_rate']),
                ];
            }
        }

        // Analyze proficiency levels with struggles
        $proficiencyPerf = $this->calculateProficiencyBreakdown($submissions);
        foreach ($proficiencyPerf as $level => $performance) {
            if ($performance['pass_rate'] < 70) {
                $areas[] = [
                    'area' => 'proficiency_level',
                    'level' => $level,
                    'current_performance' => $performance['pass_rate'],
                    'suggestion' => $this->getProficiencyImprovement($level),
                    'priority' => $this->calculatePriority($performance['pass_rate']),
                ];
            }
        }

        // Analyze time management
        $timeIssues = $this->analyzeTimeManagement($submissions);
        if ($timeIssues['needs_improvement']) {
            $areas[] = [
                'area' => 'time_management',
                'current_performance' => $timeIssues['efficiency_score'],
                'suggestion' => $timeIssues['suggestion'],
                'priority' => 'medium',
            ];
        }

        return collect($areas)->sortByDesc('priority')->values()->all();
    }

    /**
     * Calculate student achievements
     */
    private function calculateAchievements(Collection $submissions): array
    {
        $achievements = [];

        // Perfect scores
        $perfectScores = $submissions->where('percentage', 100)->count();
        if ($perfectScores > 0) {
            $achievements[] = [
                'type' => 'perfect_scores',
                'count' => $perfectScores,
                'title' => 'Perfect Scores',
                'description' => "Achieved {$perfectScores} perfect score(s)",
            ];
        }

        // Improvement streaks
        $currentStreak = $this->calculateCurrentStreak($submissions);
        if ($currentStreak >= 3) {
            $achievements[] = [
                'type' => 'improvement_streak',
                'count' => $currentStreak,
                'title' => 'Improvement Streak',
                'description' => "Currently on a {$currentStreak} quiz improvement streak",
            ];
        }

        // Level mastery
        $proficiencyBreakdown = $this->calculateProficiencyBreakdown($submissions);
        foreach ($proficiencyBreakdown as $level => $performance) {
            if ($performance['pass_rate'] >= 90 && $performance['quiz_count'] >= 3) {
                $achievements[] = [
                    'type' => 'level_mastery',
                    'level' => $level,
                    'title' => "{$level} Level Mastery",
                    'description' => "Mastered {$level} level with {$performance['pass_rate']}% pass rate",
                ];
            }
        }

        return $achievements;
    }

    /**
     * Analyze time management patterns
     */
    private function analyzeTimeManagement(Collection $submissions): array
    {
        $timedSubmissions = $submissions->filter(function ($submission) {
            return $submission->time_taken_minutes && $submission->quiz->time_limit_minutes;
        });

        if ($timedSubmissions->isEmpty()) {
            return [
                'needs_improvement' => false,
                'efficiency_score' => null,
                'suggestion' => 'No timed quizzes available for analysis',
            ];
        }

        $efficiencyScores = $timedSubmissions->map(function ($submission) {
            return ($submission->time_taken_minutes / $submission->quiz->time_limit_minutes) * 100;
        });

        $averageEfficiency = $efficiencyScores->avg();
        $needsImprovement = $averageEfficiency > 95 || $averageEfficiency < 30;

        $suggestion = '';
        if ($averageEfficiency > 95) {
            $suggestion = 'Consider taking more time to review answers carefully';
        } elseif ($averageEfficiency < 30) {
            $suggestion = 'Try to work more efficiently to use available time better';
        } else {
            $suggestion = 'Good time management overall';
        }

        return [
            'needs_improvement' => $needsImprovement,
            'efficiency_score' => round($averageEfficiency, 1),
            'suggestion' => $suggestion,
            'time_distribution' => $this->calculateTimeDistribution($efficiencyScores),
        ];
    }

    /**
     * Calculate class overview metrics
     */
    private function calculateClassOverview(Collection $submissions, Collection $enrollments): array
    {
        $totalStudents = $enrollments->count();
        $activeStudents = $submissions->unique('student_id')->count();
        $totalSubmissions = $submissions->count();

        return [
            'total_students' => $totalStudents,
            'active_students' => $activeStudents,
            'participation_rate' => $totalStudents > 0 ? round(($activeStudents / $totalStudents) * 100, 1) : 0,
            'total_submissions' => $totalSubmissions,
            'average_class_score' => round($submissions->avg('percentage'), 1),
            'class_pass_rate' => $totalSubmissions > 0 ? round(($submissions->where('is_passed', true)->count() / $totalSubmissions) * 100, 1) : 0,
            'top_performers' => $this->getTopPerformers($submissions, 3),
            'struggling_students' => $this->getStrugglingStudents($submissions, 3),
        ];
    }

    /**
     * Helper methods for calculations
     */
    private function getTimeframeStart(string $timeframe): Carbon
    {
        return match ($timeframe) {
            'week' => Carbon::now()->subWeek(),
            'month' => Carbon::now()->subMonth(),
            'year' => Carbon::now()->subYear(),
            default => Carbon::now()->subYears(10),
        };
    }

    private function getEmptyOverview(): array
    {
        return [
            'total_quizzes_taken' => 0,
            'unique_quizzes' => 0,
            'pass_rate' => 0,
            'average_score' => 0,
            'total_time_spent_hours' => 0,
            'current_streak' => 0,
            'best_score' => 0,
            'recent_trend' => 'no_data',
            'grade_distribution' => [],
        ];
    }

    private function calculateScoreTrend(Collection $submissions): string
    {
        if ($submissions->count() < 2) return 'insufficient_data';

        $scores = $submissions->pluck('percentage')->reverse()->values();
        $recent = $scores->slice(-3)->avg();
        $previous = $scores->slice(-6, 3)->avg();

        if ($recent > $previous + 5) return 'improving';
        if ($recent < $previous - 5) return 'declining';
        return 'stable';
    }

    private function calculateCurrentStreak(Collection $submissions): int
    {
        $streak = 0;
        $sortedSubmissions = $submissions->sortByDesc('submitted_at');
        $previousScore = null;

        foreach ($sortedSubmissions as $submission) {
            if ($previousScore === null) {
                $previousScore = $submission->percentage;
                $streak = 1;
                continue;
            }

            if ($submission->percentage >= $previousScore) {
                $streak++;
                $previousScore = $submission->percentage;
            } else {
                break;
            }
        }

        return $streak;
    }

    private function calculateGradeDistribution(Collection $submissions): array
    {
        $distribution = ['A' => 0, 'B' => 0, 'C' => 0, 'D' => 0, 'F' => 0];

        foreach ($submissions as $submission) {
            $grade = $this->getLetterGrade($submission->percentage);
            $distribution[$grade[0]]++; // First letter of grade (A+, A, A- all count as A)
        }

        return $distribution;
    }

    private function getLetterGrade(float $percentage): string
    {
        if ($percentage >= 97) return 'A+';
        if ($percentage >= 93) return 'A';
        if ($percentage >= 90) return 'A-';
        if ($percentage >= 87) return 'B+';
        if ($percentage >= 83) return 'B';
        if ($percentage >= 80) return 'B-';
        if ($percentage >= 77) return 'C+';
        if ($percentage >= 73) return 'C';
        if ($percentage >= 70) return 'C-';
        if ($percentage >= 67) return 'D+';
        if ($percentage >= 65) return 'D';
        return 'F';
    }

    private function determineStrengthLevel(float $accuracy): string
    {
        if ($accuracy >= 0.9) return 'excellent';
        if ($accuracy >= 0.8) return 'good';
        if ($accuracy >= 0.7) return 'fair';
        return 'needs_improvement';
    }

    private function getQuestionTypeImprovement(string $type): string
    {
        return match ($type) {
            'multiple_choice' => 'Practice elimination strategies and careful reading of all options',
            'true_false' => 'Focus on identifying absolute terms and exceptions',
            'fill_blank' => 'Review vocabulary and practice context clues',
            'short_answer' => 'Work on concise, complete responses',
            'essay' => 'Practice organizing thoughts and supporting arguments',
            default => 'Continue practicing this question type',
        };
    }

    private function getProficiencyImprovement(string $level): string
    {
        return "Focus on {$level} level materials and consider additional practice before advancing";
    }

    private function calculatePriority(float $performance): string
    {
        if ($performance < 50) return 'high';
        if ($performance < 70) return 'medium';
        return 'low';
    }

    private function calculateTimeDistribution(Collection $efficiencyScores): array
    {
        return [
            'very_fast' => $efficiencyScores->filter(fn($score) => $score < 50)->count(),
            'good_pace' => $efficiencyScores->filter(fn($score) => $score >= 50 && $score <= 75)->count(),
            'adequate' => $efficiencyScores->filter(fn($score) => $score > 75 && $score <= 90)->count(),
            'time_pressure' => $efficiencyScores->filter(fn($score) => $score > 90)->count(),
        ];
    }

    private function getTopPerformers(Collection $submissions, int $limit): array
    {
        return $submissions->groupBy('student_id')
            ->map(function ($studentSubmissions) {
                return [
                    'student_id' => $studentSubmissions->first()->student_id,
                    'student_name' => $studentSubmissions->first()->student->name ?? 'Unknown',
                    'average_score' => round($studentSubmissions->avg('percentage'), 1),
                    'quiz_count' => $studentSubmissions->count(),
                ];
            })
            ->sortByDesc('average_score')
            ->take($limit)
            ->values()
            ->all();
    }

    private function getStrugglingStudents(Collection $submissions, int $limit): array
    {
        return $submissions->groupBy('student_id')
            ->map(function ($studentSubmissions) {
                return [
                    'student_id' => $studentSubmissions->first()->student_id,
                    'student_name' => $studentSubmissions->first()->student->name ?? 'Unknown',
                    'average_score' => round($studentSubmissions->avg('percentage'), 1),
                    'pass_rate' => round(($studentSubmissions->where('is_passed', true)->count() / $studentSubmissions->count()) * 100, 1),
                    'quiz_count' => $studentSubmissions->count(),
                ];
            })
            ->sortBy('average_score')
            ->take($limit)
            ->values()
            ->all();
    }

    // Additional methods for quiz and question analysis would continue here...
    // This is a comprehensive foundation for the analytics service
}    /
**
     * Calculate student rankings within a class
     */
    private function calculateStudentRankings(Collection $submissions, Collection $studentIds): array
    {
        $rankings = [];
        
        foreach ($studentIds as $studentId) {
            $studentSubmissions = $submissions->where('student_id', $studentId);
            
            if ($studentSubmissions->isNotEmpty()) {
                $rankings[] = [
                    'student_id' => $studentId,
                    'student_name' => $studentSubmissions->first()->student->name ?? 'Unknown',
                    'average_score' => round($studentSubmissions->avg('percentage'), 1),
                    'total_quizzes' => $studentSubmissions->count(),
                    'pass_rate' => round(($studentSubmissions->where('is_passed', true)->count() / $studentSubmissions->count()) * 100, 1),
                    'improvement_trend' => $this->calculateScoreTrend($studentSubmissions->sortBy('submitted_at')),
                ];
            }
        }
        
        return collect($rankings)->sortByDesc('average_score')->values()->all();
    }

    /**
     * Analyze quiz effectiveness
     */
    private function analyzeQuizEffectiveness(int $programId, ?string $proficiencyLevel = null): array
    {
        $query = Quiz::where('program_id', $programId)
            ->with(['submissions']);
            
        if ($proficiencyLevel) {
            $query->where('proficiency_level', $proficiencyLevel);
        }
        
        $quizzes = $query->get();
        $effectiveness = [];
        
        foreach ($quizzes as $quiz) {
            $submissions = $quiz->submissions;
            
            if ($submissions->isNotEmpty()) {
                $effectiveness[] = [
                    'quiz_id' => $quiz->id,
                    'quiz_title' => $quiz->title,
                    'completion_rate' => $this->calculateCompletionRate($quiz),
                    'average_score' => round($submissions->avg('percentage'), 1),
                    'pass_rate' => round(($submissions->where('is_passed', true)->count() / $submissions->count()) * 100, 1),
                    'difficulty_rating' => $this->calculateDifficultyRating($submissions),
                    'engagement_score' => $this->calculateEngagementScore($submissions),
                    'effectiveness_rating' => $this->calculateEffectivenessRating($submissions),
                ];
            }
        }
        
        return collect($effectiveness)->sortByDesc('effectiveness_rating')->values()->all();
    }

    /**
     * Analyze question difficulty across quizzes
     */
    private function analyzeQuestionDifficulty(int $programId, ?string $proficiencyLevel = null): array
    {
        $query = QuizQuestions::whereHas('quiz', function ($q) use ($programId, $proficiencyLevel) {
            $q->where('program_id', $programId);
            if ($proficiencyLevel) {
                $q->where('proficiency_level', $proficiencyLevel);
            }
        })->with(['answers', 'quiz']);
        
        $questions = $query->get();
        $difficulty = [];
        
        foreach ($questions as $question) {
            $answers = $question->answers;
            
            if ($answers->isNotEmpty()) {
                $correctRate = $answers->where('is_correct', true)->count() / $answers->count();
                
                $difficulty[] = [
                    'question_id' => $question->id,
                    'quiz_title' => $question->quiz->title,
                    'question_type' => $question->type,
                    'question_text' => substr($question->question, 0, 100) . '...',
                    'total_attempts' => $answers->count(),
                    'correct_rate' => round($correctRate * 100, 1),
                    'difficulty_level' => $this->getDifficultyLevel($correctRate),
                    'average_points_earned' => round($answers->avg('points_earned'), 2),
                    'needs_review' => $correctRate < 0.5,
                ];
            }
        }
        
        return collect($difficulty)->sortBy('correct_rate')->values()->all();
    }

    /**
     * Calculate engagement metrics
     */
    private function calculateEngagementMetrics(Collection $submissions, Collection $enrollments): array
    {
        $totalStudents = $enrollments->count();
        $activeStudents = $submissions->unique('student_id')->count();
        
        // Calculate weekly engagement
        $weeklyEngagement = $submissions
            ->where('submitted_at', '>=', Carbon::now()->subWeeks(4))
            ->groupBy(function ($submission) {
                return Carbon::parse($submission->submitted_at)->format('Y-W');
            })
            ->map(function ($weekSubmissions) {
                return [
                    'submissions' => $weekSubmissions->count(),
                    'unique_students' => $weekSubmissions->unique('student_id')->count(),
                ];
            });
        
        return [
            'overall_participation' => $totalStudents > 0 ? round(($activeStudents / $totalStudents) * 100, 1) : 0,
            'average_attempts_per_student' => $activeStudents > 0 ? round($submissions->count() / $activeStudents, 1) : 0,
            'weekly_engagement' => $weeklyEngagement->values()->all(),
            'peak_activity_day' => $this->findPeakActivityDay($submissions),
            'retention_rate' => $this->calculateRetentionRate($submissions, $enrollments),
        ];
    }

    /**
     * Track class progress over time
     */
    private function trackClassProgress(Collection $submissions, Collection $enrollments): array
    {
        $monthlyProgress = $submissions
            ->groupBy(function ($submission) {
                return Carbon::parse($submission->submitted_at)->format('Y-m');
            })
            ->map(function ($monthSubmissions) {
                return [
                    'average_score' => round($monthSubmissions->avg('percentage'), 1),
                    'pass_rate' => round(($monthSubmissions->where('is_passed', true)->count() / $monthSubmissions->count()) * 100, 1),
                    'participation' => $monthSubmissions->unique('student_id')->count(),
                    'total_submissions' => $monthSubmissions->count(),
                ];
            });
        
        return [
            'monthly_progress' => $monthlyProgress->values()->all(),
            'overall_trend' => $this->calculateOverallTrend($monthlyProgress),
            'improvement_rate' => $this->calculateImprovementRate($monthlyProgress),
        ];
    }

    /**
     * Identify common mistakes across the class
     */
    private function identifyCommonMistakes(Collection $submissions): array
    {
        $incorrectAnswers = $submissions->flatMap->answers->where('is_correct', false);
        
        $commonMistakes = $incorrectAnswers
            ->groupBy('question_id')
            ->map(function ($questionAnswers) {
                $question = $questionAnswers->first()->question;
                return [
                    'question_id' => $question->id,
                    'question_text' => substr($question->question, 0, 100) . '...',
                    'question_type' => $question->type,
                    'mistake_count' => $questionAnswers->count(),
                    'mistake_rate' => $this->calculateMistakeRate($question->id, $submissions),
                    'common_wrong_answers' => $this->getCommonWrongAnswers($questionAnswers),
                ];
            })
            ->sortByDesc('mistake_count')
            ->take(10);
        
        return $commonMistakes->values()->all();
    }

    /**
     * Calculate quiz overview metrics
     */
    private function calculateQuizOverview(Quiz $quiz, Collection $submissions): array
    {
        if ($submissions->isEmpty()) {
            return [
                'total_attempts' => 0,
                'unique_students' => 0,
                'completion_rate' => 0,
                'average_score' => 0,
                'pass_rate' => 0,
            ];
        }
        
        return [
            'total_attempts' => $submissions->count(),
            'unique_students' => $submissions->unique('student_id')->count(),
            'completion_rate' => $this->calculateCompletionRate($quiz),
            'average_score' => round($submissions->avg('percentage'), 1),
            'pass_rate' => round(($submissions->where('is_passed', true)->count() / $submissions->count()) * 100, 1),
            'average_time' => round($submissions->avg('time_taken_minutes'), 1),
            'difficulty_rating' => $this->calculateDifficultyRating($submissions),
        ];
    }

    /**
     * Analyze individual quiz questions
     */
    private function analyzeQuizQuestions(Quiz $quiz): array
    {
        $questionAnalysis = [];
        
        foreach ($quiz->questions as $question) {
            $answers = SubmissionAnswers::where('question_id', $question->id)->get();
            
            if ($answers->isNotEmpty()) {
                $correctRate = $answers->where('is_correct', true)->count() / $answers->count();
                
                $questionAnalysis[] = [
                    'question_id' => $question->id,
                    'question_text' => $question->question,
                    'question_type' => $question->type,
                    'points' => $question->points,
                    'total_attempts' => $answers->count(),
                    'correct_rate' => round($correctRate * 100, 1),
                    'average_points' => round($answers->avg('points_earned'), 2),
                    'difficulty_level' => $this->getDifficultyLevel($correctRate),
                    'discrimination_index' => $this->calculateDiscriminationIndex($question, $answers),
                ];
            }
        }
        
        return $questionAnalysis;
    }

    /**
     * Calculate performance distribution
     */
    private function calculatePerformanceDistribution(Collection $submissions): array
    {
        $distribution = [
            '90-100' => 0, '80-89' => 0, '70-79' => 0, 
            '60-69' => 0, '50-59' => 0, 'below-50' => 0
        ];
        
        foreach ($submissions as $submission) {
            $score = $submission->percentage;
            if ($score >= 90) $distribution['90-100']++;
            elseif ($score >= 80) $distribution['80-89']++;
            elseif ($score >= 70) $distribution['70-79']++;
            elseif ($score >= 60) $distribution['60-69']++;
            elseif ($score >= 50) $distribution['50-59']++;
            else $distribution['below-50']++;
        }
        
        return $distribution;
    }

    /**
     * Helper methods for complex calculations
     */
    private function calculateCompletionRate(Quiz $quiz): float
    {
        $enrolledStudents = Enrollment::where('program_id', $quiz->program_id)
            ->where('status', 'active')
            ->count();
            
        $completedStudents = QuizSubmissions::where('quiz_id', $quiz->id)
            ->distinct('student_id')
            ->count();
            
        return $enrolledStudents > 0 ? round(($completedStudents / $enrolledStudents) * 100, 1) : 0;
    }

    private function calculateDifficultyRating(Collection $submissions): string
    {
        $averageScore = $submissions->avg('percentage');
        
        if ($averageScore >= 85) return 'easy';
        if ($averageScore >= 70) return 'moderate';
        if ($averageScore >= 55) return 'challenging';
        return 'difficult';
    }

    private function calculateEngagementScore(Collection $submissions): float
    {
        $completionRate = $submissions->count() > 0 ? 1 : 0;
        $averageTime = $submissions->avg('time_taken_minutes') ?? 0;
        $retakeRate = $this->calculateRetakeRate($submissions);
        
        // Engagement score based on completion, time spent, and retakes
        return round(($completionRate * 40) + (min($averageTime / 30, 1) * 30) + ($retakeRate * 30), 1);
    }

    private function calculateEffectivenessRating(Collection $submissions): float
    {
        $passRate = $submissions->where('is_passed', true)->count() / $submissions->count();
        $averageScore = $submissions->avg('percentage') / 100;
        $completionRate = $this->calculateCompletionRateFromSubmissions($submissions);
        
        return round(($passRate * 40) + ($averageScore * 35) + ($completionRate * 25), 1);
    }

    private function getDifficultyLevel(float $correctRate): string
    {
        if ($correctRate >= 0.8) return 'easy';
        if ($correctRate >= 0.6) return 'moderate';
        if ($correctRate >= 0.4) return 'challenging';
        return 'difficult';
    }

    private function calculateDiscriminationIndex(QuizQuestions $question, Collection $answers): float
    {
        // Simplified discrimination index calculation
        $topPerformers = $answers->sortByDesc('points_earned')->take(ceil($answers->count() * 0.27));
        $bottomPerformers = $answers->sortBy('points_earned')->take(ceil($answers->count() * 0.27));
        
        $topCorrect = $topPerformers->where('is_correct', true)->count();
        $bottomCorrect = $bottomPerformers->where('is_correct', true)->count();
        
        $groupSize = ceil($answers->count() * 0.27);
        
        return $groupSize > 0 ? round(($topCorrect - $bottomCorrect) / $groupSize, 2) : 0;
    }

    private function findPeakActivityDay(Collection $submissions): string
    {
        $dayActivity = $submissions->groupBy(function ($submission) {
            return Carbon::parse($submission->submitted_at)->format('l'); // Day name
        })->map->count();
        
        return $dayActivity->keys()->first() ?? 'No data';
    }

    private function calculateRetentionRate(Collection $submissions, Collection $enrollments): float
    {
        $recentSubmissions = $submissions->where('submitted_at', '>=', Carbon::now()->subMonth());
        $activeStudents = $recentSubmissions->unique('student_id')->count();
        $totalStudents = $enrollments->count();
        
        return $totalStudents > 0 ? round(($activeStudents / $totalStudents) * 100, 1) : 0;
    }

    private function calculateOverallTrend(Collection $monthlyProgress): string
    {
        $values = $monthlyProgress->pluck('average_score');
        if ($values->count() < 2) return 'insufficient_data';
        
        $recent = $values->slice(-2)->avg();
        $previous = $values->slice(-4, 2)->avg();
        
        if ($recent > $previous + 3) return 'improving';
        if ($recent < $previous - 3) return 'declining';
        return 'stable';
    }

    private function calculateImprovementRate(Collection $monthlyProgress): float
    {
        $values = $monthlyProgress->pluck('average_score');
        if ($values->count() < 2) return 0;
        
        $first = $values->first();
        $last = $values->last();
        
        return $first > 0 ? round((($last - $first) / $first) * 100, 1) : 0;
    }

    private function calculateMistakeRate(int $questionId, Collection $submissions): float
    {
        $totalAnswers = $submissions->flatMap->answers->where('question_id', $questionId);
        $incorrectAnswers = $totalAnswers->where('is_correct', false);
        
        return $totalAnswers->count() > 0 ? round(($incorrectAnswers->count() / $totalAnswers->count()) * 100, 1) : 0;
    }

    private function getCommonWrongAnswers(Collection $questionAnswers): array
    {
        return $questionAnswers
            ->whereNotNull('selected_option_id')
            ->groupBy('selected_option_id')
            ->map->count()
            ->sortDesc()
            ->take(3)
            ->keys()
            ->all();
    }

    private function calculateRetakeRate(Collection $submissions): float
    {
        $studentAttempts = $submissions->groupBy('student_id')->map->count();
        $retakers = $studentAttempts->filter(fn($attempts) => $attempts > 1)->count();
        $totalStudents = $studentAttempts->count();
        
        return $totalStudents > 0 ? $retakers / $totalStudents : 0;
    }

    private function calculateCompletionRateFromSubmissions(Collection $submissions): float
    {
        // This would need additional context about total enrolled students
        // For now, return a simplified metric
        return $submissions->isNotEmpty() ? 1.0 : 0.0;
    }

    private function getRecentPerformance(Collection $submissions, int $limit): array
    {
        return $submissions->sortByDesc('submitted_at')
            ->take($limit)
            ->map(function ($submission) {
                return [
                    'score' => $submission->percentage,
                    'passed' => $submission->is_passed,
                    'date' => $submission->submitted_at->format('Y-m-d'),
                ];
            })
            ->values()
            ->all();
    }

    private function calculateMonthlyImprovement(Collection $monthSubmissions): float
    {
        $sorted = $monthSubmissions->sortBy('submitted_at');
        if ($sorted->count() < 2) return 0;
        
        $first = $sorted->first()->percentage;
        $last = $sorted->last()->percentage;
        
        return round($last - $first, 1);
    }
}