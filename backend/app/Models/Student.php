<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Student extends Model
{
    use HasFactory, HasUuids, SoftDeletes;

    protected $fillable = [
        'user_id',
        'student_id',
        'date_of_birth',
        'phone',
        'bio',
        'skills',
        'level',
        'learning_goals',
        'preferred_schedule',
    ];

    protected $casts = [
        'date_of_birth' => 'date',
        'skills' => 'array',
        'preferred_schedule' => 'array',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}