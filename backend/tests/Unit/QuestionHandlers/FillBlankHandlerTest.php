<?php

namespace Tests\Unit\QuestionHandlers;

use Tests\TestCase;
use App\Services\QuestionHandlers\FillBlankHandler;

class FillBlankHandlerTest extends TestCase
{
    private FillBlankHandler $handler;

    protected function setUp(): void
    {
        parent::setUp();
        $this->handler = new FillBlankHandler();
    }

    public function test_exact_match_evaluation()
    {
        $result = $this->handler->evaluate('Paris', 'Paris', ['points' => 2]);

        $this->assertTrue($result->isCorrect);
        $this->assertEquals(2, $result->pointsEarned);
        $this->assertEquals(2, $result->maxPoints);
        $this->assertEquals(1.0, $result->accuracy);
    }

    public function test_multiple_acceptable_answers()
    {
        $result = $this->handler->evaluate('capital', ['capital', 'city'], ['points' => 2]);

        $this->assertTrue($result->isCorrect);
        $this->assertEquals(2, $result->pointsEarned);
    }

    public function test_partial_credit_for_similar_answer()
    {
        $result = $this->handler->evaluate('Pari', 'Paris', ['points' => 2]);

        $this->assertFalse($result->isCorrect); // Below 80% threshold
        $this->assertGreaterThan(0, $result->pointsEarned); // But gets partial credit
        $this->assertGreaterThan(0.5, $result->accuracy);
    }

    public function test_no_credit_for_very_different_answer()
    {
        $result = $this->handler->evaluate('London', 'Paris', ['points' => 2]);

        $this->assertFalse($result->isCorrect);
        $this->assertEquals(0, $result->pointsEarned);
        $this->assertLessThan(0.5, $result->accuracy);
    }

    public function test_case_insensitive_matching()
    {
        $result = $this->handler->evaluate('paris', 'Paris', ['points' => 1]);

        $this->assertTrue($result->isCorrect);
        $this->assertEquals(1, $result->pointsEarned);
    }

    public function test_whitespace_handling()
    {
        $result = $this->handler->evaluate('  Paris  ', 'Paris', ['points' => 1]);

        $this->assertTrue($result->isCorrect);
        $this->assertEquals(1, $result->pointsEarned);
    }

    public function test_generate_correction_for_correct_answer()
    {
        $correction = $this->handler->generateCorrection('Paris', 'Paris', [
            'explanation' => 'Paris is the capital of France.'
        ]);

        $this->assertStringContains('Correct!', $correction->correctionText);
        $this->assertEquals('Paris is the capital of France.', $correction->explanation);
    }

    public function test_generate_correction_for_close_answer()
    {
        $correction = $this->handler->generateCorrection('Pari', 'Paris', [
            'question_text' => 'The capital of France is _____.'
        ]);

        $this->assertStringContains('Close!', $correction->correctionText);
        $this->assertStringContains('Pari', $correction->correctionText);
        $this->assertStringContains('Paris', $correction->correctionText);
        $this->assertNotEmpty($correction->improvementSuggestions);
    }

    public function test_generate_correction_for_incorrect_answer()
    {
        $correction = $this->handler->generateCorrection('London', 'Paris', [
            'question_text' => 'The capital of France is _____.'
        ]);

        $this->assertStringContains('Incorrect', $correction->correctionText);
        $this->assertStringContains('London', $correction->correctionText);
        $this->assertStringContains('Paris', $correction->correctionText);
    }

    public function test_spelling_error_detection()
    {
        $correction = $this->handler->generateCorrection('Pariz', 'Paris', []);

        $this->assertContains('Pay attention to spelling', implode(' ', $correction->improvementSuggestions));
    }

    public function test_get_question_type()
    {
        $this->assertEquals('fill_blank', $this->handler->getQuestionType());
    }
}