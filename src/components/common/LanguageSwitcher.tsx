import React from 'react';
import { Globe } from 'lucide-react';
import { useLanguage, SupportedLanguage } from '@/contexts/LanguageContext';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';

const LanguageSwitcher: React.FC = () => {
  const { language, setLanguage, dir } = useLanguage();

  const languageOptions: { code: SupportedLanguage, name: string, flag: string, isRtl: boolean }[] = [
    { code: 'ar', name: 'العربية', flag: '🇸🇦', isRtl: true },
    { code: 'en', name: 'English', flag: '🇬🇧', isRtl: false },
    { code: 'es', name: 'Español', flag: '🇪🇸', isRtl: false }
  ];

  // Find current language details
  const currentLanguage = languageOptions.find(option => option.code === language);
  const isRTL = dir === 'rtl';

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="outline" 
          size="sm" 
          className={`flex items-center gap-2 bg-background ${isRTL ? 'flex-row-reverse' : ''}`}
        >
          <Globe className="h-4 w-4" />
          <span>{currentLanguage?.flag}</span>
          <span className="hidden md:inline">{currentLanguage?.name}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align={isRTL ? "start" : "end"} className="w-40 bg-background">
        {languageOptions.map((option) => (
          <DropdownMenuItem
            key={option.code}
            onClick={() => setLanguage(option.code)}
            className={`flex items-center gap-2 cursor-pointer ${isRTL ? 'flex-row-reverse' : ''}`}
          >
            <span>{option.flag}</span>
            <span>{option.name}</span>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default LanguageSwitcher;