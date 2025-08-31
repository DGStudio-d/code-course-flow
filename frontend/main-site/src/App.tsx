import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { LanguageProvider } from "./contexts/LanguageContext";
import Index from "./pages/Index";

import TeachersPage from "./pages/TeachersPage";
import TeacherDetailPage from "./pages/TeacherDetailPage";
import LanguagesPage from "./pages/LanguagesPage";
import RegistrationPage from "./pages/RegistrationPage";
import WhatsAppPage from "./pages/WhatsAppPage";
import ContactPage from "./pages/ContactPage";
import NotFound from "./pages/NotFound";
import AdminLoginPage from "./pages/AdminLoginPage";

// Language Landing Pages
import EnglishLandingPage from "./pages/EnglishLandingPage";
import SpanishLandingPage from "./pages/SpanishLandingPage";
import ArabicLandingPage from "./pages/ArabicLandingPage";

// Admin pages
import AdminDashboard from "./pages/admin/AdminDashboard";
import QuizManagement from "./pages/admin/QuizManagement";
import CreateQuiz from "./pages/admin/CreateQuiz";
import QuizQuestions from "./pages/admin/QuizQuestions";
import StudentsManagement from "./pages/admin/StudentsManagement";

// Student pages
import StudentDashboard from "./pages/student/StudentDashboard";
import QuizList from "./pages/student/QuizList";
import TakeQuiz from "./pages/student/TakeQuiz";
import QuizResults from "./pages/student/QuizResults";

import WhatsAppFloatButton from "./components/home/FloatButtonWhatsapp";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <LanguageProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <WhatsAppFloatButton />
        <BrowserRouter>
          <Routes>
            {/* Main site routes */}
            <Route path="/" element={<Index />} />
            <Route path="/professors" element={<TeachersPage />} />
            <Route path="/professors/:id" element={<TeacherDetailPage />} />
            <Route path="/languages" element={<LanguagesPage />} />
            <Route path="/register" element={<RegistrationPage />} />
            <Route path="/whatsapp" element={<WhatsAppPage />} />
            <Route path="/contact" element={<ContactPage />} />

            {/* Language Landing Pages */}
            <Route path="/english" element={<EnglishLandingPage />} />
            <Route path="/spanish" element={<SpanishLandingPage />} />
            <Route path="/espanol" element={<SpanishLandingPage />} />
            <Route path="/arabic" element={<ArabicLandingPage />} />

            {/* Admin login route */}
            <Route path="/admin/login" element={<AdminLoginPage />} />

            {/* Admin dashboard routes */}
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/admin/quizzes" element={<QuizManagement />} />
            <Route path="/admin/quizzes/create" element={<CreateQuiz />} />
            <Route
              path="/admin/quizzes/:quizId/questions"
              element={<QuizQuestions />}
            />
            <Route path="/admin/students" element={<StudentsManagement />} />

            {/* Student routes */}
            <Route path="/student" element={<StudentDashboard />} />
            <Route path="/student/dashboard" element={<StudentDashboard />} />
            <Route path="/student/quizzes" element={<QuizList />} />
            <Route path="/student/quiz/:quizId" element={<TakeQuiz />} />
            <Route path="/student/quiz/:quizId/results" element={<QuizResults />} />
            <Route path="/student/quiz/:quizId/results/:submissionId" element={<QuizResults />} />

            {/* 404 route */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </LanguageProvider>
  </QueryClientProvider>
);

export default App;
