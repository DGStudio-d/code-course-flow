
import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Form } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { getLanguages } from "@/api/languages";
import api from "@/config/axios";
import { QuizFormData, quizSchema } from "@/types/quiz-form";
import QuizCreationHeader from "@/components/quiz/QuizCreationHeader";
import QuizBasicInfo from "@/components/quiz/QuizBasicInfo";
import QuestionsSection from "@/components/quiz/QuestionsSection";
import QuizFormActions from "@/components/quiz/QuizFormActions";
import { useTranslation } from "react-i18next";

const QuizCreation = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === "ar";

  const { data: languages, isLoading: languagesLoading } = useQuery({
    queryKey: ["languages"],
    queryFn: getLanguages,
  });

  const form = useForm<QuizFormData>({
    resolver: zodResolver(quizSchema),
    defaultValues: {
      title: "",
      description: "",
      language_id: "",
      difficulty: "beginner",
      time_limit: undefined,
      questions: [
        {
          question: "",
          type: "mcq",
          points: 1,
          audio_file: "",
          options: ["", ""],
          correct_answer: "",
          explanation: "",
        },
      ],
    },
  });

  const createQuizMutation = useMutation({
    mutationFn: async (quizData: QuizFormData) => {
      const apiData = {
        ...quizData,
        language_id: parseInt(quizData.language_id),
      };
      const response = await api.post("/admin/quizzes", apiData);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-quizzes"] });
      toast({
        title: t("admin.quiz.success", "Success"),
        description: t("admin.quiz.created", "Quiz created successfully"),
      });
      navigate("/admin/quizzes");
    },
    onError: (error: any) => {
      console.log("Quiz creation error:", error);
      toast({
        title: t("admin.quiz.error", "Error"),
        description: error.response?.data?.message || t("admin.quiz.createFailed", "Failed to create quiz"),
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: QuizFormData) => {
    createQuizMutation.mutate(data);
  };

  const handleBack = () => {
    navigate("/admin/quizzes");
  };

  const handleCancel = () => {
    navigate("/admin/quizzes");
  };

  return (
    <div className={`min-h-screen bg-gray-50 ${isRTL ? 'rtl-layout' : 'ltr-layout'}`} dir={isRTL ? "rtl" : "ltr"}>
      <div className="container mx-auto px-4 py-6">
        <div className="space-y-6">
          <QuizCreationHeader onBack={handleBack} />

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <QuizBasicInfo 
                form={form} 
                languages={languages} 
                languagesLoading={languagesLoading} 
              />

              <QuestionsSection form={form} />

              <QuizFormActions 
                onCancel={handleCancel}
                isSubmitting={createQuizMutation.isPending}
              />
            </form>
          </Form>
        </div>
      </div>
    </div>
  );
};

export default QuizCreation;
