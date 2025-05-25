
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Clock, CheckCircle, XCircle, BookOpen } from 'lucide-react';
import { sampleQuiz } from '@/lib/data';
import { Question } from '@/types';
import Header from '@/components/Header';

const Quiz = () => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<{ [key: string]: string }>({});
  const [timeRemaining, setTimeRemaining] = useState(sampleQuiz.duration);
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [showResults, setShowResults] = useState(false);

  const currentQuestion = sampleQuiz.questions[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / sampleQuiz.questions.length) * 100;

  useEffect(() => {
    if (timeRemaining > 0 && !quizCompleted) {
      const timer = setTimeout(() => setTimeRemaining(timeRemaining - 1), 1000);
      return () => clearTimeout(timer);
    } else if (timeRemaining === 0) {
      handleQuizComplete();
    }
  }, [timeRemaining, quizCompleted]);

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const handleAnswerChange = (answer: string) => {
    setAnswers(prev => ({
      ...prev,
      [currentQuestion.id]: answer
    }));
  };

  const handleNext = () => {
    if (currentQuestionIndex < sampleQuiz.questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      handleQuizComplete();
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  const handleQuizComplete = () => {
    setQuizCompleted(true);
    setShowResults(true);
  };

  const calculateScore = () => {
    let correct = 0;
    sampleQuiz.questions.forEach(question => {
      if (answers[question.id] === question.correctAnswer) {
        correct++;
      }
    });
    return {
      correct,
      total: sampleQuiz.questions.length,
      percentage: Math.round((correct / sampleQuiz.questions.length) * 100)
    };
  };

  const renderQuestion = (question: Question) => {
    const userAnswer = answers[question.id] || '';

    switch (question.type) {
      case 'mcq':
        return (
          <RadioGroup
            value={userAnswer}
            onValueChange={handleAnswerChange}
            className="space-y-4"
          >
            {question.options?.map((option) => (
              <div key={option} className="flex items-center space-x-2 rtl:space-x-reverse">
                <RadioGroupItem value={option} id={option} />
                <Label 
                  htmlFor={option} 
                  className="flex-1 cursor-pointer p-4 rounded-lg border border-gray-200 hover:border-primary-300 transition-colors"
                >
                  {option}
                </Label>
              </div>
            ))}
          </RadioGroup>
        );

      case 'fill':
        return (
          <Input
            value={userAnswer}
            onChange={(e) => handleAnswerChange(e.target.value)}
            placeholder="اكتب إجابتك هنا..."
            className="text-lg p-4"
          />
        );

      default:
        return null;
    }
  };

  if (showResults) {
    const score = calculateScore();
    
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="container mx-auto px-4 py-12">
          <Card className="max-w-4xl mx-auto">
            <CardHeader className="text-center">
              <CardTitle className="text-3xl text-gray-900 mb-4">
                نتائج الاختبار
              </CardTitle>
              <div className="text-6xl mb-4">
                {score.percentage >= 70 ? '🎉' : '📚'}
              </div>
            </CardHeader>
            <CardContent className="space-y-8">
              <div className="text-center">
                <div className="text-4xl font-bold text-primary-600 mb-2">
                  {score.percentage}%
                </div>
                <p className="text-xl text-gray-600">
                  {score.correct} من {score.total} إجابة صحيحة
                </p>
              </div>

              <div className="space-y-6">
                {sampleQuiz.questions.map((question, index) => {
                  const userAnswer = answers[question.id];
                  const isCorrect = userAnswer === question.correctAnswer;
                  
                  return (
                    <Card key={question.id} className="border-l-4 border-l-primary-600">
                      <CardContent className="p-6">
                        <div className="flex items-start gap-4">
                          <div className="flex-shrink-0">
                            {isCorrect ? (
                              <CheckCircle className="w-6 h-6 text-green-600" />
                            ) : (
                              <XCircle className="w-6 h-6 text-red-600" />
                            )}
                          </div>
                          <div className="flex-1">
                            <h3 className="font-semibold text-gray-900 mb-2">
                              السؤال {index + 1}: {question.text}
                            </h3>
                            <div className="space-y-2">
                              <p className="text-sm">
                                <span className="font-medium">إجابتك:</span> 
                                <span className={isCorrect ? 'text-green-600' : 'text-red-600'}>
                                  {userAnswer || 'لم تجب'}
                                </span>
                              </p>
                              {!isCorrect && (
                                <p className="text-sm">
                                  <span className="font-medium">الإجابة الصحيحة:</span> 
                                  <span className="text-green-600">{question.correctAnswer}</span>
                                </p>
                              )}
                              <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
                                <span className="font-medium">التوضيح:</span> {question.explanation}
                              </p>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>

              <div className="text-center">
                <Button size="lg" className="bg-green-gradient hover:opacity-90">
                  <BookOpen className="w-5 h-5 ml-2" />
                  ابدأ اختبار جديد
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          {/* Quiz Header */}
          <Card className="mb-8">
            <CardHeader>
              <div className="flex justify-between items-center mb-4">
                <CardTitle className="text-2xl text-gray-900">
                  {sampleQuiz.title}
                </CardTitle>
                <Badge variant="secondary" className="text-lg px-4 py-2">
                  {sampleQuiz.difficulty}
                </Badge>
              </div>
              
              <div className="flex justify-between items-center text-sm text-gray-600 mb-4">
                <span>السؤال {currentQuestionIndex + 1} من {sampleQuiz.questions.length}</span>
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  <span>{formatTime(timeRemaining)}</span>
                </div>
              </div>
              
              <Progress value={progress} className="h-2" />
            </CardHeader>
          </Card>

          {/* Question Card */}
          <Card>
            <CardHeader>
              <CardTitle className="text-xl text-gray-900">
                {currentQuestion.text}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {renderQuestion(currentQuestion)}
              
              <div className="flex justify-between pt-6">
                <Button
                  variant="outline"
                  onClick={handlePrevious}
                  disabled={currentQuestionIndex === 0}
                >
                  السابق
                </Button>
                
                <Button
                  onClick={handleNext}
                  disabled={!answers[currentQuestion.id]}
                  className="bg-green-gradient hover:opacity-90"
                >
                  {currentQuestionIndex === sampleQuiz.questions.length - 1 ? 'إنهاء الاختبار' : 'التالي'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Quiz;
