<?php

namespace App\Services;

use App\Models\QuizSubmissions;
use App\Models\QuizCorrections;
use App\Models\SubmissionAnswers;
use App\Models\QuizQuestions;
use App\Services\QuestionHandlerFactory;
use App\DTOs\CorrectionData;
use App\DTOs\EvaluationResult;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class CorrectionService
{
    public function __construct(
        private QuestionHandlerFactory $questionHandlerFactory
    ) {}

    /**
     * Generate corrections for a quiz submission
     */
    public function generateCorrections(QuizSubmissions $submission): array
    {
        $corrections = [];
        
        // Load submission with all related data
        $submission->load([
            'answers.question.options',
            'quiz.questions.options'
        ]);

        foreach ($submission->answers as $answer) {
            $correction = $this->generateQuestionCorrection($answer);
            if ($correction) {
                $corrections[] = $correction;
            }
        }

        return $corrections;
    }

    /**
     * Generate correction for a single question answer
     */
    public function generateQuestionCorrection(SubmissionAnswers $answer): ?array
    {
        $question = $answer->question;
        
        if (!$question) {
            Log::warning('Question not found for answer', ['answer_id' => $answer->id]);
            return null;
        }

        try {
            // Get the appropriate handler for this question type
            $handler = $this->questionHandlerFactory->getHandler($question->type);
            
            // Prepare student answer
            $studentAnswer = $this->prepareStudentAnswer($answer, $question->type);
            
            // Prepare correct answer
            $correctAnswer = $this->prepareCorrectAnswer($question);
            
            // Prepare options for the handler
            $options = $this->prepareHandlerOptions($question, $answer);
            
            // Generate correction using the handler
            $correctionData = $handler->generateCorrection($studentAnswer, $correctAnswer, $options);
            
            // Store correction in database
            $storedCorrection = $this->storeCorrection($answer, $correctionData);
            
            return [
                'question_id' => $question->id,
                'answer_id' => $answer->id,
                'correction_id' => $storedCorrection->id,
                'correction_data' => $correctionData->toArray(),
                'question_text' => $question->question,
                'student_answer' => $studentAnswer,
                'correct_answer' => $correctAnswer,
                'is_correct' => $answer->is_correct,
                'points_earned' => $answer->points_earned,
                'max_points' => $question->points
            ];
            
        } catch (\Exception $e) {
            Log::error('Failed to generate correction', [
                'answer_id' => $answer->id,
                'question_id' => $question->id,
                'error' => $e->getMessage()
            ]);
            
            return null;
        }
    }

    /**
     * Re-evaluate and correct a quiz submission using enhanced handlers
     */
    public function reEvaluateSubmission(QuizSubmissions $submission): array
    {
        $results = [];
        $totalScore = 0;
        $maxPossibleScore = 0;

        DB::beginTransaction();

        try {
            $submission->load([
                'answers.question.options',
                'quiz.questions.options'
            ]);

            foreach ($submission->answers as $answer) {
                $question = $answer->question;
                $handler = $this->questionHandlerFactory->getHandler($question->type);
                
                // Prepare data for evaluation
                $studentAnswer = $this->prepareStudentAnswer($answer, $question->type);
                $correctAnswer = $this->prepareCorrectAnswer($question);
                $options = $this->prepareHandlerOptions($question, $answer);
                
                // Re-evaluate the answer
                $evaluation = $handler->evaluate($studentAnswer, $correctAnswer, $options);
                
                // Update the answer record
                $answer->update([
                    'is_correct' => $evaluation->isCorrect,
                    'points_earned' => $evaluation->pointsEarned,
                ]);

                // Generate and store correction
                $correctionData = $handler->generateCorrection($studentAnswer, $correctAnswer, $options);
                $this->storeCorrection($answer, $correctionData);

                $totalScore += $evaluation->pointsEarned;
                $maxPossibleScore += $evaluation->maxPoints;

                $results[] = [
                    'question_id' => $question->id,
                    'original_score' => $answer->getOriginal('points_earned'),
                    'new_score' => $evaluation->pointsEarned,
                    'evaluation' => $evaluation->toArray(),
                    'correction' => $correctionData->toArray()
                ];
            }

            // Update submission totals
            $percentage = $maxPossibleScore > 0 ? ($totalScore / $maxPossibleScore) * 100 : 0;
            $isPassed = $percentage >= $submission->quiz->passing_score;

            $submission->update([
                'total_score' => $totalScore,
                'percentage' => $percentage,
                'is_passed' => $isPassed,
            ]);

            DB::commit();

            return [
                'submission_id' => $submission->id,
                'original_total_score' => $submission->getOriginal('total_score'),
                'new_total_score' => $totalScore,
                'original_percentage' => $submission->getOriginal('percentage'),
                'new_percentage' => $percentage,
                'is_passed' => $isPassed,
                'question_results' => $results
            ];

        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Failed to re-evaluate submission', [
                'submission_id' => $submission->id,
                'error' => $e->getMessage()
            ]);
            throw $e;
        }
    }

    /**
     * Get detailed corrections for a submission
     */
    public function getSubmissionCorrections(QuizSubmissions $submission): array
    {
        $corrections = QuizCorrections::with(['question', 'submission'])
            ->where('submission_id', $submission->id)
            ->get();

        return $corrections->map(function ($correction) {
            return [
                'id' => $correction->id,
                'question_id' => $correction->question_id,
                'question_text' => $correction->question->question,
                'question_type' => $correction->question->type,
                'correction_text' => $correction->correction_text,
                'explanation' => $correction->explanation,
                'improvement_suggestions' => $correction->improvement_suggestions,
                'created_at' => $correction->created_at,
            ];
        })->toArray();
    }

    /**
     * Generate summary feedback for entire submission
     */
    public function generateSubmissionSummary(QuizSubmissions $submission): array
    {
        $submission->load(['answers.question', 'corrections']);
        
        $totalQuestions = $submission->answers->count();
        $correctAnswers = $submission->answers->where('is_correct', true)->count();
        $partialCredit = $submission->answers->where('is_correct', false)
            ->where('points_earned', '>', 0)->count();

        // Analyze performance by question type
        $performanceByType = $this->analyzePerformanceByType($submission);
        
        // Generate improvement areas
        $improvementAreas = $this->identifyImprovementAreas($submission);
        
        // Calculate time efficiency
        $timeEfficiency = $this->calculateTimeEfficiency($submission);

        return [
            'submission_id' => $submission->id,
            'overall_performance' => [
                'total_questions' => $totalQuestions,
                'correct_answers' => $correctAnswers,
                'partial_credit' => $partialCredit,
                'total_score' => $submission->total_score,
                'max_possible_score' => $submission->max_possible_score,
                'percentage' => $submission->percentage,
                'is_passed' => $submission->is_passed,
                'grade_letter' => $this->calculateLetterGrade($submission->percentage)
            ],
            'performance_by_type' => $performanceByType,
            'improvement_areas' => $improvementAreas,
            'time_efficiency' => $timeEfficiency,
            'strengths' => $this->identifyStrengths($submission),
            'next_steps' => $this->generateNextSteps($submission)
        ];
    }

    /**
     * Prepare student answer based on question type
     */
    private function prepareStudentAnswer(SubmissionAnswers $answer, string $questionType): string|array
    {
        switch ($questionType) {
            case 'multiple_choice':
            case 'true_false':
                return $answer->selectedOption?->option_text ?? '';
            
            case 'fill_blank':
            case 'short_answer':
            case 'essay':
                return $answer->answer_text ?? '';
            
            default:
                return $answer->answer_text ?? $answer->selectedOption?->option_text ?? '';
        }
    }

    /**
     * Prepare correct answer based on question type
     */
    private function prepareCorrectAnswer(QuizQuestions $question): string|array
    {
        switch ($question->type) {
            case 'multiple_choice':
            case 'true_false':
                $correctOptions = $question->options->where('is_correct', true);
                return $correctOptions->count() === 1 
                    ? $correctOptions->first()->option_text 
                    : $correctOptions->pluck('option_text')->toArray();
            
            case 'fill_blank':
            case 'short_answer':
            case 'essay':
                // For these types, correct answer might be stored in explanation or a separate field
                // This would need to be enhanced based on your data structure
                return $question->explanation ?? 'Manual review required';
            
            default:
                return 'Manual review required';
        }
    }

    /**
     * Prepare options for question handlers
     */
    private function prepareHandlerOptions(QuizQuestions $question, SubmissionAnswers $answer): array
    {
        return [
            'points' => $question->points,
            'question_text' => $question->question,
            'explanation' => $question->explanation,
            'all_options' => $question->options->pluck('option_text')->toArray(),
            'question_id' => $question->id,
            'answer_id' => $answer->id
        ];
    }

    /**
     * Store correction in database
     */
    private function storeCorrection(SubmissionAnswers $answer, CorrectionData $correctionData): QuizCorrections
    {
        return QuizCorrections::updateOrCreate(
            [
                'submission_id' => $answer->submission_id,
                'question_id' => $answer->question_id,
            ],
            [
                'correction_text' => $correctionData->correctionText,
                'explanation' => $correctionData->explanation,
                'improvement_suggestions' => $correctionData->improvementSuggestions,
            ]
        );
    }

    /**
     * Analyze performance by question type
     */
    private function analyzePerformanceByType(QuizSubmissions $submission): array
    {
        $performance = [];
        
        $answersByType = $submission->answers->groupBy('question.type');
        
        foreach ($answersByType as $type => $answers) {
            $total = $answers->count();
            $correct = $answers->where('is_correct', true)->count();
            $totalPoints = $answers->sum('points_earned');
            $maxPoints = $answers->sum('question.points');
            
            $performance[$type] = [
                'total_questions' => $total,
                'correct_answers' => $correct,
                'accuracy_rate' => $total > 0 ? round(($correct / $total) * 100, 1) : 0,
                'points_earned' => $totalPoints,
                'max_points' => $maxPoints,
                'score_percentage' => $maxPoints > 0 ? round(($totalPoints / $maxPoints) * 100, 1) : 0
            ];
        }
        
        return $performance;
    }

    /**
     * Identify areas for improvement
     */
    private function identifyImprovementAreas(QuizSubmissions $submission): array
    {
        $areas = [];
        
        // Analyze incorrect answers
        $incorrectAnswers = $submission->answers->where('is_correct', false);
        
        // Group by question type
        $weakTypes = $incorrectAnswers->groupBy('question.type')
            ->map(function ($answers, $type) {
                return [
                    'type' => $type,
                    'count' => $answers->count(),
                    'percentage' => round(($answers->count() / $answers->count()) * 100, 1)
                ];
            })
            ->sortByDesc('count')
            ->take(3);

        foreach ($weakTypes as $weakType) {
            $areas[] = ucfirst(str_replace('_', ' ', $weakType['type'])) . ' questions';
        }

        // Add specific improvement suggestions from corrections
        $corrections = $submission->corrections;
        $commonSuggestions = [];
        
        foreach ($corrections as $correction) {
            if ($correction->improvement_suggestions) {
                foreach ($correction->improvement_suggestions as $suggestion) {
                    $commonSuggestions[] = $suggestion;
                }
            }
        }

        // Get most common suggestions
        $suggestionCounts = array_count_values($commonSuggestions);
        arsort($suggestionCounts);
        $topSuggestions = array_slice(array_keys($suggestionCounts), 0, 3);

        return array_merge($areas, $topSuggestions);
    }

    /**
     * Calculate time efficiency
     */
    private function calculateTimeEfficiency(QuizSubmissions $submission): array
    {
        $timeTaken = $submission->time_taken_minutes ?? 0;
        $timeLimit = $submission->quiz->time_limit_minutes ?? 0;
        
        $efficiency = 'N/A';
        $feedback = 'No time limit set';
        
        if ($timeLimit > 0) {
            $percentage = ($timeTaken / $timeLimit) * 100;
            
            if ($percentage <= 50) {
                $efficiency = 'Very Fast';
                $feedback = 'You completed the quiz very quickly. Consider taking more time to review your answers.';
            } elseif ($percentage <= 75) {
                $efficiency = 'Good Pace';
                $feedback = 'You managed your time well during the quiz.';
            } elseif ($percentage <= 90) {
                $efficiency = 'Adequate';
                $feedback = 'You used most of the available time effectively.';
            } else {
                $efficiency = 'Time Pressure';
                $feedback = 'You may have felt time pressure. Practice managing time during quizzes.';
            }
        }

        return [
            'time_taken_minutes' => $timeTaken,
            'time_limit_minutes' => $timeLimit,
            'efficiency_rating' => $efficiency,
            'feedback' => $feedback
        ];
    }

    /**
     * Identify student strengths
     */
    private function identifyStrengths(QuizSubmissions $submission): array
    {
        $strengths = [];
        
        // Analyze correct answers by type
        $correctAnswers = $submission->answers->where('is_correct', true);
        $strongTypes = $correctAnswers->groupBy('question.type')
            ->map(function ($answers, $type) use ($submission) {
                $totalOfType = $submission->answers->where('question.type', $type)->count();
                return [
                    'type' => $type,
                    'correct' => $answers->count(),
                    'total' => $totalOfType,
                    'percentage' => $totalOfType > 0 ? ($answers->count() / $totalOfType) * 100 : 0
                ];
            })
            ->where('percentage', '>=', 80)
            ->sortByDesc('percentage');

        foreach ($strongTypes as $strongType) {
            $strengths[] = ucfirst(str_replace('_', ' ', $strongType['type'])) . ' questions';
        }

        // Add general strengths based on performance
        if ($submission->percentage >= 90) {
            $strengths[] = 'Excellent overall understanding';
        } elseif ($submission->percentage >= 80) {
            $strengths[] = 'Strong grasp of the material';
        } elseif ($submission->percentage >= 70) {
            $strengths[] = 'Good foundational knowledge';
        }

        return array_unique($strengths);
    }

    /**
     * Generate next steps recommendations
     */
    private function generateNextSteps(QuizSubmissions $submission): array
    {
        $nextSteps = [];
        
        if ($submission->is_passed) {
            $nextSteps[] = 'Congratulations on passing! Continue to the next topic or level.';
            
            if ($submission->percentage < 85) {
                $nextSteps[] = 'Review the questions you missed to strengthen your understanding.';
            }
        } else {
            $nextSteps[] = 'Review the material and retake the quiz when ready.';
            $nextSteps[] = 'Focus on the areas identified for improvement.';
            $nextSteps[] = 'Consider seeking additional help or resources for challenging topics.';
        }

        // Add specific recommendations based on performance
        $incorrectCount = $submission->answers->where('is_correct', false)->count();
        if ($incorrectCount > 0) {
            $nextSteps[] = 'Study the detailed corrections provided for each incorrect answer.';
        }

        return $nextSteps;
    }

    /**
     * Calculate letter grade
     */
    private function calculateLetterGrade(float $percentage): string
    {
        if ($percentage >= 97) return 'A+';
        if ($percentage >= 93) return 'A';
        if ($percentage >= 90) return 'A-';
        if ($percentage >= 87) return 'B+';
        if ($percentage >= 83) return 'B';
        if ($percentage >= 80) return 'B-';
        if ($percentage >= 77) return 'C+';
        if ($percentage >= 73) return 'C';
        if ($percentage >= 70) return 'C-';
        if ($percentage >= 67) return 'D+';
        if ($percentage >= 65) return 'D';
        return 'F';
    }
}