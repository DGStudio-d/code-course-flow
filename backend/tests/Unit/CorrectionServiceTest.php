<?php

namespace Tests\Unit;

use Tests\TestCase;
use App\Services\CorrectionService;
use App\Services\QuestionHandlerFactory;
use App\Models\QuizSubmissions;
use App\Models\SubmissionAnswers;
use App\Models\QuizQuestions;
use App\Models\QuizOptions;
use App\Models\Quiz;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;

class CorrectionServiceTest extends TestCase
{
    use RefreshDatabase;

    private CorrectionService $correctionService;
    private QuestionHandlerFactory $handlerFactory;

    protected function setUp(): void
    {
        parent::setUp();
        $this->handlerFactory = new QuestionHandlerFactory();
        $this->correctionService = new CorrectionService($this->handlerFactory);
    }

    public function test_generate_corrections_for_multiple_choice_question()
    {
        $user = User::factory()->create(['role' => 'student']);
        $quiz = Quiz::factory()->create();
        $question = QuizQuestions::factory()->create([
            'quiz_id' => $quiz->id,
            'type' => 'multiple_choice',
            'question' => 'What is the capital of France?',
            'points' => 2
        ]);

        $correctOption = QuizOptions::factory()->create([
            'question_id' => $question->id,
            'option_text' => 'Paris',
            'is_correct' => true
        ]);

        $incorrectOption = QuizOptions::factory()->create([
            'question_id' => $question->id,
            'option_text' => 'London',
            'is_correct' => false
        ]);

        $submission = QuizSubmissions::factory()->create([
            'quiz_id' => $quiz->id,
            'student_id' => $user->id
        ]);

        $answer = SubmissionAnswers::factory()->create([
            'submission_id' => $submission->id,
            'question_id' => $question->id,
            'selected_option_id' => $incorrectOption->id,
            'is_correct' => false,
            'points_earned' => 0
        ]);

        $corrections = $this->correctionService->generateCorrections($submission);

        $this->assertCount(1, $corrections);
        $this->assertEquals($question->id, $corrections[0]['question_id']);
        $this->assertEquals($answer->id, $corrections[0]['answer_id']);
        $this->assertStringContains('Incorrect', $corrections[0]['correction_data']['correction_text']);
        $this->assertNotEmpty($corrections[0]['correction_data']['improvement_suggestions']);
    }

    public function test_generate_submission_summary()
    {
        $user = User::factory()->create(['role' => 'student']);
        $quiz = Quiz::factory()->create(['passing_score' => 70]);
        
        $submission = QuizSubmissions::factory()->create([
            'quiz_id' => $quiz->id,
            'student_id' => $user->id,
            'total_score' => 8,
            'max_possible_score' => 10,
            'percentage' => 80,
            'is_passed' => true,
            'time_taken_minutes' => 15
        ]);

        // Create some questions and answers
        $question1 = QuizQuestions::factory()->create([
            'quiz_id' => $quiz->id,
            'type' => 'multiple_choice',
            'points' => 5
        ]);

        $question2 = QuizQuestions::factory()->create([
            'quiz_id' => $quiz->id,
            'type' => 'short_answer',
            'points' => 5
        ]);

        SubmissionAnswers::factory()->create([
            'submission_id' => $submission->id,
            'question_id' => $question1->id,
            'is_correct' => true,
            'points_earned' => 5
        ]);

        SubmissionAnswers::factory()->create([
            'submission_id' => $submission->id,
            'question_id' => $question2->id,
            'is_correct' => false,
            'points_earned' => 3
        ]);

        $summary = $this->correctionService->generateSubmissionSummary($submission);

        $this->assertEquals($submission->id, $summary['submission_id']);
        $this->assertEquals(2, $summary['overall_performance']['total_questions']);
        $this->assertEquals(1, $summary['overall_performance']['correct_answers']);
        $this->assertEquals(1, $summary['overall_performance']['partial_credit']);
        $this->assertEquals(80, $summary['overall_performance']['percentage']);
        $this->assertTrue($summary['overall_performance']['is_passed']);
        $this->assertEquals('B-', $summary['overall_performance']['grade_letter']);
        
        $this->assertArrayHasKey('performance_by_type', $summary);
        $this->assertArrayHasKey('improvement_areas', $summary);
        $this->assertArrayHasKey('time_efficiency', $summary);
        $this->assertArrayHasKey('strengths', $summary);
        $this->assertArrayHasKey('next_steps', $summary);
    }

    public function test_re_evaluate_submission_updates_scores()
    {
        $user = User::factory()->create(['role' => 'student']);
        $quiz = Quiz::factory()->create();
        $question = QuizQuestions::factory()->create([
            'quiz_id' => $quiz->id,
            'type' => 'fill_blank',
            'question' => 'The capital of France is _____.',
            'points' => 2
        ]);

        $submission = QuizSubmissions::factory()->create([
            'quiz_id' => $quiz->id,
            'student_id' => $user->id,
            'total_score' => 0,
            'max_possible_score' => 2,
            'percentage' => 0
        ]);

        $answer = SubmissionAnswers::factory()->create([
            'submission_id' => $submission->id,
            'question_id' => $question->id,
            'answer_text' => 'Pari', // Close to correct answer "Paris"
            'is_correct' => false,
            'points_earned' => 0
        ]);

        $results = $this->correctionService->reEvaluateSubmission($submission);

        $this->assertEquals($submission->id, $results['submission_id']);
        $this->assertEquals(0, $results['original_total_score']);
        $this->assertGreaterThan(0, $results['new_total_score']); // Should get partial credit
        $this->assertGreaterThan(0, $results['new_percentage']);
        
        // Check that the answer was updated
        $answer->refresh();
        $this->assertGreaterThan(0, $answer->points_earned);
    }

    public function test_calculate_letter_grade()
    {
        $reflection = new \ReflectionClass($this->correctionService);
        $method = $reflection->getMethod('calculateLetterGrade');
        $method->setAccessible(true);

        $this->assertEquals('A+', $method->invoke($this->correctionService, 98));
        $this->assertEquals('A', $method->invoke($this->correctionService, 95));
        $this->assertEquals('A-', $method->invoke($this->correctionService, 91));
        $this->assertEquals('B+', $method->invoke($this->correctionService, 88));
        $this->assertEquals('B', $method->invoke($this->correctionService, 85));
        $this->assertEquals('B-', $method->invoke($this->correctionService, 82));
        $this->assertEquals('C+', $method->invoke($this->correctionService, 78));
        $this->assertEquals('C', $method->invoke($this->correctionService, 75));
        $this->assertEquals('C-', $method->invoke($this->correctionService, 72));
        $this->assertEquals('D+', $method->invoke($this->correctionService, 68));
        $this->assertEquals('D', $method->invoke($this->correctionService, 65));
        $this->assertEquals('F', $method->invoke($this->correctionService, 50));
    }

    public function test_analyze_performance_by_type()
    {
        $user = User::factory()->create(['role' => 'student']);
        $quiz = Quiz::factory()->create();
        
        $submission = QuizSubmissions::factory()->create([
            'quiz_id' => $quiz->id,
            'student_id' => $user->id
        ]);

        // Create questions of different types
        $mcQuestion = QuizQuestions::factory()->create([
            'quiz_id' => $quiz->id,
            'type' => 'multiple_choice',
            'points' => 2
        ]);

        $saQuestion = QuizQuestions::factory()->create([
            'quiz_id' => $quiz->id,
            'type' => 'short_answer',
            'points' => 3
        ]);

        // Create answers with different performance
        SubmissionAnswers::factory()->create([
            'submission_id' => $submission->id,
            'question_id' => $mcQuestion->id,
            'is_correct' => true,
            'points_earned' => 2
        ]);

        SubmissionAnswers::factory()->create([
            'submission_id' => $submission->id,
            'question_id' => $saQuestion->id,
            'is_correct' => false,
            'points_earned' => 1
        ]);

        $reflection = new \ReflectionClass($this->correctionService);
        $method = $reflection->getMethod('analyzePerformanceByType');
        $method->setAccessible(true);

        $performance = $method->invoke($this->correctionService, $submission);

        $this->assertArrayHasKey('multiple_choice', $performance);
        $this->assertArrayHasKey('short_answer', $performance);
        
        $this->assertEquals(1, $performance['multiple_choice']['total_questions']);
        $this->assertEquals(1, $performance['multiple_choice']['correct_answers']);
        $this->assertEquals(100.0, $performance['multiple_choice']['accuracy_rate']);
        
        $this->assertEquals(1, $performance['short_answer']['total_questions']);
        $this->assertEquals(0, $performance['short_answer']['correct_answers']);
        $this->assertEquals(0.0, $performance['short_answer']['accuracy_rate']);
    }

    public function test_identify_improvement_areas()
    {
        $user = User::factory()->create(['role' => 'student']);
        $quiz = Quiz::factory()->create();
        
        $submission = QuizSubmissions::factory()->create([
            'quiz_id' => $quiz->id,
            'student_id' => $user->id
        ]);

        // Create questions where student struggled
        $question1 = QuizQuestions::factory()->create([
            'quiz_id' => $quiz->id,
            'type' => 'multiple_choice'
        ]);

        $question2 = QuizQuestions::factory()->create([
            'quiz_id' => $quiz->id,
            'type' => 'multiple_choice'
        ]);

        SubmissionAnswers::factory()->create([
            'submission_id' => $submission->id,
            'question_id' => $question1->id,
            'is_correct' => false
        ]);

        SubmissionAnswers::factory()->create([
            'submission_id' => $submission->id,
            'question_id' => $question2->id,
            'is_correct' => false
        ]);

        $reflection = new \ReflectionClass($this->correctionService);
        $method = $reflection->getMethod('identifyImprovementAreas');
        $method->setAccessible(true);

        $areas = $method->invoke($this->correctionService, $submission);

        $this->assertContains('Multiple choice questions', $areas);
    }

    public function test_identify_strengths()
    {
        $user = User::factory()->create(['role' => 'student']);
        $quiz = Quiz::factory()->create();
        
        $submission = QuizSubmissions::factory()->create([
            'quiz_id' => $quiz->id,
            'student_id' => $user->id,
            'percentage' => 85
        ]);

        // Create questions where student excelled
        $question1 = QuizQuestions::factory()->create([
            'quiz_id' => $quiz->id,
            'type' => 'short_answer'
        ]);

        $question2 = QuizQuestions::factory()->create([
            'quiz_id' => $quiz->id,
            'type' => 'short_answer'
        ]);

        SubmissionAnswers::factory()->create([
            'submission_id' => $submission->id,
            'question_id' => $question1->id,
            'is_correct' => true
        ]);

        SubmissionAnswers::factory()->create([
            'submission_id' => $submission->id,
            'question_id' => $question2->id,
            'is_correct' => true
        ]);

        $reflection = new \ReflectionClass($this->correctionService);
        $method = $reflection->getMethod('identifyStrengths');
        $method->setAccessible(true);

        $strengths = $method->invoke($this->correctionService, $submission);

        $this->assertContains('Short answer questions', $strengths);
        $this->assertContains('Strong grasp of the material', $strengths);
    }
}