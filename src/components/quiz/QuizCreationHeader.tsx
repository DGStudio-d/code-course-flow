
import React from "react";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { useTranslation } from "react-i18next";

interface QuizCreationHeaderProps {
  onBack: () => void;
}

const QuizCreationHeader = ({ onBack }: QuizCreationHeaderProps) => {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === "ar";

  return (
    <div className={`flex items-center justify-between ${isRTL ? 'flex-row-reverse' : ''}`}>
      <div className={`flex items-center ${isRTL ? 'space-x-reverse space-x-4' : 'space-x-4'}`}>
        <Button
          variant="ghost"
          onClick={onBack}
          className={`flex items-center ${isRTL ? 'space-x-reverse space-x-2' : 'space-x-2'}`}
        >
          {isRTL ? <ArrowRight className="w-4 h-4" /> : <ArrowLeft className="w-4 h-4" />}
          <span>{t("admin.quiz.backToQuizzes", "Back to Quizzes")}</span>
        </Button>
        <h1 className="text-3xl font-bold text-gray-900">
          {t("admin.quiz.createNew", "Create New Quiz")}
        </h1>
      </div>
    </div>
  );
};

export default QuizCreationHeader;
