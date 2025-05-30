import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Eye, EyeOff, UserPlus } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "@/hooks/use-toast";

interface RegisterFormProps {
  userType: "student" | "teacher";
  onSwitchToLogin: () => void;
}

export const RegisterForm = ({
  userType,
  onSwitchToLogin,
}: RegisterFormProps) => {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
    languagePreference: "en",
    phone: "",
    age: "",
    level: "beginner" as "beginner" | "intermediate" | "advanced",
    type: "group" as "group" | "individual",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const { register } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      setIsLoading(false);
      return;
    }

    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters long");
      setIsLoading(false);
      return;
    }

    // Validate student-specific fields
    if (userType === "student") {
      if (!formData.phone) {
        setError("Phone number is required for students");
        setIsLoading(false);
        return;
      }

      if (!formData.age || parseInt(formData.age) < 1) {
        setError("Valid age is required for students");
        setIsLoading(false);
        return;
      }
    }

    try {
      const registrationData = {
        ...formData,
        role: userType,
        age: userType === "student" ? parseInt(formData.age) : undefined,
      };

      const success = await register(registrationData);

      if (success) {
        if (userType === "teacher") {
          toast({
            title: "Registration submitted",
            description:
              "Your teacher account is pending admin approval. You'll receive an email when approved.",
          });
          onSwitchToLogin();
        } else {
          toast({
            title: "Registration successful",
            description: "Welcome! Your student account has been created.",
          });
        }
      } else {
        setError("Registration failed. Please try again.");
      }
    } catch (err) {
      setError("Registration failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const getCardTitle = () => {
    return userType === "student"
      ? "Student Registration"
      : "Teacher Registration";
  };

  const getCardColor = () => {
    return userType === "student" ? "border-blue-200" : "border-green-200";
  };

  return (
    <Card className={`w-full max-w-md mx-auto ${getCardColor()}`}>
      <CardHeader className="text-center">
        <CardTitle className="text-2xl font-bold">{getCardTitle()}</CardTitle>
        <CardDescription>
          Create your {userType} account to get started
          {userType === "teacher" && (
            <span className="block text-amber-600 mt-1">
              Teacher accounts require admin approval
            </span>
          )}
        </CardDescription>
      </CardHeader>

      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="firstName">First Name</Label>
              <Input
                id="firstName"
                placeholder="John"
                value={formData.firstName}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    firstName: e.target.value,
                  }))
                }
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="lastName">Last Name</Label>
              <Input
                id="lastName"
                placeholder="Doe"
                value={formData.lastName}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, lastName: e.target.value }))
                }
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="john.doe@example.com"
              value={formData.email}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, email: e.target.value }))
              }
              required
            />
          </div>

          {userType === "student" && (
            <>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="+1234567890"
                  value={formData.phone}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, phone: e.target.value }))
                  }
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="age">Age</Label>
                <Input
                  id="age"
                  type="number"
                  placeholder="20"
                  min="1"
                  max="120"
                  value={formData.age}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, age: e.target.value }))
                  }
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="level">Level</Label>
                <Select
                  value={formData.level}
                  onValueChange={(
                    value: "beginner" | "intermediate" | "advanced"
                  ) => setFormData((prev) => ({ ...prev, level: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select your level" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="beginner">Beginner</SelectItem>
                    <SelectItem value="intermediate">Intermediate</SelectItem>
                    <SelectItem value="advanced">Advanced</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="type">Class Type</Label>
                <Select
                  value={formData.type}
                  onValueChange={(value: "group" | "individual") =>
                    setFormData((prev) => ({ ...prev, type: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select class type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="group">Group Classes</SelectItem>
                    <SelectItem value="individual">
                      Individual Classes
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </>
          )}

          <div className="space-y-2">
            <Label htmlFor="languagePreference">Language Preference</Label>
            <Select
              value={formData.languagePreference}
              onValueChange={(value) =>
                setFormData((prev) => ({ ...prev, languagePreference: value }))
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select your language" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="en">English</SelectItem>
                <SelectItem value="es">Spanish</SelectItem>
                <SelectItem value="fr">French</SelectItem>
                <SelectItem value="de">German</SelectItem>
                <SelectItem value="zh">Chinese</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="Enter your password"
                value={formData.password}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, password: e.target.value }))
                }
                required
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Confirm Password</Label>
            <div className="relative">
              <Input
                id="confirmPassword"
                type={showConfirmPassword ? "text" : "password"}
                placeholder="Confirm your password"
                value={formData.confirmPassword}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    confirmPassword: e.target.value,
                  }))
                }
                required
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                {showConfirmPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>
        </CardContent>

        <CardFooter className="flex flex-col space-y-3">
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
            ) : (
              <UserPlus className="w-4 h-4 mr-2" />
            )}
            {isLoading ? "Creating Account..." : "Create Account"}
          </Button>

          <p className="text-sm text-center text-gray-600">
            Already have an account?{" "}
            <Button
              variant="link"
              className="p-0 h-auto"
              onClick={onSwitchToLogin}
            >
              Sign in here
            </Button>
          </p>
        </CardFooter>
      </form>
    </Card>
  );
};
