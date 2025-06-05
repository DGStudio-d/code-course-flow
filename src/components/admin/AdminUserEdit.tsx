
import React, { useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
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
import { useQuery } from "@tanstack/react-query";
import api from "@/config/axios";
import useUsers from "@/hooks/useUsers";
import { useTranslation } from "react-i18next";
import { UserFormData } from "@/types";

const AdminUserEdit = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { updateMutation } = useUsers();

  const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm<UserFormData>({
    defaultValues: {
      first_name: "",
      last_name: "",
      email: "",
      phone: "",
      role: "",
      password: "",
    },
  });

  const { data: user, isLoading } = useQuery({
    queryKey: ["user", id],
    queryFn: () => api.get(`/users/${id}`).then((res) => res.data.data),
    enabled: !!id,
  });

  useEffect(() => {
    if (user) {
      reset({
        first_name: user.firstName || "",
        last_name: user.lastName || "",
        email: user.email || "",
        phone: user.phone || "",
        role: user.role?.name || "",
        password: "",
      });
    }
  }, [user, reset]);

  const onSubmit = (data: UserFormData) => {
    if (id) {
      updateMutation.mutate({ data, id });
    }
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">{t("admin.users.editUser")}</h2>
        <Button variant="outline" onClick={() => navigate("/admin/users")}>
          {t("admin.users.backToList")}
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t("admin.users.editUserDetails")}</CardTitle>
          <CardDescription>
            {t("admin.users.editUserDescription")}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="first_name">{t("admin.users.firstName")}</Label>
                <Input
                  id="first_name"
                  {...register("first_name", { required: true })}
                />
                {errors.first_name && (
                  <span className="text-red-500 text-sm">
                    {t("admin.users.firstNameRequired")}
                  </span>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="last_name">{t("admin.users.lastName")}</Label>
                <Input
                  id="last_name"
                  {...register("last_name", { required: true })}
                />
                {errors.last_name && (
                  <span className="text-red-500 text-sm">
                    {t("admin.users.lastNameRequired")}
                  </span>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">{t("admin.users.email")}</Label>
              <Input
                id="email"
                type="email"
                {...register("email", { required: true })}
              />
              {errors.email && (
                <span className="text-red-500 text-sm">
                  {t("admin.users.emailRequired")}
                </span>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">{t("admin.users.phone")}</Label>
              <Input
                id="phone"
                {...register("phone", { required: true })}
              />
              {errors.phone && (
                <span className="text-red-500 text-sm">
                  {t("admin.users.phoneRequired")}
                </span>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="role">{t("admin.users.role")}</Label>
              <Select
                value={user?.role?.name || ""}
                onValueChange={(value) => setValue("role", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder={t("admin.users.selectRole")} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="admin">{t("admin.users.roles.admin")}</SelectItem>
                  <SelectItem value="teacher">{t("admin.users.roles.teacher")}</SelectItem>
                  <SelectItem value="student">{t("admin.users.roles.student")}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">{t("admin.users.password")}</Label>
              <Input
                id="password"
                type="password"
                placeholder={t("admin.users.passwordPlaceholder")}
                {...register("password")}
              />
            </div>

            <div className="flex gap-2">
              <Button
                type="submit"
                disabled={updateMutation.isPending}
              >
                {updateMutation.isPending
                  ? t("admin.users.updating")
                  : t("admin.users.updateUser")}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate("/admin/users")}
              >
                {t("admin.users.cancel")}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminUserEdit;
