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

interface LanguageCardProps {
  language: Language;
  onSelectLanguage: (languageId: string, difficulty: string) => void;
}

const LanguageCard = ({ language, onSelectLanguage }: LanguageCardProps) => {
  const getFlagEmoji = (code: string): string => {
    const flags: { [key: string]: string } = {
      en: "🇺🇸",
      fr: "🇫🇷",
      de: "🇩🇪",
      es: "🇪🇸",
      it: "🇮🇹",
    };
    return flags[code] || "🌍";
  };
  console.log("LanguageCard rendered for:", language?.teachers?.length);

  return (
    <Card className="group hover:shadow-xl transition-all duration-300 hover:-translate-y-2 border-green-100 hover:border-green-300">
      <CardHeader className="text-center">
        <div className="text-4xl mb-4">{language.flag}</div>
        <CardTitle className="text-xl font-bold text-gray-900 group-hover:text-primary-600 transition-colors">
          {language.name}
        </CardTitle>
      </CardHeader>

      <CardContent className="text-center space-y-4">
        {/* <div className="flex justify-center gap-2 flex-wrap">
          {language.difficultyLevels.map((level) => (
            <Badge key={level} variant="secondary" className="text-sm">
              {level}
            </Badge>
          ))}
        </div> */}

        <div className="flex justify-center gap-6 text-sm text-gray-600">
          <div className="flex items-center gap-1">
            <GraduationCap className="w-4 h-4" />
            <span>{language?.teachers?.length } معلم</span>
          </div>
        </div>
      </CardContent>

      {/* <CardFooter className="flex flex-col gap-2">
        {language.difficultyLevels.map((difficulty) => (
          <Button
            key={difficulty}
            variant={difficulty === 'مبتدئ' ? 'default' : 'outline'}
            size="sm"
            className="w-full"
            onClick={() => onSelectLanguage(language.id, difficulty)}
          >
            ابدأ مستوى {difficulty}
          </Button>
        ))}
      </CardFooter> */}
    </Card>
  );
};

export default LanguageCard;
