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
import { useSelector } from "react-redux";
import { RootState } from "@/config/store/store";
import api from "@/config/axios";

const ContactForm = () => {
  const { toast } = useToast();
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === "ar";
  const languages = useSelector((state: RootState) => state.appData.languages);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    level: "",
    age: "",
    language_id: "",
    type: "",
    password: "",
    confirmPassword: "",
  });

  const register = useMutation({
    mutationFn: async (data: unknown) => {
      const res = await api.post("/register", data);
      return res.data;
    },
    onSuccess: (data) => {
      toast({
        title: t("inscription.success_title", "تم التسجيل بنجاح"),
        description: t("inscription.success_description", `مرحباً ${data.name}! تم إنشاء حسابك بنجاح.`),
      });
      localStorage.setItem("user", JSON.stringify(data));
    },
    onError: (error: any) => {
      toast({
        title: t("common.error", "خطأ"),
        description: error.message || t("inscription.error", "حدث خطأ أثناء التسجيل"),
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      toast({
        title: t("common.error", "خطأ"),
        description: t("inscription.password_mismatch", "كلمتا المرور غير متطابقتين"),
        variant: "destructive",
      });
      return;
    }

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
              <CardTitle className={`text-3xl text-center mb-2 ${isRTL ? 'text-right' : 'text-left'} md:text-center`}>
                {t("inscription.register", "شنو خنسنا!")}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6" dir={isRTL ? "rtl" : "ltr"}>
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="name">{t("inscription.full_name", "الإسم الكامل")} *</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => handleChange("name", e.target.value)}
                      placeholder={t("inscription.full_name", "الإسم الكامل")}
                      className={isRTL ? 'text-right' : 'text-left'}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="email">{t("inscription.email", "البريد الإلكتروني")} *</Label>
                    <Input
                      id="email"
                      value={formData.email}
                      onChange={(e) => handleChange("email", e.target.value)}
                      placeholder="example@email.com"
                      type="email"
                      className={isRTL ? 'text-right' : 'text-left'}
                      required
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="phone">{t("inscription.phone", "رقم الهاتف")} *</Label>
                    <Input
                      id="phone"
                      value={formData.phone}
                      onChange={(e) => handleChange("phone", e.target.value)}
                      placeholder="06XXXXXXXX"
                      className={isRTL ? 'text-right' : 'text-left'}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="age">{t("inscription.age", "العمر")} *</Label>
                    <Input
                      id="age"
                      value={formData.age}
                      onChange={(e) => handleChange("age", e.target.value)}
                      placeholder={t("inscription.age", "العمر")}
                      className={isRTL ? 'text-right' : 'text-left'}
                      required
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="password">{t("inscription.password", "كلمة المرور")} *</Label>
                    <Input
                      id="password"
                      type="password"
                      value={formData.password}
                      onChange={(e) => handleChange("password", e.target.value)}
                      placeholder="********"
                      className={isRTL ? 'text-right' : 'text-left'}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="confirmPassword">{t("inscription.confirm_password", "تأكيد كلمة المرور")} *</Label>
                    <Input
                      id="confirmPassword"
                      type="password"
                      value={formData.confirmPassword}
                      onChange={(e) => handleChange("confirmPassword", e.target.value)}
                      placeholder="********"
                      className={isRTL ? 'text-right' : 'text-left'}
                      required
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <Label>{t("inscription.level.title", "المستوى الدراسي")} *</Label>
                    <Select
                      value={formData.level}
                      onValueChange={(value) => handleChange("level", value)}
                      dir={isRTL ? "rtl" : "ltr"}
                    >
                      <SelectTrigger className={isRTL ? 'text-right' : 'text-left'}>
                        <SelectValue placeholder={t("inscription.level.title", "اختر المستوى")} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="beginner">{t("inscription.level.beginner", "إبتدائي")}</SelectItem>
                        <SelectItem value="intermediate">{t("inscription.level.intermediate", "متوسط")}</SelectItem>
                        <SelectItem value="advanced">{t("inscription.level.advanced", "متقدم")}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>{t("inscription.language", "اللغة المفضلة")} *</Label>
                    <Select
                      value={formData.language_id}
                      onValueChange={(value) => handleChange("language_id", value)}
                      dir={isRTL ? "rtl" : "ltr"}
                    >
                      <SelectTrigger className={isRTL ? 'text-right' : 'text-left'}>
                        <SelectValue placeholder={t("inscription.language", "اختر اللغة")} />
                      </SelectTrigger>
                      <SelectContent>
                        {languages?.map((language: any) => (
                          <SelectItem key={language.id} value={language.id.toString()}>
                            {language.flag} {language.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <Label>{t("inscription.type", "نمط الدراسة")} *</Label>
                  <Select
                    value={formData.type}
                    onValueChange={(value) => handleChange("type", value)}
                    dir={isRTL ? "rtl" : "ltr"}
                  >
                    <SelectTrigger className={isRTL ? 'text-right' : 'text-left'}>
                      <SelectValue placeholder={t("inscription.type", "اختر النمط")} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="individual">{t("inscription.individual", "فردي")}</SelectItem>
                      <SelectItem value="group">{t("inscription.group", "جماعي")}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Button
                  type="submit"
                  className="w-full bg-green-600 hover:bg-green-700 text-white text-lg py-6 rounded-xl shadow"
                  disabled={register.isPending}
                >
                  {register.isPending ? t("common.loading", "جاري التحميل...") : t("inscription.register", "سجل الآن")}
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