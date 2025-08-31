<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('quiz_corrections', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('submission_id')->constrained('quiz_submissions')->onDelete('cascade');
            $table->foreignUuid('question_id')->constrained('quiz_questions')->onDelete('cascade');
            $table->text('correction_text')->nullable();
            $table->text('explanation')->nullable();
            $table->json('improvement_suggestions')->nullable();
            $table->timestamps();
            
            $table->index(['submission_id', 'question_id']);
            $table->unique(['submission_id', 'question_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('quiz_corrections');
    }
};