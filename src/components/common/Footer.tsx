
import { Link } from "react-router-dom";
import Logo from "./Logo";
import { Facebook, Globe, Instagram, Twitter, Youtube } from "lucide-react";

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-900 text-white py-12">
      <div className="container mx-auto px-4">
        <div className="grid md:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center space-x-2 rtl:space-x-reverse mb-4">
              <div className="w-8 h-8 bg-green-gradient rounded-lg flex items-center justify-center">
                <Globe className="w-5 h-5 text-white" />
              </div>
              <span className="text-2xl font-bold">عندنا</span>
            </div>
            <p className="text-gray-400">
              منصة تعليم اللغات الرائدة في المنطقة
            </p>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-4">روابط سريعة</h3>
            <ul className="space-y-2 text-gray-400">
              <li>
                <a href="/" className="hover:text-white transition-colors">
                  الرئيسية
                </a>
              </li>
              <li>
                <a
                  href="/courses"
                  className="hover:text-white transition-colors"
                >
                  الدورات
                </a>
              </li>
              <li>
                <a
                  href="/teachers"
                  className="hover:text-white transition-colors"
                >
                  المعلمون
                </a>
              </li>
              <li>
                <a
                  href="/contact"
                  className="hover:text-white transition-colors"
                >
                  تواصل معنا
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-4">اللغات</h3>
            <ul className="space-y-2 text-gray-400">
              <li>
                <a href="#" className="hover:text-white transition-colors">
                  الإنجليزية
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white transition-colors">
                  الفرنسية
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white transition-colors">
                  الألمانية
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white transition-colors">
                  الإسبانية
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-4">تواصل معنا</h3>
            <div className="space-y-2 text-gray-400">
              <p>info@learnacademy.com</p>
              <p>+966 50 123 4567</p>
              <p>الرياض، المملكة العربية السعودية</p>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
          <p>&copy; 2024 عندنا. جميع الحقوق محفوظة.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
