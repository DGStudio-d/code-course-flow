<?php

namespace App\Services\QuestionHandlers;

use App\Contracts\QuestionHandlerInterface;
use App\DTOs\EvaluationResult;
use App\DTOs\CorrectionData;

class FillBlankHandler implements QuestionHandlerInterface
{
    public function evaluate(string|array $studentAnswer, string|array $correctAnswer, array $options = []): EvaluationResult
    {
        $maxPoints = $options['points'] ?? 1;
        $acceptableAnswers = is_array($correctAnswer) ? $correctAnswer : [$correctAnswer];
        
        $studentAnswer = is_array($studentAnswer) ? $studentAnswer[0] ?? '' : $studentAnswer;
        $studentAnswer = trim($studentAnswer);
        
        $accuracy = $this->calculateAccuracy($studentAnswer, $acceptableAnswers);
        $isCorrect = $accuracy >= 0.8; // 80% similarity threshold
        $pointsEarned = $isCorrect ? $maxPoints : ($accuracy > 0.5 ? intval($maxPoints * 0.5) : 0);
        
        return new EvaluationResult(
            isCorrect: $isCorrect,
            pointsEarned: $pointsEarned,
            maxPoints: $maxPoints,
            accuracy: $accuracy,
            details: [
                'student_answer' => $studentAnswer,
                'acceptable_answers' => $acceptableAnswers,
                'question_type' => 'fill_blank',
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
        
        $accuracy = $this->calculateAccuracy($studentAnswer, $acceptableAnswers);
        $isCorrect = $accuracy >= 0.8;
        
        if ($isCorrect) {
            return new CorrectionData(
                correctionText: "Correct! Your answer '{$studentAnswer}' is acceptable.",
                explanation: $explanation,
                improvementSuggestions: [],
                correctAnswerExplanation: $explanation
            );
        }

        // Generate correction for incorrect/partial answer
        $bestMatch = $this->findBestMatch($studentAnswer, $acceptableAnswers);
        $correctionText = $this->generateCorrectionText($studentAnswer, $bestMatch, $accuracy);
        
        $improvementSuggestions = $this->generateImprovementSuggestions($studentAnswer, $acceptableAnswers, $accuracy);
        
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
            return count($answer) === 1 && !empty(trim($answer[0] ?? ''));
        }
        
        return !empty(trim($answer));
    }

    public function getQuestionType(): string
    {
        return 'fill_blank';
    }

    private function calculateAccuracy(string $studentAnswer, array $acceptableAnswers): float
    {
        if (empty($studentAnswer)) {
            return 0.0;
        }

        $maxSimilarity = 0.0;
        
        foreach ($acceptableAnswers as $correctAnswer) {
            $similarity = $this->calculateStringSimilarity($studentAnswer, $correctAnswer);
            $maxSimilarity = max($maxSimilarity, $similarity);
        }
        
        return $maxSimilarity;
    }

    private function calculateStringSimilarity(string $str1, string $str2): float
    {
        $str1 = strtolower(trim($str1));
        $str2 = strtolower(trim($str2));
        
        // Exact match
        if ($str1 === $str2) {
            return 1.0;
        }
        
        // Check if one contains the other (for partial matches)
        if (strpos($str2, $str1) !== false || strpos($str1, $str2) !== false) {
            return 0.9;
        }
        
        // Use Levenshtein distance for similarity
        $maxLen = max(strlen($str1), strlen($str2));
        if ($maxLen === 0) {
            return 1.0;
        }
        
        $distance = levenshtein($str1, $str2);
        return 1.0 - ($distance / $maxLen);
    }

    private function findBestMatch(string $studentAnswer, array $acceptableAnswers): string
    {
        $bestMatch = $acceptableAnswers[0];
        $bestSimilarity = 0.0;
        
        foreach ($acceptableAnswers as $answer) {
            $similarity = $this->calculateStringSimilarity($studentAnswer, $answer);
            if ($similarity > $bestSimilarity) {
                $bestSimilarity = $similarity;
                $bestMatch = $answer;
            }
        }
        
        return $bestMatch;
    }

    private function generateCorrectionText(string $studentAnswer, string $bestMatch, float $accuracy): string
    {
        if ($accuracy > 0.5) {
            return "Close! You wrote '{$studentAnswer}', but the correct answer is '{$bestMatch}'. You're on the right track.";
        }
        
        return "Incorrect. You wrote '{$studentAnswer}', but the correct answer is '{$bestMatch}'.";
    }

    private function generateImprovementSuggestions(string $studentAnswer, array $acceptableAnswers, float $accuracy): array
    {
        $suggestions = [];
        
        if ($accuracy > 0.5) {
            $suggestions[] = "You're close! Check your spelling and word form.";
            $suggestions[] = "Consider synonyms or alternative forms of the word.";
        } else {
            $suggestions[] = "Review the context clues in the sentence to help determine the correct word.";
            $suggestions[] = "Think about the grammatical role the missing word should play.";
        }
        
        // Check for common errors
        if ($this->hasSpellingError($studentAnswer, $acceptableAnswers)) {
            $suggestions[] = "Pay attention to spelling - small errors can change the meaning.";
        }
        
        if ($this->hasGrammaticalError($studentAnswer, $acceptableAnswers)) {
            $suggestions[] = "Consider the correct grammatical form (tense, number, etc.).";
        }
        
        return array_unique($suggestions);
    }

    private function hasSpellingError(string $studentAnswer, array $acceptableAnswers): bool
    {
        foreach ($acceptableAnswers as $correct) {
            $similarity = $this->calculateStringSimilarity($studentAnswer, $correct);
            if ($similarity > 0.7 && $similarity < 1.0) {
                return true;
            }
        }
        return false;
    }

    private function hasGrammaticalError(string $studentAnswer, array $acceptableAnswers): bool
    {
        // Simple check for common grammatical variations
        $studentRoot = $this->getWordRoot($studentAnswer);
        
        foreach ($acceptableAnswers as $correct) {
            $correctRoot = $this->getWordRoot($correct);
            if ($studentRoot === $correctRoot && $studentAnswer !== $correct) {
                return true;
            }
        }
        
        return false;
    }

    private function getWordRoot(string $word): string
    {
        // Simple stemming - remove common suffixes
        $suffixes = ['ing', 'ed', 'er', 'est', 'ly', 's'];
        $word = strtolower(trim($word));
        
        foreach ($suffixes as $suffix) {
            if (strlen($word) > strlen($suffix) + 2 && substr($word, -strlen($suffix)) === $suffix) {
                return substr($word, 0, -strlen($suffix));
            }
        }
        
        return $word;
    }

    private function formatAcceptableAnswers(array $acceptableAnswers, ?string $explanation): string
    {
        $formatted = "Acceptable answers: " . implode(', ', array_map(fn($a) => "'{$a}'", $acceptableAnswers));
        
        if ($explanation) {
            $formatted .= ". " . $explanation;
        }
        
        return $formatted;
    }

    private function extractRelatedConcepts(string $questionText): array
    {
        $concepts = [];
        
        // Extract concepts based on question patterns
        if (preg_match('/\b(verb|tense|past|present|future)\b/i', $questionText)) {
            $concepts[] = 'Verb Tenses';
        }
        
        if (preg_match('/\b(noun|plural|singular)\b/i', $questionText)) {
            $concepts[] = 'Nouns';
        }
        
        if (preg_match('/\b(adjective|comparative|superlative)\b/i', $questionText)) {
            $concepts[] = 'Adjectives';
        }
        
        if (preg_match('/\b(preposition|in|on|at|by)\b/i', $questionText)) {
            $concepts[] = 'Prepositions';
        }
        
        return array_unique($concepts);
    }
}