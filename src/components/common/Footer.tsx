import { Link } from "react-router-dom";
import { Facebook, Globe, Instagram, Twitter, Youtube } from "lucide-react";
import { useTranslation } from "react-i18next";

const Footer = () => {
  const currentYear = new Date().getFullYear();
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === "ar";

  return (
    <footer className="bg-gray-900 text-white py-12" dir={isRTL ? "rtl" : "ltr"}>
      <div className="container mx-auto px-4">
        <div className="grid md:grid-cols-4 gap-8">
          <div>
            <div className={`flex items-center mb-4 ${isRTL ? 'space-x-reverse space-x-2' : 'space-x-2'}`}>
              <div className="w-8 h-8 bg-green-gradient rounded-lg flex items-center justify-center">
                <Globe className="w-5 h-5 text-white" />
              </div>
              <span className="text-2xl font-bold">{t("footer.siteName", "عندنا")}</span>
            </div>
            <p className="text-gray-400">
              {t("footer.description", "منصة تعليم اللغات الرائدة في المنطقة")}
            </p>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-4">{t("footer.quickLinks", "روابط سريعة")}</h3>
            <ul className="space-y-2 text-gray-400">
              <li>
                <Link to="/" className="hover:text-white transition-colors">
                  {t("header.home", "الرئيسية")}
                </Link>
              </li>
              <li>
                <Link to="/courses" className="hover:text-white transition-colors">
                  {t("header.courses", "الدورات")}
                </Link>
              </li>
              <li>
                <Link to="/teachers" className="hover:text-white transition-colors">
                  {t("header.teachers", "المعلمون")}
                </Link>
              </li>
              <li>
                <Link to="/contact" className="hover:text-white transition-colors">
                  {t("header.contact", "تواصل معنا")}
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-4">{t("footer.languages", "اللغات")}</h3>
            <ul className="space-y-2 text-gray-400">
              <li>
                <a href="#" className="hover:text-white transition-colors">
                  {t("languages.english", "الإنجليزية")}
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white transition-colors">
                  {t("languages.french", "الفرنسية")}
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white transition-colors">
                  {t("languages.german", "الألمانية")}
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white transition-colors">
                  {t("languages.spanish", "الإسبانية")}
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-4">{t("footer.contactUs", "تواصل معنا")}</h3>
            <div className="space-y-2 text-gray-400">
              <p>info@learnacademy.com</p>
              <p>+966 50 123 4567</p>
              <p>{t("footer.address", "الرياض، المملكة العربية السعودية")}</p>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
          <p>&copy; {currentYear} {t("footer.siteName", "عندنا")}. {t("footer.rights", "جميع الحقوق محفوظة")}.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;