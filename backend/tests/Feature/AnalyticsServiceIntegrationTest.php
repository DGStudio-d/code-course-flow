<?php

namespace Tests\Feature;

use Tests\TestCase;
use App\Services\AnalyticsService;
use App\Models\User;
use App\Models\Quiz;
use App\Models\QuizSubmissions;
use App\Models\QuizQuestions;
use App\Models\QuizOptions;
use App\Models\SubmissionAnswers;
use App\Models\Programs;
use App\Models\Enrollment;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Carbon\Carbon;

class AnalyticsServiceIntegrationTest extends TestCase
{
    use RefreshDatabase;

    private AnalyticsService $analyticsService;
    private User $teacher;
    private Programs $program;
    private array $students;
    private array $quizzes;

    protected function setUp(): void
    {
        parent::setUp();
        
        $this->analyticsService = new AnalyticsService();
        
        // Create teacher and program
        $this->teacher = User::factory()->create(['role' => 'teacher']);
        $this->program = Programs::factory()->create(['teacher_id' => $this->teacher->id]);
        
        // Create multiple students
        $this->students = [];
        for ($i = 0; $i < 5; $i++) {
            $student = User::factory()->create(['role' => 'student', 'name' => "Student {$i}"]);
            $this->students[] = $student;
            
            Enrollment::factory()->create([
                'student_id' => $student->id,
                'program_id' => $this->program->id,
                'status' => 'active'
            ]);
        }
        
        // Create multiple quizzes at different levels
        $this->quizzes = [];
        $levels = ['A1', 'A2', 'B1', 'B2'];
        
        foreach ($levels as $level) {
            $quiz = Quiz::factory()->create([
                'program_id' => $this->program->id,
                'teacher_id' => $this->teacher->id,
                'proficiency_level' => $level,
                'title' => "Quiz {$level}",
                'time_limit_minutes' => 60,
                'passing_score' => 70
            ]);
            
            $this->quizzes[$level] = $quiz;
            
            // Create questions for each quiz
            $this->createQuestionsForQuiz($quiz);
        }
    }

    public function test_comprehensive_student_performance_analysis()
    {
        $student = $this->students[0];
        
        // Create varied performance data over time
        $this->createStudentPerformanceHistory($student);
        
        $performance = $this->analyticsService->getStudentPerformance($student->id);
        
        // Verify overview metrics
        $this->assertGreaterThan(0, $performance['overview']['total_quizzes_taken']);
        $this->assertArrayHasKey('pass_rate', $performance['overview']);
        $this->assertArrayHasKey('average_score', $performance['overview']);
        $this->assertArrayHasKey('current_streak', $performance['overview']);
        
        // Verify performance trends
        $this->assertArrayHasKey('performance_trends', $performance);
        $this->assertNotEmpty($performance['performance_trends']);
        
        // Verify proficiency breakdown
        $this->assertArrayHasKey('proficiency_breakdown', $performance);
        $this->assertArrayHasKey('A1', $performance['proficiency_breakdown']);
        $this->assertArrayHasKey('B1', $performance['proficiency_breakdown']);
        
        // Verify question type performance
        $this->assertArrayHasKey('question_type_performance', $performance);
        $this->assertArrayHasKey('multiple_choice', $performance['question_type_performance']);
        $this->assertArrayHasKey('fill_blank', $performance['question_type_performance']);
        
        // Verify improvement areas identification
        $this->assertArrayHasKey('improvement_areas', $performance);
        
        // Verify achievements
        $this->assertArrayHasKey('achievements', $performance);
        
        // Verify time analysis
        $this->assertArrayHasKey('time_analysis', $performance);
    }

    public function test_class_analytics_with_diverse_student_performance()
    {
        // Create diverse performance patterns for different students
        foreach ($this->students as $index => $student) {
            $this->createVariedStudentPerformance($student, $index);
        }
        
        $analytics = $this->analyticsService->getClassAnalytics($this->program->id);
        
        // Verify class overview
        $this->assertEquals(5, $analytics['class_overview']['total_students']);
        $this->assertEquals(5, $analytics['class_overview']['active_students']);
        $this->assertEquals(100.0, $analytics['class_overview']['participation_rate']);
        $this->assertGreaterThan(0, $analytics['class_overview']['total_submissions']);
        
        // Verify student rankings
        $this->assertCount(5, $analytics['student_rankings']);
        $this->assertArrayHasKey('student_id', $analytics['student_rankings'][0]);
        $this->assertArrayHasKey('average_score', $analytics['student_rankings'][0]);
        
        // Verify rankings are sorted by performance
        $scores = collect($analytics['student_rankings'])->pluck('average_score');
        $this->assertEquals($scores->sort()->reverse()->values()->all(), $scores->all());
        
        // Verify quiz effectiveness analysis
        $this->assertArrayHasKey('quiz_effectiveness', $analytics);
        $this->assertNotEmpty($analytics['quiz_effectiveness']);
        
        // Verify question difficulty analysis
        $this->assertArrayHasKey('question_difficulty', $analytics);
        $this->assertNotEmpty($analytics['question_difficulty']);
        
        // Verify engagement metrics
        $this->assertArrayHasKey('engagement_metrics', $analytics);
        $this->assertArrayHasKey('overall_participation', $analytics['engagement_metrics']);
        $this->assertArrayHasKey('average_attempts_per_student', $analytics['engagement_metrics']);
        
        // Verify progress tracking
        $this->assertArrayHasKey('progress_tracking', $analytics);
        $this->assertArrayHasKey('monthly_progress', $analytics['progress_tracking']);
        
        // Verify common mistakes identification
        $this->assertArrayHasKey('common_mistakes', $analytics);
    }

    public function test_quiz_analytics_comprehensive_analysis()
    {
        $quiz = $this->quizzes['B1'];
        
        // Create comprehensive submission data for the quiz
        $this->createComprehensiveQuizSubmissions($quiz);
        
        $analytics = $this->analyticsService->getQuizAnalytics($quiz->id);
        
        // Verify quiz overview
        $this->assertArrayHasKey('quiz_overview', $analytics);
        $this->assertGreaterThan(0, $analytics['quiz_overview']['total_attempts']);
        $this->assertGreaterThan(0, $analytics['quiz_overview']['unique_students']);
        $this->assertArrayHasKey('completion_rate', $analytics['quiz_overview']);
        $this->assertArrayHasKey('average_score', $analytics['quiz_overview']);
        $this->assertArrayHasKey('pass_rate', $analytics['quiz_overview']);
        
        // Verify question analysis
        $this->assertArrayHasKey('question_analysis', $analytics);
        $this->assertNotEmpty($analytics['question_analysis']);
        
        foreach ($analytics['question_analysis'] as $questionAnalysis) {
            $this->assertArrayHasKey('question_id', $questionAnalysis);
            $this->assertArrayHasKey('correct_rate', $questionAnalysis);
            $this->assertArrayHasKey('difficulty_level', $questionAnalysis);
            $this->assertArrayHasKey('discrimination_index', $questionAnalysis);
        }
        
        // Verify performance distribution
        $this->assertArrayHasKey('performance_distribution', $analytics);
        $distribution = $analytics['performance_distribution'];
        $this->assertArrayHasKey('90-100', $distribution);
        $this->assertArrayHasKey('80-89', $distribution);
        $this->assertArrayHasKey('70-79', $distribution);
        
        // Verify completion metrics
        $this->assertArrayHasKey('completion_metrics', $analytics);
        
        // Verify time analysis
        $this->assertArrayHasKey('time_analysis', $analytics);
        
        // Verify difficulty assessment
        $this->assertArrayHasKey('difficulty_assessment', $analytics);
    }

    public function test_analytics_performance_with_large_dataset()
    {
        // Create a large dataset to test performance
        $this->createLargeDataset();
        
        $startTime = microtime(true);
        
        // Test student performance analytics
        $performance = $this->analyticsService->getStudentPerformance($this->students[0]->id);
        
        $studentAnalyticsTime = microtime(true) - $startTime;
        
        // Should complete within reasonable time (less than 2 seconds)
        $this->assertLessThan(2.0, $studentAnalyticsTime);
        
        $startTime = microtime(true);
        
        // Test class analytics
        $classAnalytics = $this->analyticsService->getClassAnalytics($this->program->id);
        
        $classAnalyticsTime = microtime(true) - $startTime;
        
        // Should complete within reasonable time (less than 3 seconds)
        $this->assertLessThan(3.0, $classAnalyticsTime);
        
        // Verify data integrity with large dataset
        $this->assertArrayHasKey('overview', $performance);
        $this->assertArrayHasKey('class_overview', $classAnalytics);
        $this->assertGreaterThan(0, $performance['overview']['total_quizzes_taken']);
        $this->assertGreaterThan(0, $classAnalytics['class_overview']['total_submissions']);
    }

    public function test_analytics_with_edge_cases()
    {
        // Test with student who has no submissions
        $newStudent = User::factory()->create(['role' => 'student']);
        Enrollment::factory()->create([
            'student_id' => $newStudent->id,
            'program_id' => $this->program->id,
            'status' => 'active'
        ]);
        
        $performance = $this->analyticsService->getStudentPerformance($newStudent->id);
        
        $this->assertEquals(0, $performance['overview']['total_quizzes_taken']);
        $this->assertEquals(0, $performance['overview']['pass_rate']);
        $this->assertEmpty($performance['performance_trends']);
        
        // Test with quiz that has no submissions
        $emptyQuiz = Quiz::factory()->create([
            'program_id' => $this->program->id,
            'teacher_id' => $this->teacher->id
        ]);
        
        $quizAnalytics = $this->analyticsService->getQuizAnalytics($emptyQuiz->id);
        
        $this->assertEquals(0, $quizAnalytics['quiz_overview']['total_attempts']);
        $this->assertEquals(0, $quizAnalytics['quiz_overview']['unique_students']);
        
        // Test with program that has no active enrollments
        $emptyProgram = Programs::factory()->create(['teacher_id' => $this->teacher->id]);
        
        $emptyClassAnalytics = $this->analyticsService->getClassAnalytics($emptyProgram->id);
        
        $this->assertEquals(0, $emptyClassAnalytics['class_overview']['total_students']);
        $this->assertEquals(0, $emptyClassAnalytics['class_overview']['active_students']);
    }

    public function test_analytics_timeframe_filtering_accuracy()
    {
        $student = $this->students[0];
        
        // Create submissions across different time periods
        $oldSubmission = QuizSubmissions::factory()->create([
            'quiz_id' => $this->quizzes['A1']->id,
            'student_id' => $student->id,
            'percentage' => 60,
            'is_passed' => false,
            'submitted_at' => Carbon::now()->subMonths(3)
        ]);
        
        $recentSubmission = QuizSubmissions::factory()->create([
            'quiz_id' => $this->quizzes['B1']->id,
            'student_id' => $student->id,
            'percentage' => 90,
            'is_passed' => true,
            'submitted_at' => Carbon::now()->subDays(5)
        ]);
        
        // Test week timeframe
        $weekPerformance = $this->analyticsService->getStudentPerformance(
            $student->id, 
            ['timeframe' => 'week']
        );
        
        $this->assertEquals(1, $weekPerformance['overview']['total_quizzes_taken']);\n        $this->assertEquals(90.0, $weekPerformance['overview']['average_score']);\n        \n        // Test month timeframe\n        $monthPerformance = $this->analyticsService->getStudentPerformance(\n            $student->id, \n            ['timeframe' => 'month']\n        );\n        \n        $this->assertEquals(1, $monthPerformance['overview']['total_quizzes_taken']);\n        $this->assertEquals(90.0, $monthPerformance['overview']['average_score']);\n        \n        // Test all timeframe\n        $allPerformance = $this->analyticsService->getStudentPerformance(\n            $student->id, \n            ['timeframe' => 'all']\n        );\n        \n        $this->assertEquals(2, $allPerformance['overview']['total_quizzes_taken']);\n        $this->assertEquals(75.0, $allPerformance['overview']['average_score']);\n    }\n\n    public function test_proficiency_level_filtering_accuracy()\n    {\n        $student = $this->students[0];\n        \n        // Create submissions for different proficiency levels\n        QuizSubmissions::factory()->create([\n            'quiz_id' => $this->quizzes['A1']->id,\n            'student_id' => $student->id,\n            'percentage' => 85,\n            'is_passed' => true\n        ]);\n        \n        QuizSubmissions::factory()->create([\n            'quiz_id' => $this->quizzes['B2']->id,\n            'student_id' => $student->id,\n            'percentage' => 70,\n            'is_passed' => true\n        ]);\n        \n        // Test A1 level filtering\n        $a1Performance = $this->analyticsService->getStudentPerformance(\n            $student->id,\n            ['proficiency_level' => 'A1']\n        );\n        \n        $this->assertEquals(1, $a1Performance['overview']['total_quizzes_taken']);\n        $this->assertEquals(85.0, $a1Performance['overview']['average_score']);\n        \n        // Test B2 level filtering\n        $b2Performance = $this->analyticsService->getStudentPerformance(\n            $student->id,\n            ['proficiency_level' => 'B2']\n        );\n        \n        $this->assertEquals(1, $b2Performance['overview']['total_quizzes_taken']);\n        $this->assertEquals(70.0, $b2Performance['overview']['average_score']);\n        \n        // Test class analytics with level filtering\n        $classA1Analytics = $this->analyticsService->getClassAnalytics(\n            $this->program->id,\n            ['proficiency_level' => 'A1']\n        );\n        \n        // Should only include A1 level data\n        $this->assertGreaterThan(0, $classA1Analytics['class_overview']['total_submissions']);\n    }\n\n    /**\n     * Helper methods for creating test data\n     */\n    private function createQuestionsForQuiz(Quiz $quiz): void\n    {\n        $questionTypes = ['multiple_choice', 'fill_blank', 'short_answer', 'true_false'];\n        \n        foreach ($questionTypes as $type) {\n            $question = QuizQuestions::factory()->create([\n                'quiz_id' => $quiz->id,\n                'type' => $type,\n                'question' => \"Sample {$type} question for {$quiz->title}\",\n                'points' => rand(2, 5)\n            ]);\n            \n            if (in_array($type, ['multiple_choice', 'true_false'])) {\n                // Create options for multiple choice and true/false questions\n                QuizOptions::factory()->create([\n                    'question_id' => $question->id,\n                    'option_text' => 'Correct Answer',\n                    'is_correct' => true\n                ]);\n                \n                QuizOptions::factory()->create([\n                    'question_id' => $question->id,\n                    'option_text' => 'Wrong Answer',\n                    'is_correct' => false\n                ]);\n            }\n        }\n    }\n\n    private function createStudentPerformanceHistory(User $student): void\n    {\n        $dates = [\n            Carbon::now()->subMonths(3),\n            Carbon::now()->subMonths(2),\n            Carbon::now()->subMonth(),\n            Carbon::now()->subWeeks(2),\n            Carbon::now()->subWeek(),\n            Carbon::now()->subDays(3)\n        ];\n        \n        $scores = [60, 65, 75, 80, 85, 90]; // Improving trend\n        \n        foreach ($dates as $index => $date) {\n            $quiz = $this->quizzes[array_keys($this->quizzes)[$index % count($this->quizzes)]];\n            \n            $submission = QuizSubmissions::factory()->create([\n                'quiz_id' => $quiz->id,\n                'student_id' => $student->id,\n                'percentage' => $scores[$index],\n                'is_passed' => $scores[$index] >= 70,\n                'time_taken_minutes' => rand(30, 55),\n                'submitted_at' => $date\n            ]);\n            \n            // Create answers for the submission\n            $this->createAnswersForSubmission($submission, $quiz);\n        }\n    }\n\n    private function createVariedStudentPerformance(User $student, int $index): void\n    {\n        $performancePatterns = [\n            [90, 85, 88, 92], // High performer\n            [75, 78, 72, 80], // Average performer\n            [60, 65, 58, 70], // Struggling student\n            [85, 60, 90, 75], // Inconsistent performer\n            [70, 75, 80, 85], // Improving student\n        ];\n        \n        $scores = $performancePatterns[$index % count($performancePatterns)];\n        \n        foreach ($scores as $scoreIndex => $score) {\n            $quiz = $this->quizzes[array_keys($this->quizzes)[$scoreIndex % count($this->quizzes)]];\n            \n            $submission = QuizSubmissions::factory()->create([\n                'quiz_id' => $quiz->id,\n                'student_id' => $student->id,\n                'percentage' => $score,\n                'is_passed' => $score >= 70,\n                'time_taken_minutes' => rand(25, 60),\n                'submitted_at' => Carbon::now()->subDays(rand(1, 30))\n            ]);\n            \n            $this->createAnswersForSubmission($submission, $quiz);\n        }\n    }\n\n    private function createComprehensiveQuizSubmissions(Quiz $quiz): void\n    {\n        foreach ($this->students as $student) {\n            // Create 1-3 attempts per student\n            $attempts = rand(1, 3);\n            \n            for ($i = 0; $i < $attempts; $i++) {\n                $score = rand(40, 100);\n                \n                $submission = QuizSubmissions::factory()->create([\n                    'quiz_id' => $quiz->id,\n                    'student_id' => $student->id,\n                    'percentage' => $score,\n                    'is_passed' => $score >= 70,\n                    'time_taken_minutes' => rand(20, 60),\n                    'submitted_at' => Carbon::now()->subDays(rand(1, 14))\n                ]);\n                \n                $this->createAnswersForSubmission($submission, $quiz);\n            }\n        }\n    }\n\n    private function createAnswersForSubmission(QuizSubmissions $submission, Quiz $quiz): void\n    {\n        $questions = QuizQuestions::where('quiz_id', $quiz->id)->get();\n        \n        foreach ($questions as $question) {\n            $isCorrect = rand(0, 100) < $submission->percentage; // Probability based on submission score\n            $pointsEarned = $isCorrect ? $question->points : rand(0, $question->points - 1);\n            \n            SubmissionAnswers::factory()->create([\n                'submission_id' => $submission->id,\n                'question_id' => $question->id,\n                'is_correct' => $isCorrect,\n                'points_earned' => $pointsEarned,\n                'answer_text' => $isCorrect ? 'Correct answer' : 'Incorrect answer'\n            ]);\n        }\n    }\n\n    private function createLargeDataset(): void\n    {\n        // Create additional students for large dataset\n        for ($i = 0; $i < 20; $i++) {\n            $student = User::factory()->create(['role' => 'student']);\n            \n            Enrollment::factory()->create([\n                'student_id' => $student->id,\n                'program_id' => $this->program->id,\n                'status' => 'active'\n            ]);\n            \n            // Create multiple submissions for each student\n            foreach ($this->quizzes as $quiz) {\n                for ($j = 0; $j < rand(1, 5); $j++) {\n                    $submission = QuizSubmissions::factory()->create([\n                        'quiz_id' => $quiz->id,\n                        'student_id' => $student->id,\n                        'percentage' => rand(40, 100),\n                        'is_passed' => rand(0, 1),\n                        'time_taken_minutes' => rand(15, 60),\n                        'submitted_at' => Carbon::now()->subDays(rand(1, 90))\n                    ]);\n                    \n                    $this->createAnswersForSubmission($submission, $quiz);\n                }\n            }\n        }\n    }\n}