
import { ProgressSection } from "./ProgressSection";

interface ProgressData {
  skillName: string;
  progress: number;
  level: string;
  nextMilestone: string;
}

interface WeeklyGoal {
  target: number;
  completed: number;
  unit: string;
}

interface StudentProgressTabProps {
  progressData: ProgressData[];
  weeklyGoal: WeeklyGoal;
}

export const StudentProgressTab = ({ progressData, weeklyGoal }: StudentProgressTabProps) => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2">
        <ProgressSection 
          progressData={progressData}
          overallProgress={76}
          weeklyGoal={weeklyGoal}
        />
      </div>
    </div>
  );
};
