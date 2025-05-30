
import React, { useState } from "react";
import { LoginForm } from "@/components/LoginForm";
import { RegisterForm } from "@/components/RegisrteForm";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { User, UserPlus, Shield } from "lucide-react";

const Auth = () => {
  const [activeTab, setActiveTab] = useState("login");
  const [userType, setUserType] = useState<"student" | "teacher" | "admin">("student");

  const handleSwitchToLogin = () => setActiveTab("login");
  const handleSwitchToRegister = () => setActiveTab("register");

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* User Type Selector */}
        <div className="mb-6">
          <div className="flex justify-center space-x-2 p-1 bg-white rounded-lg shadow-sm border">
            <Button
              variant={userType === "student" ? "default" : "ghost"}
              size="sm"
              onClick={() => setUserType("student")}
              className="flex-1"
            >
              <User className="w-4 h-4 mr-1" />
              Student
            </Button>
            <Button
              variant={userType === "teacher" ? "default" : "ghost"}
              size="sm"
              onClick={() => setUserType("teacher")}
              className="flex-1"
            >
              <UserPlus className="w-4 h-4 mr-1" />
              Teacher
            </Button>
            <Button
              variant={userType === "admin" ? "default" : "ghost"}
              size="sm"
              onClick={() => setUserType("admin")}
              className="flex-1"
            >
              <Shield className="w-4 h-4 mr-1" />
              Admin
            </Button>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="login">Login</TabsTrigger>
            <TabsTrigger value="register" disabled={userType === "admin"}>
              Register
            </TabsTrigger>
          </TabsList>

          <TabsContent value="login" className="mt-6">
            <LoginForm
              userType={userType}
              onSwitchToRegister={handleSwitchToRegister}
            />
          </TabsContent>

          <TabsContent value="register" className="mt-6">
            <RegisterForm
              userType={userType as "student" | "teacher"}
              onSwitchToLogin={handleSwitchToLogin}
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Auth;
