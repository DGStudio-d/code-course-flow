
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import Index from "./pages/Index";
import Quiz from "./pages/Quiz";
import Contact from "./pages/Contact";
import Courses from "./pages/Courses";
import Teachers from "./pages/Teachers";
import TeacherDashboard from "./pages/TeacherDashboard";
import AdminDashboard from "./pages/AdminDashboard";
import Auth from "./pages/Auth";
import PasswordReset from "./components/PasswordReset";
import NotFound from "./pages/NotFound";
import ContactPage from "./pages/ContactPage";
import { useAppData } from "./hooks/useAppData";

const App = () => {
  useAppData();
  
  return (
    <>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AuthProvider>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/auth" element={<Auth />} />
              <Route path="/forgot-password" element={<PasswordReset />} />
              <Route path="/inscription" element={<Contact />} />
              <Route path="/contact" element={<ContactPage />} />
              <Route path="/teachers" element={<Teachers />} />
              
              {/* Protected Teacher Routes */}
              <Route 
                path="/teacher-dashboard/*" 
                element={
                  <ProtectedRoute allowedRoles={["teacher"]} requireApproval={true}>
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
                  <ProtectedRoute allowedRoles={["student", "teacher"]}>
                    <Quiz />
                  </ProtectedRoute>
                } 
              />
              
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </AuthProvider>
        </BrowserRouter>
      </TooltipProvider>
    </>
  );
};

export default App;
