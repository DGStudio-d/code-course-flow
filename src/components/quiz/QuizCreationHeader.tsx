
import React from "react";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

interface QuizCreationHeaderProps {
  onBack: () => void;
}

const QuizCreationHeader = ({ onBack }: QuizCreationHeaderProps) => {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center space-x-4">
        <Button
          variant="ghost"
          onClick={onBack}
          className="flex items-center space-x-2"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Quizzes</span>
        </Button>
        <h1 className="text-3xl font-bold text-gray-900">Create New Quiz</h1>
      </div>
    </div>
  );
};

export default QuizCreationHeader;
