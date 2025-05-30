
import React, { createContext, useContext, useState, useEffect } from "react";

interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: "student" | "teacher" | "admin";
  isApproved?: boolean;
  languagePreference?: string;
  phone?: string;
  age?: number;
  level?: "beginner" | "intermediate" | "advanced";
  type?: "group" | "individual";
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string, userType: string) => Promise<boolean>;
  register: (userData: any) => Promise<boolean>;
  logout: () => void;
  resetPassword: (email: string) => Promise<boolean>;
  isAuthenticated: boolean;
  hasRole: (role: string) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check for existing session on mount
    const checkAuth = async () => {
      try {
        const token = localStorage.getItem("token");
        const userData = localStorage.getItem("user");
        
        if (token && userData) {
          setUser(JSON.parse(userData));
        }
      } catch (error) {
        console.error("Auth check failed:", error);
        localStorage.removeItem("token");
        localStorage.removeItem("user");
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  const login = async (email: string, password: string, userType: string): Promise<boolean> => {
    try {
      // TODO: Replace with actual API call
      console.log("Login attempt:", { email, userType });
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock successful login
      const mockUser: User = {
        id: "1",
        email,
        firstName: "John",
        lastName: "Doe",
        role: userType as "student" | "teacher" | "admin",
        isApproved: userType === "teacher" ? true : undefined,
        languagePreference: "en"
      };

      setUser(mockUser);
      localStorage.setItem("token", "mock-token");
      localStorage.setItem("user", JSON.stringify(mockUser));
      
      return true;
    } catch (error) {
      console.error("Login failed:", error);
      return false;
    }
  };

  const register = async (userData: any): Promise<boolean> => {
    try {
      // TODO: Replace with actual API call
      console.log("Registration attempt:", userData);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // For teacher registration, don't auto-login (pending approval)
      if (userData.role === "teacher") {
        return true;
      }
      
      // Auto-login for students
      const newUser: User = {
        id: "new-user-id",
        email: userData.email,
        firstName: userData.firstName,
        lastName: userData.lastName,
        role: userData.role,
        languagePreference: userData.languagePreference,
        phone: userData.phone,
        age: userData.age,
        level: userData.level,
        type: userData.type
      };

      setUser(newUser);
      localStorage.setItem("token", "mock-token");
      localStorage.setItem("user", JSON.stringify(newUser));
      
      return true;
    } catch (error) {
      console.error("Registration failed:", error);
      return false;
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("token");
    localStorage.removeItem("user");
  };

  const resetPassword = async (email: string): Promise<boolean> => {
    try {
      // TODO: Replace with actual API call
      console.log("Password reset request for:", email);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      return true;
    } catch (error) {
      console.error("Password reset failed:", error);
      return false;
    }
  };

  const hasRole = (role: string): boolean => {
    return user?.role === role;
  };

  const value: AuthContextType = {
    user,
    isLoading,
    login,
    register,
    logout,
    resetPassword,
    isAuthenticated: !!user,
    hasRole
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
