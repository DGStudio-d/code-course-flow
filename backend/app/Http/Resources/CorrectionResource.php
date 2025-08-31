<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class CorrectionResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'submission_id' => $this->submission_id,
            'question_id' => $this->question_id,
            'correction_text' => $this->correction_text,
            'explanation' => $this->explanation,
            'improvement_suggestions' => $this->improvement_suggestions,
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
            
            // Include related data when loaded
            'question' => new QuestionResource($this->whenLoaded('question')),
            'submission' => new QuizSubmissionResource($this->whenLoaded('submission')),
        ];
    }
}