<?php

namespace App\Services\QuestionHandlers;

use App\Contracts\QuestionHandlerInterface;
use App\DTOs\EvaluationResult;
use App\DTOs\CorrectionData;

class ShortAnswerHandler implements QuestionHandlerInterface
{
    public function evaluate(string|array $studentAnswer, string|array $correctAnswer, array $options = []): EvaluationResult
    {
        $maxPoints = $options['points'] ?? 1;
        $acceptableAnswers = is_array($correctAnswer) ? $correctAnswer : [$correctAnswer];
        
        $studentAnswer = is_array($studentAnswer) ? $studentAnswer[0] ?? '' : $studentAnswer;
        $studentAnswer = trim($studentAnswer);
        
        if (empty($studentAnswer)) {
            return new EvaluationResult(
                isCorrect: false,
                pointsEarned: 0,
                maxPoints: $maxPoints,
                accuracy: 0.0,
                details: ['student_answer' => '', 'question_type' => 'short_answer']
            );
        }
        
        $accuracy = $this->calculateAccuracy($studentAnswer, $acceptableAnswers);
        $isCorrect = $accuracy >= 0.7; // 70% similarity threshold for short answers
        
        // Partial credit system
        $pointsEarned = $this->calculatePartialCredit($accuracy, $maxPoints);
        
        return new EvaluationResult(
            isCorrect: $isCorrect,
            pointsEarned: $pointsEarned,
            maxPoints: $maxPoints,
            accuracy: $accuracy,
            details: [
                'student_answer' => $studentAnswer,
                'acceptable_answers' => $acceptableAnswers,
                'question_type' => 'short_answer',
                'partial_credit' => $pointsEarned > 0 && !$isCorrect
            ]
        );
    }

    public function generateCorrection(string|array $studentAnswer, string|array $correctAnswer, array $options = []): CorrectionData
    {
        $studentAnswer = is_array($studentAnswer) ? $studentAnswer[0] ?? '' : $studentAnswer;
        $studentAnswer = trim($studentAnswer);
        $acceptableAnswers = is_array($correctAnswer) ? $correctAnswer : [$correctAnswer];
        $questionText = $options['question_text'] ?? '';
        $explanation = $options['explanation'] ?? null;
        
        if (empty($studentAnswer)) {
            return new CorrectionData(
                correctionText: "No answer provided. The correct answer is: " . $acceptableAnswers[0],
                explanation: $explanation,
                improvementSuggestions: [
                    "Make sure to provide an answer, even if you're unsure.",
                    "Read the question carefully and think about what is being asked."
                ],
                correctAnswerExplanation: $this->formatAcceptableAnswers($acceptableAnswers, $explanation)
            );
        }
        
        $accuracy = $this->calculateAccuracy($studentAnswer, $acceptableAnswers);
        $bestMatch = $this->findBestMatch($studentAnswer, $acceptableAnswers);
        
        if ($accuracy >= 0.7) {
            $correctionText = $accuracy >= 0.9 ? 
                "Excellent! Your answer is correct." : 
                "Good! Your answer is mostly correct.";
                
            return new CorrectionData(
                correctionText: $correctionText,
                explanation: $explanation,
                improvementSuggestions: $accuracy < 0.9 ? ["Consider being more specific or complete in your answer."] : [],
                correctAnswerExplanation: $explanation
            );
        }

        // Generate correction for incorrect/partial answer
        $correctionText = $this->generateCorrectionText($studentAnswer, $bestMatch, $accuracy);
        $improvementSuggestions = $this->generateImprovementSuggestions($studentAnswer, $acceptableAnswers, $accuracy, $questionText);
        
        return new CorrectionData(
            correctionText: $correctionText,
            explanation: $explanation,
            improvementSuggestions: $improvementSuggestions,
            relatedConcepts: $this->extractRelatedConcepts($questionText),
            correctAnswerExplanation: $this->formatAcceptableAnswers($acceptableAnswers, $explanation)
        );
    }

    public function validateAnswer(string|array $answer): bool
    {
        if (is_array($answer)) {
            $answer = $answer[0] ?? '';
        }
        
        return is_string($answer); // Short answers can be empty (will get 0 points)
    }

    public function getQuestionType(): string
    {
        return 'short_answer';
    }

    private function calculateAccuracy(string $studentAnswer, array $acceptableAnswers): float
    {
        if (empty($studentAnswer)) {
            return 0.0;
        }

        $maxSimilarity = 0.0;
        
        foreach ($acceptableAnswers as $correctAnswer) {
            $similarity = $this->calculateAnswerSimilarity($studentAnswer, $correctAnswer);
            $maxSimilarity = max($maxSimilarity, $similarity);
        }
        
        return $maxSimilarity;
    }

    private function calculateAnswerSimilarity(string $answer1, string $answer2): float
    {
        $answer1 = $this->normalizeAnswer($answer1);
        $answer2 = $this->normalizeAnswer($answer2);
        
        // Exact match
        if ($answer1 === $answer2) {
            return 1.0;
        }
        
        // Check for keyword matches
        $keywordSimilarity = $this->calculateKeywordSimilarity($answer1, $answer2);
        
        // Check for semantic similarity (basic implementation)
        $semanticSimilarity = $this->calculateSemanticSimilarity($answer1, $answer2);
        
        // Combine different similarity measures
        return max($keywordSimilarity, $semanticSimilarity);
    }

    private function normalizeAnswer(string $answer): string
    {
        // Convert to lowercase and remove extra whitespace
        $answer = strtolower(trim($answer));
        
        // Remove common punctuation
        $answer = preg_replace('/[.,!?;:]/', '', $answer);
        
        // Remove articles and common words that don't affect meaning
        $stopWords = ['the', 'a', 'an', 'is', 'are', 'was', 'were', 'be', 'been', 'being'];
        $words = explode(' ', $answer);
        $words = array_filter($words, fn($word) => !in_array(trim($word), $stopWords) && !empty(trim($word)));
        
        return implode(' ', $words);
    }

    private function calculateKeywordSimilarity(string $answer1, string $answer2): float
    {
        $words1 = array_unique(explode(' ', $answer1));
        $words2 = array_unique(explode(' ', $answer2));
        
        if (empty($words1) || empty($words2)) {
            return 0.0;
        }
        
        $intersection = array_intersect($words1, $words2);
        $union = array_unique(array_merge($words1, $words2));
        
        return count($intersection) / count($union);
    }

    private function calculateSemanticSimilarity(string $answer1, string $answer2): float
    {
        // Basic semantic similarity using string distance
        $maxLen = max(strlen($answer1), strlen($answer2));
        if ($maxLen === 0) {
            return 1.0;
        }
        
        $distance = levenshtein($answer1, $answer2);
        return max(0.0, 1.0 - ($distance / $maxLen));
    }

    private function calculatePartialCredit(float $accuracy, int $maxPoints): int
    {
        if ($accuracy >= 0.9) {
            return $maxPoints;
        } elseif ($accuracy >= 0.7) {
            return intval($maxPoints * 0.8);
        } elseif ($accuracy >= 0.5) {
            return intval($maxPoints * 0.6);
        } elseif ($accuracy >= 0.3) {
            return intval($maxPoints * 0.4);
        } elseif ($accuracy >= 0.1) {
            return intval($maxPoints * 0.2);
        }
        
        return 0;
    }

    private function findBestMatch(string $studentAnswer, array $acceptableAnswers): string
    {
        $bestMatch = $acceptableAnswers[0];
        $bestSimilarity = 0.0;
        
        foreach ($acceptableAnswers as $answer) {
            $similarity = $this->calculateAnswerSimilarity($studentAnswer, $answer);
            if ($similarity > $bestSimilarity) {
                $bestSimilarity = $similarity;
                $bestMatch = $answer;
            }
        }
        
        return $bestMatch;
    }

    private function generateCorrectionText(string $studentAnswer, string $bestMatch, float $accuracy): string
    {
        if ($accuracy >= 0.5) {
            return "Partially correct. You wrote '{$studentAnswer}', which contains some correct elements. A more complete answer would be: '{$bestMatch}'.";
        }
        
        return "Incorrect. You wrote '{$studentAnswer}', but the correct answer is: '{$bestMatch}'.";
    }

    private function generateImprovementSuggestions(string $studentAnswer, array $acceptableAnswers, float $accuracy, string $questionText): array
    {
        $suggestions = [];
        
        if ($accuracy >= 0.5) {
            $suggestions[] = "You're on the right track! Try to be more complete and specific in your answer.";
            $suggestions[] = "Include more key details or expand on your main points.";
        } else {
            $suggestions[] = "Read the question carefully and make sure you understand what is being asked.";
            $suggestions[] = "Think about the key concepts related to this topic.";
        }
        
        // Analyze the type of question for specific suggestions
        if ($this->isDefinitionQuestion($questionText)) {
            $suggestions[] = "For definition questions, include the main characteristics and key features.";
        }
        
        if ($this->isExplanationQuestion($questionText)) {
            $suggestions[] = "For explanation questions, describe the process or reasoning step by step.";
        }
        
        if ($this->isExampleQuestion($questionText)) {
            $suggestions[] = "Provide specific, relevant examples that clearly illustrate the concept.";
        }
        
        // Check for common issues
        if (strlen($studentAnswer) < 10) {
            $suggestions[] = "Try to provide more detailed answers - very short responses often miss important points.";
        }
        
        return array_unique($suggestions);
    }

    private function isDefinitionQuestion(string $questionText): bool
    {
        return preg_match('/\b(what is|define|definition|meaning of)\b/i', $questionText);
    }

    private function isExplanationQuestion(string $questionText): bool
    {
        return preg_match('/\b(explain|how|why|describe|process)\b/i', $questionText);
    }

    private function isExampleQuestion(string $questionText): bool
    {
        return preg_match('/\b(example|give|provide|list|name)\b/i', $questionText);
    }

    private function formatAcceptableAnswers(array $acceptableAnswers, ?string $explanation): string
    {
        if (count($acceptableAnswers) === 1) {
            $result = "Correct answer: " . $acceptableAnswers[0];
        } else {
            $result = "Acceptable answers include: " . implode('; ', $acceptableAnswers);
        }
        
        if ($explanation) {
            $result .= ". " . $explanation;
        }
        
        return $result;
    }

    private function extractRelatedConcepts(string $questionText): array
    {
        $concepts = [];
        
        // Extract concepts based on question content
        if (preg_match('/\b(grammar|tense|verb|noun|adjective)\b/i', $questionText)) {
            $concepts[] = 'Grammar';
        }
        
        if (preg_match('/\b(vocabulary|word|meaning|definition)\b/i', $questionText)) {
            $concepts[] = 'Vocabulary';
        }
        
        if (preg_match('/\b(reading|comprehension|text|passage)\b/i', $questionText)) {
            $concepts[] = 'Reading Comprehension';
        }
        
        if (preg_match('/\b(writing|essay|composition)\b/i', $questionText)) {
            $concepts[] = 'Writing Skills';
        }
        
        return array_unique($concepts);
    }
}