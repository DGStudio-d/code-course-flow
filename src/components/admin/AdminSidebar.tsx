import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
} from "@/components/ui/sidebar";
import {
  LayoutDashboard,
  Users,
  GraduationCap,
  Languages,
  BookOpen,
  Settings,
  ChevronLeft,
  ChevronRight,
  UserCheck,
  FileQuestion,
} from "lucide-react";
import { useTranslation } from "react-i18next";

function AdminSidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === "ar";

  const menuItems = [
    {
      title: t("admin.sidebar.dashboard", "لوحة التحكم"),
      url: "/admin",
      icon: LayoutDashboard,
    },
    {
      title: t("admin.sidebar.users", "المستخدمين"),
      url: "/admin/users",
      icon: Users,
    },
    {
      title: t("admin.sidebar.teacherManagement", "إدارة المعلمين"),
      url: "/admin/teacher-management",
      icon: GraduationCap,
    },
    {
      title: t("admin.sidebar.studentActivation", "تفعيل الطلاب"),
      url: "/admin/student-activation",
      icon: UserCheck,
    },
    {
      title: t("admin.sidebar.languages", "اللغات"),
      url: "/admin/languages",
      icon: Languages,
    },
    {
      title: t("admin.sidebar.courses", "الكورسات"),
      url: "/admin/courses",
      icon: BookOpen,
    },
    {
      title: t("admin.sidebar.quizzes", "الاختبارات"),
      url: "/admin/quizzes",
      icon: FileQuestion,
    },
    {
      title: t("admin.sidebar.settings", "الإعدادات"),
      url: "/admin/settings",
      icon: Settings,
    },
  ];

  return (
    <Sidebar
      className={`${isRTL ? "rtl-sidebar" : ""}`}
      side={isRTL ? "right" : "left"}
    >
      <SidebarHeader className={`p-4 ${isRTL ? "text-right" : "text-left"}`}>
        <div
          className={`flex items-center gap-2 ${
            isRTL ? "flex-row-reverse gap-3" : ""
          }`}
        >
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <LayoutDashboard className="h-4 w-4" />
          </div>
          <div
            className={`font-semibold ${isRTL ? "text-right" : "text-left"}`}
          >
            {t("admin.sidebar.title", "لوحة الإدارة")}
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className={isRTL ? "text-right" : "text-left"}>
            {t("admin.sidebar.navigation", "التنقل")}
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => {
                const isActive = location.pathname === item.url;
                const IconComponent = item.icon;

                return (
                  <SidebarMenuItem key={item.url}>
                    <SidebarMenuButton
                      onClick={() => navigate(item.url)}
                      className={`flex items-center ${
                        isActive ? "bg-accent text-accent-foreground" : ""
                      } ${
                        isRTL
                          ? "flex-row-reverse text-right justify-start"
                          : "text-left"
                      } w-full`}
                    >
                      <IconComponent
                        className={`h-4 w-4 ${isRTL ? "ml-2" : "mr-2"}`}
                      />
                      <span className="flex-1">{item.title}</span>
                      {isActive &&
                        (isRTL ? (
                          <ChevronLeft className="h-4 w-4" />
                        ) : (
                          <ChevronRight className="h-4 w-4" />
                        ))}
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className={`p-4 ${isRTL ? "text-right" : "text-left"}`}>
        <div
          className={`text-xs text-muted-foreground ${
            isRTL ? "text-right" : "text-left"
          }`}
        >
          {t("admin.sidebar.version", "الإصدار")} 1.0.0
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}

export default AdminSidebar;
