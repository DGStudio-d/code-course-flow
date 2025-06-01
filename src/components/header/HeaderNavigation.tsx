
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

const HeaderNavigation = () => {
  const { t } = useTranslation();

  const navigation = [  
    { name: t("header.home"), href: "/" },
    { name: t("header.teachers"), href: "/teachers" },
    { name: t("header.contact"), href: "/contact" },
  ];

  return (
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
  );
};

export default HeaderNavigation;
