<?php

namespace App\DTOs;

class EvaluationResult
{
    public function __construct(
        public bool $isCorrect,
        public int $pointsEarned,
        public int $maxPoints,
        public float $accuracy = 0.0,
        public array $details = []
    ) {}

    public function toArray(): array
    {
        return [
            'is_correct' => $this->isCorrect,
            'points_earned' => $this->pointsEarned,
            'max_points' => $this->maxPoints,
            'accuracy' => $this->accuracy,
            'details' => $this->details
        ];
    }
}