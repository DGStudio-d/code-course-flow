
import { Link } from 'react-router-dom';
import { Globe } from 'lucide-react';

const HeaderLogo = () => {
  return (
    <Link
      to="/"
      className="flex items-center space-x-2 rtl:space-x-reverse"
    >
      <div className="w-8 h-8 bg-green-gradient rounded-lg flex items-center justify-center">
        <Globe className="w-5 h-5 text-white" />
      </div>
      <span className="text-2xl font-bold bg-green-gradient bg-clip-text text-transparent">
        Learn academy
      </span>
    </Link>
  );
};

export default HeaderLogo;
