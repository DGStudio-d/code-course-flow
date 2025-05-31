
import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Bell, LogOut, User, Settings } from "lucide-react";
import Logo from "@/components/common/Logo";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";

const AdminHeader = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [notificationCount] = useState(3);
  const {logout}=useAuth();

  const handleLogout = () => {
    try {
      // Clear authentication data
      logout.mutate();
      
      
      // Show success message
      toast({
        title: "تم تسجيل الخروج بنجاح",
        description: "شكراً لاستخدام المنصة",
      });
      
      // Redirect to login page
      navigate("/login");
    } catch (error) {
      console.error("Logout error:", error);
      toast({
        title: "خطأ في تسجيل الخروج",
        description: "حدث خطأ أثناء تسجيل الخروج",
        variant: "destructive",
      });
    }
  };

  const getCurrentUser = () => {
    try {
      const userStr = localStorage.getItem("user");
      if (userStr) {
        return JSON.parse(userStr);
      }
    } catch (e) {
      console.error("Error parsing user data:", e);
    }
    return { name: "المدير", email: "admin@example.com" };
  };

  const currentUser = getCurrentUser();

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b bg-background px-6 shadow-sm">
      <div className="flex flex-1 items-center gap-4">
        <Logo isAdmin />
        <h1 className="text-xl font-bold text-gray-900">لوحة التحكم</h1>
      </div>
      
      <div className="flex items-center gap-4">
        {/* Notifications */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="h-5 w-5" />
              {notificationCount > 0 && (
                <Badge 
                  variant="destructive" 
                  className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 text-xs flex items-center justify-center"
                >
                  {notificationCount}
                </Badge>
              )}
              <span className="sr-only">الإشعارات</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-80 bg-white">
            <div className="p-4 border-b">
              <h3 className="font-semibold">الإشعارات</h3>
            </div>
            <div className="max-h-96 overflow-y-auto">
              <DropdownMenuItem className="p-4 flex-col items-start">
                <p className="font-medium">مستخدم جديد</p>
                <p className="text-sm text-gray-600">انضم طالب جديد إلى المنصة</p>
                <p className="text-xs text-gray-400 mt-1">منذ 5 دقائق</p>
              </DropdownMenuItem>
              <DropdownMenuItem className="p-4 flex-col items-start">
                <p className="font-medium">تحديث النظام</p>
                <p className="text-sm text-gray-600">تم تحديث النظام بنجاح</p>
                <p className="text-xs text-gray-400 mt-1">منذ ساعة</p>
              </DropdownMenuItem>
              <DropdownMenuItem className="p-4 flex-col items-start">
                <p className="font-medium">دفعة جديدة</p>
                <p className="text-sm text-gray-600">تم استلام دفعة جديدة</p>
                <p className="text-xs text-gray-400 mt-1">منذ 3 ساعات</p>
              </DropdownMenuItem>
            </div>
            <div className="p-2 border-t">
              <Button variant="ghost" className="w-full">
                عرض جميع الإشعارات
              </Button>
            </div>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* User Menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="flex items-center gap-2">
              <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                <User className="w-4 h-4 text-green-600" />
              </div>
              <div className="hidden md:block text-right">
                <p className="text-sm font-medium">{currentUser.name}</p>
                <p className="text-xs text-gray-500">مدير النظام</p>
              </div>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56 bg-white">
            <DropdownMenuItem>
              <User className="w-4 h-4 ml-2" />
              الملف الشخصي
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Settings className="w-4 h-4 ml-2" />
              إعدادات الحساب
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogout} className="text-red-600">
              <LogOut className="w-4 h-4 ml-2" />
              تسجيل الخروج
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Back to Site */}
        <Button asChild variant="outline" size="sm">
          <Link to="/">العودة للموقع</Link>
        </Button>
      </div>
    </header>
  );
};

export default AdminHeader;
