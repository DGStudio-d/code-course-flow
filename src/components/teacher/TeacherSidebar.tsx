
import React from "react";
import { Link, useLocation } from "react-router-dom";
import { 
  Home, 
  FileText,
  BarChart3,
  Users,
  Plus
} from "lucide-react";
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
} from "@/components/ui/sidebar";

const TeacherSidebar = () => {
  const location = useLocation();
  
  const isActive = (path: string) => {
    return location.pathname === path;
  };

  const navItems = [
    { 
      name: "نظرة عامة", 
      path: "/teacher-dashboard", 
      icon: Home 
    },
    { 
      name: "إدارة الاختبارات", 
      path: "/teacher-dashboard/quizzes", 
      icon: FileText 
    },
    { 
      name: "التحليلات", 
      path: "/teacher-dashboard/analytics", 
      icon: BarChart3 
    },
    { 
      name: "الطلاب", 
      path: "/teacher-dashboard/students", 
      icon: Users 
    },
  ];

  return (
    <Sidebar>
      <SidebarHeader className="p-4">
        <h2 className="text-lg font-semibold">لوحة المعلم</h2>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>القائمة الرئيسية</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map((item) => {
                const active = isActive(item.path);
                const Icon = item.icon;
                
                return (
                  <SidebarMenuItem key={item.path}>
                    <SidebarMenuButton asChild isActive={active}>
                      <Link to={item.path}>
                        <Icon className="h-4 w-4" />
                        <span>{item.name}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
};

export { TeacherSidebar };
