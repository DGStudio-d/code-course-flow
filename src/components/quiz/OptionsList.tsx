
import React from "react";
import { UseFormReturn } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Plus, Trash2 } from "lucide-react";
import { QuizFormData } from "@/types/quiz-form";
import { useTranslation } from "react-i18next";

type QuestionType = "mcq" | "fill" | "true_false";

interface OptionsListProps {
  form: UseFormReturn<QuizFormData>;
  questionIndex: number;
  questionType: QuestionType;
  options: string[];
  onAddOption: () => void;
  onRemoveOption: (optionIndex: number) => void;
}

const OptionsList = ({ form, questionIndex, options, onAddOption, onRemoveOption }: OptionsListProps) => {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === "ar";

  return (
    <div className="mt-4 space-y-2">
      <FormLabel>{t("admin.quiz.optionsRequired", "Options (2-6 required)")} *</FormLabel>
      {options.map((_, optionIndex) => (
        <div key={optionIndex} className={`flex gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
          <FormField
            control={form.control}
            name={`questions.${questionIndex}.options.${optionIndex}`}
            render={({ field }) => (
              <FormItem className="flex-1">
                <FormControl>
                  <Input 
                    {...field} 
                    placeholder={`${t("admin.quiz.option", "Option")} ${optionIndex + 1} (${t("admin.quiz.maxCharacters", "max 200 characters")})`}
                    className={isRTL ? 'text-right' : 'text-left'}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          {options.length > 2 && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => onRemoveOption(optionIndex)}
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          )}
        </div>
      ))}
      {options.length < 6 && (
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={onAddOption}
          className={`flex items-center ${isRTL ? 'space-x-reverse space-x-2' : 'space-x-2'}`}
        >
          <Plus className="w-4 h-4" />
          <span>{t("admin.quiz.addOption", "Add Option")}</span>
        </Button>
      )}
    </div>
  );
};

export default OptionsList;
