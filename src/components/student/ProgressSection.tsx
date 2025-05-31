
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Trophy, Target, TrendingUp } from "lucide-react";

interface ProgressData {
  skillName: string;
  progress: number;
  level: string;
  nextMilestone: string;
}

interface ProgressSectionProps {
  progressData: ProgressData[];
  overallProgress: number;
  weeklyGoal: {
    target: number;
    completed: number;
    unit: string;
  };
}

export const ProgressSection = ({ progressData, overallProgress, weeklyGoal }: ProgressSectionProps) => {
  return (
    <div className="space-y-6">
      {/* Overall Progress */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            التقدم العام
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>إجمالي التقدم</span>
              <span>{overallProgress}%</span>
            </div>
            <Progress value={overallProgress} className="h-3" />
          </div>
        </CardContent>
      </Card>

      {/* Weekly Goal */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            هدف الأسبوع
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>{weeklyGoal.completed} من {weeklyGoal.target} {weeklyGoal.unit}</span>
              <span>{Math.round((weeklyGoal.completed / weeklyGoal.target) * 100)}%</span>
            </div>
            <Progress 
              value={(weeklyGoal.completed / weeklyGoal.target) * 100} 
              className="h-3" 
            />
          </div>
        </CardContent>
      </Card>

      {/* Skills Progress */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5" />
            تقدم المهارات
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {progressData.map((skill, index) => (
            <div key={index} className="space-y-2">
              <div className="flex justify-between items-center">
                <div>
                  <span className="font-medium">{skill.skillName}</span>
                  <div className="text-xs text-muted-foreground">
                    المستوى: {skill.level} • التالي: {skill.nextMilestone}
                  </div>
                </div>
                <span className="text-sm font-medium">{skill.progress}%</span>
              </div>
              <Progress value={skill.progress} className="h-2" />
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
};
