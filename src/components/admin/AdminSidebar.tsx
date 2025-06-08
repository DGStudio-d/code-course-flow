
import React from "react";
import { Link, useLocation } from "react-router-dom";
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarFooter,
} from "@/components/ui/sidebar";
import {
  LayoutDashboard,
  Users,
  GraduationCap,
  Languages,
  FileText,
  Settings,
  LogOut,
  UserPlus,
  UserCheck,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { useAuth } from "@/hooks/useAuth";

const AdminSidebar = () => {
  const location = useLocation();
  const { t, i18n } = useTranslation();
  const { logout } = useAuth();
  const isRTL = i18n.language === "ar";

  const menuItems = [
    {
      title: t("admin.sidebar.dashboard"),
      url: "/admin",
      icon: LayoutDashboard,
    },
    {
      title: t("admin.sidebar.students", "Students"),
      url: "/admin/students",
      icon: UserCheck,
    },
    {
      title: t("admin.sidebar.teacherManagement"),
      url: "/admin/teacher-management",
      icon: GraduationCap,
    },
    {
      title: "Inscriptions",
      url: "/admin/inscriptions",
      icon: UserPlus,
    },
    {
      title: t("admin.sidebar.languages"),
      url: "/admin/languages",
      icon: Languages,
    },
    {
      title: t("admin.sidebar.quizzes"),
      url: "/admin/quizzes",
      icon: FileText,
    },
    {
      title: t("admin.sidebar.settings"),
      url: "/admin/settings",
      icon: Settings,
    },
  ];

  const handleLogout = () => {
    logout.mutate();
  };

  return (
    <Sidebar className={isRTL ? "rtl" : "ltr"} dir={isRTL ? "rtl" : "ltr"}>
      <SidebarHeader className={`border-b p-4 ${isRTL ? 'text-right' : 'text-left'}`}>
        <h2 className="text-lg font-semibold">{t("admin.sidebar.title")}</h2>
      </SidebarHeader>
      
      <SidebarContent>
        <SidebarMenu>
          {menuItems.map((item) => (
            <SidebarMenuItem key={item.url}>
              <SidebarMenuButton
                asChild
                isActive={
                  location.pathname === item.url ||
                  (item.url !== "/admin" && location.pathname.startsWith(item.url))
                }
              >
                <Link to={item.url} className={`flex items-center gap-3 ${isRTL ? 'flex-row-reverse' : ''}`}>
                  <item.icon className="w-4 h-4" />
                  <span>{item.title}</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarContent>

      <SidebarFooter className={`border-t p-4 ${isRTL ? 'text-right' : 'text-left'}`}>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton onClick={handleLogout} className={`${isRTL ? 'flex-row-reverse' : ''}`}>
              <LogOut className="w-4 h-4" />
              <span>{t("admin.sidebar.logout")}</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
};

export default AdminSidebar;
