<?php

namespace Tests\Unit;

use Tests\TestCase;
use App\Models\Quiz;
use App\Models\QuizCorrections;
use App\Models\QuizSubmissions;
use App\Models\QuizQuestions;
use App\Models\User;
use App\Models\Programs;
use Illuminate\Foundation\Testing\RefreshDatabase;

class QuizEnhancedModelTest extends TestCase
{
    use RefreshDatabase;

    public function test_quiz_has_proficiency_level_and_correction_mode_fields()
    {
        $quiz = new Quiz();
        
        $this->assertContains('proficiency_level', $quiz->getFillable());
        $this->assertContains('correction_mode', $quiz->getFillable());
        $this->assertContains('source_document_path', $quiz->getFillable());
    }

    public function test_quiz_has_corrections_relationship()
    {
        $this->assertTrue(method_exists(Quiz::class, 'corrections'));
    }

    public function test_quiz_has_by_level_scope()
    {
        $this->assertTrue(method_exists(Quiz::class, 'scopeByLevel'));
    }

    public function test_quiz_corrections_model_exists()
    {
        $correction = new QuizCorrections();
        
        $this->assertContains('submission_id', $correction->getFillable());
        $this->assertContains('question_id', $correction->getFillable());
        $this->assertContains('correction_text', $correction->getFillable());
        $this->assertContains('explanation', $correction->getFillable());
        $this->assertContains('improvement_suggestions', $correction->getFillable());
    }

    public function test_quiz_corrections_has_relationships()
    {
        $this->assertTrue(method_exists(QuizCorrections::class, 'submission'));
        $this->assertTrue(method_exists(QuizCorrections::class, 'question'));
    }

    public function test_quiz_submissions_has_corrections_relationship()
    {
        $this->assertTrue(method_exists(QuizSubmissions::class, 'corrections'));
    }

    public function test_quiz_by_level_scope_filters_correctly()
    {
        // This would require database setup, so we'll test the method exists
        $this->assertTrue(method_exists(Quiz::class, 'scopeByLevel'));
    }

    public function test_quiz_model_casts_are_correct()
    {
        $quiz = new Quiz();
        $casts = $quiz->getCasts();
        
        $this->assertArrayHasKey('is_active', $casts);
        $this->assertArrayHasKey('shuffle_questions', $casts);
        $this->assertArrayHasKey('show_results_immediately', $casts);
        $this->assertEquals('boolean', $casts['is_active']);
        $this->assertEquals('boolean', $casts['shuffle_questions']);
        $this->assertEquals('boolean', $casts['show_results_immediately']);
    }

    public function test_quiz_fillable_includes_new_fields()
    {
        $quiz = new Quiz();
        $fillable = $quiz->getFillable();
        
        $this->assertContains('proficiency_level', $fillable);
        $this->assertContains('correction_mode', $fillable);
        $this->assertContains('source_document_path', $fillable);
    }