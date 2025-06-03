import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useAdminDashboard } from "@/hooks/useAdminDashboard";
import { useTranslation } from "react-i18next";

const AdminDashboardOverview = () => {
  const { stats, recentRegistrations, notifications, isLoading } =
    useAdminDashboard();
  const { t } = useTranslation();

  if (isLoading) {
    return <div>{t("loading", "جاري التحميل...")}</div>;
  }

  return (
    <div className="space-y-6">
      {/* Dashboard Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          {t("admin.dashboard.title", "لوحة التحكم")}
        </h1>
        <p className="text-muted-foreground">
          {t("admin.dashboard.welcome", "مرحبًا بك في لوحة تحكم الإدارة")}
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle>
              {t("admin.dashboard.totalUsers", "إجمالي المستخدمين")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats?.totalUsers}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle>
              {t("admin.dashboard.totalTeachers", "إجمالي المدرسين")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats?.totalTeachers}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle>
              {t("admin.dashboard.totalLanguages", "إجمالي اللغات")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats?.totalLanguages}</div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Registrations Table */}
      <Card>
        <CardHeader>
          <CardTitle>
            {t("admin.dashboard.recentRegistrations", "آخر التسجيلات")}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t("admin.dashboard.name", "الاسم")}</TableHead>
                <TableHead>
                  {t("admin.dashboard.email", "البريد الإلكتروني")}
                </TableHead>
                <TableHead>{t("admin.dashboard.language", "اللغة")}</TableHead>
                <TableHead>{t("admin.dashboard.date", "التاريخ")}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {recentRegistrations?.map((registration) => (
                <TableRow key={registration?.id}>
                  <TableCell>{registration?.name}</TableCell>
                  <TableCell>{registration?.email}</TableCell>
                  <TableCell>{registration?.language}</TableCell>
                  <TableCell>{registration?.date}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Notifications Section */}
      <Card>
        <CardHeader>
          <CardTitle>
            {t("admin.dashboard.notifications", "الإشعارات")}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2">
            {notifications?.map((notification) => (
              <li
                key={notification?.id}
                className="p-2 border rounded-md bg-gray-50"
              >
                <p className="font-bold">{notification?.title}</p>
                <p className="text-sm text-muted-foreground">
                  {notification?.message}
                </p>
                <p className="text-xs text-gray-400">{notification?.time}</p>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminDashboardOverview;
