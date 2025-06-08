
import React from "react";
import { Button } from "@/components/ui/button";
import { Save } from "lucide-react";
import { useTranslation } from "react-i18next";

interface QuizFormActionsProps {
  onCancel: () => void;
  isSubmitting: boolean;
}

const QuizFormActions = ({ onCancel, isSubmitting }: QuizFormActionsProps) => {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === "ar";

  return (
    <div className={`flex ${isRTL ? 'justify-start space-x-reverse space-x-4' : 'justify-end space-x-4'}`}>
      <Button
        type="button"
        variant="outline"
        onClick={onCancel}
      >
        {t("common.cancel", "Cancel")}
      </Button>
      <Button
        type="submit"
        disabled={isSubmitting}
        className={`flex items-center ${isRTL ? 'space-x-reverse space-x-2' : 'space-x-2'}`}
      >
        <Save className="w-4 h-4" />
        <span>{isSubmitting ? t("admin.quiz.creating", "Creating...") : t("admin.quiz.createQuiz", "Create Quiz")}</span>
      </Button>
    </div>
  );
};

export default QuizFormActions;
