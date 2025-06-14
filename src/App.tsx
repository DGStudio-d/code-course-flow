
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { LanguageProvider } from "@/contexts/LanguageContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import Index from "./pages/Index";
import Quiz from "./pages/Quiz";
import Contact from "./pages/Contact";
import Teachers from "./pages/Teachers";
import TeacherDashboard from "./pages/TeacherDashboard";
import AdminDashboard from "./pages/AdminDashboard";
import StudentDashboard from "./pages/StudentDashboard";
import CourseEdit from "./pages/CourseEdit";
import QuizEdit from "./pages/QuizEdit";
import TeacherManagement from "./pages/TeacherManagement";
import Auth from "./pages/Auth";
import PasswordReset from "./components/PasswordReset";
import NotFound from "./pages/NotFound";
import ContactPage from "./pages/ContactPage";
import { useAppData } from "./hooks/useAppData";
import "./config/i18n";
import FloatingWhatsAppButton from "./components/FloatingWhatsAppButton";

const queryClient = new QueryClient();

const AppContent = () => {
  return (
    <Routes>
      <Route path="/" element={<Index />} />
      <Route path="/auth" element={<Auth />} />
      <Route path="/inscription" element={<Contact />} />
      <Route path="/contact" element={<ContactPage />} />
      <Route path="/teachers" element={<Teachers />} />

      {/* Protected Student Routes */}
      <Route
        path="/student-dashboard/*"
        element={
          <ProtectedRoute allowedRoles={["student"]}>
            <StudentDashboard />
          </ProtectedRoute>
        }
        />

      {/* Protected Teacher Routes */}
      <Route
        path="/teacher-dashboard/*"
        element={
          <ProtectedRoute allowedRoles={["teacher"]}>
            <TeacherDashboard />
          </ProtectedRoute>
        }
      />

      {/* Protected Admin Routes */}
      <Route
        path="/admin/*"
        element={
          <ProtectedRoute allowedRoles={["admin"]}>
            <AdminDashboard />
          </ProtectedRoute>
        }
      />

      {/* Protected Student/General Routes */}
      <Route
        path="/quiz"
        element={
          <ProtectedRoute allowedRoles={["student", "teacher","admin"]}>
            <Quiz />
          </ProtectedRoute>
        }
      />

      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

const App = () => {
  const role = localStorage.getItem("role");
  useAppData();
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <LanguageProvider>
            <AppContent />
            {role === "student" && (<FloatingWhatsAppButton />)}
          </LanguageProvider>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
