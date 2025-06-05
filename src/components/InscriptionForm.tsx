
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
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
import { useSelector } from "react-redux";
import useUsers from "@/hooks/useUsers";
import { useTranslation } from "react-i18next";

const InscriptionForm = () => {
  const { t } = useTranslation();
  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    email: "",
    password: "",
    password_confirmation: "",
    phone: "",
    age: "",
    role: "student",
    language_id: 1,
    level: "beginner" as "beginner" | "intermediate" | "advanced",
    type: "group" as "group" | "individual",
    start_date: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState("");
  const languages = useSelector((state: any) => state.appData.languages);

  const { createInscriptionMutation } = useUsers();

  // Default languages fallback
  const defaultLanguages = [
    { id: 1, code: "en", name: "English" },
    { id: 2, code: "fr", name: "French" },
    { id: 3, code: "es", name: "Spanish" },
    { id: 4, code: "ar", name: "Arabic" },
    { id: 5, code: "zh", name: "Chinese" },
  ];

  const availableLanguages =
    languages && languages.length > 0 ? languages : defaultLanguages;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (formData.password !== formData.password_confirmation) {
      setError("Passwords do not match");
      return;
    }

    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters long");
      return;
    }

    if (!formData.phone || !formData.age || parseInt(formData.age) < 1) {
      setError("Please fill in all required fields");
      return;
    }

    const inscriptionData = {
      ...formData,
      age: parseInt(formData.age),
      language_id: Number(formData.language_id),
    };

    createInscriptionMutation.mutate(inscriptionData);
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl font-bold">{t("inscription.title") || "Student Inscription"}</CardTitle>
        <CardDescription>
          Fill out the form below to register for language courses
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
              <Label htmlFor="firstName">{t("inscription.first_name") || "First Name"}</Label>
              <Input
                id="firstName"
                placeholder="John"
                value={formData.first_name}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    first_name: e.target.value,
                  }))
                }
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="lastName">{t("inscription.last_name") || "Last Name"}</Label>
              <Input
                id="lastName"
                placeholder="Doe"
                value={formData.last_name}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, last_name: e.target.value }))
                }
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">{t("inscription.email")}</Label>
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

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="phone">{t("inscription.phone")}</Label>
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
              <Label htmlFor="age">{t("inscription.age")}</Label>
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
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="level">{t("inscription.level.title")}</Label>
              <Select
                value={formData.level}
                onValueChange={(value: "beginner" | "intermediate" | "advanced") =>
                  setFormData((prev) => ({ ...prev, level: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select your level" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="beginner">{t("inscription.level.beginner")}</SelectItem>
                  <SelectItem value="intermediate">{t("inscription.level.intermediate")}</SelectItem>
                  <SelectItem value="advanced">{t("inscription.level.advanced")}</SelectItem>
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
                  <SelectItem value="individual">Individual Classes</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="languagePreference">{t("inscription.language")}</Label>
              <Select
                value={String(formData.language_id)}
                onValueChange={(value) =>
                  setFormData((prev) => ({ ...prev, language_id: Number(value) }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select your language" />
                </SelectTrigger>
                <SelectContent>
                  {availableLanguages.map((lang: any) => (
                    <SelectItem key={lang.id} value={String(lang.id)}>
                      {lang.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="startDate">Start Date</Label>
              <Input
                id="startDate"
                type="date"
                value={formData.start_date}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, start_date: e.target.value }))
                }
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">{t("inscription.password")}</Label>
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
            <Label htmlFor="confirmPassword">{t("inscription.confirm_password")}</Label>
            <div className="relative">
              <Input
                id="confirmPassword"
                type={showConfirmPassword ? "text" : "password"}
                placeholder="Confirm your password"
                value={formData.password_confirmation}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    password_confirmation: e.target.value,
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

          <Button type="submit" className="w-full" disabled={createInscriptionMutation.isPending}>
            {createInscriptionMutation.isPending ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
            ) : (
              <UserPlus className="w-4 h-4 mr-2" />
            )}
            {createInscriptionMutation.isPending ? "Submitting..." : t("inscription.submit")}
          </Button>
        </CardContent>
      </form>
    </Card>
  );
};

export default InscriptionForm;
