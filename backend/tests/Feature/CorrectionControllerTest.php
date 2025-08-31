<?php

namespace Tests\Feature;

use Tests\TestCase;
use App\Models\User;
use App\Models\Quiz;
use App\Models\QuizSubmissions;
use App\Models\QuizQuestions;
use App\Models\QuizOptions;
use App\Models\SubmissionAnswers;
use App\Models\QuizCorrections;
use App\Models\Programs;
use App\Models\Enrollment;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;

class CorrectionControllerTest extends TestCase
{
    use RefreshDatabase;

    private User $teacher;
    private User $student;
    private Programs $program;
    private Quiz $quiz;
    private QuizSubmissions $submission;

    protected function setUp(): void
    {
        parent::setUp();
        
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
            'teacher_id' => $this->teacher->id
        ]);

        $this->submission = QuizSubmissions::factory()->create([
            'quiz_id' => $this->quiz->id,
            'student_id' => $this->student->id,
            'submitted_at' => now()
        ]);
    }

    public function test_student_can_view_their_submission_corrections()
    {
        Sanctum::actingAs($this->student);

        $question = QuizQuestions::factory()->create([
            'quiz_id' => $this->quiz->id,
            'type' => 'multiple_choice'
        ]);

        $answer = SubmissionAnswers::factory()->create([
            'submission_id' => $this->submission->id,
            'question_id' => $question->id
        ]);

        $correction = QuizCorrections::factory()->create([
            'submission_id' => $this->submission->id,
            'question_id' => $question->id,
            'correction_text' => 'This is a test correction',
            'improvement_suggestions' => ['Study more', 'Practice regularly']
        ]);

        $response = $this->getJson("/api/v1/quizzes/submissions/{$this->submission->id}/corrections");

        $response->assertStatus(200)
                ->assertJsonStructure([
                    'data' => [
                        'submission' => [
                            'id', 'quiz_title', 'student_name', 'submitted_at',
                            'total_score', 'percentage', 'is_passed'
                        ],
                        'corrections' => [
                            '*' => [
                                'id', 'question_id', 'question_text', 'question_type',
                                'correction_text', 'explanation', 'improvement_suggestions'
                            ]
                        ],
                        'summary' => [
                            'submission_id', 'overall_performance', 'performance_by_type',
                            'improvement_areas', 'time_efficiency', 'strengths', 'next_steps'
                        ]
                    ]
                ]);
    }

    public function test_student_cannot_view_other_students_corrections()
    {
        $otherStudent = User::factory()->create(['role' => 'student']);
        $otherSubmission = QuizSubmissions::factory()->create([
            'quiz_id' => $this->quiz->id,
            'student_id' => $otherStudent->id
        ]);

        Sanctum::actingAs($this->student);

        $response = $this->getJson("/api/v1/quizzes/submissions/{$otherSubmission->id}/corrections");

        $response->assertStatus(403);
    }

    public function test_teacher_can_generate_corrections_for_their_quiz()
    {
        Sanctum::actingAs($this->teacher);

        $question = QuizQuestions::factory()->create([
            'quiz_id' => $this->quiz->id,
            'type' => 'multiple_choice',
            'question' => 'What is 2+2?'
        ]);

        $correctOption = QuizOptions::factory()->create([
            'question_id' => $question->id,
            'option_text' => '4',
            'is_correct' => true
        ]);

        $incorrectOption = QuizOptions::factory()->create([
            'question_id' => $question->id,
            'option_text' => '5',
            'is_correct' => false
        ]);

        SubmissionAnswers::factory()->create([
            'submission_id' => $this->submission->id,
            'question_id' => $question->id,
            'selected_option_id' => $incorrectOption->id,
            'is_correct' => false
        ]);

        $response = $this->postJson("/api/v1/teacher/corrections/submissions/{$this->submission->id}/generate");

        $response->assertStatus(200)
                ->assertJson(['message' => 'Corrections generated successfully'])
                ->assertJsonStructure([
                    'data' => [
                        '*' => [
                            'question_id', 'answer_id', 'correction_id',
                            'correction_data', 'question_text', 'student_answer',
                            'correct_answer', 'is_correct', 'points_earned', 'max_points'
                        ]
                    ]
                ]);

        // Verify correction was stored in database
        $this->assertDatabaseHas('quiz_corrections', [
            'submission_id' => $this->submission->id,
            'question_id' => $question->id
        ]);
    }

    public function test_teacher_cannot_generate_corrections_for_other_teachers_quiz()
    {
        $otherTeacher = User::factory()->create(['role' => 'teacher']);
        $otherProgram = Programs::factory()->create(['teacher_id' => $otherTeacher->id]);
        $otherQuiz = Quiz::factory()->create([
            'program_id' => $otherProgram->id,
            'teacher_id' => $otherTeacher->id
        ]);
        $otherSubmission = QuizSubmissions::factory()->create([
            'quiz_id' => $otherQuiz->id,
            'student_id' => $this->student->id
        ]);

        Sanctum::actingAs($this->teacher);

        $response = $this->postJson("/api/v1/teacher/corrections/submissions/{$otherSubmission->id}/generate");

        $response->assertStatus(403);
    }

    public function test_teacher_can_re_evaluate_submission()
    {
        Sanctum::actingAs($this->teacher);

        $question = QuizQuestions::factory()->create([
            'quiz_id' => $this->quiz->id,
            'type' => 'fill_blank',
            'points' => 2
        ]);

        $answer = SubmissionAnswers::factory()->create([
            'submission_id' => $this->submission->id,
            'question_id' => $question->id,
            'answer_text' => 'Pari', // Close to correct answer
            'is_correct' => false,
            'points_earned' => 0
        ]);

        $originalScore = $this->submission->total_score;

        $response = $this->postJson("/api/v1/teacher/corrections/submissions/{$this->submission->id}/re-evaluate");

        $response->assertStatus(200)
                ->assertJson(['message' => 'Submission re-evaluated successfully'])
                ->assertJsonStructure([
                    'data' => [
                        'submission_id', 'original_total_score', 'new_total_score',
                        'original_percentage', 'new_percentage', 'is_passed',
                        'question_results' => [
                            '*' => [
                                'question_id', 'original_score', 'new_score',
                                'evaluation', 'correction'
                            ]
                        ]
                    ]
                ]);

        // Verify submission was updated
        $this->submission->refresh();
        $this->assertNotEquals($originalScore, $this->submission->total_score);
    }

    public function test_get_question_correction_returns_detailed_info()
    {
        Sanctum::actingAs($this->student);

        $question = QuizQuestions::factory()->create([
            'quiz_id' => $this->quiz->id,
            'question' => 'What is the capital of France?',
            'type' => 'multiple_choice',
            'points' => 2,
            'explanation' => 'Paris is the capital and largest city of France.'
        ]);

        $correctOption = QuizOptions::factory()->create([
            'question_id' => $question->id,
            'option_text' => 'Paris',
            'is_correct' => true
        ]);

        $incorrectOption = QuizOptions::factory()->create([
            'question_id' => $question->id,
            'option_text' => 'London',
            'is_correct' => false
        ]);

        $answer = SubmissionAnswers::factory()->create([
            'submission_id' => $this->submission->id,
            'question_id' => $question->id,
            'selected_option_id' => $incorrectOption->id,
            'is_correct' => false,
            'points_earned' => 0
        ]);

        $correction = QuizCorrections::factory()->create([
            'submission_id' => $this->submission->id,
            'question_id' => $question->id,
            'correction_text' => 'Incorrect. You selected London, but the correct answer is Paris.',
            'explanation' => 'Paris is the capital of France.',
            'improvement_suggestions' => ['Review European capitals', 'Study geography']
        ]);

        $response = $this->getJson("/api/v1/quizzes/submissions/{$this->submission->id}/questions/{$question->id}/correction");

        $response->assertStatus(200)
                ->assertJsonStructure([
                    'data' => [
                        'correction' => [
                            'id', 'correction_text', 'explanation', 'improvement_suggestions'
                        ],
                        'question' => [
                            'id', 'text', 'type', 'points', 'explanation',
                            'options' => [
                                '*' => ['id', 'text', 'is_correct']
                            ]
                        ],
                        'student_answer' => [
                            'selected_option', 'answer_text', 'is_correct', 'points_earned'
                        ]
                    ]
                ])
                ->assertJson([
                    'data' => [
                        'correction' => [
                            'correction_text' => 'Incorrect. You selected London, but the correct answer is Paris.'
                        ],
                        'question' => [
                            'text' => 'What is the capital of France?'
                        ],
                        'student_answer' => [
                            'selected_option' => 'London',
                            'is_correct' => false,
                            'points_earned' => 0
                        ]
                    ]
                ]);
    }

    public function test_teacher_can_update_correction_manually()
    {
        Sanctum::actingAs($this->teacher);

        $question = QuizQuestions::factory()->create([
            'quiz_id' => $this->quiz->id
        ]);

        $correction = QuizCorrections::factory()->create([
            'submission_id' => $this->submission->id,
            'question_id' => $question->id,
            'correction_text' => 'Original correction text'
        ]);

        $updateData = [
            'correction_text' => 'Updated correction text',
            'explanation' => 'Updated explanation',
            'improvement_suggestions' => ['New suggestion 1', 'New suggestion 2']
        ];

        $response = $this->putJson("/api/v1/teacher/corrections/{$correction->id}", $updateData);

        $response->assertStatus(200)
                ->assertJson([
                    'message' => 'Correction updated successfully',
                    'data' => [
                        'correction_text' => 'Updated correction text',
                        'explanation' => 'Updated explanation',
                        'improvement_suggestions' => ['New suggestion 1', 'New suggestion 2']
                    ]
                ]);

        $this->assertDatabaseHas('quiz_corrections', [
            'id' => $correction->id,
            'correction_text' => 'Updated correction text',
            'explanation' => 'Updated explanation'
        ]);
    }

    public function test_get_quiz_correction_stats_returns_analytics()
    {
        Sanctum::actingAs($this->teacher);

        // Create multiple submissions with corrections
        $question = QuizQuestions::factory()->create([
            'quiz_id' => $this->quiz->id,
            'type' => 'multiple_choice'
        ]);

        $submission2 = QuizSubmissions::factory()->create([
            'quiz_id' => $this->quiz->id,
            'student_id' => User::factory()->create(['role' => 'student'])->id,
            'percentage' => 85,
            'is_passed' => true
        ]);

        SubmissionAnswers::factory()->create([
            'submission_id' => $this->submission->id,
            'question_id' => $question->id,
            'is_correct' => false
        ]);

        SubmissionAnswers::factory()->create([
            'submission_id' => $submission2->id,
            'question_id' => $question->id,
            'is_correct' => true
        ]);

        QuizCorrections::factory()->create([
            'submission_id' => $this->submission->id,
            'question_id' => $question->id,
            'improvement_suggestions' => ['Study more', 'Practice regularly']
        ]);

        $response = $this->getJson("/api/v1/teacher/corrections/quizzes/{$this->quiz->id}/stats");

        $response->assertStatus(200)
                ->assertJsonStructure([
                    'data' => [
                        'total_submissions',
                        'submissions_with_corrections',
                        'average_score',
                        'pass_rate',
                        'common_mistakes',
                        'question_difficulty'
                    ]
                ]);

        $data = $response->json('data');
        $this->assertEquals(2, $data['total_submissions']);
        $this->assertGreaterThanOrEqual(0, $data['average_score']);
        $this->assertGreaterThanOrEqual(0, $data['pass_rate']);
    }

    public function test_unauthorized_users_cannot_access_correction_endpoints()
    {
        $endpoints = [
            ['POST', "/api/v1/teacher/corrections/submissions/{$this->submission->id}/generate"],
            ['POST', "/api/v1/teacher/corrections/submissions/{$this->submission->id}/re-evaluate"],
            ['GET', "/api/v1/teacher/corrections/quizzes/{$this->quiz->id}/stats"],
        ];

        foreach ($endpoints as [$method, $url]) {
            $response = $this->json($method, $url);
            $this->assertEquals(401, $response->getStatusCode(), "Failed for: $method $url");
        }
    }
}