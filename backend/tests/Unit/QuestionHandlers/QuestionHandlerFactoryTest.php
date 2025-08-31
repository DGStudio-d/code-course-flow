<?php

namespace Tests\Unit\QuestionHandlers;

use Tests\TestCase;
use App\Services\QuestionHandlerFactory;
use App\Services\QuestionHandlers\MultipleChoiceHandler;
use App\Services\QuestionHandlers\TrueFalseHandler;
use App\Services\QuestionHandlers\FillBlankHandler;
use App\Services\QuestionHandlers\ShortAnswerHandler;
use App\Services\QuestionHandlers\EssayHandler;
use InvalidArgumentException;

class QuestionHandlerFactoryTest extends TestCase
{
    private QuestionHandlerFactory $factory;

    protected function setUp(): void
    {
        parent::setUp();
        $this->factory = new QuestionHandlerFactory();
    }

    public function test_factory_registers_default_handlers()
    {
        $supportedTypes = $this->factory->getSupportedQuestionTypes();

        $expectedTypes = ['multiple_choice', 'true_false', 'fill_blank', 'short_answer', 'essay'];
        
        foreach ($expectedTypes as $type) {
            $this->assertContains($type, $supportedTypes);
        }
    }

    public function test_get_handler_returns_correct_handler_type()
    {
        $multipleChoiceHandler = $this->factory->getHandler('multiple_choice');
        $trueFalseHandler = $this->factory->getHandler('true_false');
        $fillBlankHandler = $this->factory->getHandler('fill_blank');
        $shortAnswerHandler = $this->factory->getHandler('short_answer');
        $essayHandler = $this->factory->getHandler('essay');

        $this->assertInstanceOf(MultipleChoiceHandler::class, $multipleChoiceHandler);
        $this->assertInstanceOf(TrueFalseHandler::class, $trueFalseHandler);
        $this->assertInstanceOf(FillBlankHandler::class, $fillBlankHandler);
        $this->assertInstanceOf(ShortAnswerHandler::class, $shortAnswerHandler);
        $this->assertInstanceOf(EssayHandler::class, $essayHandler);
    }

    public function test_get_handler_throws_exception_for_unsupported_type()
    {
        $this->expectException(InvalidArgumentException::class);
        $this->expectExceptionMessage('No handler registered for question type: unsupported_type');

        $this->factory->getHandler('unsupported_type');
    }

    public function test_is_question_type_supported()
    {
        $this->assertTrue($this->factory->isQuestionTypeSupported('multiple_choice'));
        $this->assertTrue($this->factory->isQuestionTypeSupported('true_false'));
        $this->assertFalse($this->factory->isQuestionTypeSupported('unsupported_type'));
    }

    public function test_evaluate_answer_delegates_to_correct_handler()
    {
        $result = $this->factory->evaluateAnswer('multiple_choice', 'Paris', 'Paris', ['points' => 2]);

        $this->assertTrue($result->isCorrect);
        $this->assertEquals(2, $result->pointsEarned);
        $this->assertEquals('multiple_choice', $result->details['question_type']);
    }

    public function test_generate_correction_delegates_to_correct_handler()
    {
        $correction = $this->factory->generateCorrection('multiple_choice', 'London', 'Paris', [
            'explanation' => 'Paris is the capital of France.'
        ]);

        $this->assertStringContains('Incorrect', $correction->correctionText);
        $this->assertStringContains('London', $correction->correctionText);
        $this->assertStringContains('Paris', $correction->correctionText);
    }

    public function test_validate_answer_delegates_to_correct_handler()
    {
        $this->assertTrue($this->factory->validateAnswer('multiple_choice', 'Paris'));
        $this->assertFalse($this->factory->validateAnswer('multiple_choice', ''));
    }

    public function test_register_custom_handler()
    {
        $customHandler = new class implements \App\Contracts\QuestionHandlerInterface {
            public function evaluate(string|array $studentAnswer, string|array $correctAnswer, array $options = []): \App\DTOs\EvaluationResult
            {
                return new \App\DTOs\EvaluationResult(true, 1, 1);
            }

            public function generateCorrection(string|array $studentAnswer, string|array $correctAnswer, array $options = []): \App\DTOs\CorrectionData
            {
                return new \App\DTOs\CorrectionData('Custom correction');
            }

            public function validateAnswer(string|array $answer): bool
            {
                return true;
            }

            public function getQuestionType(): string
            {
                return 'custom_type';
            }
        };

        $this->factory->registerHandler($customHandler);

        $this->assertTrue($this->factory->isQuestionTypeSupported('custom_type'));
        $this->assertSame($customHandler, $this->factory->getHandler('custom_type'));
    }

    public function test_get_supported_question_types_includes_all_registered_types()
    {
        $types = $this->factory->getSupportedQuestionTypes();

        $this->assertIsArray($types);
        $this->assertGreaterThanOrEqual(5, count($types)); // At least the 5 default types
        $this->assertContains('multiple_choice', $types);
        $this->assertContains('essay', $types);
    }
}