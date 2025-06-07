
import React from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useNavigate } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { ArrowLeft, Save, Plus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { getLanguages } from "@/api/languages";
import api from "@/config/axios";
import QuizBasicInfo from "@/components/quiz/QuizBasicInfo";
import QuestionForm from "@/components/quiz/QuestionForm";

const questionSchema = z.object({
  question: z.string().min(1, "Question text is required").max(500, "Question text cannot exceed 500 characters"),
  type: z.enum(["mcq", "fill", "true_false"], {
    required_error: "Question type must be selected",
  }),
  points: z.number().min(1, "Points must be between 1 and 10").max(10, "Points must be between 1 and 10"),
  audio_file: z.string().optional(),
  options: z.array(z.string().min(1, "Option cannot be empty").max(200, "Option cannot exceed 200 characters")).optional(),
  correct_answer: z.string().min(1, "Correct answer is required").max(200, "Correct answer cannot exceed 200 characters"),
  explanation: z.string().min(1, "Explanation is required"),
}).refine((data) => {
  // For MCQ and True/False, options are required
  if (data.type === "mcq" || data.type === "true_false") {
    if (!data.options || data.options.length < 2 || data.options.length > 6) {
      return false;
    }
    // Correct answer must match one of the options
    return data.options.includes(data.correct_answer);
  }
  // For fill type, no options validation needed
  return true;
}, {
  message: "For MCQ and True/False: Options (2-6) are required and correct answer must match one of the options",
});

const quizSchema = z.object({
  title: z.string().min(1, "Title is required").max(255, "Title cannot exceed 255 characters"),
  description: z.string().max(1000, "Description cannot exceed 1000 characters").optional(),
  language_id: z.string().min(1, "Language is required"),
  difficulty: z.enum(["beginner", "intermediate", "advanced"], {
    required_error: "Difficulty is required",
  }),
  time_limit: z.number().min(1).max(300).optional(),
  questions: z.array(questionSchema).min(1, "At least one question is required").max(50, "Maximum 50 questions allowed"),
});

type QuizFormData = z.infer<typeof quizSchema>;

const QuizCreation = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();

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

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "questions",
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
      queryClient.invalidateQueries({ queryKey: ["quizzes"] });
      toast({
        title: "Success",
        description: "Quiz created successfully",
      });
      navigate("/admin/quizzes");
    },
    onError: (error: any) => {
      console.log("error handling Quiz creation : ",error)
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to create quiz",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: QuizFormData) => {
    createQuizMutation.mutate(data);
  };

  const addQuestion = () => {
    append({
      question: "",
      type: "mcq",
      points: 1,
      audio_file: "",
      options: ["", ""],
      correct_answer: "",
      explanation: "",
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button
            variant="ghost"
            onClick={() => navigate("/admin/quizzes")}
            className="flex items-center space-x-2"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Quizzes</span>
          </Button>
          <h1 className="text-3xl font-bold text-gray-900">Create New Quiz</h1>
        </div>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <QuizBasicInfo 
            form={form} 
            languages={languages} 
            languagesLoading={languagesLoading} 
          />

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">❓ Questions (Min: 1, Max: 50)</h3>
              <Button
                type="button"
                variant="outline"
                onClick={addQuestion}
                disabled={fields.length >= 50}
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Another Question
              </Button>
            </div>

            {fields.map((field, questionIndex) => (
              <QuestionForm
                key={field.id}
                form={form}
                questionIndex={questionIndex}
                onRemove={() => remove(questionIndex)}
                canRemove={fields.length > 1}
              />
            ))}
          </div>

          <div className="flex justify-end space-x-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate("/admin/quizzes")}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={createQuizMutation.isPending}
              className="flex items-center space-x-2"
            >
              <Save className="w-4 h-4" />
              <span>{createQuizMutation.isPending ? "Creating..." : "Create Quiz"}</span>
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
};

export default QuizCreation;
