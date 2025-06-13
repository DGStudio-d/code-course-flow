import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Users, GraduationCap } from "lucide-react";
import { Language } from "@/types";
import { useTranslation } from "react-i18next";

interface LanguageCardProps {
  language: Language;
  onSelectLanguage: (languageId: string, difficulty: string) => void;
}

const LanguageCard = ({ language, onSelectLanguage }: LanguageCardProps) => {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === "ar";

  return (
    <Card className="group hover:shadow-xl transition-all duration-300 hover:-translate-y-2 border-green-100 hover:border-green-300">
      <CardHeader className="text-center">
        <div className="text-4xl mb-4">{language.flag}</div>
        <CardTitle className="text-xl font-bold text-gray-900 group-hover:text-primary-600 transition-colors">
          {language.name}
        </CardTitle>
      </CardHeader>

      <CardContent className="text-center space-y-4">
        <div className={`flex justify-center gap-6 text-sm text-gray-600 ${isRTL ? 'flex-row-reverse' : ''}`}>
          <div className={`flex items-center gap-1 ${isRTL ? 'flex-row-reverse' : ''}`}>
            <GraduationCap className="w-4 h-4" />
            <span>{language?.teachers?.length || 0} {t('teachers.teacher', 'معلم')}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default LanguageCard;