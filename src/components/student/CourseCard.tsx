
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { BookOpen, Clock } from "lucide-react";

interface CourseCardProps {
  course: {
    id: string;
    title: string;
    description: string;
    progress: number;
    totalLessons: number;
    completedLessons: number;
    difficulty: 'beginner' | 'intermediate' | 'advanced';
    thumbnail: string;
    estimatedTime: string;
  };
}

export const CourseCard = ({ course }: CourseCardProps) => {
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
    <Card className="overflow-hidden">
      <div className="aspect-video bg-gradient-to-r from-blue-500 to-purple-600 relative">
        <img 
          src={course.thumbnail} 
          alt={course.title}
          className="w-full h-full object-cover"
        />
        <Badge 
          className={`absolute top-2 right-2 ${difficultyColors[course.difficulty]}`}
        >
          {difficultyLabels[course.difficulty]}
        </Badge>
      </div>
      
      <CardHeader>
        <CardTitle className="text-lg">{course.title}</CardTitle>
        <p className="text-sm text-muted-foreground">{course.description}</p>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-1">
            <BookOpen className="h-4 w-4" />
            <span>{course.completedLessons}/{course.totalLessons} دروس</span>
          </div>
          <div className="flex items-center gap-1">
            <Clock className="h-4 w-4" />
            <span>{course.estimatedTime}</span>
          </div>
        </div>
        
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>التقدم</span>
            <span>{course.progress}%</span>
          </div>
          <Progress value={course.progress} className="h-2" />
        </div>
        
        <Button className="w-full">
          {course.progress > 0 ? 'متابعة الدورة' : 'بدء الدورة'}
        </Button>
      </CardContent>
    </Card>
  );
};
