import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useMutation } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import api from "@/config/axios";

const ContactForm = () => {
  const { toast } = useToast();
  const { t } = useTranslation();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    level: "",
    age:"",
    language_id: "",
    type: "",
    password: "",
    confirmPassword: "",
  });

  const register = useMutation({
    mutationFn: async (data: unknown) => {
      const res = await api.post("/register", data);
      console.log("Response from API:", res.data);
      return res.data;
    },
    onSuccess: (data) => {
      toast({
        title: "تم التسجيل بنجاح",
        description: `مرحباً ${data.name}! تم إنشاء حسابك بنجاح.`,
      });
      localStorage.setItem("user", JSON.stringify(data));
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      toast({
        title: "خطأ",
        description: "كلمتا المرور غير متطابقتين",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "تم إرسال الرسالة بنجاح",
      description: "سنتواصل معك قريباً",
    });
    register.mutate(formData);

    // Reset form
    setFormData({
      name: "",
      email: "",
      phone: "",
      level: "",
      language_id: "",
      age: "",
      type: "",
      password: "",
      confirmPassword: "",
    });
  };

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <section className="py-16 bg-gradient-to-br from-gray-50 to-primary-50">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          <Card className="border-green-100 shadow-xl">
            <CardHeader>
              <CardTitle className="text-3xl text-center mb-2">
                شنو خنسنا!
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="name">{t("inscription.full_name")} *</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => handleChange("name", e.target.value)}
                      placeholder="الإسم الكامل"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="email">{t("inscription.email")} *</Label>
                    <Input
                      id="email"
                      value={formData.email}
                      onChange={(e) => handleChange("email", e.target.value)}
                      placeholder="example@email.com"
                      type="email"
                      required
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="phone">{t("inscription.phone")} *</Label>
                    <Input
                      id="phone"
                      value={formData.phone}
                      onChange={(e) => handleChange("phone", e.target.value)}
                      placeholder="06XXXXXXXX"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="age">{t("inscription.age")} *</Label>
                    <Input
                      id="age"
                      value={formData.age}
                      onChange={(e) => handleChange("age", e.target.value)}
                      placeholder="العمر"
                      required
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="password">كلمة المرور *</Label>
                    <Input
                      id="password"
                      type="password"
                      value={formData.password}
                      onChange={(e) => handleChange("password", e.target.value)}
                      placeholder="********"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="confirmPassword">تأكيد كلمة المرور *</Label>
                    <Input
                      id="confirmPassword"
                      type="password"
                      value={formData.confirmPassword}
                      onChange={(e) =>
                        handleChange("confirmPassword", e.target.value)
                      }
                      placeholder="********"
                      required
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <Label>المستوى الدراسي *</Label>
                    <Select
                      value={formData.level}
                      onValueChange={(value) => handleChange("level", value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="اختر المستوى" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="beginner">إبتدائي</SelectItem>
                        <SelectItem value="intermediate">متوسط</SelectItem>
                        <SelectItem value="advanced">متقدم</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>اللغة المفضلة *</Label>
                    <Select
                      value={formData.language_id}
                      onValueChange={(value) => handleChange("language_id", value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="اختر اللغة" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="english">الإنجليزية</SelectItem>
                        <SelectItem value="french">الفرنسية</SelectItem>
                        <SelectItem value="german">الألمانية</SelectItem>
                        <SelectItem value="spanish">الإسبانية</SelectItem>
                        <SelectItem value="italian">الإيطالية</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <Label>نمط الدراسة *</Label>
                  <Select
                    value={formData.type}
                    onValueChange={(value) => handleChange("type", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="اختر النمط" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="individual">فردي</SelectItem>
                      <SelectItem value="group">جماعي</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Button
                  type="submit"
                  className="w-full bg-green-600 hover:bg-green-700 text-white text-lg py-6 rounded-xl shadow"
                >
                  {t("inscription.register") || "سجل الآن"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
};

export default ContactForm;
