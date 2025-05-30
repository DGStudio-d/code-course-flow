
import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, X } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import LanguageSwitcher from "./LanguageSwitcher";
import Logo from "./Logo";
import { Button } from "../ui/button";

const NavBar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { t, dir } = useLanguage();
  const location = useLocation();

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  const navLinks = [
    { name: t('nav.home'), path: "/" },
    { name: t('nav.professors'), path: "/professors" },
    { name: t('nav.languages'), path: "/languages" },
    { name: t('nav.register'), path: "/register" },
    { name: t('nav.contact'), path: "/contact" },
  ];

  return (
    <nav className={`bg-white shadow-md sticky top-0 z-50 ${dir === 'rtl' ? 'text-right' : 'text-left'}`} dir={dir}>
      <div className="container mx-auto px-4">
        <div className="flex justify-between h-16 items-center">
          <div className="flex">
            <Link to="/" className="flex-shrink-0 flex items-center">
              <Logo />
            </Link>
          </div>
          
          <div className="hidden md:flex items-center space-x-4 rtl:space-x-reverse">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors
                  ${
                    location.pathname === link.path
                      ? "text-academy-green border-b-2 border-academy-green"
                      : "text-gray-700 hover:text-academy-green"
                  }`}
              >
                {link.name}
              </Link>
            ))}
            <Button
              variant="default"
              className="bg-academy-green hover:bg-opacity-90"
              asChild
            >
              <Link to="/register">{t('button.register')}</Link>
            </Button>
            
            {/* Language switcher dropdown */}
            <LanguageSwitcher />
          </div>

          <div className="md:hidden flex items-center">
            <LanguageSwitcher />
            <button
              onClick={toggleMenu}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-700 hover:text-academy-green focus:outline-none ml-2"
            >
              {isOpen ? <X /> : <Menu />}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {isOpen && (
          <div className="md:hidden">
            <div className="pt-2 pb-4 space-y-1">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  onClick={() => setIsOpen(false)}
                  className={`block px-3 py-2 rounded-md text-base font-medium ${
                    location.pathname === link.path
                      ? "text-academy-green bg-gray-50"
                      : "text-gray-700 hover:bg-gray-50 hover:text-academy-green"
                  }`}
                >
                  {link.name}
                </Link>
              ))}
              <Button
                variant="default"
                className="w-full bg-academy-green hover:bg-opacity-90 mt-2"
                onClick={() => {
                  setIsOpen(false);
                }}
                asChild
              >
                <Link to="/register">{t('button.register')}</Link>
              </Button>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default NavBar;
