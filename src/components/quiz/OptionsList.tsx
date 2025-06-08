
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
  return (
    <div className="mt-4 space-y-2">
      <FormLabel>Options (2-6 required) *</FormLabel>
      {options.map((_, optionIndex) => (
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
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Option
        </Button>
      )}
    </div>
  );
};

export default OptionsList;
