<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\Quiz;
use App\Models\QuizSubmissions;
use App\Models\SubmissionAnswers;
use App\Models\QuizQuestions;
use App\Models\QuizOptions;
use App\Models\Enrollment;
use App\Http\Resources\QuizResource;
use App\Http\Resources\QuizSubmissionResource;
use App\Services\DocumentParserService;
use App\Exceptions\DocumentParsingException;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Log;

class QuizController extends Controller
{
    protected DocumentParserService $documentParser;

    public function __construct(DocumentParserService $documentParser)
    {
        $this->documentParser = $documentParser;
    }
    public function index(Request $request): JsonResponse
    {
        $user = $request->user();
        
        if (!$user->isTeacher()) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $quizzes = Quiz::with(['program'])
                      ->where('teacher_id', $user->id)
                      ->latest()
                      ->paginate(10);

        return response()->json([
            'data' => QuizResource::collection($quizzes->items()),
            'meta' => [
                'current_page' => $quizzes->currentPage(),
                'last_page' => $quizzes->lastPage(),
                'per_page' => $quizzes->perPage(),
                'total' => $quizzes->total(),
            ]
        ]);
    }

    public function studentQuizzes(Request $request): JsonResponse
    {
        $user = $request->user();
        
        // Get quizzes from programs the student is enrolled in
        $enrollments = Enrollment::where('student_id', $user->id)
                                ->where('status', 'active')
                                ->pluck('program_id');

        $query = Quiz::with(['program'])
                    ->whereIn('program_id', $enrollments)
                    ->where('is_active', true);

        // Filter by proficiency level if provided
        if ($request->has('level') && !empty($request->level)) {
            $query->byLevel($request->level);
        }

        // Filter by student's assigned level if they have one
        if ($user->student && $user->student->proficiency_level) {
            $query->where(function ($q) use ($user) {
                $q->where('proficiency_level', $user->student->proficiency_level)
                  ->orWhereNull('proficiency_level');
            });
        }

        $quizzes = $query->latest()->get();

        // Add attempt information for each quiz
        $quizzesWithAttempts = $quizzes->map(function ($quiz) use ($user) {
            $attempts = QuizSubmissions::where('quiz_id', $quiz->id)
                                     ->where('student_id', $user->id)
                                     ->orderBy('attempt_number')
                                     ->get();

            $quiz->attempts = $attempts;
            $quiz->can_take_quiz = $attempts->count() < $quiz->max_attempts;
            
            // Add level compatibility warning
            if ($user->student && $user->student->proficiency_level && 
                $quiz->proficiency_level && 
                $this->isLevelAboveStudent($quiz->proficiency_level, $user->student->proficiency_level)) {
                $quiz->level_warning = true;
            }
            
            return $quiz;
        });

        return response()->json([
            'data' => QuizResource::collection($quizzesWithAttempts)
        ]);
    }

    public function show(string $id): JsonResponse
    {
        $user = auth()->user();
        
        $quiz = Quiz::with(['program', 'questions.options'])
                   ->findOrFail($id);

        // Check if user is enrolled in the program
        if ($user->isStudent()) {
            $enrollment = Enrollment::where('student_id', $user->id)
                                   ->where('program_id', $quiz->program_id)
                                   ->first();

            if (!$enrollment) {
                return response()->json([
                    'message' => 'You must be enrolled in the program to access this quiz'
                ], 403);
            }

            // Get user's previous attempts
            $attempts = QuizSubmissions::where('quiz_id', $quiz->id)
                                     ->where('student_id', $user->id)
                                     ->orderBy('attempt_number')
                                     ->get();

            // Check if user can take the quiz
            $canTakeQuiz = $attempts->count() < $quiz->max_attempts;

            return response()->json([
                'data' => new QuizResource($quiz),
                'attempts' => QuizSubmissionResource::collection($attempts),
                'can_take_quiz' => $canTakeQuiz,
            ]);
        }

        return response()->json([
            'data' => new QuizResource($quiz)
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        $user = $request->user();
        
        if (!$user->isTeacher()) {
            return response()->json(['message' => 'Only teachers can create quizzes'], 403);
        }

        $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'sometimes|string',
            'proficiency_level' => 'sometimes|in:A1,A2,B1,B2,C1,C2',
            'correction_mode' => 'sometimes|in:immediate,end_of_quiz,manual',
            'program_id' => 'required|exists:programs,id',
            'time_limit_minutes' => 'sometimes|integer|min:5|max:480',
            'passing_score' => 'required|integer|min:0|max:100',
            'shuffle_questions' => 'sometimes|boolean',
            'show_results_immediately' => 'sometimes|boolean',
            'max_attempts' => 'required|integer|min:1|max:10',
            'available_from' => 'sometimes|date',
            'available_until' => 'sometimes|date|after:available_from',
        ]);

        // Verify teacher owns the program
        $program = \App\Models\Programs::findOrFail($request->program_id);
        if ($program->teacher_id !== $user->id) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $quiz = Quiz::create([
            ...$request->validated(),
            'teacher_id' => $user->id,
            'total_questions' => 0, // Will be updated when questions are added
        ]);

        return response()->json([
            'message' => 'Quiz created successfully',
            'data' => new QuizResource($quiz->load('program'))
        ], 201);
    }

    public function update(Request $request, Quiz $quiz): JsonResponse
    {
        $user = $request->user();
        
        // Check authorization
        if ($user->isTeacher() && $quiz->teacher_id !== $user->id) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $request->validate([
            'title' => 'sometimes|string|max:255',
            'description' => 'sometimes|string',
            'proficiency_level' => 'sometimes|in:A1,A2,B1,B2,C1,C2',
            'correction_mode' => 'sometimes|in:immediate,end_of_quiz,manual',
            'time_limit_minutes' => 'sometimes|integer|min:5|max:480',
            'passing_score' => 'sometimes|integer|min:0|max:100',
            'shuffle_questions' => 'sometimes|boolean',
            'show_results_immediately' => 'sometimes|boolean',
            'max_attempts' => 'sometimes|integer|min:1|max:10',
            'available_from' => 'sometimes|date',
            'available_until' => 'sometimes|date|after:available_from',
            'is_active' => 'sometimes|boolean',
        ]);

        $quiz->update($request->validated());

        return response()->json([
            'message' => 'Quiz updated successfully',
            'data' => new QuizResource($quiz->fresh()->load('program'))
        ]);
    }

    public function destroy(Quiz $quiz): JsonResponse
    {
        $user = auth()->user();
        
        // Check authorization
        if ($user->isTeacher() && $quiz->teacher_id !== $user->id) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $quiz->delete();

        return response()->json([
            'message' => 'Quiz deleted successfully'
        ]);
    }

    public function start(string $id): JsonResponse
    {
        $user = auth()->user();
        $quiz = Quiz::findOrFail($id);

        // Check enrollment
        $enrollment = Enrollment::where('student_id', $user->id)
                               ->where('program_id', $quiz->program_id)
                               ->first();

        if (!$enrollment) {
            return response()->json([
                'message' => 'You must be enrolled in the program to take this quiz'
            ], 403);
        }

        // Check attempts limit
        $attemptsCount = QuizSubmissions::where('quiz_id', $quiz->id)
                                      ->where('student_id', $user->id)
                                      ->count();

        if ($attemptsCount >= $quiz->max_attempts) {
            return response()->json([
                'message' => 'Maximum attempts reached'
            ], 409);
        }

        // Create new submission
        $submission = QuizSubmissions::create([
            'quiz_id' => $quiz->id,
            'student_id' => $user->id,
            'attempt_number' => $attemptsCount + 1,
            'max_possible_score' => $quiz->questions->sum('points'),
            'started_at' => now(),
        ]);

        return response()->json([
            'message' => 'Quiz started successfully',
            'data' => new QuizSubmissionResource($submission),
        ], 201);
    }

    public function submit(Request $request, string $id): JsonResponse
    {
        $user = auth()->user();
        $quiz = Quiz::with('questions.options')->findOrFail($id);

        $request->validate([
            'submission_id' => 'required|exists:quiz_submissions,id',
            'answers' => 'required|array',
            'answers.*.question_id' => 'required|exists:quiz_questions,id',
            'answers.*.selected_option_id' => 'nullable|exists:quiz_options,id',
            'answers.*.answer_text' => 'nullable|string',
        ]);

        $submission = QuizSubmissions::where('id', $request->submission_id)
                                   ->where('student_id', $user->id)
                                   ->where('quiz_id', $quiz->id)
                                   ->firstOrFail();

        if ($submission->submitted_at) {
            return response()->json([
                'message' => 'Quiz already submitted'
            ], 409);
        }

        DB::beginTransaction();

        try {
            $totalScore = 0;

            foreach ($request->answers as $answerData) {
                $question = $quiz->questions->find($answerData['question_id']);
                $isCorrect = false;
                $pointsEarned = 0;

                if ($question->type === 'multiple_choice' && isset($answerData['selected_option_id'])) {
                    $selectedOption = $question->options->find($answerData['selected_option_id']);
                    $isCorrect = $selectedOption && $selectedOption->is_correct;
                    $pointsEarned = $isCorrect ? $question->points : 0;
                } elseif ($question->type === 'true_false' && isset($answerData['selected_option_id'])) {
                    $selectedOption = $question->options->find($answerData['selected_option_id']);
                    $isCorrect = $selectedOption && $selectedOption->is_correct;
                    $pointsEarned = $isCorrect ? $question->points : 0;
                }

                SubmissionAnswers::create([
                    'submission_id' => $submission->id,
                    'question_id' => $question->id,
                    'selected_option_id' => $answerData['selected_option_id'] ?? null,
                    'answer_text' => $answerData['answer_text'] ?? null,
                    'is_correct' => $isCorrect,
                    'points_earned' => $pointsEarned,
                ]);

                $totalScore += $pointsEarned;
            }

            // Calculate percentage and pass status
            $percentage = ($totalScore / $submission->max_possible_score) * 100;
            $isPassed = $percentage >= $quiz->passing_score;

            $submission->update([
                'total_score' => $totalScore,
                'percentage' => $percentage,
                'is_passed' => $isPassed,
                'submitted_at' => now(),
                'time_taken_minutes' => now()->diffInMinutes($submission->started_at),
            ]);

            DB::commit();

            return response()->json([
                'message' => 'Quiz submitted successfully',
                'data' => new QuizSubmissionResource($submission->load('answers.question', 'answers.selectedOption')),
                'show_results' => $quiz->show_results_immediately,
            ]);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'message' => 'Failed to submit quiz'
            ], 500);
        }
    }

    public function results(string $submissionId): JsonResponse
    {
        $user = auth()->user();

        $submission = QuizSubmissions::with([
            'quiz.questions.options',
            'answers.question.options',
            'answers.selectedOption'
        ])
        ->where('student_id', $user->id)
        ->findOrFail($submissionId);

        if (!$submission->quiz->show_results_immediately && !$submission->submitted_at) {
            return response()->json([
                'message' => 'Results not available yet'
            ], 403);
        }

        return response()->json([
            'data' => new QuizSubmissionResource($submission),
        ]);
    }

    /**
     * Upload and parse a document to create a quiz
     */
    public function uploadDocument(Request $request): JsonResponse
    {
        $user = $request->user();
        
        if (!$user->isTeacher()) {
            return response()->json(['message' => 'Only teachers can upload documents'], 403);
        }

        $request->validate([
            'document' => 'required|file|mimes:docx|max:10240', // 10MB max
            'program_id' => 'required|exists:programs,id',
        ]);

        // Verify teacher owns the program
        $program = \App\Models\Programs::findOrFail($request->program_id);
        if ($program->teacher_id !== $user->id) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        try {
            $file = $request->file('document');
            
            // Parse the document
            $parsedData = $this->documentParser->parseDocument($file);
            
            // Store the document
            $documentPath = $file->store('quiz-documents', 'private');
            
            // Create quiz preview data
            $quizPreview = [
                'title' => $parsedData->title,
                'proficiency_level' => $parsedData->level,
                'source_document_path' => $documentPath,
                'program_id' => $request->program_id,
                'total_questions' => count($parsedData->questions),
                'questions' => $parsedData->questions,
                'metadata' => $parsedData->metadata,
            ];

            return response()->json([
                'message' => 'Document parsed successfully',
                'data' => $quizPreview,
            ]);

        } catch (DocumentParsingException $e) {
            return response()->json([
                'message' => 'Document parsing failed',
                'error' => $e->getMessage()
            ], 422);
        } catch (\Exception $e) {
            Log::error('Document upload failed', [
                'user_id' => $user->id,
                'error' => $e->getMessage()
            ]);
            
            return response()->json([
                'message' => 'Document upload failed',
                'error' => 'An unexpected error occurred'
            ], 500);
        }
    }

    /**
     * Create quiz from parsed document data
     */
    public function createFromDocument(Request $request): JsonResponse
    {
        $user = $request->user();
        
        if (!$user->isTeacher()) {
            return response()->json(['message' => 'Only teachers can create quizzes'], 403);
        }

        $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'sometimes|string',
            'proficiency_level' => 'sometimes|in:A1,A2,B1,B2,C1,C2',
            'correction_mode' => 'sometimes|in:immediate,end_of_quiz,manual',
            'source_document_path' => 'required|string',
            'program_id' => 'required|exists:programs,id',
            'time_limit_minutes' => 'sometimes|integer|min:5|max:480',
            'passing_score' => 'required|integer|min:0|max:100',
            'shuffle_questions' => 'sometimes|boolean',
            'show_results_immediately' => 'sometimes|boolean',
            'max_attempts' => 'required|integer|min:1|max:10',
            'available_from' => 'sometimes|date',
            'available_until' => 'sometimes|date|after:available_from',
            'questions' => 'required|array|min:1',
            'questions.*.text' => 'required|string',
            'questions.*.type' => 'required|in:multiple_choice,true_false,fill_blank,short_answer,essay',
            'questions.*.options' => 'sometimes|array',
            'questions.*.correct_answer' => 'required',
            'questions.*.explanation' => 'sometimes|string',
            'questions.*.points' => 'required|integer|min:1',
        ]);

        // Verify teacher owns the program
        $program = \App\Models\Programs::findOrFail($request->program_id);
        if ($program->teacher_id !== $user->id) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        DB::beginTransaction();

        try {
            // Create the quiz
            $quiz = Quiz::create([
                'title' => $request->title,
                'description' => $request->description,
                'proficiency_level' => $request->proficiency_level,
                'correction_mode' => $request->correction_mode ?? 'end_of_quiz',
                'source_document_path' => $request->source_document_path,
                'program_id' => $request->program_id,
                'teacher_id' => $user->id,
                'total_questions' => count($request->questions),
                'time_limit_minutes' => $request->time_limit_minutes,
                'passing_score' => $request->passing_score,
                'shuffle_questions' => $request->shuffle_questions ?? false,
                'show_results_immediately' => $request->show_results_immediately ?? true,
                'max_attempts' => $request->max_attempts,
                'available_from' => $request->available_from,
                'available_until' => $request->available_until,
                'is_active' => true,
            ]);

            // Create questions and options
            foreach ($request->questions as $questionData) {
                $question = QuizQuestions::create([
                    'quiz_id' => $quiz->id,
                    'question' => $questionData['text'],
                    'type' => $questionData['type'],
                    'points' => $questionData['points'],
                    'explanation' => $questionData['explanation'] ?? null,
                ]);

                // Create options for multiple choice and true/false questions
                if (in_array($questionData['type'], ['multiple_choice', 'true_false']) && 
                    isset($questionData['options'])) {
                    
                    foreach ($questionData['options'] as $index => $optionText) {
                        $isCorrect = false;
                        
                        // Determine if this option is correct
                        if (is_string($questionData['correct_answer'])) {
                            $isCorrect = $optionText === $questionData['correct_answer'];
                        } elseif (is_array($questionData['correct_answer'])) {
                            $isCorrect = in_array($optionText, $questionData['correct_answer']);
                        }

                        QuizOptions::create([
                            'question_id' => $question->id,
                            'option_text' => $optionText,
                            'is_correct' => $isCorrect,
                        ]);
                    }
                }
            }

            DB::commit();

            return response()->json([
                'message' => 'Quiz created successfully from document',
                'data' => new QuizResource($quiz->load('program', 'questions.options'))
            ], 201);

        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Quiz creation from document failed', [
                'user_id' => $user->id,
                'error' => $e->getMessage()
            ]);
            
            return response()->json([
                'message' => 'Failed to create quiz from document'
            ], 500);
        }
    }

    /**
     * Get available proficiency levels
     */
    public function getProficiencyLevels(): JsonResponse
    {
        $levels = [
            ['value' => 'A1', 'label' => 'A1 - Beginner'],
            ['value' => 'A2', 'label' => 'A2 - Elementary'],
            ['value' => 'B1', 'label' => 'B1 - Intermediate'],
            ['value' => 'B2', 'label' => 'B2 - Upper Intermediate'],
            ['value' => 'C1', 'label' => 'C1 - Advanced'],
            ['value' => 'C2', 'label' => 'C2 - Proficient'],
        ];

        return response()->json([
            'data' => $levels
        ]);
    }

    /**
     * Check if a quiz level is above student's level
     */
    private function isLevelAboveStudent(string $quizLevel, string $studentLevel): bool
    {
        $levels = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];
        $quizIndex = array_search($quizLevel, $levels);
        $studentIndex = array_search($studentLevel, $levels);
        
        return $quizIndex !== false && $studentIndex !== false && $quizIndex > $studentIndex;
    }
}