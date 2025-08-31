<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Services\AnalyticsService;
use App\Models\Programs;
use App\Models\Quiz;
use App\Models\QuizSubmissions;
use App\Models\Enrollment;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Response;
use Carbon\Carbon;

class AnalyticsController extends Controller
{
    protected AnalyticsService $analyticsService;

    public function __construct(AnalyticsService $analyticsService)
    {
        $this->analyticsService = $analyticsService;
    }

    /**
     * Get student performance analytics
     */
    public function studentPerformance(Request $request, int $studentId): JsonResponse
    {
        try {
            $user = $request->user();
            
            // Authorization check
            if (!$this->canViewStudentAnalytics($user, $studentId)) {
                return response()->json(['message' => 'Unauthorized'], 403);
            }

            $validator = Validator::make($request->all(), [
                'timeframe' => 'sometimes|in:week,month,year,all',
                'program_id' => 'sometimes|exists:programs,id',
                'proficiency_level' => 'sometimes|in:A1,A2,B1,B2,C1,C2',
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'message' => 'Validation failed',
                    'errors' => $validator->errors()
                ], 422);
            }

            $options = $request->only(['timeframe', 'program_id', 'proficiency_level']);
            $performance = $this->analyticsService->getStudentPerformance($studentId, $options);

            return response()->json([
                'data' => $performance,
                'meta' => [
                    'student_id' => $studentId,
                    'filters_applied' => $options,
                    'generated_at' => now()->toISOString(),
                ]
            ]);

        } catch (\Exception $e) {
            Log::error('Failed to get student performance analytics', [
                'student_id' => $studentId,
                'error' => $e->getMessage()
            ]);

            return response()->json([
                'message' => 'Failed to retrieve student performance analytics',
                'error' => 'An unexpected error occurred'
            ], 500);
        }
    }

    /**
     * Get class analytics for teachers
     */
    public function classAnalytics(Request $request, int $programId): JsonResponse
    {
        try {
            $user = $request->user();
            
            // Authorization check
            if (!$this->canViewClassAnalytics($user, $programId)) {
                return response()->json(['message' => 'Unauthorized'], 403);
            }

            $validator = Validator::make($request->all(), [
                'timeframe' => 'sometimes|in:week,month,year,all',
                'proficiency_level' => 'sometimes|in:A1,A2,B1,B2,C1,C2',
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'message' => 'Validation failed',
                    'errors' => $validator->errors()
                ], 422);
            }

            $options = $request->only(['timeframe', 'proficiency_level']);
            $analytics = $this->analyticsService->getClassAnalytics($programId, $options);

            return response()->json([
                'data' => $analytics,
                'meta' => [
                    'program_id' => $programId,
                    'filters_applied' => $options,
                    'generated_at' => now()->toISOString(),
                ]
            ]);

        } catch (\Exception $e) {
            Log::error('Failed to get class analytics', [
                'program_id' => $programId,
                'error' => $e->getMessage()
            ]);

            return response()->json([
                'message' => 'Failed to retrieve class analytics',
                'error' => 'An unexpected error occurred'
            ], 500);
        }
    }

    /**
     * Get quiz analytics
     */
    public function quizAnalytics(Request $request, int $quizId): JsonResponse
    {
        try {
            $user = $request->user();
            $quiz = Quiz::findOrFail($quizId);
            
            // Authorization check
            if (!$this->canViewQuizAnalytics($user, $quiz)) {
                return response()->json(['message' => 'Unauthorized'], 403);
            }

            $analytics = $this->analyticsService->getQuizAnalytics($quizId);

            return response()->json([
                'data' => $analytics,
                'meta' => [
                    'quiz_id' => $quizId,
                    'quiz_title' => $quiz->title,
                    'generated_at' => now()->toISOString(),
                ]
            ]);

        } catch (\Exception $e) {
            Log::error('Failed to get quiz analytics', [
                'quiz_id' => $quizId,
                'error' => $e->getMessage()
            ]);

            return response()->json([
                'message' => 'Failed to retrieve quiz analytics',
                'error' => 'An unexpected error occurred'
            ], 500);
        }
    }

    /**
     * Get performance trends for a student
     */
    public function studentTrends(Request $request, int $studentId): JsonResponse
    {
        try {
            $user = $request->user();
            
            if (!$this->canViewStudentAnalytics($user, $studentId)) {
                return response()->json(['message' => 'Unauthorized'], 403);
            }

            $validator = Validator::make($request->all(), [
                'period' => 'sometimes|in:daily,weekly,monthly',
                'duration' => 'sometimes|integer|min:1|max:12',
                'program_id' => 'sometimes|exists:programs,id',
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'message' => 'Validation failed',
                    'errors' => $validator->errors()
                ], 422);
            }

            $period = $request->get('period', 'monthly');
            $duration = $request->get('duration', 6);
            $programId = $request->get('program_id');

            $trends = $this->calculateStudentTrends($studentId, $period, $duration, $programId);

            return response()->json([
                'data' => $trends,
                'meta' => [
                    'student_id' => $studentId,
                    'period' => $period,
                    'duration' => $duration,
                    'program_id' => $programId,
                ]
            ]);

        } catch (\Exception $e) {
            Log::error('Failed to get student trends', [
                'student_id' => $studentId,
                'error' => $e->getMessage()
            ]);

            return response()->json([
                'message' => 'Failed to retrieve student trends',
                'error' => 'An unexpected error occurred'
            ], 500);
        }
    }

    /**
     * Get class performance comparison
     */
    public function classComparison(Request $request, int $programId): JsonResponse
    {
        try {
            $user = $request->user();
            
            if (!$this->canViewClassAnalytics($user, $programId)) {
                return response()->json(['message' => 'Unauthorized'], 403);
            }

            $validator = Validator::make($request->all(), [
                'compare_with' => 'sometimes|array',
                'compare_with.*' => 'exists:programs,id',
                'metric' => 'sometimes|in:average_score,pass_rate,completion_rate,engagement',
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'message' => 'Validation failed',
                    'errors' => $validator->errors()
                ], 422);
            }

            $compareWith = $request->get('compare_with', []);
            $metric = $request->get('metric', 'average_score');

            $comparison = $this->calculateClassComparison($programId, $compareWith, $metric);

            return response()->json([
                'data' => $comparison,
                'meta' => [
                    'primary_program_id' => $programId,
                    'comparison_programs' => $compareWith,
                    'metric' => $metric,
                ]
            ]);

        } catch (\Exception $e) {
            Log::error('Failed to get class comparison', [
                'program_id' => $programId,
                'error' => $e->getMessage()
            ]);

            return response()->json([
                'message' => 'Failed to retrieve class comparison',
                'error' => 'An unexpected error occurred'
            ], 500);
        }
    }

    /**
     * Generate and export analytics report
     */
    public function exportReport(Request $request, int $programId): JsonResponse
    {
        try {
            $user = $request->user();
            
            if (!$this->canViewClassAnalytics($user, $programId)) {
                return response()->json(['message' => 'Unauthorized'], 403);
            }

            $validator = Validator::make($request->all(), [
                'format' => 'required|in:json,csv,pdf',
                'include' => 'sometimes|array',
                'include.*' => 'in:overview,students,quizzes,questions,trends',
                'timeframe' => 'sometimes|in:week,month,year,all',
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'message' => 'Validation failed',
                    'errors' => $validator->errors()
                ], 422);
            }

            $format = $request->get('format');
            $include = $request->get('include', ['overview', 'students', 'quizzes']);
            $timeframe = $request->get('timeframe', 'all');

            $reportData = $this->generateReportData($programId, $include, $timeframe);

            if ($format === 'json') {
                return response()->json([
                    'data' => $reportData,
                    'meta' => [
                        'program_id' => $programId,
                        'format' => $format,
                        'sections_included' => $include,
                        'timeframe' => $timeframe,
                        'generated_at' => now()->toISOString(),
                    ]
                ]);
            }

            // For CSV and PDF, we would typically generate files and return download URLs
            // For now, return the data with instructions for frontend processing
            return response()->json([
                'data' => $reportData,
                'download_instructions' => [
                    'format' => $format,
                    'suggested_filename' => "analytics_report_{$programId}_" . now()->format('Y-m-d') . ".{$format}",
                ],
                'meta' => [
                    'program_id' => $programId,
                    'format' => $format,
                    'sections_included' => $include,
                    'timeframe' => $timeframe,
                    'generated_at' => now()->toISOString(),
                ]
            ]);

        } catch (\Exception $e) {
            Log::error('Failed to export analytics report', [
                'program_id' => $programId,
                'error' => $e->getMessage()
            ]);

            return response()->json([
                'message' => 'Failed to export analytics report',
                'error' => 'An unexpected error occurred'
            ], 500);
        }
    }

    /**
     * Get level-specific analytics
     */
    public function levelAnalytics(Request $request, int $programId, string $level): JsonResponse
    {
        try {
            $user = $request->user();
            
            if (!$this->canViewClassAnalytics($user, $programId)) {
                return response()->json(['message' => 'Unauthorized'], 403);
            }

            if (!in_array($level, ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'])) {
                return response()->json(['message' => 'Invalid proficiency level'], 400);
            }

            $validator = Validator::make($request->all(), [
                'timeframe' => 'sometimes|in:week,month,year,all',
                'include_progression' => 'sometimes|boolean',
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'message' => 'Validation failed',
                    'errors' => $validator->errors()
                ], 422);
            }

            $timeframe = $request->get('timeframe', 'all');
            $includeProgression = $request->get('include_progression', false);

            $analytics = $this->analyticsService->getClassAnalytics($programId, [
                'proficiency_level' => $level,
                'timeframe' => $timeframe
            ]);

            $levelData = [
                'level_analytics' => $analytics,
                'level_info' => $this->getLevelInfo($level),
            ];

            if ($includeProgression) {
                $levelData['progression_analysis'] = $this->calculateLevelProgression($programId, $level);
            }

            return response()->json([
                'data' => $levelData,
                'meta' => [
                    'program_id' => $programId,
                    'proficiency_level' => $level,
                    'timeframe' => $timeframe,
                    'includes_progression' => $includeProgression,
                ]
            ]);

        } catch (\Exception $e) {
            Log::error('Failed to get level analytics', [
                'program_id' => $programId,
                'level' => $level,
                'error' => $e->getMessage()
            ]);

            return response()->json([
                'message' => 'Failed to retrieve level analytics',
                'error' => 'An unexpected error occurred'
            ], 500);
        }
    }

    /**
     * Get real-time analytics dashboard data
     */
    public function dashboardData(Request $request, int $programId): JsonResponse
    {
        try {
            $user = $request->user();
            
            if (!$this->canViewClassAnalytics($user, $programId)) {
                return response()->json(['message' => 'Unauthorized'], 403);
            }

            $dashboardData = [
                'quick_stats' => $this->getQuickStats($programId),
                'recent_activity' => $this->getRecentActivity($programId),
                'performance_alerts' => $this->getPerformanceAlerts($programId),
                'trending_quizzes' => $this->getTrendingQuizzes($programId),
                'student_highlights' => $this->getStudentHighlights($programId),
            ];

            return response()->json([
                'data' => $dashboardData,
                'meta' => [
                    'program_id' => $programId,
                    'last_updated' => now()->toISOString(),
                    'refresh_interval' => 300, // 5 minutes
                ]
            ]);

        } catch (\Exception $e) {
            Log::error('Failed to get dashboard data', [
                'program_id' => $programId,
                'error' => $e->getMessage()
            ]);

            return response()->json([
                'message' => 'Failed to retrieve dashboard data',
                'error' => 'An unexpected error occurred'
            ], 500);
        }
    }

    /**
     * Authorization helper methods
     */
    private function canViewStudentAnalytics($user, int $studentId): bool
    {
        // Students can view their own analytics
        if ($user->id === $studentId && $user->role === 'student') {
            return true;
        }

        // Teachers can view analytics for students in their programs
        if ($user->role === 'teacher') {
            return Enrollment::whereHas('program', function ($query) use ($user) {
                $query->where('teacher_id', $user->id);
            })->where('student_id', $studentId)->exists();
        }

        return false;
    }

    private function canViewClassAnalytics($user, int $programId): bool
    {
        if ($user->role !== 'teacher') {
            return false;
        }

        return Programs::where('id', $programId)
            ->where('teacher_id', $user->id)
            ->exists();
    }

    private function canViewQuizAnalytics($user, Quiz $quiz): bool
    {
        // Teachers can view analytics for their own quizzes
        if ($user->role === 'teacher' && $quiz->teacher_id === $user->id) {
            return true;
        }

        // Students can view analytics for quizzes they've taken
        if ($user->role === 'student') {
            return QuizSubmissions::where('quiz_id', $quiz->id)
                ->where('student_id', $user->id)
                ->exists();
        }

        return false;
    }

    /**
     * Helper methods for complex calculations
     */
    private function calculateStudentTrends(int $studentId, string $period, int $duration, ?int $programId): array
    {
        $query = QuizSubmissions::where('student_id', $studentId);
        
        if ($programId) {
            $query->whereHas('quiz', fn($q) => $q->where('program_id', $programId));
        }

        $startDate = match ($period) {
            'daily' => Carbon::now()->subDays($duration),
            'weekly' => Carbon::now()->subWeeks($duration),
            'monthly' => Carbon::now()->subMonths($duration),
        };

        $submissions = $query->where('submitted_at', '>=', $startDate)
            ->orderBy('submitted_at')
            ->get();

        $trends = [];
        $groupedSubmissions = $submissions->groupBy(function ($submission) use ($period) {
            return match ($period) {
                'daily' => Carbon::parse($submission->submitted_at)->format('Y-m-d'),
                'weekly' => Carbon::parse($submission->submitted_at)->format('Y-W'),
                'monthly' => Carbon::parse($submission->submitted_at)->format('Y-m'),
            };
        });

        foreach ($groupedSubmissions as $periodKey => $periodSubmissions) {
            $trends[] = [
                'period' => $periodKey,
                'average_score' => round($periodSubmissions->avg('percentage'), 1),
                'quiz_count' => $periodSubmissions->count(),
                'pass_rate' => round(($periodSubmissions->where('is_passed', true)->count() / $periodSubmissions->count()) * 100, 1),
                'best_score' => $periodSubmissions->max('percentage'),
                'time_spent' => $periodSubmissions->sum('time_taken_minutes'),
            ];
        }

        return [
            'trends' => $trends,
            'summary' => [
                'total_periods' => count($trends),
                'overall_trend' => $this->calculateOverallTrend($trends),
                'improvement_rate' => $this->calculateImprovementRate($trends),
            ]
        ];
    }

    private function calculateClassComparison(int $primaryProgramId, array $compareWith, string $metric): array
    {
        $programs = [$primaryProgramId, ...$compareWith];
        $comparison = [];

        foreach ($programs as $programId) {
            $analytics = $this->analyticsService->getClassAnalytics($programId);
            $program = Programs::find($programId);

            $comparison[] = [
                'program_id' => $programId,
                'program_name' => $program->name ?? 'Unknown Program',
                'metric_value' => $this->extractMetricValue($analytics, $metric),
                'is_primary' => $programId === $primaryProgramId,
                'student_count' => $analytics['class_overview']['total_students'] ?? 0,
                'submission_count' => $analytics['class_overview']['total_submissions'] ?? 0,
            ];
        }

        return [
            'comparison' => $comparison,
            'metric' => $metric,
            'best_performing' => collect($comparison)->sortByDesc('metric_value')->first(),
            'average' => round(collect($comparison)->avg('metric_value'), 1),
        ];
    }

    private function generateReportData(int $programId, array $include, string $timeframe): array
    {
        $reportData = [];
        $options = ['timeframe' => $timeframe];

        if (in_array('overview', $include)) {
            $reportData['overview'] = $this->analyticsService->getClassAnalytics($programId, $options);
        }

        if (in_array('students', $include)) {
            $reportData['students'] = $this->getStudentReportData($programId, $options);
        }

        if (in_array('quizzes', $include)) {
            $reportData['quizzes'] = $this->getQuizReportData($programId, $options);
        }

        if (in_array('questions', $include)) {
            $reportData['questions'] = $this->getQuestionReportData($programId, $options);
        }

        if (in_array('trends', $include)) {
            $reportData['trends'] = $this->getTrendReportData($programId, $options);
        }

        return $reportData;
    }

    private function getLevelInfo(string $level): array
    {
        $levelInfo = [
            'A1' => ['name' => 'Beginner', 'description' => 'Basic user level'],
            'A2' => ['name' => 'Elementary', 'description' => 'Basic user level'],
            'B1' => ['name' => 'Intermediate', 'description' => 'Independent user level'],
            'B2' => ['name' => 'Upper Intermediate', 'description' => 'Independent user level'],
            'C1' => ['name' => 'Advanced', 'description' => 'Proficient user level'],
            'C2' => ['name' => 'Proficiency', 'description' => 'Proficient user level'],
        ];

        return $levelInfo[$level] ?? ['name' => 'Unknown', 'description' => 'Unknown level'];
    }

    private function calculateLevelProgression(int $programId, string $level): array
    {
        // This would analyze how students progress through levels
        // For now, return a simplified structure
        return [
            'current_level_performance' => 'Good implementation would go here',
            'progression_rate' => 'Calculation needed',
            'readiness_for_next_level' => 'Assessment needed',
        ];
    }

    private function getQuickStats(int $programId): array
    {
        $analytics = $this->analyticsService->getClassAnalytics($programId, ['timeframe' => 'week']);
        
        return [
            'weekly_submissions' => $analytics['class_overview']['total_submissions'] ?? 0,
            'active_students' => $analytics['class_overview']['active_students'] ?? 0,
            'average_score' => $analytics['class_overview']['average_class_score'] ?? 0,
            'pass_rate' => $analytics['class_overview']['class_pass_rate'] ?? 0,
        ];
    }

    private function getRecentActivity(int $programId): array
    {
        $recentSubmissions = QuizSubmissions::whereHas('quiz', fn($q) => $q->where('program_id', $programId))
            ->with(['student', 'quiz'])
            ->orderBy('submitted_at', 'desc')
            ->take(10)
            ->get();

        return $recentSubmissions->map(function ($submission) {
            return [
                'student_name' => $submission->student->name ?? 'Unknown',
                'quiz_title' => $submission->quiz->title ?? 'Unknown Quiz',
                'score' => $submission->percentage,
                'submitted_at' => $submission->submitted_at->toISOString(),
            ];
        })->toArray();
    }

    private function getPerformanceAlerts(int $programId): array
    {
        // This would identify students or quizzes that need attention
        return [
            'struggling_students' => [],
            'difficult_quizzes' => [],
            'low_engagement' => [],
        ];
    }

    private function getTrendingQuizzes(int $programId): array
    {
        // This would identify popular or frequently taken quizzes
        return [];
    }

    private function getStudentHighlights(int $programId): array
    {
        // This would identify top performers or notable achievements
        return [];
    }

    // Additional helper methods would continue here...
    private function calculateOverallTrend(array $trends): string
    {
        if (count($trends) < 2) return 'insufficient_data';
        
        $scores = collect($trends)->pluck('average_score');
        $recent = $scores->slice(-2)->avg();
        $previous = $scores->slice(-4, 2)->avg();
        
        if ($recent > $previous + 3) return 'improving';
        if ($recent < $previous - 3) return 'declining';
        return 'stable';
    }

    private function calculateImprovementRate(array $trends): float
    {
        if (count($trends) < 2) return 0;
        
        $scores = collect($trends)->pluck('average_score');
        $first = $scores->first();
        $last = $scores->last();
        
        return $first > 0 ? round((($last - $first) / $first) * 100, 1) : 0;
    }

    private function extractMetricValue(array $analytics, string $metric): float
    {
        return match ($metric) {
            'average_score' => $analytics['class_overview']['average_class_score'] ?? 0,
            'pass_rate' => $analytics['class_overview']['class_pass_rate'] ?? 0,
            'completion_rate' => $analytics['engagement_metrics']['overall_participation'] ?? 0,
            'engagement' => $analytics['engagement_metrics']['average_attempts_per_student'] ?? 0,
            default => 0,
        };
    }

    private function getStudentReportData(int $programId, array $options): array
    {
        // Implementation for student report data
        return [];
    }

    private function getQuizReportData(int $programId, array $options): array
    {
        // Implementation for quiz report data
        return [];
    }

    private function getQuestionReportData(int $programId, array $options): array
    {
        // Implementation for question report data
        return [];
    }

    private function getTrendReportData(int $programId, array $options): array
    {
        // Implementation for trend report data
        return [];
    }
}