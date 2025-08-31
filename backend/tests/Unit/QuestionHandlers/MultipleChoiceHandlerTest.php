<?php

namespace Tests\Unit\QuestionHandlers;

use Tests\TestCase;
use App\Services\QuestionHandlers\MultipleChoiceHandler;

class MultipleChoiceHandlerTest extends TestCase
{
    private MultipleChoiceHandler $handler;

    protected function setUp(): void
    {
        parent::setUp();
        $this->handler = new MultipleChoiceHandler();
    }

    public function test_correct_answer_evaluation()
    {
        $result = $this->handler->evaluate('Paris', 'Paris', ['points' => 2]);

        $this->assertTrue($result->isCorrect);
        $this->assertEquals(2, $result->pointsEarned);
        $this->assertEquals(2, $result->maxPoints);
        $this->assertEquals(1.0, $result->accuracy);
    }

    public function test_incorrect_answer_evaluation()
    {
        $result = $this->handler->evaluate('London', 'Paris', ['points' => 2]);

        $this->assertFalse($result->isCorrect);
        $this->assertEquals(0, $result->pointsEarned);
        $this->assertEquals(2, $result->maxPoints);
        $this->assertEquals(0.0, $result->accuracy);
    }

    public function test_case_insensitive_comparison()
    {
        $result = $this->handler->evaluate('paris', 'Paris', ['points' => 1]);

        $this->assertTrue($result->isCorrect);
        $this->assertEquals(1, $result->pointsEarned);
    }

    public function test_array_answer_handling()
    {
        $result = $this->handler->evaluate(['Paris'], ['Paris'], ['points' => 1]);

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
        $this->assertEmpty($correction->improvementSuggestions);
    }

    public function test_generate_correction_for_incorrect_answer()
    {
        $correction = $this->handler->generateCorrection('London', 'Paris', [
            'explanation' => 'Paris is the capital of France.',
            'all_options' => ['London', 'Paris', 'Berlin', 'Madrid']
        ]);

        $this->assertStringContains('Incorrect', $correction->correctionText);
        $this->assertStringContains('London', $correction->correctionText);
        $this->assertStringContains('Paris', $correction->correctionText);
        $this->assertNotEmpty($correction->improvementSuggestions);
    }

    public function test_validate_answer_with_string()
    {
        $this->assertTrue($this->handler->validateAnswer('Paris'));
        $this->assertFalse($this->handler->validateAnswer(''));
        $this->assertFalse($this->handler->validateAnswer('   '));
    }

    public function test_validate_answer_with_array()
    {
        $this->assertTrue($this->handler->validateAnswer(['Paris']));
        $this->assertFalse($this->handler->validateAnswer([]));
        $this->assertFalse($this->handler->validateAnswer(['']));
    }

    public function test_get_question_type()
    {
        $this->assertEquals('multiple_choice', $this->handler->getQuestionType());
    }
}