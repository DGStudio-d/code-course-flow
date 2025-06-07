
import React from "react";
import { UseFormReturn, useFieldArray } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { QuizFormData } from "@/types/quiz-form";
import QuestionForm from "./QuestionForm";

interface QuestionsSectionProps {
  form: UseFormReturn<QuizFormData>;
}

const QuestionsSection = ({ form }: QuestionsSectionProps) => {
  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "questions",
  });

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
  );
};

export default QuestionsSection;
