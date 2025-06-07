
import React from "react";
import { Button } from "@/components/ui/button";
import { Save } from "lucide-react";

interface QuizFormActionsProps {
  onCancel: () => void;
  isSubmitting: boolean;
}

const QuizFormActions = ({ onCancel, isSubmitting }: QuizFormActionsProps) => {
  return (
    <div className="flex justify-end space-x-4">
      <Button
        type="button"
        variant="outline"
        onClick={onCancel}
      >
        Cancel
      </Button>
      <Button
        type="submit"
        disabled={isSubmitting}
        className="flex items-center space-x-2"
      >
        <Save className="w-4 h-4" />
        <span>{isSubmitting ? "Creating..." : "Create Quiz"}</span>
      </Button>
    </div>
  );
};

export default QuizFormActions;
