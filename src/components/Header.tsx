
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Menu, X, Globe, User } from 'lucide-react';
import { Link } from 'react-router-dom';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const navigation = [
    { name: 'الرئيسية', href: '/' },
    { name: 'الدورات', href: '/courses' },
    { name: 'المعلمون', href: '/teachers' },
    { name: 'الاختبارات', href: '/quiz' },
    { name: 'تواصل معنا', href: '/contact' },
  ];

  return (
    <header className="bg-white/95 backdrop-blur-sm border-b border-green-100 sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2 rtl:space-x-reverse">
            <div className="w-8 h-8 bg-green-gradient rounded-lg flex items-center justify-center">
              <Globe className="w-5 h-5 text-white" />
            </div>
            <span className="text-2xl font-bold bg-green-gradient bg-clip-text text-transparent">
              عندنا
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8 rtl:space-x-reverse">
            {navigation.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                className="text-gray-700 hover:text-primary-600 font-medium transition-colors duration-200"
              >
                {item.name}
              </Link>
            ))}
          </nav>

          {/* Auth Buttons */}
          <div className="hidden md:flex items-center space-x-4 rtl:space-x-reverse">
            <Button variant="ghost" size="sm">
              <User className="w-4 h-4 ml-2" />
              تسجيل الدخول
            </Button>
            <Button size="sm" className="bg-green-gradient hover:opacity-90">
              إنشاء حساب
            </Button>
          </div>

          {/* Mobile menu button */}
          <Button
            variant="ghost"
            size="sm"
            className="md:hidden"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </Button>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
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
                <Button variant="ghost" size="sm" className="w-full justify-center">
                  <User className="w-4 h-4 ml-2" />
                  تسجيل الدخول
                </Button>
                <Button size="sm" className="w-full bg-green-gradient hover:opacity-90">
                  إنشاء حساب
                </Button>
              </div>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
