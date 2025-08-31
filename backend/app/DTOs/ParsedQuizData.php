<?php

namespace App\DTOs;

class ParsedQuizData
{
    public function __construct(
        public string $title,
        public ?string $level,
        public array $questions,
        public DocumentMetadata $metadata
    ) {}

    public function toArray(): array
    {
        return [
            'title' => $this->title,
            'level' => $this->level,
            'questions' => array_map(fn($q) => $q->toArray(), $this->questions),
            'metadata' => $this->metadata->toArray()
        ];
    }
}