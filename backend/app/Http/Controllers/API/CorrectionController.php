<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\QuizSubmissions;
use App\Models\QuizCorrections;
use App\Services\CorrectionService;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Gate;

class CorrectionController extends Controller
{
    public function __construct(
        private CorrectionService $correctionService
    ) {}

    /**
     * Get corrections for a specific submission
     */
    public function getSubmissionCorrections(string $submissionId): JsonResponse
    {
        $user = auth()->user();
        
        $submission = QuizSubmissions::with(['quiz', 'student'])
            ->findOrFail($submissionId);

        // Check authorization
        if (!$this->canViewCorrections($user, $submission)) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        try {
            $corrections = $this->correctionService->getSubmissionCorrections($submission);
            $summary = $this->correctionService->generateSubmissionSummary($submission);

            return response()->json([
                'data' => [
                    'submission' => [
                        'id' => $submission->id,
                        'quiz_title' => $submission->quiz->title,
                        'student_name' => $submission->student->name,
                        'submitted_at' => $submission->submitted_at,
                        'total_score' => $submission->total_score,
                        'percentage' => $submission->percentage,
                        'is_passed' => $submission->is_passed,
                    ],
                    'corrections' => $corrections,
                    'summary' => $summary
                ]
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Failed to retrieve corrections',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Generate corrections for a submission
     */
    public function generateCorrections(string $submissionId): JsonResponse
    {
        $user = auth()->user();
        
        $submission = QuizSubmissions::with(['quiz', 'answers.question.options'])
            ->findOrFail($submissionId);

        // Only teachers can generate corrections
        if (!$user->isTeacher() || $submission->quiz->teacher_id !== $user->id) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        try {
            $corrections = $this->correctionService->generateCorrections($submission);

            return response()->json([
                'message' => 'Corrections generated successfully',
                'data' => $corrections
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Failed to generate corrections',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Re-evaluate a submission with enhanced scoring
     */
    public function reEvaluateSubmission(string $submissionId): JsonResponse
    {
        $user = auth()->user();
        
        $submission = QuizSubmissions::with(['quiz', 'answers.question.options'])
            ->findOrFail($submissionId);

        // Only teachers can re-evaluate submissions
        if (!$user->isTeacher() || $submission->quiz->teacher_id !== $user->id) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        try {
            $results = $this->correctionService->reEvaluateSubmission($submission);

            return response()->json([
                'message' => 'Submission re-evaluated successfully',
                'data' => $results
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Failed to re-evaluate submission',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get detailed correction for a specific question
     */
    public function getQuestionCorrection(string $submissionId, string $questionId): JsonResponse
    {
        $user = auth()->user();
        
        $submission = QuizSubmissions::with(['quiz', 'student'])
            ->findOrFail($submissionId);

        if (!$this->canViewCorrections($user, $submission)) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $correction = QuizCorrections::with(['question.options', 'submission.answers'])
            ->where('submission_id', $submissionId)
            ->where('question_id', $questionId)
            ->first();

        if (!$correction) {
            return response()->json(['message' => 'Correction not found'], 404);
        }

        // Get the student's answer for this question
        $studentAnswer = $submission->answers()
            ->where('question_id', $questionId)
            ->with('selectedOption')
            ->first();

        return response()->json([
            'data' => [
                'correction' => [
                    'id' => $correction->id,
                    'correction_text' => $correction->correction_text,
                    'explanation' => $correction->explanation,
                    'improvement_suggestions' => $correction->improvement_suggestions,
                ],
                'question' => [
                    'id' => $correction->question->id,
                    'text' => $correction->question->question,
                    'type' => $correction->question->type,
                    'points' => $correction->question->points,
                    'explanation' => $correction->question->explanation,
                    'options' => $correction->question->options->map(function ($option) {
                        return [
                            'id' => $option->id,
                            'text' => $option->option_text,
                            'is_correct' => $option->is_correct
                        ];
                    })
                ],
                'student_answer' => [
                    'selected_option' => $studentAnswer?->selectedOption?->option_text,
                    'answer_text' => $studentAnswer?->answer_text,
                    'is_correct' => $studentAnswer?->is_correct,
                    'points_earned' => $studentAnswer?->points_earned,
                ]
            ]
        ]);
    }

    /**
     * Update correction manually (for teachers)
     */
    public function updateCorrection(Request $request, string $correctionId): JsonResponse
    {
        $user = auth()->user();
        
        $correction = QuizCorrections::with(['submission.quiz'])
            ->findOrFail($correctionId);

        // Only teachers can update corrections
        if (!$user->isTeacher() || $correction->submission->quiz->teacher_id !== $user->id) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $request->validate([
            'correction_text' => 'sometimes|string',
            'explanation' => 'sometimes|string|nullable',
            'improvement_suggestions' => 'sometimes|array',
            'improvement_suggestions.*' => 'string'
        ]);

        $correction->update($request->only([
            'correction_text',
            'explanation',
            'improvement_suggestions'
        ]));

        return response()->json([
            'message' => 'Correction updated successfully',
            'data' => [
                'id' => $correction->id,
                'correction_text' => $correction->correction_text,
                'explanation' => $correction->explanation,
                'improvement_suggestions' => $correction->improvement_suggestions,
                'updated_at' => $correction->updated_at
            ]
        ]);
    }

    /**
     * Get correction statistics for a quiz
     */
    public function getQuizCorrectionStats(string $quizId): JsonResponse
    {
        $user = auth()->user();
        
        $quiz = \App\Models\Quiz::with(['submissions.corrections'])
            ->findOrFail($quizId);

        // Only teachers can view correction stats
        if (!$user->isTeacher() || $quiz->teacher_id !== $user->id) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $submissions = $quiz->submissions()->with(['corrections', 'answers'])->get();
        
        $stats = [
            'total_submissions' => $submissions->count(),
            'submissions_with_corrections' => $submissions->filter(function ($submission) {
                return $submission->corrections->count() > 0;
            })->count(),
            'average_score' => $submissions->avg('percentage'),
            'pass_rate' => $submissions->where('is_passed', true)->count() / max($submissions->count(), 1) * 100,
            'common_mistakes' => $this->getCommonMistakes($submissions),
            'question_difficulty' => $this->getQuestionDifficulty($submissions),
        ];

        return response()->json([
            'data' => $stats
        ]);
    }

    /**
     * Check if user can view corrections
     */
    private function canViewCorrections($user, QuizSubmissions $submission): bool
    {
        // Students can view their own corrections
        if ($user->isStudent() && $submission->student_id === $user->id) {
            return true;
        }

        // Teachers can view corrections for their quizzes
        if ($user->isTeacher() && $submission->quiz->teacher_id === $user->id) {
            return true;
        }

        // Admins can view all corrections
        if ($user->isAdmin()) {
            return true;
        }

        return false;
    }

    /**
     * Get common mistakes across submissions
     */
    private function getCommonMistakes($submissions): array
    {
        $mistakes = [];
        
        foreach ($submissions as $submission) {
            foreach ($submission->corrections as $correction) {
                if ($correction->improvement_suggestions) {
                    foreach ($correction->improvement_suggestions as $suggestion) {
                        $mistakes[] = $suggestion;
                    }
                }
            }
        }

        $mistakeCounts = array_count_values($mistakes);
        arsort($mistakeCounts);
        
        return array_slice($mistakeCounts, 0, 10, true);
    }

    /**
     * Get question difficulty analysis
     */
    private function getQuestionDifficulty($submissions): array
    {
        $questionStats = [];
        
        foreach ($submissions as $submission) {
            foreach ($submission->answers as $answer) {
                $questionId = $answer->question_id;
                
                if (!isset($questionStats[$questionId])) {
                    $questionStats[$questionId] = [
                        'question_text' => $answer->question->question,
                        'total_attempts' => 0,
                        'correct_attempts' => 0,
                        'average_score' => 0,
                        'total_points' => 0
                    ];
                }
                
                $questionStats[$questionId]['total_attempts']++;
                if ($answer->is_correct) {
                    $questionStats[$questionId]['correct_attempts']++;
                }
                $questionStats[$questionId]['total_points'] += $answer->points_earned;
            }
        }

        // Calculate difficulty metrics
        foreach ($questionStats as $questionId => &$stats) {
            $stats['success_rate'] = $stats['total_attempts'] > 0 
                ? ($stats['correct_attempts'] / $stats['total_attempts']) * 100 
                : 0;
            $stats['average_score'] = $stats['total_attempts'] > 0 
                ? $stats['total_points'] / $stats['total_attempts'] 
                : 0;
            
            // Classify difficulty
            if ($stats['success_rate'] >= 80) {
                $stats['difficulty'] = 'Easy';
            } elseif ($stats['success_rate'] >= 60) {
                $stats['difficulty'] = 'Medium';
            } else {
                $stats['difficulty'] = 'Hard';
            }
        }

        return $questionStats;
    }
}