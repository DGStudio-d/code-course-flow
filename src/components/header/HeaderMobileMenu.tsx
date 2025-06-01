
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { User, LogOut } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/hooks/useAuth';
import LanguageSwitcher from '@/components/common/LanguageSwitcher';

interface HeaderMobileMenuProps {
  isMenuOpen: boolean;
  setIsMenuOpen: (open: boolean) => void;
}

const HeaderMobileMenu = ({ isMenuOpen, setIsMenuOpen }: HeaderMobileMenuProps) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user, logout, isAuthenticated } = useAuth();

  const navigation = [  
    { name: t("header.home"), href: "/" },
    { name: t("header.teachers"), href: "/teachers" },
    { name: t("header.contact"), href: "/contact" },
  ];

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

  if (!isMenuOpen) return null;

  return (
    <div className="md:hidden py-4 border-t border-green-100">
      <nav className="flex flex-col space-y-4">
        {navigation.map((item) => (
          <Link
            key={item.name}
            to={item.href}
            className="text-gray-700 hover:text-primary-600 font-medium py-2"
            onClick={() => setIsMenuOpen(false)}
          >
            {item.name}
          </Link>
        ))}
        <div className="pt-4 space-y-2">
          <LanguageSwitcher />
          {isAuthenticated ? (
            <>
              <Button
                variant="ghost"
                size="sm"
                className="w-full justify-start"
                asChild
              >
                <Link to={getUserDashboardLink()}>
                  <User className="w-4 h-4 mr-2" />
                  Dashboard ({user?.role?.name})
                </Link>
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="w-full justify-start text-red-600"
                onClick={handleLogout}
              >
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </Button>
            </>
          ) : (
            <>
              <Button
                variant="ghost"
                size="sm"
                className="w-full justify-center"
                asChild
              >
                <Link to="/auth">
                  <User className="w-4 h-4 ml-2" />
                  تسجيل الدخول
                </Link>
              </Button>
              <Button
                size="sm"
                className="w-full bg-green-gradient hover:opacity-90"
                onClick={() => navigate("/inscription")}
              >
                إنشاء حساب
              </Button>
            </>
          )}
        </div>
      </nav>
    </div>
  );
};

export default HeaderMobileMenu;
