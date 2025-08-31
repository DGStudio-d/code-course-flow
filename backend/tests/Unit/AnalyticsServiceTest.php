<?php

namespace Tests\Unit;

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

class AnalyticsServiceTest extends TestCase
{
    use RefreshDatabase;

    private AnalyticsService $analyticsService;
    private User $student;
    private User $teacher;
    private Programs $program;
    private Quiz $quiz;

    protected function setUp(): void
    {
        parent::setUp();
        
        $this->analyticsService = new AnalyticsService();
        
        $this->teacher = User::factory()->create(['role' => 'teacher']);
        $this->student = User::factory()->create(['role' => 'student']);
        $this->program = Programs::factory()->create(['teacher_id' => $this->teacher->id]);
        
        Enrollment::factory()->create([
            'student_id' => $this->student->id,
            'program_id' => $this->program->id,
            'status' => 'active'
        ]);

        $this->quiz = Quiz::factory()->create([
            'program_id' => $this->program->id,
            'teacher_id' => $this->teacher->id,
            'proficiency_level' => 'B1',
            'time_limit_minutes' => 60,
            'passing_score' => 70
        ]);
    }

    public function test_get_student_performance_with_no_submissions()
    {
        $performance = $this->analyticsService->getStudentPerformance($this->student->id);

        $this->assertEquals(0, $performance['overview']['total_quizzes_taken']);
        $this->assertEquals(0, $performance['overview']['pass_rate']);
        $this->assertEquals(0, $performance['overview']['average_score']);
        $this->assertEmpty($performance['performance_trends']);
        $this->assertEmpty($performance['proficiency_breakdown']);
    }

    public function test_get_student_performance_with_submissions()
    {
        // Create test submissions
        $submission1 = QuizSubmissions::factory()->create([
            'quiz_id' => $this->quiz->id,
            'student_id' => $this->student->id,
            'total_score' => 8,
            'max_possible_score' => 10,
            'percentage' => 80,
            'is_passed' => true,
            'time_taken_minutes' => 45,
            'submitted_at' => Carbon::now()->subDays(5)
        ]);

        $submission2 = QuizSubmissions::factory()->create([
            'quiz_id' => $this->quiz->id,
            'student_id' => $this->student->id,
            'total_score' => 9,
            'max_possible_score' => 10,
            'percentage' => 90,
            'is_passed' => true,
            'time_taken_minutes' => 40,
            'submitted_at' => Carbon::now()->subDays(2)
        ]);

        $performance = $this->analyticsService->getStudentPerformance($this->student->id);

        $this->assertEquals(2, $performance['overview']['total_quizzes_taken']);
        $this->assertEquals(100.0, $performance['overview']['pass_rate']);
        $this->assertEquals(85.0, $performance['overview']['average_score']);
        $this->assertEquals(90, $performance['overview']['best_score']);
        $this->assertArrayHasKey('performance_trends', $performance);
        $this->assertArrayHasKey('proficiency_breakdown', $performance);
    }

    public function test_student_performance_with_different_proficiency_levels()
    {
        // Create quizzes at different levels
        $quizA1 = Quiz::factory()->create([
            'program_id' => $this->program->id,
            'proficiency_level' => 'A1'
        ]);

        $quizB2 = Quiz::factory()->create([
            'program_id' => $this->program->id,
            'proficiency_level' => 'B2'
        ]);

        // Create submissions for different levels
        QuizSubmissions::factory()->create([
            'quiz_id' => $quizA1->id,
            'student_id' => $this->student->id,
            'percentage' => 95,
            'is_passed' => true
        ]);

        QuizSubmissions::factory()->create([
            'quiz_id' => $quizB2->id,
            'student_id' => $this->student->id,
            'percentage' => 65,
            'is_passed' => false
        ]);

        $performance = $this->analyticsService->getStudentPerformance($this->student->id);

        $this->assertArrayHasKey('A1', $performance['proficiency_breakdown']);
        $this->assertArrayHasKey('B2', $performance['proficiency_breakdown']);
        $this->assertEquals(95.0, $performance['proficiency_breakdown']['A1']['average_score']);
        $this->assertEquals(65.0, $performance['proficiency_breakdown']['B2']['average_score']);
    }

    public function test_student_performance_question_type_analysis()
    {
        // Create questions of different types
        $mcQuestion = QuizQuestions::factory()->create([
            'quiz_id' => $this->quiz->id,
            'type' => 'multiple_choice',
            'points' => 2
        ]);

        $fbQuestion = QuizQuestions::factory()->create([
            'quiz_id' => $this->quiz->id,
            'type' => 'fill_blank',
            'points' => 3
        ]);

        $submission = QuizSubmissions::factory()->create([
            'quiz_id' => $this->quiz->id,
            'student_id' => $this->student->id
        ]);

        // Create answers
        SubmissionAnswers::factory()->create([
            'submission_id' => $submission->id,
            'question_id' => $mcQuestion->id,
            'is_correct' => true,
            'points_earned' => 2
        ]);

        SubmissionAnswers::factory()->create([
            'submission_id' => $submission->id,
            'question_id' => $fbQuestion->id,
            'is_correct' => false,
            'points_earned' => 0
        ]);

        $performance = $this->analyticsService->getStudentPerformance($this->student->id);

        $this->assertArrayHasKey('multiple_choice', $performance['question_type_performance']);
        $this->assertArrayHasKey('fill_blank', $performance['question_type_performance']);
        $this->assertEquals(100.0, $performance['question_type_performance']['multiple_choice']['accuracy_rate']);
        $this->assertEquals(0.0, $performance['question_type_performance']['fill_blank']['accuracy_rate']);
    }

    public function test_student_performance_improvement_areas_identification()
    {
        // Create a question type with poor performance
        $question = QuizQuestions::factory()->create([
            'quiz_id' => $this->quiz->id,
            'type' => 'essay',
            'points' => 5
        ]);

        $submission = QuizSubmissions::factory()->create([
            'quiz_id' => $this->quiz->id,
            'student_id' => $this->student->id
        ]);

        // Create multiple incorrect answers for the same question type
        for ($i = 0; $i < 3; $i++) {
            SubmissionAnswers::factory()->create([
                'submission_id' => $submission->id,
                'question_id' => $question->id,
                'is_correct' => false,
                'points_earned' => 1 // Partial credit
            ]);
        }

        $performance = $this->analyticsService->getStudentPerformance($this->student->id);

        $this->assertNotEmpty($performance['improvement_areas']);
        $improvementArea = collect($performance['improvement_areas'])
            ->firstWhere('area', 'question_type');
        
        $this->assertNotNull($improvementArea);
        $this->assertEquals('essay', $improvementArea['type']);
    }

    public function test_student_performance_achievements_calculation()
    {
        // Create perfect score submissions
        for ($i = 0; $i < 2; $i++) {
            QuizSubmissions::factory()->create([
                'quiz_id' => $this->quiz->id,
                'student_id' => $this->student->id,
                'percentage' => 100,
                'is_passed' => true,
                'submitted_at' => Carbon::now()->subDays($i)
            ]);
        }

        $performance = $this->analyticsService->getStudentPerformance($this->student->id);

        $this->assertNotEmpty($performance['achievements']);
        $perfectScoreAchievement = collect($performance['achievements'])
            ->firstWhere('type', 'perfect_scores');
        
        $this->assertNotNull($perfectScoreAchievement);
        $this->assertEquals(2, $perfectScoreAchievement['count']);
    }

    public function test_student_performance_time_analysis()
    {
        // Create submissions with different time patterns
        QuizSubmissions::factory()->create([
            'quiz_id' => $this->quiz->id,
            'student_id' => $this->student->id,
            'time_taken_minutes' => 30, // 50% of time limit
            'submitted_at' => Carbon::now()->subDays(1)
        ]);

        QuizSubmissions::factory()->create([
            'quiz_id' => $this->quiz->id,
            'student_id' => $this->student->id,
            'time_taken_minutes' => 58, // 97% of time limit
            'submitted_at' => Carbon::now()
        ]);

        $performance = $this->analyticsService->getStudentPerformance($this->student->id);

        $this->assertArrayHasKey('time_analysis', $performance);
        $this->assertArrayHasKey('efficiency_score', $performance['time_analysis']);
        $this->assertArrayHasKey('suggestion', $performance['time_analysis']);
    }

    public function test_get_class_analytics()
    {
        // Create additional students
        $student2 = User::factory()->create(['role' => 'student']);
        $student3 = User::factory()->create(['role' => 'student']);

        Enrollment::factory()->create([
            'student_id' => $student2->id,
            'program_id' => $this->program->id,
            'status' => 'active'
        ]);

        Enrollment::factory()->create([
            'student_id' => $student3->id,
            'program_id' => $this->program->id,
            'status' => 'active'
        ]);

        // Create submissions for different students
        QuizSubmissions::factory()->create([
            'quiz_id' => $this->quiz->id,
            'student_id' => $this->student->id,
            'percentage' => 85,
            'is_passed' => true
        ]);

        QuizSubmissions::factory()->create([
            'quiz_id' => $this->quiz->id,
            'student_id' => $student2->id,
            'percentage' => 75,
            'is_passed' => true
        ]);

        QuizSubmissions::factory()->create([
            'quiz_id' => $this->quiz->id,
            'student_id' => $student3->id,
            'percentage' => 60,
            'is_passed' => false
        ]);

        $analytics = $this->analyticsService->getClassAnalytics($this->program->id);

        $this->assertEquals(3, $analytics['class_overview']['total_students']);
        $this->assertEquals(3, $analytics['class_overview']['active_students']);
        $this->assertEquals(100.0, $analytics['class_overview']['participation_rate']);
        $this->assertEquals(73.3, $analytics['class_overview']['average_class_score']);
        $this->assertEquals(66.7, $analytics['class_overview']['class_pass_rate']);
        
        $this->assertArrayHasKey('student_rankings', $analytics);
        $this->assertArrayHasKey('quiz_effectiveness', $analytics);
        $this->assertArrayHasKey('engagement_metrics', $analytics);
    }

    public function test_class_analytics_student_rankings()
    {
        $student2 = User::factory()->create(['role' => 'student', 'name' => 'Student Two']);
        
        Enrollment::factory()->create([
            'student_id' => $student2->id,
            'program_id' => $this->program->id,
            'status' => 'active'
        ]);

        // Student 1: Higher average
        QuizSubmissions::factory()->create([
            'quiz_id' => $this->quiz->id,
            'student_id' => $this->student->id,
            'percentage' => 90,
            'is_passed' => true
        ]);

        // Student 2: Lower average
        QuizSubmissions::factory()->create([
            'quiz_id' => $this->quiz->id,
            'student_id' => $student2->id,
            'percentage' => 70,
            'is_passed' => true
        ]);

        $analytics = $this->analyticsService->getClassAnalytics($this->program->id);

        $rankings = $analytics['student_rankings'];
        $this->assertCount(2, $rankings);
        
        // Check that rankings are sorted by average score (descending)
        $this->assertEquals($this->student->id, $rankings[0]['student_id']);
        $this->assertEquals(90.0, $rankings[0]['average_score']);
        $this->assertEquals($student2->id, $rankings[1]['student_id']);
        $this->assertEquals(70.0, $rankings[1]['average_score']);
    }

    public function test_get_quiz_analytics()
    {
        // Create questions for the quiz
        $question1 = QuizQuestions::factory()->create([
            'quiz_id' => $this->quiz->id,
            'type' => 'multiple_choice',
            'points' => 2
        ]);

        $question2 = QuizQuestions::factory()->create([
            'quiz_id' => $this->quiz->id,
            'type' => 'short_answer',
            'points' => 3
        ]);

        // Create submissions
        $submission1 = QuizSubmissions::factory()->create([
            'quiz_id' => $this->quiz->id,
            'student_id' => $this->student->id,
            'percentage' => 80,
            'is_passed' => true,
            'time_taken_minutes' => 45
        ]);

        $submission2 = QuizSubmissions::factory()->create([
            'quiz_id' => $this->quiz->id,
            'student_id' => $this->student->id,
            'percentage' => 90,
            'is_passed' => true,
            'time_taken_minutes' => 50
        ]);

        // Create answers
        SubmissionAnswers::factory()->create([
            'submission_id' => $submission1->id,
            'question_id' => $question1->id,
            'is_correct' => true,
            'points_earned' => 2
        ]);

        SubmissionAnswers::factory()->create([
            'submission_id' => $submission1->id,
            'question_id' => $question2->id,
            'is_correct' => false,
            'points_earned' => 1
        ]);

        $analytics = $this->analyticsService->getQuizAnalytics($this->quiz->id);

        $this->assertArrayHasKey('quiz_overview', $analytics);
        $this->assertArrayHasKey('question_analysis', $analytics);
        $this->assertArrayHasKey('performance_distribution', $analytics);
        
        $this->assertEquals(2, $analytics['quiz_overview']['total_attempts']);
        $this->assertEquals(1, $analytics['quiz_overview']['unique_students']);
        $this->assertEquals(85.0, $analytics['quiz_overview']['average_score']);
        $this->assertEquals(100.0, $analytics['quiz_overview']['pass_rate']);
    }

    public function test_analytics_with_timeframe_filtering()
    {
        // Create old submission (outside timeframe)
        QuizSubmissions::factory()->create([
            'quiz_id' => $this->quiz->id,
            'student_id' => $this->student->id,
            'percentage' => 60,
            'submitted_at' => Carbon::now()->subMonths(2)
        ]);

        // Create recent submission (within timeframe)
        QuizSubmissions::factory()->create([
            'quiz_id' => $this->quiz->id,
            'student_id' => $this->student->id,
            'percentage' => 90,
            'submitted_at' => Carbon::now()->subDays(5)
        ]);

        // Test with month timeframe
        $performance = $this->analyticsService->getStudentPerformance(
            $this->student->id, 
            ['timeframe' => 'month']
        );

        // Should only include the recent submission
        $this->assertEquals(1, $performance['overview']['total_quizzes_taken']);
        $this->assertEquals(90.0, $performance['overview']['average_score']);

        // Test with all timeframe
        $performanceAll = $this->analyticsService->getStudentPerformance(
            $this->student->id, 
            ['timeframe' => 'all']
        );

        // Should include both submissions
        $this->assertEquals(2, $performanceAll['overview']['total_quizzes_taken']);
        $this->assertEquals(75.0, $performanceAll['overview']['average_score']);
    }

    public function test_analytics_with_proficiency_level_filtering()
    {
        // Create quiz at different level
        $quizA2 = Quiz::factory()->create([
            'program_id' => $this->program->id,
            'proficiency_level' => 'A2'
        ]);

        // Create submissions for different levels
        QuizSubmissions::factory()->create([
            'quiz_id' => $this->quiz->id, // B1 level
            'student_id' => $this->student->id,
            'percentage' => 80
        ]);

        QuizSubmissions::factory()->create([
            'quiz_id' => $quizA2->id, // A2 level
            'student_id' => $this->student->id,
            'percentage' => 90
        ]);

        // Test filtering by B1 level
        $performance = $this->analyticsService->getStudentPerformance(
            $this->student->id,
            ['proficiency_level' => 'B1']
        );

        $this->assertEquals(1, $performance['overview']['total_quizzes_taken']);
        $this->assertEquals(80.0, $performance['overview']['average_score']);

        // Test filtering by A2 level
        $performanceA2 = $this->analyticsService->getStudentPerformance(
            $this->student->id,
            ['proficiency_level' => 'A2']
        );

        $this->assertEquals(1, $performanceA2['overview']['total_quizzes_taken']);
        $this->assertEquals(90.0, $performanceA2['overview']['average_score']);
    }

    public function test_question_difficulty_analysis()
    {
        $question = QuizQuestions::factory()->create([
            'quiz_id' => $this->quiz->id,
            'type' => 'multiple_choice',
            'points' => 2
        ]);

        $submission = QuizSubmissions::factory()->create([
            'quiz_id' => $this->quiz->id,
            'student_id' => $this->student->id
        ]);

        // Create multiple answers with different success rates
        SubmissionAnswers::factory()->create([
            'submission_id' => $submission->id,
            'question_id' => $question->id,
            'is_correct' => true,
            'points_earned' => 2
        ]);

        SubmissionAnswers::factory()->create([
            'submission_id' => $submission->id,
            'question_id' => $question->id,
            'is_correct' => false,
            'points_earned' => 0
        ]);

        $analytics = $this->analyticsService->getClassAnalytics($this->program->id);

        $this->assertArrayHasKey('question_difficulty', $analytics);
        $this->assertNotEmpty($analytics['question_difficulty']);
        
        $questionDifficulty = $analytics['question_difficulty'][0];
        $this->assertEquals($question->id, $questionDifficulty['question_id']);
        $this->assertEquals(50.0, $questionDifficulty['correct_rate']);
        $this->assertEquals('challenging', $questionDifficulty['difficulty_level']);
    }
}