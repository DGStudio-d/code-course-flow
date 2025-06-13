import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { User, LogOut } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import LanguageSwitcher from '@/components/common/LanguageSwitcher';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

const HeaderAuthSection = () => {
  const navigate = useNavigate();
  const { user, logout, isAuthenticated } = useAuth();
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === "ar";

  const handleLogout = () => {
    logout.mutate();
    navigate('/');
  };

  const getUserDashboardLink = () => {
    if (!user) return '/';
    
    switch (user.role?.name) {
      case 'admin': return '/admin';
      case 'teacher': return '/teacher-dashboard';
      case 'student': return '/student-dashboard';
      default: return '/';
    }
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
    <div className={`hidden md:flex items-center ${isRTL ? 'space-x-reverse space-x-4' : 'space-x-4'}`}>
      <LanguageSwitcher />
      {isAuthenticated ? (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className={`flex items-center h-10 ${isRTL ? 'space-x-reverse space-x-2' : 'space-x-2'}`}>
              <Avatar className="w-8 h-8">
                <AvatarFallback className="bg-green-100 text-green-700 text-sm font-medium">
                  {user?.name ? getUserInitials(user.name) : 'U'}
                </AvatarFallback>
              </Avatar>
              <div className={`flex flex-col ${isRTL ? 'items-end' : 'items-start'}`}>
                <span className="text-sm font-medium">{user?.name || 'User'}</span>
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
            <DropdownMenuItem asChild>
              <Link to={getUserDashboardLink()}>
                {t("header.dashboard", "لوحة التحكم")}
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogout} className="text-red-600">
              <LogOut className={`w-4 h-4 ${isRTL ? 'ml-2' : 'mr-2'}`} />
              {t("header.logout", "تسجيل الخروج")}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ) : (
        <Button variant="ghost" size="sm" asChild>
          <Link to="/auth">
            <User className={`w-4 h-4 ${isRTL ? 'ml-2' : 'mr-2'}`} />
            {t("header.login", "تسجيل الدخول")}
          </Link>
        </Button>
      )}
    </div>
  );
};

export default HeaderAuthSection;