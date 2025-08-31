<?php

namespace App\Services\QuestionHandlers;

use App\Contracts\QuestionHandlerInterface;
use App\DTOs\EvaluationResult;
use App\DTOs\CorrectionData;

class EssayHandler implements QuestionHandlerInterface
{
    public function evaluate(string|array $studentAnswer, string|array $correctAnswer, array $options = []): EvaluationResult
    {
        $maxPoints = $options['points'] ?? 5;
        $gradingCriteria = $options['grading_criteria'] ?? [];
        
        $studentAnswer = is_array($studentAnswer) ? $studentAnswer[0] ?? '' : $studentAnswer;
        $studentAnswer = trim($studentAnswer);
        
        if (empty($studentAnswer)) {
            return new EvaluationResult(
                isCorrect: false,
                pointsEarned: 0,
                maxPoints: $maxPoints,
                accuracy: 0.0,
                details: [
                    'student_answer' => '',
                    'question_type' => 'essay',
                    'word_count' => 0,
                    'requires_manual_review' => true
                ]
            );
        }
        
        // Basic automated evaluation
        $analysis = $this->analyzeEssay($studentAnswer, $gradingCriteria);
        $autoScore = $this->calculateAutomaticScore($analysis, $maxPoints);
        
        // Essays typically require manual review, but we can provide initial assessment
        return new EvaluationResult(
            isCorrect: $autoScore >= ($maxPoints * 0.6), // 60% threshold
            pointsEarned: $autoScore,
            maxPoints: $maxPoints,
            accuracy: $autoScore / $maxPoints,
            details: [
                'student_answer' => $studentAnswer,
                'question_type' => 'essay',
                'word_count' => $analysis['word_count'],
                'sentence_count' => $analysis['sentence_count'],
                'paragraph_count' => $analysis['paragraph_count'],
                'analysis' => $analysis,
                'requires_manual_review' => true,
                'auto_score_only' => true
            ]
        );
    }

    public function generateCorrection(string|array $studentAnswer, string|array $correctAnswer, array $options = []): CorrectionData
    {
        $studentAnswer = is_array($studentAnswer) ? $studentAnswer[0] ?? '' : $studentAnswer;
        $studentAnswer = trim($studentAnswer);
        $questionText = $options['question_text'] ?? '';
        $gradingCriteria = $options['grading_criteria'] ?? [];
        $explanation = $options['explanation'] ?? null;
        
        if (empty($studentAnswer)) {
            return new CorrectionData(
                correctionText: "No essay submitted. Please provide a written response to the question.",
                explanation: $explanation,
                improvementSuggestions: [
                    "Make sure to submit your essay before the deadline.",
                    "Read the question carefully and plan your response.",
                    "Include an introduction, body paragraphs, and conclusion."
                ],
                correctAnswerExplanation: $explanation
            );
        }
        
        $analysis = $this->analyzeEssay($studentAnswer, $gradingCriteria);
        $feedback = $this->generateDetailedFeedback($analysis, $questionText);
        
        return new CorrectionData(
            correctionText: $feedback['main_feedback'],
            explanation: $explanation,
            improvementSuggestions: $feedback['suggestions'],
            relatedConcepts: $this->extractRelatedConcepts($questionText),
            correctAnswerExplanation: $this->generateEssayGuidance($questionText, $explanation)
        );
    }

    public function validateAnswer(string|array $answer): bool
    {
        if (is_array($answer)) {
            $answer = $answer[0] ?? '';
        }
        
        return is_string($answer); // Essays can be empty (will get 0 points)
    }

    public function getQuestionType(): string
    {
        return 'essay';
    }

    private function analyzeEssay(string $essay, array $gradingCriteria): array
    {
        $analysis = [
            'word_count' => str_word_count($essay),
            'character_count' => strlen($essay),
            'sentence_count' => $this->countSentences($essay),
            'paragraph_count' => $this->countParagraphs($essay),
            'average_sentence_length' => 0,
            'vocabulary_diversity' => 0,
            'structure_score' => 0,
            'content_keywords' => [],
            'readability_score' => 0
        ];
        
        if ($analysis['sentence_count'] > 0) {
            $analysis['average_sentence_length'] = $analysis['word_count'] / $analysis['sentence_count'];
        }
        
        $analysis['vocabulary_diversity'] = $this->calculateVocabularyDiversity($essay);
        $analysis['structure_score'] = $this->evaluateStructure($essay);
        $analysis['content_keywords'] = $this->extractKeywords($essay);
        $analysis['readability_score'] = $this->calculateReadabilityScore($essay);
        
        return $analysis;
    }

    private function countSentences(string $text): int
    {
        // Count sentences by looking for sentence-ending punctuation
        return preg_match_all('/[.!?]+/', $text);
    }

    private function countParagraphs(string $text): int
    {
        // Count paragraphs by looking for double line breaks or significant spacing
        $paragraphs = preg_split('/\n\s*\n/', trim($text));
        return count(array_filter($paragraphs, fn($p) => !empty(trim($p))));
    }

    private function calculateVocabularyDiversity(string $text): float
    {
        $words = str_word_count(strtolower($text), 1);
        $totalWords = count($words);
        $uniqueWords = count(array_unique($words));
        
        return $totalWords > 0 ? $uniqueWords / $totalWords : 0;
    }

    private function evaluateStructure(string $essay): float
    {
        $score = 0.0;
        $maxScore = 10.0;
        
        // Check for introduction (first paragraph should introduce topic)
        $paragraphs = preg_split('/\n\s*\n/', trim($essay));
        if (count($paragraphs) >= 1) {
            $firstParagraph = strtolower($paragraphs[0]);
            if (preg_match('/\b(this essay|in this|the topic|discuss|analyze|examine)\b/', $firstParagraph)) {
                $score += 2.0;
            }
        }
        
        // Check for multiple paragraphs (structure)
        if (count($paragraphs) >= 3) {
            $score += 3.0;
        } elseif (count($paragraphs) >= 2) {
            $score += 1.5;
        }
        
        // Check for conclusion (last paragraph should conclude)
        if (count($paragraphs) >= 2) {
            $lastParagraph = strtolower($paragraphs[count($paragraphs) - 1]);
            if (preg_match('/\b(in conclusion|to conclude|finally|in summary|therefore)\b/', $lastParagraph)) {
                $score += 2.0;
            }
        }
        
        // Check for transition words
        if (preg_match('/\b(however|furthermore|moreover|additionally|therefore|consequently)\b/i', $essay)) {
            $score += 1.5;
        }
        
        // Check for topic sentences
        if (preg_match('/\b(first|second|third|firstly|secondly|another|also)\b/i', $essay)) {
            $score += 1.5;
        }
        
        return min($score / $maxScore, 1.0);
    }

    private function extractKeywords(string $text): array
    {
        // Simple keyword extraction - remove common words and get most frequent
        $words = str_word_count(strtolower($text), 1);
        $stopWords = [
            'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by',
            'is', 'are', 'was', 'were', 'be', 'been', 'being', 'have', 'has', 'had', 'do', 'does', 'did',
            'will', 'would', 'could', 'should', 'may', 'might', 'can', 'this', 'that', 'these', 'those'
        ];
        
        $filteredWords = array_filter($words, fn($word) => 
            !in_array($word, $stopWords) && strlen($word) > 3
        );
        
        $wordCounts = array_count_values($filteredWords);
        arsort($wordCounts);
        
        return array_slice(array_keys($wordCounts), 0, 10);
    }

    private function calculateReadabilityScore(string $text): float
    {
        // Simplified readability calculation (similar to Flesch Reading Ease)
        $wordCount = str_word_count($text);
        $sentenceCount = $this->countSentences($text);
        $syllableCount = $this->estimateSyllables($text);
        
        if ($sentenceCount === 0 || $wordCount === 0) {
            return 0.0;
        }
        
        $avgWordsPerSentence = $wordCount / $sentenceCount;
        $avgSyllablesPerWord = $syllableCount / $wordCount;
        
        // Simplified Flesch formula
        $score = 206.835 - (1.015 * $avgWordsPerSentence) - (84.6 * $avgSyllablesPerWord);
        
        return max(0, min(100, $score)) / 100; // Normalize to 0-1
    }

    private function estimateSyllables(string $text): int
    {
        $words = str_word_count(strtolower($text), 1);
        $totalSyllables = 0;
        
        foreach ($words as $word) {
            $syllables = preg_match_all('/[aeiouy]+/', $word);
            $totalSyllables += max(1, $syllables); // At least 1 syllable per word
        }
        
        return $totalSyllables;
    }

    private function calculateAutomaticScore(array $analysis, int $maxPoints): int
    {
        $score = 0;
        
        // Word count scoring (30% of total)
        $wordCountScore = 0;
        if ($analysis['word_count'] >= 200) {
            $wordCountScore = 0.3;
        } elseif ($analysis['word_count'] >= 150) {
            $wordCountScore = 0.25;
        } elseif ($analysis['word_count'] >= 100) {
            $wordCountScore = 0.2;
        } elseif ($analysis['word_count'] >= 50) {
            $wordCountScore = 0.15;
        }
        
        // Structure scoring (40% of total)
        $structureScore = $analysis['structure_score'] * 0.4;
        
        // Vocabulary diversity (20% of total)
        $vocabScore = min($analysis['vocabulary_diversity'] * 2, 1.0) * 0.2;
        
        // Readability (10% of total)
        $readabilityScore = $analysis['readability_score'] * 0.1;
        
        $totalScore = $wordCountScore + $structureScore + $vocabScore + $readabilityScore;
        
        return intval($totalScore * $maxPoints);
    }

    private function generateDetailedFeedback(array $analysis, string $questionText): array
    {
        $feedback = [];
        $suggestions = [];
        
        // Word count feedback
        if ($analysis['word_count'] < 50) {
            $feedback[] = "Your essay is quite short ({$analysis['word_count']} words).";
            $suggestions[] = "Try to expand your ideas with more details and examples.";
        } elseif ($analysis['word_count'] < 100) {
            $feedback[] = "Your essay length is adequate ({$analysis['word_count']} words) but could be more developed.";
            $suggestions[] = "Consider adding more supporting details and examples.";
        } else {
            $feedback[] = "Good essay length ({$analysis['word_count']} words).";
        }
        
        // Structure feedback
        if ($analysis['structure_score'] < 0.3) {
            $feedback[] = "Your essay would benefit from better organization.";
            $suggestions[] = "Include a clear introduction, body paragraphs, and conclusion.";
            $suggestions[] = "Use transition words to connect your ideas.";
        } elseif ($analysis['structure_score'] < 0.7) {
            $feedback[] = "Your essay has some organizational structure.";
            $suggestions[] = "Consider strengthening your introduction and conclusion.";
        } else {
            $feedback[] = "Your essay is well-organized.";
        }
        
        // Vocabulary feedback
        if ($analysis['vocabulary_diversity'] < 0.3) {
            $suggestions[] = "Try to use more varied vocabulary to express your ideas.";
        } elseif ($analysis['vocabulary_diversity'] > 0.7) {
            $feedback[] = "Good vocabulary variety.";
        }
        
        // Paragraph feedback
        if ($analysis['paragraph_count'] < 2) {
            $suggestions[] = "Break your essay into multiple paragraphs for better readability.";
        }
        
        $mainFeedback = implode(' ', $feedback);
        if (empty($mainFeedback)) {
            $mainFeedback = "Your essay has been submitted and will be reviewed. This is an automated preliminary assessment.";
        }
        
        return [
            'main_feedback' => $mainFeedback,
            'suggestions' => array_unique($suggestions)
        ];
    }

    private function generateEssayGuidance(string $questionText, ?string $explanation): string
    {
        $guidance = "For essay questions, consider the following structure:\n";
        $guidance .= "1. Introduction: Introduce the topic and your main argument\n";
        $guidance .= "2. Body paragraphs: Develop your points with evidence and examples\n";
        $guidance .= "3. Conclusion: Summarize your main points and restate your position\n";
        
        if ($explanation) {
            $guidance .= "\nAdditional guidance: " . $explanation;
        }
        
        return $guidance;
    }

    private function extractRelatedConcepts(string $questionText): array
    {
        $concepts = ['Essay Writing', 'Written Communication'];
        
        if (preg_match('/\b(analyze|analysis)\b/i', $questionText)) {
            $concepts[] = 'Critical Analysis';
        }
        
        if (preg_match('/\b(compare|contrast)\b/i', $questionText)) {
            $concepts[] = 'Comparative Writing';
        }
        
        if (preg_match('/\b(argue|argument|persuade)\b/i', $questionText)) {
            $concepts[] = 'Argumentative Writing';
        }
        
        if (preg_match('/\b(describe|description)\b/i', $questionText)) {
            $concepts[] = 'Descriptive Writing';
        }
        
        if (preg_match('/\b(explain|explanation)\b/i', $questionText)) {
            $concepts[] = 'Explanatory Writing';
        }
        
        return array_unique($concepts);
    }
}