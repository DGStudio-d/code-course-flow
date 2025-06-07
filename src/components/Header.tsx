
import React, { useState } from 'react';
import { Menu, X } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import HeaderLogo from './header/HeaderLogo';
import HeaderNavigation from './header/HeaderNavigation';
import HeaderAuthSection from './header/HeaderAuthSection';
import HeaderMobileMenu from './header/HeaderMobileMenu';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { dir } = useLanguage();

  return (
    <header className={`bg-white shadow-sm border-b sticky top-0 z-50 ${dir === 'rtl' ? 'text-right' : 'text-left'}`} dir={dir}>
      <div className="container mx-auto px-4">
        <div className={`flex justify-between items-center h-16 ${dir === 'rtl' ? 'flex-row-reverse' : ''}`}>
          {/* Logo */}
          <HeaderLogo />

          {/* Desktop Navigation */}
          <HeaderNavigation />

          {/* Auth Section */}
          <HeaderAuthSection />

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className={`inline-flex items-center justify-center p-2 rounded-md text-gray-700 hover:text-primary-600 focus:outline-none ${dir === 'rtl' ? 'ml-2' : 'mr-2'}`}
            >
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        <HeaderMobileMenu isMenuOpen={isMenuOpen} setIsMenuOpen={setIsMenuOpen} />
      </div>
    </header>
  );
};

export default Header;
