<?php

namespace App\DTOs;

class CorrectionData
{
    public function __construct(
        public string $correctionText,
        public ?string $explanation = null,
        public array $improvementSuggestions = [],
        public array $relatedConcepts = [],
        public ?string $correctAnswerExplanation = null
    ) {}

    public function toArray(): array
    {
        return [
            'correction_text' => $this->correctionText,
            'explanation' => $this->explanation,
            'improvement_suggestions' => $this->improvementSuggestions,
            'related_concepts' => $this->relatedConcepts,
            'correct_answer_explanation' => $this->correctAnswerExplanation
        ];
    }
}