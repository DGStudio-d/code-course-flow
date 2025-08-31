<?php

namespace App\Services\QuestionHandlers;

use App\Contracts\QuestionHandlerInterface;
use App\DTOs\EvaluationResult;
use App\DTOs\CorrectionData;

class MultipleChoiceHandler implements QuestionHandlerInterface
{
    public function evaluate(string|array $studentAnswer, string|array $correctAnswer, array $options = []): EvaluationResult
    {
        $maxPoints = $options['points'] ?? 1;
        
        // Normalize answers for comparison
        $studentAnswer = is_array($studentAnswer) ? $studentAnswer[0] ?? '' : $studentAnswer;
        $correctAnswer = is_array($correctAnswer) ? $correctAnswer[0] ?? '' : $correctAnswer;
        
        $isCorrect = $this->compareAnswers($studentAnswer, $correctAnswer);
        $pointsEarned = $isCorrect ? $maxPoints : 0;
        
        return new EvaluationResult(
            isCorrect: $isCorrect,
            pointsEarned: $pointsEarned,
            maxPoints: $maxPoints,
            accuracy: $isCorrect ? 1.0 : 0.0,
            details: [
                'student_answer' => $studentAnswer,
                'correct_answer' => $correctAnswer,
                'question_type' => 'multiple_choice'
            ]
        );
    }

    public function generateCorrection(string|array $studentAnswer, string|array $correctAnswer, array $options = []): CorrectionData
    {
        $studentAnswer = is_array($studentAnswer) ? $studentAnswer[0] ?? '' : $studentAnswer;
        $correctAnswer = is_array($correctAnswer) ? $correctAnswer[0] ?? '' : $correctAnswer;
        $questionText = $options['question_text'] ?? '';
        $allOptions = $options['all_options'] ?? [];
        $explanation = $options['explanation'] ?? null;
        
        $isCorrect = $this->compareAnswers($studentAnswer, $correctAnswer);
        
        if ($isCorrect) {
            return new CorrectionData(
                correctionText: "Correct! You selected the right answer.",
                explanation: $explanation,
                improvementSuggestions: [],
                correctAnswerExplanation: $explanation ? "The correct answer is '{$correctAnswer}'. {$explanation}" : null
            );
        }

        // Generate correction for incorrect answer
        $correctionText = "Incorrect. You selected '{$studentAnswer}', but the correct answer is '{$correctAnswer}'.";
        
        $improvementSuggestions = $this->generateImprovementSuggestions($studentAnswer, $correctAnswer, $allOptions);
        
        return new CorrectionData(
            correctionText: $correctionText,
            explanation: $explanation,
            improvementSuggestions: $improvementSuggestions,
            relatedConcepts: $this->extractRelatedConcepts($questionText),
            correctAnswerExplanation: $explanation ? "The correct answer is '{$correctAnswer}'. {$explanation}" : "The correct answer is '{$correctAnswer}'."
        );
    }

    public function validateAnswer(string|array $answer): bool
    {
        if (is_array($answer)) {
            return count($answer) === 1 && !empty(trim($answer[0] ?? ''));
        }
        
        return !empty(trim($answer));
    }

    public function getQuestionType(): string
    {
        return 'multiple_choice';
    }

    private function compareAnswers(string $studentAnswer, string $correctAnswer): bool
    {
        return trim(strtolower($studentAnswer)) === trim(strtolower($correctAnswer));
    }

    private function generateImprovementSuggestions(string $studentAnswer, string $correctAnswer, array $allOptions): array
    {
        $suggestions = [];
        
        // Basic suggestion
        $suggestions[] = "Review the question carefully and consider all options before selecting.";
        
        // If there are multiple options, suggest elimination strategy
        if (count($allOptions) > 2) {
            $suggestions[] = "Try using the process of elimination to narrow down the choices.";
        }
        
        // Suggest reviewing related material
        $suggestions[] = "Review the material related to this topic to better understand the concept.";
        
        return $suggestions;
    }

    private function extractRelatedConcepts(string $questionText): array
    {
        $concepts = [];
        
        // Simple keyword extraction (can be enhanced with NLP)
        $keywords = ['grammar', 'vocabulary', 'tense', 'pronunciation', 'spelling', 'syntax'];
        
        foreach ($keywords as $keyword) {
            if (stripos($questionText, $keyword) !== false) {
                $concepts[] = ucfirst($keyword);
            }
        }
        
        return array_unique($concepts);
    }
}