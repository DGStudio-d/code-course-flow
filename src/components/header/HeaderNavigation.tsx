import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

const HeaderNavigation = () => {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === "ar";

  const navigation = [  
    { name: t("header.home", "الرئيسية"), href: "/" },
    { name: t("header.teachers", "المعلمون"), href: "/teachers" },
    { name: t("header.contact", "اتصل بنا"), href: "/contact" },
  ];

  return (
    <nav className={`hidden md:flex items-center ${isRTL ? 'space-x-reverse space-x-8' : 'space-x-8'}`}>
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
  );
};

export default HeaderNavigation;