
import React from "react";
import { UseFormReturn } from "react-hook-form";
import { Card } from "@/components/ui/card";
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
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Trash2 } from "lucide-react";
import OptionsList from "./OptionsList";

interface QuizFormData {
  questions: any[];
}

interface QuestionFormProps {
  form: UseFormReturn<QuizFormData>;
  questionIndex: number;
  onRemove: () => void;
  canRemove: boolean;
}

const QuestionForm = ({ form, questionIndex, onRemove, canRemove }: QuestionFormProps) => {
  const questionType = form.watch(`questions.${questionIndex}.type`);

  // When question type changes, update options accordingly
  const handleTypeChange = (value: string) => {
    form.setValue(`questions.${questionIndex}.type`, value);
    
    if (value === "fill") {
      // For fill type, remove options
      form.setValue(`questions.${questionIndex}.options`, undefined);
    } else if (value === "true_false") {
      // For true/false, set default options
      form.setValue(`questions.${questionIndex}.options`, ["True", "False"]);
    } else if (value === "mcq") {
      // For MCQ, set default empty options
      form.setValue(`questions.${questionIndex}.options`, ["", ""]);
    }
    
    // Clear correct answer when type changes
    form.setValue(`questions.${questionIndex}.correct_answer`, "");
  };

  return (
    <Card className="p-4">
      <div className="flex items-center justify-between mb-4">
        <h4 className="font-medium">Question {questionIndex + 1}</h4>
        {canRemove && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onRemove}
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

      {/* Only show options for MCQ and True/False types */}
      {questionType !== "fill" && (
        <OptionsList form={form} questionIndex={questionIndex} />
      )}

      <FormField
        control={form.control}
        name={`questions.${questionIndex}.correct_answer`}
        render={({ field }) => (
          <FormItem className="mt-4">
            <FormLabel>Correct Answer (required) *</FormLabel>
            <FormControl>
              <Input 
                {...field} 
                placeholder={
                  questionType === "fill" 
                    ? "Enter the correct answer for this fill-in-the-blank question" 
                    : "Must exactly match one of the options above"
                } 
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </Card>
  );
};

export default QuestionForm;
