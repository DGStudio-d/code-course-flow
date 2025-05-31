
import { CourseCard } from "./CourseCard";

interface Course {
  id: string;
  title: string;
  description: string;
  progress: number;
  totalLessons: number;
  completedLessons: number;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  thumbnail: string;
  estimatedTime: string;
}

interface StudentCoursesTabProps {
  courses: Course[];
}

export const StudentCoursesTab = ({ courses }: StudentCoursesTabProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {courses.map((course) => (
        <CourseCard key={course.id} course={course} />
      ))}
    </div>
  );
};
