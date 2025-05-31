
import { QuizCard } from "./QuizCard";

interface Quiz {
  id: string;
  title: string;
  description: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  duration: number;
  questionsCount: number;
  bestScore?: number;
  completed: boolean;
  language: string;
}

interface StudentQuizzesTabProps {
  quizzes: Quiz[];
}

export const StudentQuizzesTab = ({ quizzes }: StudentQuizzesTabProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {quizzes.map((quiz) => (
        <QuizCard key={quiz.id} quiz={quiz} />
      ))}
    </div>
  );
};
