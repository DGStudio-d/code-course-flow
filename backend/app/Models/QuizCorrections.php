<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class QuizCorrections extends Model
{
    use HasFactory, HasUuids;

    protected $fillable = [
        'submission_id',
        'question_id',
        'correction_text',
        'explanation',
        'improvement_suggestions',
    ];

    protected $casts = [
        'improvement_suggestions' => 'array',
    ];

    public function submission(): BelongsTo
    {
        return $this->belongsTo(QuizSubmissions::class, 'submission_id');
    }

    public function question(): BelongsTo
    {
        return $this->belongsTo(QuizQuestions::class, 'question_id');
    }
}