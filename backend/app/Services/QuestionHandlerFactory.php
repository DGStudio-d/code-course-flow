<?php

namespace App\Services;

use App\Contracts\QuestionHandlerInterface;
use App\Services\QuestionHandlers\MultipleChoiceHandler;
use App\Services\QuestionHandlers\TrueFalseHandler;
use App\Services\QuestionHandlers\FillBlankHandler;
use App\Services\QuestionHandlers\ShortAnswerHandler;
use App\Services\QuestionHandlers\EssayHandler;
use InvalidArgumentException;

class QuestionHandlerFactory
{
    private array $handlers = [];

    public function __construct()
    {
        $this->registerDefaultHandlers();
    }

    /**
     * Register default question type handlers
     */
    private function registerDefaultHandlers(): void
    {
        $this->registerHandler(new MultipleChoiceHandler());
        $this->registerHandler(new TrueFalseHandler());
        $this->registerHandler(new FillBlankHandler());
        $this->registerHandler(new ShortAnswerHandler());
        $this->registerHandler(new EssayHandler());
    }

    /**
     * Register a question handler
     */
    public function registerHandler(QuestionHandlerInterface $handler): void
    {
        $this->handlers[$handler->getQuestionType()] = $handler;
    }

    /**
     * Get handler for a specific question type
     */
    public function getHandler(string $questionType): QuestionHandlerInterface
    {
        if (!isset($this->handlers[$questionType])) {
            throw new InvalidArgumentException("No handler registered for question type: {$questionType}");
        }

        return $this->handlers[$questionType];
    }

    /**
     * Get all registered question types
     */
    public function getSupportedQuestionTypes(): array
    {
        return array_keys($this->handlers);
    }

    /**
     * Check if a question type is supported
     */
    public function isQuestionTypeSupported(string $questionType): bool
    {
        return isset($this->handlers[$questionType]);
    }

    /**
     * Evaluate an answer using the appropriate handler
     */
    public function evaluateAnswer(
        string $questionType,
        string|array $studentAnswer,
        string|array $correctAnswer,
        array $options = []
    ): \App\DTOs\EvaluationResult {
        $handler = $this->getHandler($questionType);
        return $handler->evaluate($studentAnswer, $correctAnswer, $options);
    }

    /**
     * Generate correction using the appropriate handler
     */
    public function generateCorrection(
        string $questionType,
        string|array $studentAnswer,
        string|array $correctAnswer,
        array $options = []
    ): \App\DTOs\CorrectionData {
        $handler = $this->getHandler($questionType);
        return $handler->generateCorrection($studentAnswer, $correctAnswer, $options);
    }

    /**
     * Validate an answer format using the appropriate handler
     */
    public function validateAnswer(string $questionType, string|array $answer): bool
    {
        $handler = $this->getHandler($questionType);
        return $handler->validateAnswer($answer);
    }
}