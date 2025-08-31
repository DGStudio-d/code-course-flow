<?php

namespace App\Services;

use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Log;
use App\DTOs\ParsedQuizData;
use App\DTOs\ParsedQuestion;
use App\DTOs\DocumentMetadata;
use App\Exceptions\DocumentParsingException;

class DocumentParserService
{
    private const SUPPORTED_MIME_TYPES = [
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'application/msword'
    ];

    private const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

    /**
     * Parse a Word document and extract quiz content
     */
    public function parseDocument(UploadedFile $file): ParsedQuizData
    {
        $this->validateFile($file);
        
        $content = $this->extractTextFromDocument($file);
        $metadata = $this->extractMetadata($file, $content);
        $questions = $this->extractQuestions($content);
        
        return new ParsedQuizData(
            title: $this->extractTitle($content),
            level: $this->extractProficiencyLevel($content),
            questions: $questions,
            metadata: $metadata
        );
    }

    /**
     * Validate uploaded file
     */
    private function validateFile(UploadedFile $file): void
    {
        if (!$file->isValid()) {
            throw new DocumentParsingException('Invalid file upload');
        }

        if ($file->getSize() > self::MAX_FILE_SIZE) {
            throw new DocumentParsingException('File size exceeds maximum limit of 10MB');
        }

        if (!in_array($file->getMimeType(), self::SUPPORTED_MIME_TYPES)) {
            throw new DocumentParsingException('Unsupported file type. Please upload a Word document (.docx or .doc)');
        }
    }

    /**
     * Extract text content from Word document
     */
    private function extractTextFromDocument(UploadedFile $file): string
    {
        try {
            // For .docx files, we can extract text using ZipArchive
            if ($file->getClientOriginalExtension() === 'docx') {
                return $this->extractFromDocx($file);
            }
            
            // For .doc files, we would need a different approach
            // For now, we'll throw an exception for .doc files
            throw new DocumentParsingException('Legacy .doc format not supported. Please convert to .docx format');
            
        } catch (\Exception $e) {
            Log::error('Document text extraction failed', [
                'file' => $file->getClientOriginalName(),
                'error' => $e->getMessage()
            ]);
            throw new DocumentParsingException('Failed to extract text from document: ' . $e->getMessage());
        }
    }

    /**
     * Extract text from .docx file
     */
    private function extractFromDocx(UploadedFile $file): string
    {
        $zip = new \ZipArchive();
        $tempPath = $file->getPathname();
        
        if ($zip->open($tempPath) !== true) {
            throw new DocumentParsingException('Unable to open document file');
        }

        $content = $zip->getFromName('word/document.xml');
        $zip->close();

        if ($content === false) {
            throw new DocumentParsingException('Unable to extract document content');
        }

        // Parse XML and extract text
        $xml = simplexml_load_string($content);
        if ($xml === false) {
            throw new DocumentParsingException('Invalid document XML structure');
        }

        // Register namespaces
        $xml->registerXPathNamespace('w', 'http://schemas.openxmlformats.org/wordprocessingml/2006/main');
        
        // Extract all text nodes
        $textNodes = $xml->xpath('//w:t');
        $text = '';
        
        foreach ($textNodes as $node) {
            $text .= (string)$node . ' ';
        }

        return trim($text);
    }

    /**
     * Extract quiz title from document content
     */
    private function extractTitle(string $content): string
    {
        // Look for patterns like "TEST A1", "Quiz B2", etc.
        if (preg_match('/(?:TEST|QUIZ|EXAM)\s+([A-C][12])/i', $content, $matches)) {
            return 'Quiz ' . strtoupper($matches[1]);
        }

        // Look for first line that might be a title
        $lines = explode("\n", $content);
        $firstLine = trim($lines[0] ?? '');
        
        if (!empty($firstLine) && strlen($firstLine) < 100) {
            return $firstLine;
        }

        return 'Imported Quiz';
    }

    /**
     * Extract proficiency level from document content
     */
    private function extractProficiencyLevel(string $content): ?string
    {
        // Look for level indicators like A1, A2, B1, B2, C1, C2
        if (preg_match('/\b([A-C][12])\b/', $content, $matches)) {
            return strtoupper($matches[1]);
        }

        return null;
    }

    /**
     * Extract questions from document content
     */
    public function extractQuestions(string $content): array
    {
        $questions = [];
        
        // Split content into potential question blocks
        $blocks = $this->splitIntoQuestionBlocks($content);
        
        foreach ($blocks as $block) {
            $question = $this->parseQuestionBlock($block);
            if ($question) {
                $questions[] = $question;
            }
        }

        return $questions;
    }

    /**
     * Split content into question blocks
     */
    private function splitIntoQuestionBlocks(string $content): array
    {
        // Remove extra whitespace and normalize line endings
        $content = preg_replace('/\s+/', ' ', $content);
        $content = str_replace(["\r\n", "\r"], "\n", $content);
        
        // Split by question numbers (1., 2., etc.) or letters (A., B., etc.)
        $pattern = '/(?=\b(?:\d+\.|[A-Z]\.))/';
        $blocks = preg_split($pattern, $content, -1, PREG_SPLIT_NO_EMPTY);
        
        return array_map('trim', $blocks);
    }

    /**
     * Parse individual question block
     */
    private function parseQuestionBlock(string $block): ?ParsedQuestion
    {
        if (empty(trim($block))) {
            return null;
        }

        $type = $this->identifyQuestionType($block);
        $text = $this->extractQuestionText($block);
        $options = $this->extractOptions($block, $type);
        $correctAnswer = $this->extractCorrectAnswer($block, $type, $options);
        $explanation = $this->extractExplanation($block);

        if (empty($text)) {
            return null;
        }

        return new ParsedQuestion(
            text: $text,
            type: $type,
            options: $options,
            correctAnswer: $correctAnswer,
            explanation: $explanation,
            points: $this->calculatePoints($type)
        );
    }

    /**
     * Identify question type based on content
     */
    public function identifyQuestionType(string $block): string
    {
        $block = strtolower($block);

        // Check for multiple choice indicators
        if (preg_match('/[a-d]\)|\([a-d]\)|[a-d]\./', $block)) {
            return 'multiple_choice';
        }

        // Check for true/false indicators
        if (preg_match('/\b(true|false|correct|incorrect)\b/', $block)) {
            return 'true_false';
        }

        // Check for fill-in-the-blank indicators
        if (preg_match('/_{3,}|\[.*?\]|\(.*?\)/', $block)) {
            return 'fill_blank';
        }

        // Check for essay/short answer indicators
        if (preg_match('/\b(explain|describe|discuss|write|essay)\b/', $block)) {
            return 'essay';
        }

        // Default to short answer
        return 'short_answer';
    }

    /**
     * Extract question text from block
     */
    private function extractQuestionText(string $block): string
    {
        // Remove question number/letter at the beginning
        $text = preg_replace('/^\s*(?:\d+\.|[A-Z]\.)\s*/', '', $block);
        
        // Extract text before options (if any)
        if (preg_match('/^(.*?)(?:[a-d]\)|[a-d]\.)/is', $text, $matches)) {
            return trim($matches[1]);
        }

        // If no options found, take the whole text (but limit length for question text)
        $lines = explode("\n", $text);
        $questionLines = [];
        
        foreach ($lines as $line) {
            $line = trim($line);
            if (empty($line)) continue;
            
            // Stop at correction indicators
            if (preg_match('/^(answer|correction|explanation):/i', $line)) {
                break;
            }
            
            $questionLines[] = $line;
        }

        return trim(implode(' ', $questionLines));
    }

    /**
     * Extract options from question block
     */
    private function extractOptions(string $block, string $type): array
    {
        if (!in_array($type, ['multiple_choice', 'true_false'])) {
            return [];
        }

        $options = [];
        
        if ($type === 'true_false') {
            return ['True', 'False'];
        }

        // Extract multiple choice options
        if (preg_match_all('/([a-d])\)\s*([^a-d\)]+?)(?=[a-d]\)|$)/is', $block, $matches, PREG_SET_ORDER)) {
            foreach ($matches as $match) {
                $options[] = trim($match[2]);
            }
        }

        return $options;
    }

    /**
     * Extract correct answer from block
     */
    private function extractCorrectAnswer(string $block, string $type, array $options): string|array
    {
        // Look for correction indicators
        if (preg_match('/(?:answer|correction|correct):\s*([^\n]+)/i', $block, $matches)) {
            $answer = trim($matches[1]);
            
            if ($type === 'multiple_choice' && preg_match('/^[a-d]$/i', $answer)) {
                $index = ord(strtolower($answer)) - ord('a');
                return $options[$index] ?? $answer;
            }
            
            return $answer;
        }

        // For true/false, try to infer from context
        if ($type === 'true_false') {
            if (preg_match('/\b(true|correct)\b/i', $block)) {
                return 'True';
            }
            return 'False';
        }

        return '';
    }

    /**
     * Extract explanation from block
     */
    private function extractExplanation(string $block): ?string
    {
        if (preg_match('/(?:explanation|because|reason):\s*([^\n]+)/i', $block, $matches)) {
            return trim($matches[1]);
        }

        return null;
    }

    /**
     * Calculate points based on question type
     */
    private function calculatePoints(string $type): int
    {
        return match($type) {
            'multiple_choice' => 2,
            'true_false' => 1,
            'fill_blank' => 2,
            'short_answer' => 3,
            'essay' => 5,
            default => 1
        };
    }

    /**
     * Extract document metadata
     */
    private function extractMetadata(UploadedFile $file, string $content): DocumentMetadata
    {
        return new DocumentMetadata(
            originalName: $file->getClientOriginalName(),
            size: $file->getSize(),
            mimeType: $file->getMimeType(),
            wordCount: str_word_count($content),
            extractedAt: now()
        );
    }

    /**
     * Validate document structure
     */
    public function validateDocumentStructure(string $content): array
    {
        $errors = [];
        $warnings = [];

        if (empty(trim($content))) {
            $errors[] = 'Document appears to be empty';
            return ['errors' => $errors, 'warnings' => $warnings];
        }

        $questions = $this->extractQuestions($content);
        
        if (empty($questions)) {
            $errors[] = 'No valid questions found in document';
        }

        if (count($questions) < 5) {
            $warnings[] = 'Document contains fewer than 5 questions';
        }

        foreach ($questions as $index => $question) {
            if (empty($question->text)) {
                $errors[] = "Question " . ($index + 1) . " has no text";
            }
            
            if ($question->type === 'multiple_choice' && count($question->options) < 2) {
                $errors[] = "Question " . ($index + 1) . " has insufficient options for multiple choice";
            }
        }

        return [
            'errors' => $errors,
            'warnings' => $warnings,
            'questionCount' => count($questions)
        ];
    }
}