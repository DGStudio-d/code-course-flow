<?php

namespace Tests\Feature;

use Tests\TestCase;
use App\Models\User;
use App\Models\Quiz;
use App\Models\QuizSubmissions;
use App\Models\QuizQuestions;
use App\Models\QuizOptions;
use App\Models\SubmissionAnswers;
use App\Models\Programs;
use App\Models\Enrollment;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Carbon\Carbon;

class AnalyticsControllerTest extends TestCase
{
    use RefreshDatabase;

    private User $student;
    private User $teacher;
    private User $otherTeacher;
    private Programs $program;
    private Quiz $quiz;

    protected function setUp(): void
    {
        parent::setUp();
        
        $this->teacher = User::factory()->create(['role' => 'teacher']);
        $this->otherTeacher = User::factory()->create(['role' => 'teacher']);
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
            'proficiency_level' => 'B1'
        ]);
    }

    public function test_student_can_view_own_performance_analytics()
    {
        Sanctum::actingAs($this->student);

        // Create some submission data
        QuizSubmissions::factory()->create([
            'quiz_id' => $this->quiz->id,
            'student_id' => $this->student->id,
            'percentage' => 85,
            'is_passed' => true
        ]);

        $response = $this->getJson('/api/v1/analytics/my-performance');

        $response->assertStatus(200)
                ->assertJsonStructure([
                    'data' => [
                        'overview',
                        'performance_trends',
                        'proficiency_breakdown',
                        'question_type_performance',
                        'improvement_areas',
                        'achievements',
                        'time_analysis'
                    ],
                    'meta' => [
                        'student_id',
                        'filters_applied',
                        'generated_at'
                    ]
                ]);
    }

    public function test_student_performance_with_filters()
    {
        Sanctum::actingAs($this->student);

        // Create submissions across different time periods
        QuizSubmissions::factory()->create([
            'quiz_id' => $this->quiz->id,
            'student_id' => $this->student->id,
            'percentage' => 80,
            'submitted_at' => Carbon::now()->subMonths(2)
        ]);

        QuizSubmissions::factory()->create([
            'quiz_id' => $this->quiz->id,
            'student_id' => $this->student->id,
            'percentage' => 90,
            'submitted_at' => Carbon::now()->subDays(5)
        ]);

        // Test with month timeframe filter
        $response = $this->getJson('/api/v1/analytics/my-performance?timeframe=month');

        $response->assertStatus(200);
        
        $data = $response->json('data.overview');
        $this->assertEquals(1, $data['total_quizzes_taken']); // Only recent submission
        $this->assertEquals(90.0, $data['average_score']);
    }

    public function test_student_performance_with_program_filter()
    {
        Sanctum::actingAs($this->student);

        // Create another program and quiz
        $otherProgram = Programs::factory()->create(['teacher_id' => $this->teacher->id]);
        $otherQuiz = Quiz::factory()->create([
            'program_id' => $otherProgram->id,
            'teacher_id' => $this->teacher->id
        ]);

        Enrollment::factory()->create([
            'student_id' => $this->student->id,
            'program_id' => $otherProgram->id,
            'status' => 'active'
        ]);

        // Create submissions for both programs
        QuizSubmissions::factory()->create([
            'quiz_id' => $this->quiz->id,
            'student_id' => $this->student->id,
            'percentage' => 80
        ]);

        QuizSubmissions::factory()->create([
            'quiz_id' => $otherQuiz->id,
            'student_id' => $this->student->id,
            'percentage' => 90
        ]);

        // Test filtering by specific program
        $response = $this->getJson("/api/v1/analytics/my-performance?program_id={$this->program->id}");

        $response->assertStatus(200);
        
        $data = $response->json('data.overview');
        $this->assertEquals(1, $data['total_quizzes_taken']);
        $this->assertEquals(80.0, $data['average_score']);
    }

    public function test_student_trends_analytics()
    {
        Sanctum::actingAs($this->student);

        // Create trend data
        $dates = [
            Carbon::now()->subMonths(3),
            Carbon::now()->subMonths(2),
            Carbon::now()->subMonth(),
        ];

        foreach ($dates as $date) {
            QuizSubmissions::factory()->create([
                'quiz_id' => $this->quiz->id,
                'student_id' => $this->student->id,
                'percentage' => rand(70, 90),
                'submitted_at' => $date
            ]);
        }

        $response = $this->getJson('/api/v1/analytics/my-trends?period=monthly&duration=6');

        $response->assertStatus(200)
                ->assertJsonStructure([
                    'data' => [
                        'trends',
                        'summary'
                    ],
                    'meta' => [
                        'student_id',
                        'period',
                        'duration'
                    ]
                ]);
    }

    public function test_teacher_can_view_student_performance()
    {
        Sanctum::actingAs($this->teacher);

        QuizSubmissions::factory()->create([
            'quiz_id' => $this->quiz->id,
            'student_id' => $this->student->id,
            'percentage' => 85
        ]);

        $response = $this->getJson("/api/v1/teacher/analytics/students/{$this->student->id}/performance");

        $response->assertStatus(200)
                ->assertJsonStructure([
                    'data' => [
                        'overview',
                        'performance_trends',
                        'proficiency_breakdown'
                    ]
                ]);
    }

    public function test_teacher_cannot_view_other_teachers_student_performance()
    {
        Sanctum::actingAs($this->otherTeacher);

        $response = $this->getJson("/api/v1/teacher/analytics/students/{$this->student->id}/performance");

        $response->assertStatus(403)
                ->assertJson(['message' => 'Unauthorized']);
    }

    public function test_teacher_can_view_class_analytics()
    {
        Sanctum::actingAs($this->teacher);

        // Create multiple students and submissions
        $students = User::factory()->count(3)->create(['role' => 'student']);
        
        foreach ($students as $student) {
            Enrollment::factory()->create([
                'student_id' => $student->id,
                'program_id' => $this->program->id,
                'status' => 'active'
            ]);

            QuizSubmissions::factory()->create([
                'quiz_id' => $this->quiz->id,
                'student_id' => $student->id,
                'percentage' => rand(60, 95),
                'is_passed' => rand(0, 1)
            ]);
        }

        $response = $this->getJson("/api/v1/teacher/analytics/programs/{$this->program->id}/class");

        $response->assertStatus(200)
                ->assertJsonStructure([
                    'data' => [
                        'class_overview',
                        'student_rankings',
                        'quiz_effectiveness',
                        'question_difficulty',
                        'engagement_metrics',
                        'progress_tracking',
                        'common_mistakes'
                    ],
                    'meta' => [
                        'program_id',
                        'filters_applied',
                        'generated_at'
                    ]
                ]);

        $classOverview = $response->json('data.class_overview');
        $this->assertGreaterThan(0, $classOverview['total_students']);
        $this->assertGreaterThan(0, $classOverview['total_submissions']);
    }

    public function test_teacher_cannot_view_other_teachers_class_analytics()
    {
        Sanctum::actingAs($this->otherTeacher);

        $response = $this->getJson("/api/v1/teacher/analytics/programs/{$this->program->id}/class");

        $response->assertStatus(403)
                ->assertJson(['message' => 'Unauthorized']);
    }

    public function test_quiz_analytics_for_teacher()
    {
        Sanctum::actingAs($this->teacher);

        // Create questions and submissions for the quiz
        $question = QuizQuestions::factory()->create([
            'quiz_id' => $this->quiz->id,
            'type' => 'multiple_choice',
            'points' => 2
        ]);

        $submission = QuizSubmissions::factory()->create([
            'quiz_id' => $this->quiz->id,
            'student_id' => $this->student->id,
            'percentage' => 80,
            'time_taken_minutes' => 30
        ]);

        SubmissionAnswers::factory()->create([
            'submission_id' => $submission->id,
            'question_id' => $question->id,
            'is_correct' => true,
            'points_earned' => 2
        ]);

        $response = $this->getJson("/api/v1/teacher/analytics/quizzes/{$this->quiz->id}");

        $response->assertStatus(200)
                ->assertJsonStructure([
                    'data' => [
                        'quiz_overview',
                        'question_analysis',
                        'performance_distribution',
                        'completion_metrics',
                        'time_analysis',
                        'difficulty_assessment'
                    ],
                    'meta' => [
                        'quiz_id',
                        'quiz_title',
                        'generated_at'
                    ]
                ]);
    }

    public function test_student_can_view_quiz_analytics_for_taken_quiz()
    {
        Sanctum::actingAs($this->student);

        // Student must have taken the quiz to view analytics
        QuizSubmissions::factory()->create([
            'quiz_id' => $this->quiz->id,
            'student_id' => $this->student->id,
            'percentage' => 85
        ]);

        $response = $this->getJson("/api/v1/teacher/analytics/quizzes/{$this->quiz->id}");

        $response->assertStatus(200);
    }

    public function test_student_cannot_view_quiz_analytics_for_untaken_quiz()
    {
        Sanctum::actingAs($this->student);

        $response = $this->getJson("/api/v1/teacher/analytics/quizzes/{$this->quiz->id}");

        $response->assertStatus(403);
    }

    public function test_class_comparison_analytics()
    {
        Sanctum::actingAs($this->teacher);

        // Create another program for comparison
        $otherProgram = Programs::factory()->create(['teacher_id' => $this->teacher->id]);
        
        // Create submissions for both programs
        QuizSubmissions::factory()->create([
            'quiz_id' => $this->quiz->id,
            'student_id' => $this->student->id,
            'percentage' => 80
        ]);

        $otherQuiz = Quiz::factory()->create([
            'program_id' => $otherProgram->id,
            'teacher_id' => $this->teacher->id
        ]);

        $otherStudent = User::factory()->create(['role' => 'student']);
        Enrollment::factory()->create([
            'student_id' => $otherStudent->id,
            'program_id' => $otherProgram->id,
            'status' => 'active'
        ]);

        QuizSubmissions::factory()->create([
            'quiz_id' => $otherQuiz->id,
            'student_id' => $otherStudent->id,
            'percentage' => 90
        ]);

        $response = $this->getJson("/api/v1/teacher/analytics/programs/{$this->program->id}/comparison?compare_with[]={$otherProgram->id}&metric=average_score");

        $response->assertStatus(200)
                ->assertJsonStructure([
                    'data' => [
                        'comparison',
                        'metric',
                        'best_performing',
                        'average'
                    ],
                    'meta' => [
                        'primary_program_id',
                        'comparison_programs',
                        'metric'
                    ]
                ]);
    }

    public function test_level_specific_analytics()
    {
        Sanctum::actingAs($this->teacher);

        // Create quizzes at different levels
        $a1Quiz = Quiz::factory()->create([
            'program_id' => $this->program->id,
            'teacher_id' => $this->teacher->id,
            'proficiency_level' => 'A1'
        ]);

        QuizSubmissions::factory()->create([
            'quiz_id' => $a1Quiz->id,
            'student_id' => $this->student->id,
            'percentage' => 85
        ]);

        $response = $this->getJson("/api/v1/teacher/analytics/programs/{$this->program->id}/levels/A1");

        $response->assertStatus(200)
                ->assertJsonStructure([
                    'data' => [
                        'level_analytics',
                        'level_info'
                    ],
                    'meta' => [
                        'program_id',
                        'proficiency_level',
                        'timeframe'
                    ]
                ]);

        $levelInfo = $response->json('data.level_info');
        $this->assertEquals('Beginner', $levelInfo['name']);
    }

    public function test_invalid_proficiency_level_returns_error()
    {
        Sanctum::actingAs($this->teacher);

        $response = $this->getJson("/api/v1/teacher/analytics/programs/{$this->program->id}/levels/INVALID");

        $response->assertStatus(400)
                ->assertJson(['message' => 'Invalid proficiency level']);
    }

    public function test_dashboard_data_endpoint()
    {
        Sanctum::actingAs($this->teacher);

        // Create some recent activity
        QuizSubmissions::factory()->create([
            'quiz_id' => $this->quiz->id,
            'student_id' => $this->student->id,
            'percentage' => 85,
            'submitted_at' => Carbon::now()->subHours(2)
        ]);

        $response = $this->getJson("/api/v1/teacher/analytics/programs/{$this->program->id}/dashboard");

        $response->assertStatus(200)
                ->assertJsonStructure([
                    'data' => [
                        'quick_stats',
                        'recent_activity',
                        'performance_alerts',
                        'trending_quizzes',
                        'student_highlights'
                    ],
                    'meta' => [
                        'program_id',
                        'last_updated',
                        'refresh_interval'
                    ]
                ]);
    }

    public function test_export_report_json_format()
    {
        Sanctum::actingAs($this->teacher);

        QuizSubmissions::factory()->create([
            'quiz_id' => $this->quiz->id,
            'student_id' => $this->student->id,
            'percentage' => 85
        ]);

        $response = $this->getJson("/api/v1/teacher/analytics/programs/{$this->program->id}/export?format=json&include[]=overview&include[]=students");

        $response->assertStatus(200)
                ->assertJsonStructure([
                    'data' => [
                        'overview',
                        'students'
                    ],
                    'meta' => [
                        'program_id',
                        'format',
                        'sections_included',
                        'timeframe',
                        'generated_at'
                    ]
                ]);
    }

    public function test_export_report_csv_format()
    {
        Sanctum::actingAs($this->teacher);

        $response = $this->getJson("/api/v1/teacher/analytics/programs/{$this->program->id}/export?format=csv&include[]=overview");

        $response->assertStatus(200)
                ->assertJsonStructure([
                    'data',
                    'download_instructions' => [
                        'format',
                        'suggested_filename'
                    ],
                    'meta'
                ]);

        $downloadInstructions = $response->json('download_instructions');
        $this->assertEquals('csv', $downloadInstructions['format']);
        $this->assertStringContains('analytics_report_', $downloadInstructions['suggested_filename']);
    }

    public function test_validation_errors_for_invalid_parameters()
    {
        Sanctum::actingAs($this->teacher);

        // Test invalid timeframe
        $response = $this->getJson("/api/v1/teacher/analytics/programs/{$this->program->id}/class?timeframe=invalid");

        $response->assertStatus(422)
                ->assertJsonValidationErrors(['timeframe']);

        // Test invalid proficiency level
        $response = $this->getJson('/api/v1/analytics/my-performance?proficiency_level=INVALID');

        $response->assertStatus(422)
                ->assertJsonValidationErrors(['proficiency_level']);

        // Test invalid export format
        $response = $this->getJson("/api/v1/teacher/analytics/programs/{$this->program->id}/export?format=invalid");

        $response->assertStatus(422)
                ->assertJsonValidationErrors(['format']);
    }

    public function test_analytics_with_no_data_returns_empty_results()
    {
        Sanctum::actingAs($this->student);

        $response = $this->getJson('/api/v1/analytics/my-performance');

        $response->assertStatus(200);
        
        $overview = $response->json('data.overview');
        $this->assertEquals(0, $overview['total_quizzes_taken']);
        $this->assertEquals(0, $overview['pass_rate']);
        $this->assertEquals(0, $overview['average_score']);
    }

    public function test_admin_can_access_all_analytics()
    {
        $admin = User::factory()->create(['role' => 'admin']);
        Sanctum::actingAs($admin);

        QuizSubmissions::factory()->create([
            'quiz_id' => $this->quiz->id,
            'student_id' => $this->student->id,
            'percentage' => 85
        ]);

        // Admin should be able to access any student's performance
        $response = $this->getJson("/api/v1/admin/analytics/students/{$this->student->id}/performance");
        $response->assertStatus(200);

        // Admin should be able to access any program's class analytics
        $response = $this->getJson("/api/v1/admin/analytics/programs/{$this->program->id}/class");
        $response->assertStatus(200);

        // Admin should be able to access any quiz analytics
        $response = $this->getJson("/api/v1/admin/analytics/quizzes/{$this->quiz->id}");
        $response->assertStatus(200);
    }

    public function test_error_handling_for_nonexistent_resources()
    {
        Sanctum::actingAs($this->teacher);

        // Test nonexistent student
        $response = $this->getJson('/api/v1/teacher/analytics/students/99999/performance');
        $response->assertStatus(500); // Should handle gracefully

        // Test nonexistent program
        $response = $this->getJson('/api/v1/teacher/analytics/programs/99999/class');
        $response->assertStatus(403); // Unauthorized for nonexistent program

        // Test nonexistent quiz
        $response = $this->getJson('/api/v1/teacher/analytics/quizzes/99999');
        $response->assertStatus(404); // Quiz not found
    }

    public function test_performance_with_large_dataset()
    {
        Sanctum::actingAs($this->teacher);

        // Create a large number of submissions
        $students = User::factory()->count(50)->create(['role' => 'student']);
        
        foreach ($students as $student) {
            Enrollment::factory()->create([
                'student_id' => $student->id,
                'program_id' => $this->program->id,
                'status' => 'active'
            ]);

            // Create multiple submissions per student
            QuizSubmissions::factory()->count(5)->create([
                'quiz_id' => $this->quiz->id,
                'student_id' => $student->id,
                'percentage' => rand(60, 95),
                'submitted_at' => Carbon::now()->subDays(rand(1, 30))
            ]);
        }

        $startTime = microtime(true);
        
        $response = $this->getJson("/api/v1/teacher/analytics/programs/{$this->program->id}/class");
        
        $endTime = microtime(true);
        $executionTime = $endTime - $startTime;

        $response->assertStatus(200);
        
        // Should complete within reasonable time (less than 3 seconds)
        $this->assertLessThan(3.0, $executionTime);
    }
}