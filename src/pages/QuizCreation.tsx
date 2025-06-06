
import React, { useState } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useNavigate } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
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
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { ArrowLeft, Save, Plus, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { getLanguages } from "@/api/languages";
import api from "@/config/axios";

const questionSchema = z.object({
  question: z.string().min(1, "Question text is required").max(500, "Question text cannot exceed 500 characters"),
  type: z.enum(["mcq", "fill", "true_false"], {
    required_error: "Question type must be selected",
  }),
  points: z.number().min(1, "Points must be between 1 and 10").max(10, "Points must be between 1 and 10"),
  audio_file: z.string().optional(),
  options: z.array(z.string().min(1, "Option cannot be empty").max(200, "Option cannot exceed 200 characters")).min(2, "At least 2 options required").max(6, "Maximum 6 options allowed"),
  correct_answer: z.string().min(1, "Correct answer is required").max(200, "Correct answer cannot exceed 200 characters"),
  explanation: z.string().min(1, "Explanation is required"),
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
}).refine((data) => {
  // Validate that correct_answer matches one of the options for each question
  return data.questions.every(question => 
    question.options.includes(question.correct_answer)
  );
}, {
  message: "Correct answer must match one of the provided options",
  path: ["questions"],
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

  const addOption = (questionIndex: number) => {
    const currentOptions = form.getValues(`questions.${questionIndex}.options`);
    if (currentOptions.length < 6) {
      form.setValue(`questions.${questionIndex}.options`, [...currentOptions, ""]);
    }
  };

  const removeOption = (questionIndex: number, optionIndex: number) => {
    const currentOptions = form.getValues(`questions.${questionIndex}.options`);
    if (currentOptions.length > 2) {
      const newOptions = currentOptions.filter((_, index) => index !== optionIndex);
      form.setValue(`questions.${questionIndex}.options`, newOptions);
      
      // Clear correct answer if it was the removed option
      const correctAnswer = form.getValues(`questions.${questionIndex}.correct_answer`);
      if (correctAnswer === currentOptions[optionIndex]) {
        form.setValue(`questions.${questionIndex}.correct_answer`, "");
      }
    }
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

      <Card>
        <CardHeader>
          <CardTitle>🏷️ Quiz Information</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Title (required) *</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="Enter a unique title (max 255 characters)" />
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
                      <FormLabel>Language (required) *</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select language" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {languages?.data?.map((language: any) => (
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
                      <FormLabel>Difficulty (required) *</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Choose difficulty" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="beginner">Beginner</SelectItem>
                          <SelectItem value="intermediate">Intermediate</SelectItem>
                          <SelectItem value="advanced">Advanced</SelectItem>
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
                      <FormLabel>Time Limit (optional)</FormLabel>
                      <FormControl>
                        <Input 
                          {...field} 
                          type="number" 
                          placeholder="Duration in minutes (1-300)" 
                          onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : undefined)}
                          value={field.value || ""}
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
                  <FormItem>
                    <FormLabel>Description (optional)</FormLabel>
                    <FormControl>
                      <Textarea 
                        {...field} 
                        placeholder="Briefly describe your quiz (max 1000 characters)" 
                        rows={3}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Questions Section */}
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
                  <Card key={field.id} className="p-4">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="font-medium">Question {questionIndex + 1}</h4>
                      {fields.length > 1 && (
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => remove(questionIndex)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name={`questions.${questionIndex}.question`}
                        render={({ field }) => (
                          <FormItem className="md:col-span-2">
                            <FormLabel>Question Text (required) *</FormLabel>
                            <FormControl>
                              <Textarea 
                                {...field} 
                                placeholder="Enter your question (max 500 characters)" 
                                rows={2}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name={`questions.${questionIndex}.type`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Question Type (required) *</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select question type" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="mcq">Multiple Choice</SelectItem>
                                <SelectItem value="fill">Fill in the Blank</SelectItem>
                                <SelectItem value="true_false">True/False</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name={`questions.${questionIndex}.points`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Points (required) *</FormLabel>
                            <FormControl>
                              <Input 
                                {...field} 
                                type="number" 
                                placeholder="1-10 points" 
                                min={1}
                                max={10}
                                onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : 1)}
                                value={field.value || 1}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name={`questions.${questionIndex}.audio_file`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Audio File (optional)</FormLabel>
                            <FormControl>
                              <Input {...field} placeholder="Audio file URL" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name={`questions.${questionIndex}.explanation`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Explanation (required) *</FormLabel>
                            <FormControl>
                              <Textarea 
                                {...field} 
                                placeholder="Provide an explanation for the correct answer" 
                                rows={2}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    {/* Options */}
                    <div className="mt-4 space-y-2">
                      <FormLabel>Options (2-6 required) *</FormLabel>
                      {form.watch(`questions.${questionIndex}.options`).map((_, optionIndex) => (
                        <div key={optionIndex} className="flex gap-2">
                          <FormField
                            control={form.control}
                            name={`questions.${questionIndex}.options.${optionIndex}`}
                            render={({ field }) => (
                              <FormItem className="flex-1">
                                <FormControl>
                                  <Input 
                                    {...field} 
                                    placeholder={`Option ${optionIndex + 1} (max 200 characters)`} 
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          {form.watch(`questions.${questionIndex}.options`).length > 2 && (
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => removeOption(questionIndex, optionIndex)}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          )}
                        </div>
                      ))}
                      {form.watch(`questions.${questionIndex}.options`).length < 6 && (
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => addOption(questionIndex)}
                        >
                          <Plus className="w-4 h-4 mr-2" />
                          Add Option
                        </Button>
                      )}
                    </div>

                    <FormField
                      control={form.control}
                      name={`questions.${questionIndex}.correct_answer`}
                      render={({ field }) => (
                        <FormItem className="mt-4">
                          <FormLabel>Correct Answer (required) *</FormLabel>
                          <FormControl>
                            <Input 
                              {...field} 
                              placeholder="Must exactly match one of the options above" 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </Card>
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
        </CardContent>
      </Card>
    </div>
  );
};

export default QuizCreation;
