
import * as z from "zod";

export const questionSchema = z.object({
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
  if (data.type === "mcq" || data.type === "true_false") {
    if (!data.options || data.options.length < 2 || data.options.length > 6) {
      return false;
    }
    return data.options.includes(data.correct_answer);
  }
  return true;
}, {
  message: "For MCQ and True/False: Options (2-6) are required and correct answer must match one of the options",
});

export const quizSchema = z.object({
  title: z.string().min(1, "Title is required").max(255, "Title cannot exceed 255 characters"),
  description: z.string().max(1000, "Description cannot exceed 1000 characters").optional(),
  language_id: z.string().min(1, "Language is required"),
  difficulty: z.enum(["beginner", "intermediate", "advanced"], {
    required_error: "Difficulty is required",
  }),
  time_limit: z.number().min(1).max(300).optional(),
  questions: z.array(questionSchema).min(1, "At least one question is required").max(50, "Maximum 50 questions allowed"),
});

export type QuizFormData = z.infer<typeof quizSchema>;
export type QuestionFormData = z.infer<typeof questionSchema>;
