<?php

namespace App\DTOs;

class ParsedQuestion
{
    public function __construct(
        public string $text,
        public string $type,
        public array $options,
        public string|array $correctAnswer,
        public ?string $explanation,
        public int $points
    ) {}

    public function toArray(): array
    {
        return [
            'text' => $this->text,
            'type' => $this->type,
            'options' => $this->options,
            'correct_answer' => $this->correctAnswer,
            'explanation' => $this->explanation,
            'points' => $this->points
        ];
    }
}