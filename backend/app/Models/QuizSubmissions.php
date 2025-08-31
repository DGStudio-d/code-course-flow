<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class QuizSubmissions extends Model
{
    use HasFactory, HasUuids, SoftDeletes;

    protected $fillable = [
        'quiz_id',
        'student_id',
        'attempt_number',
        'total_score',
        'max_possible_score',
        'percentage',
        'is_passed',
        'started_at',
        'submitted_at',
        'time_taken_minutes',
    ];

    protected $casts = [
        'attempt_number' => 'integer',
        'total_score' => 'integer',
        'max_possible_score' => 'integer',
        'percentage' => 'decimal:2',
        'is_passed' => 'boolean',
        'started_at' => 'datetime',
        'submitted_at' => 'datetime',
        'time_taken_minutes' => 'integer',
    ];

    public function quiz(): BelongsTo
    {
        return $this->belongsTo(Quiz::class);
    }

    public function student(): BelongsTo
    {
        return $this->belongsTo(User::class, 'student_id');
    }

    public function answers(): HasMany
    {
        return $this->hasMany(SubmissionAnswers::class, 'submission_id');
    }

    public function corrections(): HasMany
    {
        return $this->hasMany(QuizCorrections::class, 'submission_id');
    }
}