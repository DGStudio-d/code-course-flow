<?php

namespace Tests\Unit;

use Tests\TestCase;
use App\Services\DocumentParserService;
use App\DTOs\ParsedQuizData;
use App\DTOs\ParsedQuestion;
use App\Exceptions\DocumentParsingException;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;

class DocumentParserServiceTest extends TestCase
{
    private DocumentParserService $service;

    protected function setUp(): void
    {
        parent::setUp();
        $this->service = new DocumentParserService();
    }

    public function test_identify_multiple_choice_question_type()
    {
        $block = "What is the capital of France? a) London b) Paris c) Berlin d) Madrid";
        $type = $this->service->identifyQuestionType($block);
        
        $this->assertEquals('multiple_choice', $type);
    }

    public function test_identify_true_false_question_type()
    {
        $block = "The Earth is flat. True or False?";
        $type = $this->service->identifyQuestionType($block);
        
        $this->assertEquals('true_false', $type);
    }

    public function test_identify_fill_blank_question_type()
    {
        $block = "The capital of France is _______.";
        $type = $this->service->identifyQuestionType($block);
        
        $this->assertEquals('fill_blank', $type);
    }

    public function test_identify_essay_question_type()
    {
        $block = "Explain the causes of World War II.";
        $type = $this->service->identifyQuestionType($block);
        
        $this->assertEquals('essay', $type);
    }

    public function test_extract_questions_from_content()
    {
        $content = "1. What is 2+2? a) 3 b) 4 c) 5 d) 6 Answer: b 2. The sky is blue. True or False? Answer: True";
        
        $questions = $this->service->extractQuestions($content);
        
        $this->assertCount(2, $questions);
        $this->assertEquals('multiple_choice', $questions[0]->type);
        $this->assertEquals('true_false', $questions[1]->type);
    }

    public function test_validate_document_structure_with_valid_content()
    {
        $content = "1. What is 2+2? a) 3 b) 4 c) 5 d) 6 2. What is 3+3? a) 5 b) 6 c) 7 d) 8";
        
        $validation = $this->service->validateDocumentStructure($content);
        
        $this->assertEmpty($validation['errors']);
        $this->assertEquals(2, $validation['questionCount']);
    }

    public function test_validate_document_structure_with_empty_content()
    {
        $content = "";
        
        $validation = $this->service->validateDocumentStructure($content);
        
        $this->assertContains('Document appears to be empty', $validation['errors']);
    }

    public function test_validate_document_structure_with_no_questions()
    {
        $content = "This is just some text without any questions.";
        
        $validation = $this->service->validateDocumentStructure($content);
        
        $this->assertContains('No valid questions found in document', $validation['errors']);
    }

    public function test_validate_document_structure_with_few_questions()
    {
        $content = "1. What is 2+2? a) 3 b) 4 c) 5 d) 6 2. What is 3+3? a) 5 b) 6 c) 7 d) 8";
        
        $validation = $this->service->validateDocumentStructure($content);
        
        $this->assertContains('Document contains fewer than 5 questions', $validation['warnings']);
    }

    public function test_parse_document_throws_exception_for_invalid_file()
    {
        $this->expectException(DocumentParsingException::class);
        $this->expectExceptionMessage('Unsupported file type');

        // Create a fake file with wrong mime type
        $file = UploadedFile::fake()->create('test.txt', 100, 'text/plain');
        
        $this->service->parseDocument($file);
    }

    public function test_parse_document_throws_exception_for_large_file()
    {
        $this->expectException(DocumentParsingException::class);
        $this->expectExceptionMessage('File size exceeds maximum limit');

        // Create a fake file that's too large (11MB)
        $file = UploadedFile::fake()->create('test.docx', 11 * 1024, 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
        
        $this->service->parseDocument($file);
    }

    public function test_extract_proficiency_level_from_content()
    {
        $reflection = new \ReflectionClass($this->service);
        $method = $reflection->getMethod('extractProficiencyLevel');
        $method->setAccessible(true);

        $content = "TEST A1 + CORRECTION";
        $level = $method->invoke($this->service, $content);
        
        $this->assertEquals('A1', $level);
    }

    public function test_extract_title_from_content()
    {
        $reflection = new \ReflectionClass($this->service);
        $method = $reflection->getMethod('extractTitle');
        $method->setAccessible(true);

        $content = "TEST A1 + CORRECTION\nQuestion 1: What is...";
        $title = $method->invoke($this->service, $content);
        
        $this->assertEquals('Quiz A1', $title);
    }

    public function test_calculate_points_for_different_question_types()
    {
        $reflection = new \ReflectionClass($this->service);
        $method = $reflection->getMethod('calculatePoints');
        $method->setAccessible(true);

        $this->assertEquals(2, $method->invoke($this->service, 'multiple_choice'));
        $this->assertEquals(1, $method->invoke($this->service, 'true_false'));
        $this->assertEquals(2, $method->invoke($this->service, 'fill_blank'));
        $this->assertEquals(3, $method->invoke($this->service, 'short_answer'));
        $this->assertEquals(5, $method->invoke($this->service, 'essay'));
    }

    public function test_extract_options_for_multiple_choice()
    {
        $reflection = new \ReflectionClass($this->service);
        $method = $reflection->getMethod('extractOptions');
        $method->setAccessible(true);

        $block = "What is 2+2? a) Three b) Four c) Five d) Six";
        $options = $method->invoke($this->service, $block, 'multiple_choice');
        
        $this->assertEquals(['Three', 'Four', 'Five', 'Six'], $options);
    }

    public function test_extract_options_for_true_false()
    {
        $reflection = new \ReflectionClass($this->service);
        $method = $reflection->getMethod('extractOptions');
        $method->setAccessible(true);

        $block = "The sky is blue. True or False?";
        $options = $method->invoke($this->service, $block, 'true_false');
        
        $this->assertEquals(['True', 'False'], $options);
    }

    public function test_extract_correct_answer_from_block()
    {
        $reflection = new \ReflectionClass($this->service);
        $method = $reflection->getMethod('extractCorrectAnswer');
        $method->setAccessible(true);

        $block = "What is 2+2? a) Three b) Four c) Five d) Six Answer: b";
        $options = ['Three', 'Four', 'Five', 'Six'];
        $answer = $method->invoke($this->service, $block, 'multiple_choice', $options);
        
        $this->assertEquals('Four', $answer);
    }

    public function test_extract_explanation_from_block()
    {
        $reflection = new \ReflectionClass($this->service);
        $method = $reflection->getMethod('extractExplanation');
        $method->setAccessible(true);

        $block = "What is 2+2? Answer: 4 Explanation: Basic arithmetic";
        $explanation = $method->invoke($this->service, $block);
        
        $this->assertEquals('Basic arithmetic', $explanation);
    }
}