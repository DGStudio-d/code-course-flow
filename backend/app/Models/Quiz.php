<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Quiz extends Model
{
    use HasFactory, HasUuids, SoftDeletes;

    protected $fillable = [
        'title',
        'description',
        'proficiency_level',
        'correction_mode',
        'source_document_path',
        'program_id',
        'teacher_id',
        'total_questions',
        'time_limit_minutes',
        'passing_score',
        'shuffle_questions',
        'show_results_immediately',
        'max_attempts',
        'available_from',
        'available_until',
        'is_active',
    ];

    protected $casts = [
        'total_questions' => 'integer',
        'time_limit_minutes' => 'integer',
        'passing_score' => 'integer',
        'shuffle_questions' => 'boolean',
        'show_results_immediately' => 'boolean',
        'max_attempts' => 'integer',
        'available_from' => 'datetime',
        'available_until' => 'datetime',
        'is_active' => 'boolean',
        'improvement_suggestions' => 'array',
    ];

    public function program(): BelongsTo
    {
        return $this->belongsTo(Programs::class);
    }

    public function teacher(): BelongsTo
    {
        return $this->belongsTo(User::class, 'teacher_id');
    }

    public function questions(): HasMany
    {
        return $this->hasMany(QuizQuestions::class);
    }

    public function submissions(): HasMany
    {
        return $this->hasMany(QuizSubmissions::class);
    }

    public function corrections(): HasMany
    {
        return $this->hasMany(QuizCorrections::class);
    }

    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    public function scopeByLevel($query, $level)
    {
        return $query->where('proficiency_level', $level);
    }
}
