<?php

namespace App\Contracts;

use App\DTOs\EvaluationResult;
use App\DTOs\CorrectionData;

interface QuestionHandlerInterface
{
    /**
     * Evaluate a student's answer against the correct answer
     */
    public function evaluate(string|array $studentAnswer, string|array $correctAnswer, array $options = []): EvaluationResult;

    /**
     * Generate detailed correction feedback
     */
    public function generateCorrection(string|array $studentAnswer, string|array $correctAnswer, array $options = []): CorrectionData;

    /**
     * Validate answer format for this question type
     */
    public function validateAnswer(string|array $answer): bool;

    /**
     * Get the question type this handler supports
     */
    public function getQuestionType(): string;
}