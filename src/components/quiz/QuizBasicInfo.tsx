
import React from "react";
import { UseFormReturn } from "react-hook-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { QuizFormData } from "@/types/quiz-form";
import { useTranslation } from "react-i18next";

interface QuizBasicInfoProps {
  form: UseFormReturn<QuizFormData>;
  languages?: { data?: any[] };
  languagesLoading: boolean;
}

const QuizBasicInfo = ({ form, languages, languagesLoading }: QuizBasicInfoProps) => {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === "ar";

  return (
    <Card className={isRTL ? 'text-right' : 'text-left'}>
      <CardHeader>
        <CardTitle>🏷️ {t("admin.quiz.quizInformation", "Quiz Information")}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("admin.quiz.title", "Title")} ({t("common.required", "required")}) *</FormLabel>
                <FormControl>
                  <Input 
                    {...field} 
                    placeholder={t("admin.quiz.titlePlaceholder", "Enter a unique title (max 255 characters)")}
                    className={isRTL ? 'text-right' : 'text-left'} 
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="language_id"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("admin.quiz.language", "Language")} ({t("common.required", "required")}) *</FormLabel>
                <Select onValueChange={field.onChange} value={field.value} dir={isRTL ? "rtl" : "ltr"}>
                  <FormControl>
                    <SelectTrigger className={isRTL ? 'text-right' : 'text-left'}>
                      <SelectValue placeholder={t("admin.quiz.selectLanguage", "Select language")} />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {!languagesLoading && languages?.data?.map((language: any) => (
                      <SelectItem key={language.id} value={language.id.toString()}>
                        {language.flag} {language.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="difficulty"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("admin.quiz.difficulty", "Difficulty")} ({t("common.required", "required")}) *</FormLabel>
                <Select onValueChange={field.onChange} value={field.value} dir={isRTL ? "rtl" : "ltr"}>
                  <FormControl>
                    <SelectTrigger className={isRTL ? 'text-right' : 'text-left'}>
                      <SelectValue placeholder={t("admin.quiz.chooseDifficulty", "Choose difficulty")} />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="beginner">{t("admin.quiz.beginner", "Beginner")}</SelectItem>
                    <SelectItem value="intermediate">{t("admin.quiz.intermediate", "Intermediate")}</SelectItem>
                    <SelectItem value="advanced">{t("admin.quiz.advanced", "Advanced")}</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="time_limit"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("admin.quiz.timeLimit", "Time Limit")} ({t("common.optional", "optional")})</FormLabel>
                <FormControl>
                  <Input 
                    {...field} 
                    type="number" 
                    placeholder={t("admin.quiz.timeLimitPlaceholder", "Duration in minutes (1-300)")}
                    onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : undefined)}
                    value={field.value || ""}
                    className={isRTL ? 'text-right' : 'text-left'}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem className="mt-4">
              <FormLabel>{t("admin.quiz.description", "Description")} ({t("common.optional", "optional")})</FormLabel>
              <FormControl>
                <Textarea 
                  {...field} 
                  placeholder={t("admin.quiz.descriptionPlaceholder", "Briefly describe your quiz (max 1000 characters)")}
                  rows={3}
                  className={isRTL ? 'text-right' : 'text-left'}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </CardContent>
    </Card>
  );
};

export default QuizBasicInfo;
