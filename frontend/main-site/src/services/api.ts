import axios from '@/lib/axios';
import { Language, Professor } from "@/types";

// Types
export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  avatar?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  student?: any;
  teacher?: any;
}

export interface ApiResponse<T> {
  data: T;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
  };
}

// Auth APIs
export const registerUser = async (userData: any): Promise<ApiResponse<any>> => {
  const response = await axios.post('/auth/register', userData);
  return response.data;
};

export const loginUser = async (credentials: { email: string; password: string }): Promise<ApiResponse<{ user: User; token: string }>> => {
  const response = await axios.post('/auth/login', credentials);
  return response.data;
};

export const adminLogin = async (credentials: { email: string; password: string }): Promise<ApiResponse<{ user: User; token: string }>> => {
  const response = await axios.post('/auth/admin-login', credentials);
  return response.data;
};

export const logoutUser = async (): Promise<ApiResponse<any>> => {
  const response = await axios.post('/auth/logout');
  return response.data;
};

export const getCurrentUser = async (): Promise<ApiResponse<User>> => {
  const response = await axios.get('/auth/user');
  return response.data;
};

export const updateProfile = async (profileData: any): Promise<ApiResponse<User>> => {
  const response = await axios.put('/auth/profile', profileData);
  return response.data;
};

// Language APIs
export const fetchLanguages = async (): Promise<Language[]> => {
  const response = await axios.get('/languages');
  return response.data.data;
};

export const fetchLanguageById = async (id: string): Promise<Language> => {
  const response = await axios.get(`/admin/languages/${id}`);
  return response.data.data;
};

export const createLanguage = async (languageData: any): Promise<ApiResponse<Language>> => {
  const response = await axios.post('/admin/languages', languageData);
  return response.data;
};

export const updateLanguage = async (id: string, languageData: any): Promise<ApiResponse<Language>> => {
  const response = await axios.put(`/admin/languages/${id}`, languageData);
  return response.data;
};

export const deleteLanguage = async (id: string): Promise<ApiResponse<any>> => {
  const response = await axios.delete(`/admin/languages/${id}`);
  return response.data;
};

// Program APIs
export const fetchPrograms = async (params?: any): Promise<PaginatedResponse<any>> => {
  const response = await axios.get('/programs', { params });
  return response.data;
};

export const fetchProgramById = async (id: string): Promise<ApiResponse<any>> => {
  const response = await axios.get(`/programs/${id}`);
  return response.data;
};

export const createProgram = async (programData: any): Promise<ApiResponse<any>> => {
  const response = await axios.post('/admin/programs', programData);
  return response.data;
};

export const updateProgram = async (id: string, programData: any): Promise<ApiResponse<any>> => {
  const response = await axios.put(`/admin/programs/${id}`, programData);
  return response.data;
};

export const deleteProgram = async (id: string): Promise<ApiResponse<any>> => {
  const response = await axios.delete(`/admin/programs/${id}`);
  return response.data;
};

// Quiz APIs
export const fetchQuizzes = async (params?: any): Promise<PaginatedResponse<any>> => {
  const response = await axios.get('/teacher/quizzes', { params });
  return response.data;
};

export const fetchQuizById = async (id: string): Promise<ApiResponse<any>> => {
  const response = await axios.get(`/quizzes/${id}`);
  return response.data;
};

export const createQuiz = async (quizData: any): Promise<ApiResponse<any>> => {
  const response = await axios.post('/teacher/quizzes', quizData);
  return response.data;
};

export const updateQuiz = async (id: string, quizData: any): Promise<ApiResponse<any>> => {
  const response = await axios.put(`/teacher/quizzes/${id}`, quizData);
  return response.data;
};

export const deleteQuiz = async (id: string): Promise<ApiResponse<any>> => {
  const response = await axios.delete(`/teacher/quizzes/${id}`);
  return response.data;
};

// Student Quiz APIs
export const fetchStudentQuizzes = async (params?: any): Promise<PaginatedResponse<any>> => {
  const response = await axios.get('/student/quizzes', { params });
  return response.data;
};

export const startQuiz = async (quizId: string): Promise<ApiResponse<any>> => {
  const response = await axios.post(`/quizzes/${quizId}/start`);
  return response.data;
};

export const submitQuiz = async (quizId: string, submissionData: any): Promise<ApiResponse<any>> => {
  const response = await axios.post(`/quizzes/${quizId}/submit`, submissionData);
  return response.data;
};

export const fetchQuizResults = async (submissionId: string): Promise<ApiResponse<any>> => {
  const response = await axios.get(`/quizzes/submissions/${submissionId}/results`);
  return response.data;
};

// Student management APIs
export const fetchPendingStudents = async (): Promise<ApiResponse<User[]>> => {
  const response = await axios.get('/admin/students/pending');
  return response.data;
};

export const approveStudent = async (userId: string): Promise<ApiResponse<User>> => {
  const response = await axios.post(`/admin/students/${userId}/approve`);
  return response.data;
};

export const rejectStudent = async (userId: string, reason: string): Promise<ApiResponse<any>> => {
  const response = await axios.post(`/admin/students/${userId}/reject`, { reason });
  return response.data;
};

// User management APIs
export const fetchUsers = async (params?: any): Promise<PaginatedResponse<User>> => {
  const response = await axios.get('/users', { params });
  return response.data;
};

export const fetchUserById = async (id: string): Promise<ApiResponse<User>> => {
  const response = await axios.get(`/users/${id}`);
  return response.data;
};

export const createUser = async (userData: any): Promise<ApiResponse<User>> => {
  const response = await axios.post('/admin/users', userData);
  return response.data;
};

export const updateUser = async (id: string, userData: any): Promise<ApiResponse<User>> => {
  const response = await axios.put(`/admin/users/${id}`, userData);
  return response.data;
};

export const deleteUser = async (id: string): Promise<ApiResponse<any>> => {
  const response = await axios.delete(`/admin/users/${id}`);
  return response.data;
};

// Dashboard APIs
export const fetchAdminDashboard = async (): Promise<ApiResponse<any>> => {
  const response = await axios.get('/dashboard/admin');
  return response.data;
};

export const fetchStudentDashboard = async (): Promise<ApiResponse<any>> => {
  const response = await axios.get('/dashboard/student');
  return response.data;
};

export const fetchTeacherDashboard = async (): Promise<ApiResponse<any>> => {
  const response = await axios.get('/dashboard/teacher');
  return response.data;
};

// Enrollment APIs
export const fetchEnrollments = async (params?: any): Promise<PaginatedResponse<any>> => {
  const response = await axios.get('/enrollments', { params });
  return response.data;
};

export const enrollInProgram = async (programId: string): Promise<ApiResponse<any>> => {
  const response = await axios.post(`/enrollments/programs/${programId}`);
  return response.data;
};

// Live Sessions APIs
export const fetchLiveSessions = async (params?: any): Promise<PaginatedResponse<any>> => {
  const response = await axios.get('/live-sessions', { params });
  return response.data;
};

export const joinLiveSession = async (sessionId: string): Promise<ApiResponse<any>> => {
  const response = await axios.post(`/live-sessions/${sessionId}/join`);
  return response.data;
};

// Media APIs
export const uploadMedia = async (formData: FormData): Promise<ApiResponse<any>> => {
  const response = await axios.post('/media/upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};

export const fetchMedia = async (params?: any): Promise<PaginatedResponse<any>> => {
  const response = await axios.get('/media', { params });
  return response.data;
};

export const deleteMedia = async (id: string): Promise<ApiResponse<any>> => {
  const response = await axios.delete(`/media/${id}`);
  return response.data;
};

// Legacy compatibility functions
export const fetchProfessors = async (): Promise<Professor[]> => {
  // This would be replaced with actual API call when professors endpoint is available
  const professors = [
    {
      id: "1",
      name: "د. محمد أحمد",
      title: "أستاذ اللغة الإنجليزية",
      language: "الإنجليزية",
      image: "/lovable-uploads/1a202d64-c977-417b-8bf0-0b1c3cfed19f.png",
      description: "خبرة 15 عامًا في تدريس اللغة الإنجليزية للناطقين بالعربية. حاصل على شهادة TESOL وماجستير في اللغويات التطبيقية."
    },
    {
      id: "2", 
      name: "د. سارة علي",
      title: "أستاذة اللغة الفرنسية",
      language: "الفرنسية",
      image: "/lovable-uploads/1f6232dc-505a-4424-805a-ec17ff935bae.png",
      description: "متخصصة في تدريس اللغة الفرنسية مع خبرة 12 عامًا. حاصلة على دكتوراه في الأدب الفرنسي من جامعة السوربون."
    },
    {
      id: "3",
      name: "د. أحمد محمود", 
      title: "أستاذ اللغة الألمانية",
      language: "الألمانية",
      image: "/lovable-uploads/448b66da-1bb9-4262-96ff-d30d78dccb59.png",
      description: "خبير في تدريس اللغة الألمانية للأعمال والأغراض الأكاديمية. خبرة 10 سنوات ومعتمد من معهد جوته."
    }
  ];
  
  return professors;
};

export const fetchProfessorById = async (id: string): Promise<Professor | undefined> => {
  const professors = await fetchProfessors();
  return professors.find(prof => prof.id === id);
};