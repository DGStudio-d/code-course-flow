
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
  BookOpen,
  FileText,
  TrendingUp,
  LogOut,
  User,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { useAuth } from "@/hooks/useAuth";

export const StudentSidebar = () => {
  const location = useLocation();
  const { t, i18n } = useTranslation();
  const { logout } = useAuth();
  const isRTL = i18n.language === "ar";

  const menuItems = [
    {
      title: "لوحة التحكم",
      url: "/student-dashboard",
      icon: LayoutDashboard,
    },
    {
      title: "الدورات",
      url: "/student-dashboard/courses",
      icon: BookOpen,
    },
    {
      title: "الاختبارات",
      url: "/student-dashboard/quizzes",
      icon: FileText,
    },
    {
      title: "التقدم",
      url: "/student-dashboard/progress",
      icon: TrendingUp,
    },
  ];

  const handleLogout = () => {
    logout.mutate();
  };

  return (
    <Sidebar className={isRTL ? "rtl" : "ltr"} dir={isRTL ? "rtl" : "ltr"}>
      <SidebarHeader className={`border-b p-4 ${isRTL ? 'text-right' : 'text-left'}`}>
        <div className={`flex items-center ${isRTL ? 'space-x-reverse space-x-2' : 'space-x-2'}`}>
          <User className="w-6 h-6 text-blue-600" />
          <h2 className="text-lg font-semibold">لوحة الطالب</h2>
        </div>
      </SidebarHeader>
      
      <SidebarContent>
        <SidebarMenu>
          {menuItems.map((item) => (
            <SidebarMenuItem key={item.url}>
              <SidebarMenuButton
                asChild
                isActive={
                  location.pathname === item.url ||
                  (item.url !== "/student-dashboard" && location.pathname.startsWith(item.url))
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
              <span>تسجيل الخروج</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
};
