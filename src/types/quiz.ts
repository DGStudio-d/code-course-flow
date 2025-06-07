
export interface QuizFormData {
  title: string;
  description: string;
  questions: {
    type: "fill" | "true_false" | "mcq";
    points: number;
    options: string[];
    correct_answer: string;
    question: string;
    audio_file?: string;
    explanation: string;
  }[];
  language_id: string;
  difficulty: "beginner" | "intermediate" | "advanced";
  time_limit: number;
  status: "draft" | "published";
}
