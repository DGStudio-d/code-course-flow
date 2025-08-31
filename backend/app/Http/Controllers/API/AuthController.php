<?php

namespace App\Http\Controllers\API;

use App\Events\UserRegistered;
use App\Http\Controllers\Controller;
use App\Mail\NewUserRegistered;
use App\Models\User;
use App\Models\Student;
use App\Models\Teacher;
use App\Http\Resources\UserResource;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\ValidationException;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class AuthController extends Controller
{
    public function test_email(){
        $user=User::all()->first();
        try {
            Mail::send(new NewUserRegistered($user));
        } catch (\Exception $e) {
            Log::error('Failed to send admin notification: ' . $e->getMessage());
        }
        return response()->json(["message"=>"send successfully"],200);
    }
    public function register(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'fullName' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users',
            'phone' => 'required|string|max:20',
            'age' => 'required|integer|min:10|max:100',
            'level' => 'required|in:beginner,intermediate,advanced',
            'language' => 'required|string',
            'classType' => 'required|in:individual,group,online',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        DB::beginTransaction();

        try {
            // Generate a temporary password
            $tempPassword = 'temp' . rand(1000, 9999);

            $user = User::create([
                'name' => $request->fullName,
                'email' => $request->email,
                'password' => Hash::make($tempPassword),
                'role' => 'student',
                'is_active' => false, // Inactive until admin approval
            ]);

            // Generate unique student ID
            $studentId = 'STU' . str_pad($user->id, 6, '0', STR_PAD_LEFT);

            // Create student profile
            Student::create([
                'user_id' => $user->id,
                'student_id' => $studentId,
                'phone' => $request->phone,
                'level' => $request->level,
                'skills' => [$request->language],
                'bio' => "Interested in learning {$request->language} - {$request->classType} classes",
                'learning_goals' => "Learn {$request->language} through {$request->classType} classes",
                'preferred_schedule' => [
                    'class_type' => $request->classType,
                    'language' => $request->language,
                    'level' => $request->level
                ]
            ]);
            Mail::send(new NewUserRegistered($user));


            DB::commit();

            return response()->json([
                'message' => 'Registration successful. Your application is pending approval. You will be contacted soon with your login credentials.',
                'data' => [
                    'user' => new UserResource($user->load('student')),
                    'temp_password' => $tempPassword,
                    'status' => 'pending_approval'
                ]
            ], 201);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'message' => 'Registration failed. Please try again.',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function login(Request $request): JsonResponse
    {
        $request->validate([
            'email' => 'required|email',
            'password' => 'required',
        ]);

        $user = User::where('email', $request->email)->first();

        if (!$user || !Hash::check($request->password, $user->password)) {
            throw ValidationException::withMessages([
                'email' => ['The provided credentials are incorrect.'],
            ]);
        }

        if (!$user->is_active) {
            return response()->json([
                'message' => 'Account is inactive or pending approval. Please contact administrator.'
            ], 403);
        }

        $token = $user->createToken('auth_token')->plainTextToken;
        if($user->role=='student'||$user->role=='teacher')$user->load($user->role);

        return response()->json([
            'message' => 'Login successful',
            'data' => [
                'user' => new UserResource($user),
                'token' => $token,
            ]
        ]);
    }

    public function adminLogin(Request $request): JsonResponse
    {
        $request->validate([
            'email' => 'required|email',
            'password' => 'required',
        ]);

        $user = User::where('email', $request->email)->where('role', 'admin')->first();

        if (!$user || !Hash::check($request->password, $user->password)) {
            return response()->json([
                'message' => 'Invalid admin credentials'
            ], 401);
        }

        $token = $user->createToken('admin_token')->plainTextToken;

        return response()->json([
            'message' => 'Admin login successful',
            'data' => [
                'user' => new UserResource($user),
                'token' => $token,
            ]
        ]);
    }

    public function logout(Request $request): JsonResponse
    {
        $request->user()->currentAccessToken()->delete();

        return response()->json([
            'message' => 'Logged out successfully'
        ]);
    }

    public function user(Request $request): JsonResponse
    {
        return response()->json([
            'data' => new UserResource($request->user()->load($request->user()->role))
        ]);
    }

    public function updateProfile(Request $request): JsonResponse
    {
        $user = $request->user();
        
        $request->validate([
            'name' => 'sometimes|string|max:255',
            'email' => 'sometimes|email|unique:users,email,' . $user->id,
            'avatar' => 'sometimes|string|max:255',
            'bio' => 'sometimes|string|max:1000',
            'phone' => 'sometimes|string|max:20',
        ]);

        $user->update($request->only(['name', 'email', 'avatar']));

        // Update role-specific profile
        if ($user->is_student && $user->student) {
            $user->student->update($request->only(['bio', 'phone']));
        } elseif ($user->is_teacher && $user->teacher) {
            $user->teacher->update($request->only(['bio', 'phone']));
        }

        return response()->json([
            'message' => 'Profile updated successfully',
            'data' => new UserResource($user->fresh()->load($user->role))
        ]);
    }

    public function approveStudent(Request $request, User $user): JsonResponse
    {
        if ($user->role !== 'student') {
            return response()->json(['message' => 'User is not a student'], 400);
        }

        $user->update(['is_active' => true]);

        return response()->json([
            'message' => 'Student approved successfully',
            'data' => new UserResource($user->load('student'))
        ]);
    }

    public function rejectStudent(Request $request, User $user): JsonResponse
    {
        if ($user->role !== 'student') {
            return response()->json(['message' => 'User is not a student'], 400);
        }

        $request->validate([
            'reason' => 'required|string|max:500'
        ]);

        // You might want to store the rejection reason
        $user->delete(); // Or soft delete

        return response()->json([
            'message' => 'Student application rejected'
        ]);
    }
}