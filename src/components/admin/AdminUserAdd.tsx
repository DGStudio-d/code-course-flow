import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
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
import { ArrowLeft, Save, Loader2, Eye, EyeOff } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { useTranslation } from "react-i18next";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useForm } from "react-hook-form";
import useUsers from "@/hooks/useUsers";
import { UserFormData } from "@/types";

const AdminUserAdd = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const form = useForm<UserFormData>({
    defaultValues: {
      first_name: "",
      last_name: "",
      email: "",
      phone: "",
      role: "student",
      password: "",
      password_confirmation: "",
      language_id: "1",
      age: "",
    },
  });

  // Create user mutation
  const { createMutation } = useUsers();

  // Default languages
  const defaultLanguages = [
    { id: 1, code: "en", name: "English" },
    { id: 2, code: "fr", name: "French" },
    { id: 3, code: "es", name: "Spanish" },
    { id: 4, code: "ar", name: "Arabic" },
    { id: 5, code: "zh", name: "Chinese" },
  ];

  const onSubmit = async (data: UserFormData) => {
    if (data.password !== data.password_confirmation) {
      form.setError("password_confirmation", {
        type: "manual",
        message: t("inscription.passwordsDoNotMatch"),
      });
      return;
    }

    if (data.password.length < 6) {
      form.setError("password", {
        type: "manual",
        message: t("inscription.passwordTooShort"),
      });
      return;
    }

    if (!data.phone || !data.age || parseInt(data.age) < 1) {
      form.setError("root", {
        type: "manual",
        message: t("inscription.requiredFields"),
      });
      return;
    }

    const inscriptionData = {
      ...data,
      age: parseInt(data.age),
      language_id: Number(data.language_id),
    };

    createMutation.mutate(inscriptionData, {
      onSuccess: () => {
        toast({
          title: t("admin.users.success"),
          description: t("admin.users.userCreated"),
        });
        queryClient.invalidateQueries(["users"]);
        navigate("/admin/users");
      },
      onError: () => {
        toast({
          title: t("admin.users.error"),
          description: t("admin.users.errorCreating"),
          variant: "destructive",
        });
      },
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">{t("admin.users.addUser")}</h2>
        <Button variant="outline" onClick={() => navigate("/admin/users")}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          {t("admin.users.backToList")}
        </Button>
      </div>

      <Card className="w-full max-w-2xl mx-auto">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">
            {t("admin.users.createInscription")}
          </CardTitle>
          <CardDescription>
            {t("admin.users.createInscriptionDescription")}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="first_name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("admin.users.form.firstName")}</FormLabel>
                      <FormControl>
                        <Input
                          placeholder={t("admin.users.form.firstName")}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="last_name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("admin.users.form.lastName")}</FormLabel>
                      <FormControl>
                        <Input
                          placeholder={t("admin.users.form.lastName")}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("admin.users.form.email")}</FormLabel>
                      <FormControl>
                        <Input
                          type="email"
                          placeholder={t("admin.users.form.email")}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("admin.users.form.phone")}</FormLabel>
                      <FormControl>
                        <Input
                          placeholder={t("admin.users.form.phone")}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                      燃料
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="age"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("admin.users.form.age")}</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder={t("admin.users.form.age")}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="role"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("admin.users.form.role")}</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue
                              placeholder={t("admin.users.form.selectRole")}
                            />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="student">
                            {t("admin.users.form.student")}
                          </SelectItem>
                          <SelectItem value="teacher">
                            {t("admin.users.form.teacher")}
                          </SelectItem>
                          <SelectItem value="admin">
                            {t("admin.users.form.admin")}
                          </SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="language_id"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("admin.users.form.language")}</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue
                              placeholder={t("admin.users.form.selectLanguage")}
                            />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {defaultLanguages.map((lang) => (
                            <SelectItem
                              key={lang.id}
                              value={lang.id.toString()}
                            >
                              {lang.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("admin.users.form.password")}</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Input
                            type={showPassword ? "text" : "password"}
                            placeholder={t("admin.users.form.password")}
                            {...field}
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
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="password_confirmation"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        {t("admin.users.form.confirmPassword")}
                      </FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Input
                            type={showConfirmPassword ? "text" : "password"}
                            placeholder={t("admin.users.form.confirmPassword")}
                            {...field}
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                            onClick={() =>
                              setShowConfirmPassword(!showConfirmPassword)
                            }
                          >
                            {showConfirmPassword ? (
                              <EyeOff className="h-4 w-4" />
                            ) : (
                              <Eye className="h-4 w-4" />
                            )}
                          </Button>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <Button
                type="submit"
                className="w-full"
                disabled={createMutation.isPending}
              >
                {createMutation.isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    {t("admin.users.creating")}
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    {t("admin.users.create")}
                  </>
                )}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminUserAdd;
