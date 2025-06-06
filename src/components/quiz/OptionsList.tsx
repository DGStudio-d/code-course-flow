
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

interface QuizFormData {
  questions: any[];
}

interface OptionsListProps {
  form: UseFormReturn<QuizFormData>;
  questionIndex: number;
}

const OptionsList = ({ form, questionIndex }: OptionsListProps) => {
  const addOption = () => {
    const currentOptions = form.getValues(`questions.${questionIndex}.options`);
    if (currentOptions.length < 6) {
      form.setValue(`questions.${questionIndex}.options`, [...currentOptions, ""]);
    }
  };

  const removeOption = (optionIndex: number) => {
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
              onClick={() => removeOption(optionIndex)}
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
          onClick={addOption}
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Option
        </Button>
      )}
    </div>
  );
};

export default OptionsList;
