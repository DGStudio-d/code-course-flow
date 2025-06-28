<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\API\AuthController;
use App\Http\Controllers\API\ProgramsController;
use App\Http\Controllers\API\QuizController;
use App\Http\Controllers\API\QuizQuestionsController;
use App\Http\Controllers\API\LanguagesController;
use App\Http\Controllers\API\LiveSessionsController;
use App\Http\Controllers\API\MediaController;
use App\Http\Controllers\API\DashboardController;
use App\Http\Controllers\API\EnrollmentController;
use App\Http\Controllers\API\UserController;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
*/

// Public routes
Route::prefix('v1')->group(function () {
    Route::get('test',[AuthController::class,'test_email']);
    // Authentication routes
    Route::prefix('auth')->group(function () {
        Route::post('register', [AuthController::class, 'register']);
        Route::post('login', [AuthController::class, 'login']);
        Route::post('admin-login', [AuthController::class, 'adminLogin']);
    });
    
    // Public resource routes
    Route::apiResource('programs', ProgramsController::class)->only(['index', 'show']);
    Route::apiResource('languages', LanguagesController::class)->only(['index', 'show']);
    Route::apiResource('users', UserController::class)->only(['index', 'show']);
    Route::get('live-sessions', [LiveSessionsController::class, 'index']);
    Route::get('live-sessions/{id}', [LiveSessionsController::class, 'show']);
    Route::prefix('media')->group(function () {
        Route::get('/', [MediaController::class, 'index']);
        Route::post('upload', [MediaController::class, 'upload']);
        Route::get('{id}', [MediaController::class, 'show']);
        Route::delete('{id}', [MediaController::class, 'destroy']);
    });
    Route::get('/storage/images/teachers/{filename}', function ($filename) {
        $path = storage_path('app/public/images/teachers/' . $filename);
        if (!file_exists($path)) {
            abort(404, 'Image not found');
        }
        return response()->file($path);
    })->where('filename', '.*');
});

// Protected routes
Route::prefix('v1')->middleware('auth:sanctum')->group(function () {
    // Authentication
    Route::prefix('auth')->group(function () {
        Route::post('logout', [AuthController::class, 'logout']);
        Route::get('user', [AuthController::class, 'user']);
        Route::put('profile', [AuthController::class, 'updateProfile']);
    });
    
    // Dashboard routes
    Route::prefix('dashboard')->group(function () {
        Route::get('student', [DashboardController::class, 'studentDashboard'])->middleware('role:student');
        Route::get('teacher', [DashboardController::class, 'teacherDashboard'])->middleware('role:teacher');
        Route::get('admin', [DashboardController::class, 'adminDashboard'])->middleware('role:admin');
    });
    
    // Media management
    
    // Student routes
    Route::middleware('role:student')->group(function () {
        // Enrollments
        Route::prefix('enrollments')->group(function () {
            Route::get('/', [EnrollmentController::class, 'index']);
            Route::post('programs/{program}', [EnrollmentController::class, 'store']);
            Route::get('{enrollment}', [EnrollmentController::class, 'show']);
            Route::put('{enrollment}', [EnrollmentController::class, 'update']);
        });
        
        // Quiz routes for students
        Route::prefix('quizzes')->group(function () {
            Route::get('{quiz}', [QuizController::class, 'show']);
            Route::post('{quiz}/start', [QuizController::class, 'start']);
            Route::post('{quiz}/submit', [QuizController::class, 'submit']);
            Route::get('submissions/{submission}/results', [QuizController::class, 'results']);
        });
        
        // Live sessions
        Route::post('live-sessions/{session}/join', [LiveSessionsController::class, 'join']);
    });
    
    // Teacher routes
    Route::middleware(['role:teacher','role:admin'])->prefix('teacher')->group(function () {
        Route::apiResource('programs', ProgramsController::class)->except(['index', 'show']);
        Route::apiResource('live-sessions', LiveSessionsController::class)->except(['index', 'show']);
        Route::apiResource('quizzes', QuizController::class)->except(['show']);
        
        // Quiz questions management
        Route::prefix('quizzes/{quiz}')->group(function () {
            Route::get('questions', [QuizQuestionsController::class, 'index']);
            Route::post('questions', [QuizQuestionsController::class, 'store']);
            Route::get('questions/{question}', [QuizQuestionsController::class, 'show']);
            Route::put('questions/{question}', [QuizQuestionsController::class, 'update']);
            Route::delete('questions/{question}', [QuizQuestionsController::class, 'destroy']);
        });
        
        Route::get('students', [UserController::class, 'teacherStudents']);
        Route::get('enrollments', [EnrollmentController::class, 'teacherEnrollments']);
        Route::get('analytics', [DashboardController::class, 'teacherAnalytics']);
    });
    
    // Admin routes
    Route::middleware('role:admin')->prefix('admin')->group(function () {
        Route::apiResource('users', UserController::class);
        Route::apiResource('programs', ProgramsController::class);
        Route::apiResource('languages', LanguagesController::class);
        Route::apiResource('enrollments', EnrollmentController::class);
        Route::apiResource('quizzes', QuizController::class);
        
        // Quiz questions management for admin
        Route::prefix('quizzes/{quiz}')->group(function () {
            Route::get('questions', [QuizQuestionsController::class, 'index']);
            Route::post('questions', [QuizQuestionsController::class, 'store']);
            Route::get('questions/{question}', [QuizQuestionsController::class, 'show']);
            Route::put('questions/{question}', [QuizQuestionsController::class, 'update']);
            Route::delete('questions/{question}', [QuizQuestionsController::class, 'destroy']);
        });
        
        // Student approval/rejection
        Route::post('students/{user}/approve', [AuthController::class, 'approveStudent']);
        Route::post('students/{user}/reject', [AuthController::class, 'rejectStudent']);
        
        // Pending students
        Route::get('students/pending', function () {
            $pendingStudents = \App\Models\User::with('student')
                ->where('role', 'student')
                ->where('is_active', false)
                ->latest()
                ->get();
            
            return response()->json([
                'data' => \App\Http\Resources\UserResource::collection($pendingStudents)
            ]);
        });
        
        Route::get('stats', [DashboardController::class, 'adminStats']);
        Route::get('analytics', [DashboardController::class, 'adminAnalytics']);
        
        // Payment verification
        Route::prefix('payments')->group(function () {
            Route::get('pending', [EnrollmentController::class, 'pendingPayments']);
            Route::post('{enrollment}/verify', [EnrollmentController::class, 'verifyPayment']);
            Route::post('{enrollment}/reject', [EnrollmentController::class, 'rejectPayment']);
        });
    });
});

// Fallback route for API
Route::fallback(function () {
    return response()->json([
        'message' => 'API endpoint not found',
        'status' => 404
    ], 404);
});