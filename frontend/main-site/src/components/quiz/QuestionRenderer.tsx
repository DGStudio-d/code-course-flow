import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { 
  Target, 
  CheckCircle2, 
  BookOpen, 
  Lightbulb, 
  AlertCircle,
  Clock,
  HelpCircle
} from 'lucide-react';

interface QuizOption {
  id: string;
  option_text: string;
  is_correct: boolean;
}

interface QuizQuestion {
  id: string;
  type: 'multiple_choice' | 'true_false' | 'fill_blank' | 'short_answer' | 'essay';
  question: string;
  points: number;
  options?: QuizOption[];
  explanation?: string;
  difficulty_level?: string;
  estimated_time?: number;
}

interface SubmissionAnswer {
  question_id: string;
  selected_option_id?: string;
  answer_text?: string;
}

interface QuestionRendererProps {
  question: QuizQuestion;
  questionIndex: number;
  answer?: SubmissionAnswer;
  onAnswerChange: (questionId: string, answerData: Partial<SubmissionAnswer>) => void;
  isReadOnly?: boolean;
  showCorrection?: boolean;
  correction?: {
    is_correct: boolean;
    correct_answer: string;
    explanation: string;
    improvement_suggestion: string;
  };
  t: (key: string) => string;
}

export const QuestionRenderer: React.FC<QuestionRendererProps> = ({
  question,
  questionIndex,
  answer,
  onAnswerChange,
  isReadOnly = false,
  showCorrection = false,
  correction,
  t
}) => {
  const getQuestionTypeIcon = (type: string) => {
    switch (type) {
      case 'multiple_choice':
        return <Target className="h-4 w-4" />;
      case 'true_false':
        return <CheckCircle2 className="h-4 w-4" />;
      case 'fill_blank':
        return <BookOpen className="h-4 w-4" />;
      case 'short_answer':
        return <Lightbulb className="h-4 w-4" />;
      case 'essay':
        return <BookOpen className="h-4 w-4" />;
      default:
        return <AlertCircle className="h-4 w-4" />;
    }
  };

  const getDifficultyColor = (level?: string) => {
    switch (level) {
      case 'easy':
        return 'text-green-600 bg-green-50 border-green-200';
      case 'medium':
        return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'hard':
        return 'text-red-600 bg-red-50 border-red-200';
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const isAnswered = () => {
    if (!answer) return false;
    return !!(answer.selected_option_id || (answer.answer_text && answer.answer_text.trim()));
  };

  const renderFillBlankQuestion = () => {
    const questionText = question.question;
    const blanks = questionText.split('_____');
    const currentAnswer = answer?.answer_text || '';
    const blankValues = currentAnswer.split('|');

    return (
      <div className="space-y-4">
        <div className="text-lg leading-relaxed">
          {blanks.map((part, index) => (
            <React.Fragment key={index}>
              <span>{part}</span>
              {index < blanks.length - 1 && (
                <Input
                  className="inline-block w-32 mx-2 text-center"
                  value={blankValues[index] || ''}
                  onChange={(e) => {
                    if (isReadOnly) return;
                    const newBlanks = [...blankValues];
                    newBlanks[index] = e.target.value;
                    onAnswerChange(question.id, { answer_text: newBlanks.join('|') });
                  }}
                  placeholder={`${t('quiz.blank')} ${index + 1}`}
                  disabled={isReadOnly}
                />
              )}
            </React.Fragment>
          ))}
        </div>
        <div className="text-sm text-gray-500">
          {t('quiz.fillBlankInstruction')}
        </div>
      </div>
    );
  };

  const renderMultipleChoiceQuestion = () => {
    if (!question.options) return null;

    return (
      <RadioGroup
        value={answer?.selected_option_id || ''}
        onValueChange={(value) => {
          if (!isReadOnly) {
            onAnswerChange(question.id, { selected_option_id: value });
          }
        }}
        className="space-y-3"
        disabled={isReadOnly}
      >
        {question.options.map((option, index) => (
          <div 
            key={option.id} 
            className={`
              flex items-start space-x-3 p-3 rounded-lg border transition-colors
              ${isReadOnly ? 'bg-gray-50' : 'border-gray-200 hover:border-blue-300'}
              ${showCorrection && option.is_correct ? 'border-green-500 bg-green-50' : ''}
              ${showCorrection && answer?.selected_option_id === option.id && !option.is_correct ? 'border-red-500 bg-red-50' : ''}
            `}
          >
            <RadioGroupItem 
              value={option.id} 
              id={option.id} 
              className="mt-1" 
              disabled={isReadOnly}
            />
            <Label htmlFor={option.id} className="flex-1 cursor-pointer">
              <div className="flex items-start gap-2">
                <span className="font-medium text-blue-600 min-w-[24px]">
                  {String.fromCharCode(65 + index)}.
                </span>
                <span className="text-gray-800">{option.option_text}</span>
                {showCorrection && option.is_correct && (
                  <CheckCircle2 className="h-4 w-4 text-green-600 ml-auto" />
                )}
              </div>
            </Label>
          </div>
        ))}
      </RadioGroup>
    );
  };

  const renderTextQuestion = () => {
    const isEssay = question.type === 'essay';
    const maxLength = isEssay ? 2000 : 500;
    const minHeight = isEssay ? 'min-h-[200px]' : 'min-h-[100px]';

    return (
      <div className="space-y-3">
        <Label htmlFor={`${question.type}-answer`} className="text-sm font-medium text-gray-700">
          {isEssay ? t('quiz.essayInstruction') : t('quiz.shortAnswerInstruction')}
        </Label>
        <Textarea
          id={`${question.type}-answer`}
          value={answer?.answer_text || ''}
          onChange={(e) => {
            if (!isReadOnly) {
              onAnswerChange(question.id, { answer_text: e.target.value });
            }
          }}
          placeholder={isEssay ? t('quiz.writeEssayHere') : t('quiz.writeAnswerHere')}
          className={`${minHeight} resize-y`}
          maxLength={maxLength}
          disabled={isReadOnly}
        />
        <div className="text-xs text-gray-500 text-right">
          {(answer?.answer_text || '').length}/{maxLength} {t('quiz.characters')}
        </div>
      </div>
    );
  };

  const renderAnswerContent = () => {
    switch (question.type) {
      case 'multiple_choice':
      case 'true_false':
        return renderMultipleChoiceQuestion();
      case 'fill_blank':
        return renderFillBlankQuestion();
      case 'short_answer':
      case 'essay':
        return renderTextQuestion();
      default:
        return (
          <div className="text-center py-8 text-gray-500">
            <HelpCircle className="h-8 w-8 mx-auto mb-2" />
            <p>{t('quiz.unsupportedQuestionType')}</p>
          </div>
        );
    }
  };

  return (
    <Card className="overflow-hidden">
      <CardHeader>
        <div className="flex justify-between items-start">
          <div className="flex items-center gap-3">
            <CardTitle className="text-lg">
              {t('quiz.question')} {questionIndex + 1}
            </CardTitle>
            <div className="flex items-center gap-2">
              {getQuestionTypeIcon(question.type)}
              <Badge variant="outline">{t(`quiz.type.${question.type}`)}</Badge>
              {question.difficulty_level && (
                <Badge className={getDifficultyColor(question.difficulty_level)}>
                  {t(`quiz.difficulty.${question.difficulty_level}`)}
                </Badge>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="flex items-center gap-1">
              <Target className="h-3 w-3" />
              {question.points} {t('quiz.points')}
            </Badge>
            {question.estimated_time && (
              <Badge variant="outline" className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {question.estimated_time}m
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="text-lg leading-relaxed text-gray-800">
          {question.question}
        </div>

        {renderAnswerContent()}

        {/* Answer Status Indicator */}
        {!isReadOnly && (
          <div className="flex items-center gap-2 pt-2 border-t border-gray-100">
            {isAnswered() ? (
              <>
                <CheckCircle2 className="h-4 w-4 text-green-600" />
                <span className="text-sm text-green-600 font-medium">{t('quiz.answered')}</span>
              </>
            ) : (
              <>
                <AlertCircle className="h-4 w-4 text-orange-600" />
                <span className="text-sm text-orange-600">{t('quiz.notAnswered')}</span>
              </>
            )}
          </div>
        )}

        {/* Correction Display */}
        {showCorrection && correction && (
          <div className="mt-4 p-4 border-l-4 border-l-blue-500 bg-blue-50 rounded-r-lg">
            <div className="flex items-start gap-3">
              {correction.is_correct ? (
                <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5" />
              ) : (
                <AlertCircle className="h-5 w-5 text-red-600 mt-0.5" />
              )}
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <span className={`font-medium ${correction.is_correct ? 'text-green-700' : 'text-red-700'}`}>
                    {correction.is_correct ? t('quiz.correct') : t('quiz.incorrect')}
                  </span>
                </div>
                
                {!correction.is_correct && (
                  <div className="space-y-2">
                    <div>
                      <span className="font-medium text-gray-700">{t('quiz.correctAnswer')}: </span>
                      <span className="text-green-700">{correction.correct_answer}</span>
                    </div>
                    {correction.explanation && (
                      <div>
                        <span className="font-medium text-gray-700">{t('quiz.explanation')}: </span>
                        <span className="text-gray-600">{correction.explanation}</span>
                      </div>
                    )}
                    {correction.improvement_suggestion && (
                      <div className="bg-blue-100 p-3 rounded-lg">
                        <span className="font-medium text-blue-700">{t('quiz.suggestion')}: </span>
                        <span className="text-blue-600">{correction.improvement_suggestion}</span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default QuestionRenderer;