
import React from "react";
import { UseFormReturn } from "react-hook-form";
import { Trash2, Plus, Minus } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { QuizFormData } from "@/types/quiz-form";
import OptionsList from "./OptionsList";

type QuestionType = "mcq" | "fill" | "true_false";

interface QuestionFormProps {
  form: UseFormReturn<QuizFormData>;
  questionIndex: number;
  onRemove: () => void;
  canRemove: boolean;
}

const QuestionForm: React.FC<QuestionFormProps> = ({
  form,
  questionIndex,
  onRemove,
  canRemove,
}) => {
  const questionType = form.watch(`questions.${questionIndex}.type`) as QuestionType;
  const questionOptions = form.watch(`questions.${questionIndex}.options`) || [];

  const addOption = () => {
    const currentOptions = form.getValues(`questions.${questionIndex}.options`) || [];
    if (currentOptions.length < 6) {
      form.setValue(`questions.${questionIndex}.options`, [...currentOptions, ""]);
    }
  };

  const removeOption = (optionIndex: number) => {
    const currentOptions = form.getValues(`questions.${questionIndex}.options`) || [];
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

  const handleTypeChange = (newType: string) => {
    const typedNewType = newType as QuestionType;
    form.setValue(`questions.${questionIndex}.type`, typedNewType);
    
    // Reset options and correct answer when changing type
    if (typedNewType === "fill") {
      form.setValue(`questions.${questionIndex}.options`, []);
    } else if (typedNewType === "true_false") {
      form.setValue(`questions.${questionIndex}.options`, ["True", "False"]);
      form.setValue(`questions.${questionIndex}.correct_answer`, "");
    } else if (typedNewType === "mcq") {
      form.setValue(`questions.${questionIndex}.options`, ["", ""]);
      form.setValue(`questions.${questionIndex}.correct_answer`, "");
    }
  };

  return (
    <Card className="border-2">
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle className="text-lg">Question {questionIndex + 1}</CardTitle>
          {canRemove && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onRemove}
              className="text-red-600 hover:text-red-700"
            >
              <Trash2 className="w-4 h-4 mr-1" />
              Remove
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <FormField
          control={form.control}
          name={`questions.${questionIndex}.question`}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Question Text *</FormLabel>
              <FormControl>
                <Textarea
                  {...field}
                  placeholder="Enter your question here..."
                  className="min-h-[80px]"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name={`questions.${questionIndex}.type`}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Question Type *</FormLabel>
                <Select onValueChange={handleTypeChange} value={field.value}>
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
                <FormLabel>Points (1-10) *</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    min="1"
                    max="10"
                    {...field}
                    onChange={(e) => field.onChange(parseInt(e.target.value) || 1)}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name={`questions.${questionIndex}.audio_file`}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Audio File URL (Optional)</FormLabel>
              <FormControl>
                <Input {...field} placeholder="https://example.com/audio.mp3" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {(questionType === "mcq" || questionType === "true_false") && (
          <OptionsList
            form={form}
            questionIndex={questionIndex}
            questionType={questionType}
            options={questionOptions}
            onAddOption={addOption}
            onRemoveOption={removeOption}
          />
        )}

        <FormField
          control={form.control}
          name={`questions.${questionIndex}.correct_answer`}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Correct Answer *</FormLabel>
              <FormControl>
                {questionType === "mcq" || questionType === "true_false" ? (
                  <Select onValueChange={field.onChange} value={field.value}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select correct answer" />
                    </SelectTrigger>
                    <SelectContent>
                      {questionOptions.map((option, index) => (
                        <SelectItem key={index} value={option}>
                          {option || `Option ${index + 1}`}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ) : (
                  <Input
                    {...field}
                    placeholder="Enter the correct answer"
                  />
                )}
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
              <FormLabel>Explanation *</FormLabel>
              <FormControl>
                <Textarea
                  {...field}
                  placeholder="Explain why this is the correct answer..."
                  className="min-h-[60px]"
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

export default QuestionForm;
