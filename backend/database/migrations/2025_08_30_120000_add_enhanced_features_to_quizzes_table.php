<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('quizzes', function (Blueprint $table) {
            $table->enum('proficiency_level', ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'])->nullable()->after('description');
            $table->enum('correction_mode', ['immediate', 'end_of_quiz', 'manual'])->default('end_of_quiz')->after('proficiency_level');
            $table->string('source_document_path')->nullable()->after('correction_mode');
            
            $table->index(['proficiency_level', 'is_active']);
        });
    }

    public function down(): void
    {
        Schema::table('quizzes', function (Blueprint $table) {
            $table->dropIndex(['proficiency_level', 'is_active']);
            $table->dropColumn(['proficiency_level', 'correction_mode', 'source_document_path']);
        });
    }
};