<?php

namespace Tests\Feature;

use Tests\TestCase;
use App\Models\User;
use App\Models\Quiz;
use App\Models\Programs;
use App\Models\Enrollment;
use App\Services\DocumentParserService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Laravel\Sanctum\Sanctum;

class EnhancedQuizControllerTest extends TestCase
{
    use RefreshDatabase;

    private User $teacher;
    private User $student;
    private Programs $program;

    protected function setUp(): void
    {
        parent::setUp();
        
        $this->teacher = User::factory()->create(['role' => 'teacher']);
        $this->student = User::factory()->create(['role' => 'student']);
        $this->program = Programs::factory()->create(['teacher_id' => $this->teacher->id]);
        
        // Enroll student in program
        Enrollment::factory()->create([
            'student_id' => $this->student->id,
            'program_id' => $this->program->id,
            'status' => 'active'
        ]);
    }

    public function test_teacher_can_get_proficiency_levels()
    {
        Sanctum::actingAs($this->teacher);

        $response = $this->getJson('/api/v1/teacher/quizzes/proficiency-levels');

        $response->assertStatus(200)
                ->assertJsonStructure([
                    'data' => [
                        '*' => ['value', 'label']
                    ]
                ]);

        $levels = $response->json('data');
        $this->assertCount(6, $levels);
        $this->assertEquals('A1', $levels[0]['value']);
        $this->assertEquals('C2', $levels[5]['value']);
    }

    public function test_student_can_filter_quizzes_by_level()
    {
        Sanctum::actingAs($this->student);

        // Create quizzes with different levels
        Quiz::factory()->create([
            'program_id' => $this->program->id,
            'teacher_id' => $this->teacher->id,
            'proficiency_level' => 'A1',
            'is_active' => true
        ]);

        Quiz::factory()->create([
            'program_id' => $this->program->id,
            'teacher_id' => $this->teacher->id,
            'proficiency_level' => 'B2',
            'is_active' => true
        ]);

        // Filter by A1 level
        $response = $this->getJson('/api/v1/student/quizzes?level=A1');

        $response->assertStatus(200);
        $quizzes = $response->json('data');
        $this->assertCount(1, $quizzes);
        $this->assertEquals('A1', $quizzes[0]['proficiency_level']);
    }

    public function test_teacher_can_create_quiz_with_proficiency_level()
    {
        Sanctum::actingAs($this->teacher);

        $quizData = [
            'title' => 'A1 Level Quiz',
            'description' => 'Basic level quiz',
            'proficiency_level' => 'A1',
            'correction_mode' => 'immediate',
            'program_id' => $this->program->id,
            'passing_score' => 70,
            'max_attempts' => 3,
        ];

        $response = $this->postJson('/api/v1/teacher/quizzes', $quizData);

        $response->assertStatus(201)
                ->assertJsonFragment([
                    'title' => 'A1 Level Quiz',
                    'proficiency_level' => 'A1',
                    'correction_mode' => 'immediate'
                ]);

        $this->assertDatabaseHas('quizzes', [
            'title' => 'A1 Level Quiz',
            'proficiency_level' => 'A1',
            'correction_mode' => 'immediate'
        ]);
    }

    public function test_teacher_can_update_quiz_with_new_fields()
    {
        Sanctum::actingAs($this->teacher);

        $quiz = Quiz::factory()->create([
            'program_id' => $this->program->id,
            'teacher_id' => $this->teacher->id,
        ]);

        $updateData = [
            'proficiency_level' => 'B1',
            'correction_mode' => 'manual',
        ];

        $response = $this->putJson("/api/v1/teacher/quizzes/{$quiz->id}", $updateData);

        $response->assertStatus(200)
                ->assertJsonFragment([
                    'proficiency_level' => 'B1',
                    'correction_mode' => 'manual'
                ]);

        $this->assertDatabaseHas('quizzes', [
            'id' => $quiz->id,
            'proficiency_level' => 'B1',
            'correction_mode' => 'manual'
        ]);
    }

    public function test_validation_for_proficiency_level()
    {
        Sanctum::actingAs($this->teacher);

        $quizData = [
            'title' => 'Invalid Level Quiz',
            'proficiency_level' => 'X1', // Invalid level
            'program_id' => $this->program->id,
            'passing_score' => 70,
            'max_attempts' => 3,
        ];

        $response = $this->postJson('/api/v1/teacher/quizzes', $quizData);

        $response->assertStatus(422)
                ->assertJsonValidationErrors(['proficiency_level']);
    }

    public function test_validation_for_correction_mode()
    {
        Sanctum::actingAs($this->teacher);

        $quizData = [
            'title' => 'Invalid Correction Mode Quiz',
            'correction_mode' => 'invalid_mode',
            'program_id' => $this->program->id,
            'passing_score' => 70,
            'max_attempts' => 3,
        ];

        $response = $this->postJson('/api/v1/teacher/quizzes', $quizData);

        $response->assertStatus(422)
                ->assertJsonValidationErrors(['correction_mode']);
    }

    public function test_document_upload_requires_teacher_role()
    {
        Sanctum::actingAs($this->student);

        Storage::fake('private');
        $file = UploadedFile::fake()->create('test.docx', 100, 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');

        $response = $this->postJson('/api/v1/teacher/quizzes/upload-document', [
            'document' => $file,
            'program_id' => $this->program->id,
        ]);

        $response->assertStatus(403)
                ->assertJson(['message' => 'Only teachers can upload documents']);
    }

    public function test_document_upload_validates_file_type()
    {
        Sanctum::actingAs($this->teacher);

        Storage::fake('private');
        $file = UploadedFile::fake()->create('test.txt', 100, 'text/plain');

        $response = $this->postJson('/api/v1/teacher/quizzes/upload-document', [
            'document' => $file,
            'program_id' => $this->program->id,
        ]);

        $response->assertStatus(422)
                ->assertJsonValidationErrors(['document']);
    }

    public function test_document_upload_validates_program_ownership()
    {
        Sanctum::actingAs($this->teacher);

        $otherTeacher = User::factory()->create(['role' => 'teacher']);
        $otherProgram = Programs::factory()->create(['teacher_id' => $otherTeacher->id]);

        Storage::fake('private');
        $file = UploadedFile::fake()->create('test.docx', 100, 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');

        $response = $this->postJson('/api/v1/teacher/quizzes/upload-document', [
            'document' => $file,
            'program_id' => $otherProgram->id,
        ]);

        $response->assertStatus(403)
                ->assertJson(['message' => 'Unauthorized']);
    }

    public function test_create_from_document_requires_valid_questions()
    {
        Sanctum::actingAs($this->teacher);

        $quizData = [
            'title' => 'Document Quiz',
            'source_document_path' => 'quiz-documents/test.docx',
            'program_id' => $this->program->id,
            'passing_score' => 70,
            'max_attempts' => 3,
            'questions' => [
                [
                    'text' => 'What is 2+2?',
                    'type' => 'multiple_choice',
                    'options' => ['3', '4', '5', '6'],
                    'correct_answer' => '4',
                    'points' => 2
                ]
            ]
        ];

        $response = $this->postJson('/api/v1/teacher/quizzes/create-from-document', $quizData);

        $response->assertStatus(201)
                ->assertJsonFragment([
                    'title' => 'Document Quiz',
                    'source_document_path' => 'quiz-documents/test.docx'
                ]);

        $this->assertDatabaseHas('quizzes', [
            'title' => 'Document Quiz',
            'source_document_path' => 'quiz-documents/test.docx',
            'total_questions' => 1
        ]);
    }

    public function test_create_from_document_validates_question_structure()
    {
        Sanctum::actingAs($this->teacher);

        $quizData = [
            'title' => 'Invalid Document Quiz',
            'source_document_path' => 'quiz-documents/test.docx',
            'program_id' => $this->program->id,
            'passing_score' => 70,
            'max_attempts' => 3,
            'questions' => [
                [
                    // Missing required fields
                    'type' => 'multiple_choice',
                    'options' => ['3', '4', '5', '6'],
                ]
            ]
        ];

        $response = $this->postJson('/api/v1/teacher/quizzes/create-from-document', $quizData);

        $response->assertStatus(422)
                ->assertJsonValidationErrors(['questions.0.text', 'questions.0.correct_answer', 'questions.0.points']);
    }

    public function test_student_sees_level_warning_for_advanced_quizzes()
    {
        // Set student's proficiency level
        $this->student->student()->create(['proficiency_level' => 'A1']);
        
        Sanctum::actingAs($this->student);

        // Create quiz above student's level
        Quiz::factory()->create([
            'program_id' => $this->program->id,
            'teacher_id' => $this->teacher->id,
            'proficiency_level' => 'B2',
            'is_active' => true
        ]);

        $response = $this->getJson('/api/v1/student/quizzes');

        $response->assertStatus(200);
        $quizzes = $response->json('data');
        $this->assertTrue($quizzes[0]['level_warning'] ?? false);
    }

    public function test_only_teachers_can_access_document_endpoints()
    {
        Sanctum::actingAs($this->student);

        $endpoints = [
            'GET /api/v1/teacher/quizzes/proficiency-levels',
            'POST /api/v1/teacher/quizzes/upload-document',
            'POST /api/v1/teacher/quizzes/create-from-document',
        ];

        foreach ($endpoints as $endpoint) {
            [$method, $url] = explode(' ', $endpoint);
            
            $response = $this->json($method, $url);
            $this->assertEquals(403, $response->getStatusCode(), "Failed for: $endpoint");
        }
    }
}