
export interface Language {
  id: string;
  code: string;
  name: string;
  nativeName?: string;
  flag: string;
  teachers: Array<object>;
  difficultyLevels?: string[];
  teacherCount?: number;
  studentCount?: number;
}

export interface Question {
  id: string;
  type: 'mcq' | 'fill' | 'audio';
  text: string;
  options?: string[];
  correctAnswer: string;
  explanation: string;
  audioUrl?: string;
}

export interface Quiz {
  id: string;
  title: string;
  questions: Question[];
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  courseId: string;
  duration: number; // in seconds
  languageId: string;
}
export interface UserFormData {
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  role: string;
  password: string;
}
export interface Teacher {
  id: string;
  name: string;
  avatar: string;
  language: string;
  specialization: string;
  rating: number;
  testimonial: string;
  experience: number;
}

export interface Course {
  id: string;
  title: string;
  description: string;
  languageId: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  duration: string;
  lessonsCount: number;
  price: number;
  thumbnail: string;
}

export interface QuizSubmission {
  quizId: string;
  answers: { questionId: string; answer: string }[];
  startTime: Date;
  endTime: Date;
}

export interface ApiResponse<T> {
  data: T;
  message?: string;
  success?: boolean;
}
export interface ApiResponseRegister<T> {
  data: T;
  message?: string;
  success?: boolean;
}
