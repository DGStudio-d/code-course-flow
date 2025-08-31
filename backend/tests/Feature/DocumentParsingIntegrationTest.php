<?php

namespace Tests\Feature;

use Tests\TestCase;
use App\Services\DocumentParserService;
use Illuminate\Foundation\Testing\RefreshDatabase;

class DocumentParsingIntegrationTest extends TestCase
{
    use RefreshDatabase;

    private DocumentParserService $service;

    protected function setUp(): void
    {
        parent::setUp();
        $this->service = new DocumentParserService();
    }

    public function test_parse_complete_quiz_content()
    {
        $content = "TEST A1 + CORRECTION

1. What is the capital of France?
a) London
b) Paris
c) Berlin
d) Madrid
Answer: b
Explanation: Paris is the capital and largest city of France.

2. The Earth is round.
True or False?
Answer: True
Explanation: The Earth is approximately spherical in shape.

3. Complete the sentence: The sun rises in the _____.
Answer: east
Explanation: The sun appears to rise in the eastern direction due to Earth's rotation.

4. Explain the water cycle.
Answer: The water cycle involves evaporation, condensation, and precipitation.
Explanation: This is a continuous process of water movement on Earth.";

        $questions = $this->service->extractQuestions($content);

        $this->assertCount(4, $questions);

        // Test multiple choice question
        $this->assertEquals('multiple_choice', $questions[0]->type);
        $this->assertEquals('What is the capital of France?', $questions[0]->text);
        $this->assertEquals(['London', 'Paris', 'Berlin', 'Madrid'], $questions[0]->options);
        $this->assertEquals('Paris', $questions[0]->correctAnswer);
        $this->assertEquals('Paris is the capital and largest city of France.', $questions[0]->explanation);

        // Test true/false question
        $this->assertEquals('true_false', $questions[1]->type);
        $this->assertEquals('The Earth is round.', $questions[1]->text);
        $this->assertEquals(['True', 'False'], $questions[1]->options);

        // Test fill-in-the-blank question
        $this->assertEquals('fill_blank', $questions[2]->type);
        $this->assertStringContains('sun rises in the', $questions[2]->text);
        $this->assertEquals('east', $questions[2]->correctAnswer);

        // Test essay question
        $this->assertEquals('essay', $questions[3]->type);
        $this->assertStringContains('Explain the water cycle', $questions[3]->text);
    }

    public function test_validate_quiz_structure()
    {
        $validContent = "TEST B1
1. Question one? a) Option 1 b) Option 2 c) Option 3 d) Option 4
2. Question two? a) Option 1 b) Option 2 c) Option 3 d) Option 4
3. Question three? a) Option 1 b) Option 2 c) Option 3 d) Option 4
4. Question four? a) Option 1 b) Option 2 c) Option 3 d) Option 4
5. Question five? a) Option 1 b) Option 2 c) Option 3 d) Option 4";

        $validation = $this->service->validateDocumentStructure($validContent);

        $this->assertEmpty($validation['errors']);
        $this->assertEquals(5, $validation['questionCount']);
    }

    public function test_extract_proficiency_levels()
    {
        $testCases = [
            'TEST A1 + CORRECTION' => 'A1',
            'Quiz B2 Advanced' => 'B2',
            'EXAM C1 Level' => 'C1',
            'No level here' => null,
        ];

        $reflection = new \ReflectionClass($this->service);
        $method = $reflection->getMethod('extractProficiencyLevel');
        $method->setAccessible(true);

        foreach ($testCases as $content => $expectedLevel) {
            $level = $method->invoke($this->service, $content);
            $this->assertEquals($expectedLevel, $level, "Failed for content: $content");
        }
    }

    public function test_extract_quiz_titles()
    {
        $testCases = [
            'TEST A1 + CORRECTION' => 'Quiz A1',
            'QUIZ B2 Advanced' => 'Quiz B2',
            'My Custom Quiz Title' => 'My Custom Quiz Title',
            '' => 'Imported Quiz',
        ];

        $reflection = new \ReflectionClass($this->service);
        $method = $reflection->getMethod('extractTitle');
        $method->setAccessible(true);

        foreach ($testCases as $content => $expectedTitle) {
            $title = $method->invoke($this->service, $content);
            $this->assertEquals($expectedTitle, $title, "Failed for content: $content");
        }
    }

    public function test_question_type_identification_accuracy()
    {
        $testCases = [
            'What is 2+2? a) 3 b) 4 c) 5 d) 6' => 'multiple_choice',
            'The sky is blue. True or False?' => 'true_false',
            'Fill in the blank: Paris is the _____ of France.' => 'fill_blank',
            'Explain the theory of relativity.' => 'essay',
            'What is your name?' => 'short_answer',
        ];

        foreach ($testCases as $question => $expectedType) {
            $type = $this->service->identifyQuestionType($question);
            $this->assertEquals($expectedType, $type, "Failed for question: $question");
        }
    }
}