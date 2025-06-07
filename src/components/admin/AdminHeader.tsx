
import React from "react";
import { useTranslation } from "react-i18next";
import LanguageSwitcher from "@/components/common/LanguageSwitcher";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { LogOut, User } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

const AdminHeader = () => {
  const { t, i18n } = useTranslation();
  const { user, logout } = useAuth();
  const isRTL = i18n.language === "ar";

  const handleLogout = () => {
    logout.mutate();
  };

  const getUserInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .slice(0, 2)
      .join('')
      .toUpperCase();
  };

  return (
    <header className={`bg-white shadow-sm border-b px-6 py-4 ${isRTL ? 'text-right' : 'text-left'}`} dir={isRTL ? "rtl" : "ltr"}>
      <div className={`flex items-center justify-between ${isRTL ? 'flex-row-reverse' : ''}`}>
        <div className={`flex items-center ${isRTL ? 'space-x-reverse space-x-4' : 'space-x-4'}`}>
          <h1 className="text-2xl font-bold text-gray-900">
            {t("admin.header.title") || "لوحة تحكم الإدارة"}
          </h1>
        </div>

        <div className={`flex items-center ${isRTL ? 'space-x-reverse space-x-4' : 'space-x-4'}`}>
          <LanguageSwitcher />
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className={`flex items-center h-10 ${isRTL ? 'space-x-reverse space-x-2' : 'space-x-2'}`}>
                <Avatar className="w-8 h-8">
                  <AvatarFallback className="bg-green-100 text-green-700 text-sm font-medium">
                    {user?.name ? getUserInitials(user.name) : 'A'}
                  </AvatarFallback>
                </Avatar>
                <div className={`flex flex-col ${isRTL ? 'items-end' : 'items-start'}`}>
                  <span className="text-sm font-medium">{user?.name || 'Admin'}</span>
                  <span className="text-xs text-gray-500 capitalize">{user?.role?.name}</span>
                </div>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align={isRTL ? "start" : "end"} className="w-56">
              <DropdownMenuLabel>
                {user?.name}
                <div className="text-xs text-gray-500 capitalize">{user?.role?.name}</div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout} className="text-red-600">
                <LogOut className={`w-4 h-4 ${isRTL ? 'ml-2' : 'mr-2'}`} />
                {t("admin.sidebar.logout")}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
};

export default AdminHeader;
