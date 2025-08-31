import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { useLanguage } from "@/contexts/LanguageContext";
import { 
  Clock, 
  Users, 
  CheckCircle, 
  XCircle, 
  Search,
  BookOpen,
  Trophy,
  AlertCircle
} from "lucide-react";
import { fetchStudentQuizzes } from "@/services/api";

const QuizList = () => {
  const navigate = useNavigate();
  const { t, dir } = useLanguage();
  const [searchTerm, setSearchTerm] = useState("");

  const { data: quizzesData, isLoading } = useQuery({
    queryKey: ['student-quizzes'],
    queryFn: () => fetchStudentQuizzes(),
  });

  const quizzes = quizzesData?.data || [];
  const filteredQuizzes = quizzes.filter((quiz: any) =>
    quiz.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    quiz.program?.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-300 rounded w-1/4 mb-4"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-64 bg-gray-300 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6" dir={dir}>
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">{t("quiz.availableQuizzes")}</h1>
      </div>

      {/* Search */}
      <Card>
        <CardContent className="p-6">
          <div className="relative">
            <Search className={`absolute ${dir === 'rtl' ? 'right-3' : 'left-3'} top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4`} />
            <Input
              placeholder={t("quiz.searchPlaceholder")}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={dir === 'rtl' ? 'pr-10' : 'pl-10'}
            />
          </div>
        </CardContent>
      </Card>

      {/* Quizzes Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredQuizzes.map((quiz: any) => (
          <Card key={quiz.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex justify-between items-start">
                <CardTitle className="text-lg">{quiz.title}</CardTitle>
                <Badge variant={quiz.is_active ? "default" : "secondary"}>
                  {quiz.is_active ? t("quiz.available") : t("quiz.unavailable")}
                </Badge>
              </div>
              <p className="text-sm text-gray-600">{quiz.program?.title}</p>
            </CardHeader>
            <CardContent className="space-y-4">
              {quiz.description && (
                <p className="text-sm text-gray-700">{quiz.description}</p>
              )}
              
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-gray-500" />
                  <span>{quiz.total_questions} {t("quiz.questions")}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-gray-500" />
                  <span>{quiz.time_limit_minutes ? `${quiz.time_limit_minutes} ${t("quiz.minutes")}` : t("quiz.unlimited")}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Trophy className="h-4 w-4 text-gray-500" />
                  <span>{quiz.passing_score}% {t("quiz.passingScore")}</span>
                </div>
                <div className="flex items-center gap-2">
                  <BookOpen className="h-4 w-4 text-gray-500" />
                  <span>{quiz.max_attempts} {t("quiz.attempts")}</span>
                </div>
              </div>

              {quiz.attempts && quiz.attempts.length > 0 && (
                <div className="space-y-2">
                  <p className="text-sm font-medium">{t("quiz.previousAttempts")}</p>
                  {quiz.attempts.map((attempt: any, index: number) => (
                    <div key={attempt.id} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                      <span className="text-sm">{t("quiz.attempt")} {attempt.attempt_number}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-sm">{attempt.percentage}%</span>
                        {attempt.is_passed ? (
                          <CheckCircle className="h-4 w-4 text-green-600" />
                        ) : (
                          <XCircle className="h-4 w-4 text-red-600" />
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <div className="flex gap-2">
                {quiz.can_take_quiz ? (
                  <Button 
                    className="flex-1 bg-academy-green hover:bg-academy-green/90"
                    onClick={() => navigate(`/student/quiz/${quiz.id}`)}
                  >
                    {t("quiz.startQuiz")}
                  </Button>
                ) : (
                  <Button variant="outline" className="flex-1" disabled>
                    <AlertCircle className={`h-4 w-4 ${dir === 'rtl' ? 'ml-2' : 'mr-2'}`} />
                    {t("quiz.attemptsExhausted")}
                  </Button>
                )}
                
                {quiz.attempts && quiz.attempts.length > 0 && (
                  <Button 
                    variant="outline"
                    onClick={() => navigate(`/student/quiz/${quiz.id}/results`)}
                  >
                    {t("quiz.results")}
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredQuizzes.length === 0 && (
        <Card>
          <CardContent className="text-center py-8">
            <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">{t("quiz.noQuizzesAvailable")}</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default QuizList;