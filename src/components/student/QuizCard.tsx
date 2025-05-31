
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Clock, Trophy, Target } from "lucide-react";

interface QuizCardProps {
  quiz: {
    id: string;
    title: string;
    description: string;
    difficulty: 'beginner' | 'intermediate' | 'advanced';
    duration: number;
    questionsCount: number;
    bestScore?: number;
    completed: boolean;
    language: string;
  };
}

export const QuizCard = ({ quiz }: QuizCardProps) => {
  const difficultyColors = {
    beginner: 'bg-green-100 text-green-800',
    intermediate: 'bg-yellow-100 text-yellow-800',
    advanced: 'bg-red-100 text-red-800'
  };

  const difficultyLabels = {
    beginner: 'مبتدئ',
    intermediate: 'متوسط',
    advanced: 'متقدم'
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-start">
          <CardTitle className="text-lg">{quiz.title}</CardTitle>
          <Badge className={difficultyColors[quiz.difficulty]}>
            {difficultyLabels[quiz.difficulty]}
          </Badge>
        </div>
        <p className="text-sm text-muted-foreground">{quiz.description}</p>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className="grid grid-cols-3 gap-4 text-sm">
          <div className="flex items-center gap-1">
            <Clock className="h-4 w-4" />
            <span>{Math.floor(quiz.duration / 60)} دقيقة</span>
          </div>
          <div className="flex items-center gap-1">
            <Target className="h-4 w-4" />
            <span>{quiz.questionsCount} سؤال</span>
          </div>
          {quiz.bestScore && (
            <div className="flex items-center gap-1">
              <Trophy className="h-4 w-4" />
              <span>{quiz.bestScore}%</span>
            </div>
          )}
        </div>
        
        <div className="text-xs text-muted-foreground">
          اللغة: {quiz.language}
        </div>
        
        <Button 
          className="w-full" 
          variant={quiz.completed ? "outline" : "default"}
        >
          {quiz.completed ? 'إعادة الاختبار' : 'بدء الاختبار'}
        </Button>
      </CardContent>
    </Card>
  );
};
