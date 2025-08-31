<?php

namespace App\Services\QuestionHandlers;

use App\Contracts\QuestionHandlerInterface;
use App\DTOs\EvaluationResult;
use App\DTOs\CorrectionData;

class TrueFalseHandler implements QuestionHandlerInterface
{
    private const TRUE_VALUES = ['true', 't', '1', 'yes', 'correct', 'right'];
    private const FALSE_VALUES = ['false', 'f', '0', 'no', 'incorrect', 'wrong'];

    public function evaluate(string|array $studentAnswer, string|array $correctAnswer, array $options = []): EvaluationResult
    {
        $maxPoints = $options['points'] ?? 1;
        
        $studentAnswer = is_array($studentAnswer) ? $studentAnswer[0] ?? '' : $studentAnswer;
        $correctAnswer = is_array($correctAnswer) ? $correctAnswer[0] ?? '' : $correctAnswer;
        
        $studentBool = $this->normalizeToBoolean($studentAnswer);
        $correctBool = $this->normalizeToBoolean($correctAnswer);
        
        $isCorrect = $studentBool === $correctBool;
        $pointsEarned = $isCorrect ? $maxPoints : 0;
        
        return new EvaluationResult(
            isCorrect: $isCorrect,
            pointsEarned: $pointsEarned,
            maxPoints: $maxPoints,
            accuracy: $isCorrect ? 1.0 : 0.0,
            details: [
                'student_answer' => $studentAnswer,
                'correct_answer' => $correctAnswer,
                'student_boolean' => $studentBool,
                'correct_boolean' => $correctBool,
                'question_type' => 'true_false'
            ]
        );
    }

    public function generateCorrection(string|array $studentAnswer, string|array $correctAnswer, array $options = []): CorrectionData
    {
        $studentAnswer = is_array($studentAnswer) ? $studentAnswer[0] ?? '' : $studentAnswer;
        $correctAnswer = is_array($correctAnswer) ? $correctAnswer[0] ?? '' : $correctAnswer;
        $questionText = $options['question_text'] ?? '';
        $explanation = $options['explanation'] ?? null;
        
        $studentBool = $this->normalizeToBoolean($studentAnswer);
        $correctBool = $this->normalizeToBoolean($correctAnswer);
        $isCorrect = $studentBool === $correctBool;
        
        if ($isCorrect) {
            return new CorrectionData(
                correctionText: "Correct! The statement is " . ($correctBool ? "true" : "false") . ".",
                explanation: $explanation,
                improvementSuggestions: [],
                correctAnswerExplanation: $explanation
            );
        }

        // Generate correction for incorrect answer
        $correctText = $correctBool ? "true" : "false";
        $studentText = $studentBool ? "true" : "false";
        
        $correctionText = "Incorrect. You answered '{$studentText}', but the correct answer is '{$correctText}'.";
        
        $improvementSuggestions = $this->generateImprovementSuggestions($questionText, $correctBool);
        
        return new CorrectionData(
            correctionText: $correctionText,
            explanation: $explanation,
            improvementSuggestions: $improvementSuggestions,
            relatedConcepts: $this->extractRelatedConcepts($questionText),
            correctAnswerExplanation: $this->generateDetailedExplanation($questionText, $correctBool, $explanation)
        );
    }

    public function validateAnswer(string|array $answer): bool
    {
        if (is_array($answer)) {
            $answer = $answer[0] ?? '';
        }
        
        $answer = strtolower(trim($answer));
        return in_array($answer, array_merge(self::TRUE_VALUES, self::FALSE_VALUES));
    }

    public function getQuestionType(): string
    {
        return 'true_false';
    }

    private function normalizeToBoolean(string $answer): bool
    {
        $answer = strtolower(trim($answer));
        
        if (in_array($answer, self::TRUE_VALUES)) {
            return true;
        }
        
        if (in_array($answer, self::FALSE_VALUES)) {
            return false;
        }
        
        // Default fallback - could throw exception instead
        return false;
    }

    private function generateImprovementSuggestions(string $questionText, bool $correctAnswer): array
    {
        $suggestions = [];
        
        // General suggestions
        $suggestions[] = "Read the statement carefully and consider each word.";
        $suggestions[] = "Look for absolute terms like 'always', 'never', 'all', or 'none' which often make statements false.";
        
        // Specific suggestions based on the correct answer
        if ($correctAnswer) {
            $suggestions[] = "The statement contains accurate information. Review the facts presented.";
            $suggestions[] = "Consider what makes this statement true and look for supporting evidence.";
        } else {
            $suggestions[] = "Look for what makes this statement incorrect or incomplete.";
            $suggestions[] = "Consider exceptions or counterexamples that would make the statement false.";
        }
        
        // Content-specific suggestions
        if ($this->containsGrammarContent($questionText)) {
            $suggestions[] = "Review the grammar rules related to this topic.";
        }
        
        if ($this->containsVocabularyContent($questionText)) {
            $suggestions[] = "Check the definitions and usage of key vocabulary words.";
        }
        
        return array_unique($suggestions);
    }

    private function generateDetailedExplanation(string $questionText, bool $correctAnswer, ?string $explanation): string
    {
        $result = "The correct answer is " . ($correctAnswer ? "True" : "False") . ".";
        
        if ($explanation) {
            $result .= " " . $explanation;
        } else {
            // Generate basic explanation based on content analysis
            if ($correctAnswer) {
                $result .= " This statement is accurate based on the established facts or rules.";
            } else {
                $result .= " This statement contains incorrect or incomplete information.";
            }
        }
        
        return $result;
    }

    private function containsGrammarContent(string $text): bool
    {
        $grammarKeywords = [
            'verb', 'noun', 'adjective', 'adverb', 'tense', 'grammar',
            'subject', 'object', 'clause', 'sentence', 'plural', 'singular'
        ];
        
        $text = strtolower($text);
        foreach ($grammarKeywords as $keyword) {
            if (strpos($text, $keyword) !== false) {
                return true;
            }
        }
        
        return false;
    }

    private function containsVocabularyContent(string $text): bool
    {
        $vocabKeywords = [
            'meaning', 'definition', 'synonym', 'antonym', 'word',
            'vocabulary', 'term', 'phrase', 'expression'
        ];
        
        $text = strtolower($text);
        foreach ($vocabKeywords as $keyword) {
            if (strpos($text, $keyword) !== false) {
                return true;
            }
        }
        
        return false;
    }

    private function extractRelatedConcepts(string $questionText): array
    {
        $concepts = [];
        
        if ($this->containsGrammarContent($questionText)) {
            $concepts[] = 'Grammar Rules';
        }
        
        if ($this->containsVocabularyContent($questionText)) {
            $concepts[] = 'Vocabulary';
        }
        
        // Extract specific grammar concepts
        if (preg_match('/\b(present|past|future|tense)\b/i', $questionText)) {
            $concepts[] = 'Verb Tenses';
        }
        
        if (preg_match('/\b(article|a|an|the)\b/i', $questionText)) {
            $concepts[] = 'Articles';
        }
        
        if (preg_match('/\b(preposition|in|on|at|by|with)\b/i', $questionText)) {
            $concepts[] = 'Prepositions';
        }
        
        return array_unique($concepts);
    }
}