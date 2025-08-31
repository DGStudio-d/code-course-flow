import React, { useState, useCallback, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  CheckCircle2, 
  XCircle, 
  AlertCircle, 
  Lightbulb, 
  Target,
  BookOpen,
  Edit3,
  FileText,
  Clock,
  Zap
} from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

// Enhanced TypeScript interfaces
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
  difficulty_level?: 'easy' | 'medium' | 'hard';
  estimated_time?: number;
}

interface SubmissionAnswer {
  question_id: string;
  selected_option_id?: string;
  answer_text?: string;
}

interface QuestionComponentProps {
  question: QuizQuestion;
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
}

// Enhanced Multiple Choice Component
export const MultipleChoiceQuestion: React.FC<QuestionComponentProps> = ({
  question,
  answer,
  onAnswerChange,
  isReadOnly = false,
  showCorrection = false,
  correction
}) => {
  const { t } = useLanguage();

  const handleOptionSelect = useCallback((optionId: string) => {
    if (!isReadOnly) {
      onAnswerChange(question.id, { selected_option_id: optionId });
    }
  }, [question.id, onAnswerChange, isReadOnly]);

  return (
    <div className="space-y-4">
      <RadioGroup
        value={answer?.selected_option_id || ''}
        onValueChange={handleOptionSelect}
        disabled={isReadOnly}
        className="space-y-3"
      >
        {question.options?.map((option, index) => {
          const isSelected = answer?.selected_option_id === option.id;
          const isCorrect = showCorrection && option.is_correct;
          const isIncorrect = showCorrection && isSelected && !option.is_correct;
          
          return (
            <div 
              key={option.id} 
              className={`
                flex items-start space-x-3 p-4 rounded-lg border transition-all duration-200
                ${isSelected ? 'border-blue-300 bg-blue-50' : 'border-gray-200 hover:border-blue-200'}
                ${isCorrect ? 'border-green-300 bg-green-50' : ''}
                ${isIncorrect ? 'border-red-300 bg-red-50' : ''}
                ${isReadOnly ? 'cursor-default' : 'cursor-pointer hover:shadow-sm'}
              `}
            >
              <RadioGroupItem 
                value={option.id} 
                id={option.id} 
                className="mt-1"
                disabled={isReadOnly}
              />
              <Label 
                htmlFor={option.id} 
                className={`flex-1 ${isReadOnly ? 'cursor-default' : 'cursor-pointer'}`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    <span className="font-medium text-blue-600 min-w-[24px] text-sm">
                      {String.fromCharCode(65 + index)}.
                    </span>
                    <span className="text-gray-800 leading-relaxed">
                      {option.option_text}
                    </span>
                  </div>
                  {showCorrection && (
                    <div className="flex items-center gap-1 ml-2">
                      {isCorrect && <CheckCircle2 className="h-4 w-4 text-green-600" />}
                      {isIncorrect && <XCircle className="h-4 w-4 text-red-600" />}
                    </div>
                  )}
                </div>
              </Label>
            </div>
          );
        })}
      </RadioGroup>
      
      {showCorrection && correction && (
        <CorrectionDisplay correction={correction} />
      )}
    </div>
  );
};

// Enhanced True/False Component
export const TrueFalseQuestion: React.FC<QuestionComponentProps> = ({
  question,
  answer,
  onAnswerChange,
  isReadOnly = false,
  showCorrection = false,
  correction
}) => {
  const { t } = useLanguage();

  const handleOptionSelect = useCallback((optionId: string) => {
    if (!isReadOnly) {
      onAnswerChange(question.id, { selected_option_id: optionId });
    }
  }, [question.id, onAnswerChange, isReadOnly]);

  return (
    <div className="space-y-4">
      <RadioGroup
        value={answer?.selected_option_id || ''}
        onValueChange={handleOptionSelect}
        disabled={isReadOnly}
        className="space-y-3"
      >
        {question.options?.map((option) => {
          const isSelected = answer?.selected_option_id === option.id;
          const isCorrect = showCorrection && option.is_correct;
          const isIncorrect = showCorrection && isSelected && !option.is_correct;
          
          return (
            <div 
              key={option.id} 
              className={`
                flex items-center space-x-3 p-4 rounded-lg border transition-all duration-200
                ${isSelected ? 'border-blue-300 bg-blue-50' : 'border-gray-200 hover:border-blue-200'}
                ${isCorrect ? 'border-green-300 bg-green-50' : ''}
                ${isIncorrect ? 'border-red-300 bg-red-50' : ''}
                ${isReadOnly ? 'cursor-default' : 'cursor-pointer hover:shadow-sm'}
              `}
            >
              <RadioGroupItem 
                value={option.id} 
                id={option.id}
                disabled={isReadOnly}
              />
              <Label 
                htmlFor={option.id} 
                className={`flex-1 font-medium text-lg ${isReadOnly ? 'cursor-default' : 'cursor-pointer'}`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-gray-800">{option.option_text}</span>
                  {showCorrection && (
                    <div className="flex items-center gap-1">
                      {isCorrect && <CheckCircle2 className="h-5 w-5 text-green-600" />}
                      {isIncorrect && <XCircle className="h-5 w-5 text-red-600" />}
                    </div>
                  )}
                </div>
              </Label>
            </div>
          );
        })}
      </RadioGroup>
      
      {showCorrection && correction && (
        <CorrectionDisplay correction={correction} />
      )}
    </div>
  );
};

// Enhanced Fill in the Blank Component
export const FillBlankQuestion: React.FC<QuestionComponentProps> = ({
  question,
  answer,
  onAnswerChange,
  isReadOnly = false,
  showCorrection = false,
  correction
}) => {
  const { t } = useLanguage();
  const [blanks, setBlanks] = useState<string[]>([]);

  // Parse question text to identify blanks
  const questionParts = question.question.split('_____');
  const blankCount = questionParts.length - 1;

  useEffect(() => {
    const currentAnswer = answer?.answer_text || '';
    const blankValues = currentAnswer.split('|').slice(0, blankCount);
    
    // Ensure we have the right number of blanks
    while (blankValues.length < blankCount) {
      blankValues.push('');
    }
    
    setBlanks(blankValues);
  }, [answer?.answer_text, blankCount]);

  const handleBlankChange = useCallback((index: number, value: string) => {
    if (isReadOnly) return;
    
    const newBlanks = [...blanks];
    newBlanks[index] = value;
    setBlanks(newBlanks);
    
    onAnswerChange(question.id, { answer_text: newBlanks.join('|') });
  }, [blanks, question.id, onAnswerChange, isReadOnly]);

  const getBlankStatus = (index: number) => {
    if (!showCorrection || !correction) return 'default';
    
    const correctAnswers = correction.correct_answer.split('|');
    const userAnswer = blanks[index]?.toLowerCase().trim();
    const correctAnswer = correctAnswers[index]?.toLowerCase().trim();
    
    if (userAnswer === correctAnswer) return 'correct';
    if (userAnswer && userAnswer !== correctAnswer) return 'incorrect';
    return 'empty';
  };

  return (
    <div className="space-y-4">
      <div className="text-lg leading-relaxed">
        {questionParts.map((part, index) => (
          <React.Fragment key={index}>
            <span className="text-gray-800">{part}</span>
            {index < questionParts.length - 1 && (
              <span className="inline-block mx-2">
                <Input
                  value={blanks[index] || ''}
                  onChange={(e) => handleBlankChange(index, e.target.value)}
                  disabled={isReadOnly}
                  placeholder={`${t('quiz.blank')} ${index + 1}`}
                  className={`
                    inline-block w-32 text-center transition-all duration-200
                    ${getBlankStatus(index) === 'correct' ? 'border-green-300 bg-green-50' : ''}
                    ${getBlankStatus(index) === 'incorrect' ? 'border-red-300 bg-red-50' : ''}
                    ${getBlankStatus(index) === 'empty' && showCorrection ? 'border-orange-300 bg-orange-50' : ''}
                  `}
                />
                {showCorrection && (
                  <div className="inline-block ml-1">
                    {getBlankStatus(index) === 'correct' && <CheckCircle2 className="h-4 w-4 text-green-600" />}
                    {getBlankStatus(index) === 'incorrect' && <XCircle className="h-4 w-4 text-red-600" />}
                    {getBlankStatus(index) === 'empty' && <AlertCircle className="h-4 w-4 text-orange-600" />}
                  </div>
                )}
              </span>
            )}
          </React.Fragment>
        ))}
      </div>
      
      <div className="text-sm text-gray-500 bg-blue-50 p-3 rounded-lg">
        <div className="flex items-center gap-2">
          <Lightbulb className="h-4 w-4 text-blue-600" />
          <span>{t('quiz.fillBlankInstruction')}</span>
        </div>
      </div>
      
      {showCorrection && correction && (
        <CorrectionDisplay correction={correction} />
      )}
    </div>
  );
};

// Enhanced Short Answer Component
export const ShortAnswerQuestion: React.FC<QuestionComponentProps> = ({
  question,
  answer,
  onAnswerChange,
  isReadOnly = false,
  showCorrection = false,
  correction
}) => {
  const { t } = useLanguage();
  const [wordCount, setWordCount] = useState(0);
  const maxLength = 500;

  const handleTextChange = useCallback((value: string) => {
    if (isReadOnly) return;
    
    const words = value.trim().split(/\s+/).filter(word => word.length > 0);
    setWordCount(words.length);
    
    onAnswerChange(question.id, { answer_text: value });
  }, [question.id, onAnswerChange, isReadOnly]);

  useEffect(() => {
    const text = answer?.answer_text || '';
    const words = text.trim().split(/\s+/).filter(word => word.length > 0);
    setWordCount(text.trim() ? words.length : 0);
  }, [answer?.answer_text]);

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="short-answer" className="text-sm font-medium text-gray-700">
          {t('quiz.shortAnswerInstruction')}
        </Label>
        <Textarea
          id="short-answer"
          value={answer?.answer_text || ''}
          onChange={(e) => handleTextChange(e.target.value)}
          disabled={isReadOnly}
          placeholder={t('quiz.writeAnswerHere')}
          className={`
            min-h-[120px] resize-none transition-all duration-200
            ${showCorrection && correction?.is_correct ? 'border-green-300 bg-green-50' : ''}
            ${showCorrection && !correction?.is_correct ? 'border-orange-300 bg-orange-50' : ''}
          `}
          maxLength={maxLength}
        />
        <div className="flex justify-between items-center text-xs text-gray-500">
          <div className="flex items-center gap-4">
            <span>{wordCount} {t('quiz.words')}</span>
            <span>{(answer?.answer_text || '').length}/{maxLength} {t('quiz.characters')}</span>
          </div>
          {showCorrection && (
            <div className="flex items-center gap-1">
              {correction?.is_correct ? (
                <>
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                  <span className="text-green-600">{t('quiz.goodAnswer')}</span>
                </>
              ) : (
                <>
                  <AlertCircle className="h-4 w-4 text-orange-600" />
                  <span className="text-orange-600">{t('quiz.needsImprovement')}</span>
                </>
              )}
            </div>
          )}
        </div>
      </div>
      
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
        <div className="flex items-start gap-2">
          <Lightbulb className="h-4 w-4 text-blue-600 mt-0.5" />
          <div className="text-sm text-blue-700">
            <p className="font-medium">{t('quiz.shortAnswerTips')}</p>
            <ul className="mt-1 space-y-1 text-xs">
              <li>• {t('quiz.shortAnswerTip1')}</li>
              <li>• {t('quiz.shortAnswerTip2')}</li>
              <li>• {t('quiz.shortAnswerTip3')}</li>
            </ul>
          </div>
        </div>
      </div>
      
      {showCorrection && correction && (
        <CorrectionDisplay correction={correction} />
      )}
    </div>
  );
};

// Enhanced Essay Component
export const EssayQuestion: React.FC<QuestionComponentProps> = ({
  question,
  answer,
  onAnswerChange,
  isReadOnly = false,
  showCorrection = false,
  correction
}) => {
  const { t } = useLanguage();
  const [wordCount, setWordCount] = useState(0);
  const [estimatedReadingTime, setEstimatedReadingTime] = useState(0);
  const maxLength = 2000;

  const handleTextChange = useCallback((value: string) => {
    if (isReadOnly) return;
    
    const words = value.trim().split(/\s+/).filter(word => word.length > 0);
    const wordCount = value.trim() ? words.length : 0;
    const readingTime = Math.ceil(wordCount / 200); // Average reading speed
    
    setWordCount(wordCount);
    setEstimatedReadingTime(readingTime);
    
    onAnswerChange(question.id, { answer_text: value });
  }, [question.id, onAnswerChange, isReadOnly]);

  useEffect(() => {
    const text = answer?.answer_text || '';
    const words = text.trim().split(/\s+/).filter(word => word.length > 0);
    const wordCount = text.trim() ? words.length : 0;
    const readingTime = Math.ceil(wordCount / 200);
    
    setWordCount(wordCount);
    setEstimatedReadingTime(readingTime);
  }, [answer?.answer_text]);

  const getWordCountStatus = () => {
    if (wordCount < 50) return { color: 'text-red-600', message: t('quiz.tooShort') };
    if (wordCount < 100) return { color: 'text-orange-600', message: t('quiz.couldBeExpanded') };
    if (wordCount < 300) return { color: 'text-green-600', message: t('quiz.goodLength') };
    return { color: 'text-blue-600', message: t('quiz.comprehensive') };
  };

  const wordCountStatus = getWordCountStatus();

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="essay-answer" className="text-sm font-medium text-gray-700">
          {t('quiz.essayInstruction')}
        </Label>
        <Textarea
          id="essay-answer"
          value={answer?.answer_text || ''}
          onChange={(e) => handleTextChange(e.target.value)}
          disabled={isReadOnly}
          placeholder={t('quiz.writeEssayHere')}
          className={`
            min-h-[250px] resize-y transition-all duration-200
            ${showCorrection && correction?.is_correct ? 'border-green-300 bg-green-50' : ''}
            ${showCorrection && !correction?.is_correct ? 'border-orange-300 bg-orange-50' : ''}
          `}
          maxLength={maxLength}
        />
        <div className="flex justify-between items-center text-xs">
          <div className="flex items-center gap-4 text-gray-500">
            <span className={wordCountStatus.color}>
              {wordCount} {t('quiz.words')} - {wordCountStatus.message}
            </span>
            <span>{(answer?.answer_text || '').length}/{maxLength} {t('quiz.characters')}</span>
            {estimatedReadingTime > 0 && (
              <span className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {estimatedReadingTime} {t('quiz.minRead')}
              </span>
            )}
          </div>
          {showCorrection && (
            <div className="flex items-center gap-1">
              {correction?.is_correct ? (
                <>
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                  <span className="text-green-600">{t('quiz.excellentEssay')}</span>
                </>
              ) : (
                <>
                  <AlertCircle className="h-4 w-4 text-orange-600" />
                  <span className="text-orange-600">{t('quiz.needsImprovement')}</span>
                </>
              )}
            </div>
          )}
        </div>
      </div>
      
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
        <div className="flex items-start gap-2">
          <FileText className="h-4 w-4 text-blue-600 mt-0.5" />
          <div className="text-sm text-blue-700">
            <p className="font-medium">{t('quiz.essayTips')}</p>
            <ul className="mt-1 space-y-1 text-xs">
              <li>• {t('quiz.essayTip1')}</li>
              <li>• {t('quiz.essayTip2')}</li>
              <li>• {t('quiz.essayTip3')}</li>
              <li>• {t('quiz.essayTip4')}</li>
            </ul>
          </div>
        </div>
      </div>
      
      {showCorrection && correction && (
        <CorrectionDisplay correction={correction} />
      )}
    </div>
  );
};

// Question Type Icon Component
export const QuestionTypeIcon: React.FC<{ type: string; className?: string }> = ({ type, className = "h-4 w-4" }) => {
  switch (type) {
    case 'multiple_choice':
      return <Target className={className} />;
    case 'true_false':
      return <CheckCircle2 className={className} />;
    case 'fill_blank':
      return <BookOpen className={className} />;
    case 'short_answer':
      return <Edit3 className={className} />;
    case 'essay':
      return <FileText className={className} />;
    default:
      return <AlertCircle className={className} />;
  }
};

// Difficulty Badge Component
export const DifficultyBadge: React.FC<{ level?: string }> = ({ level }) => {
  const { t } = useLanguage();
  
  if (!level) return null;
  
  const getDifficultyColor = (level: string) => {
    switch (level) {
      case 'easy': return 'bg-green-100 text-green-800 border-green-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'hard': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <Badge variant="outline" className={`${getDifficultyColor(level)} text-xs`}>
      {t(`quiz.difficulty.${level}`)}
    </Badge>
  );
};

// Correction Display Component
const CorrectionDisplay: React.FC<{ 
  correction: {
    is_correct: boolean;
    correct_answer: string;
    explanation: string;
    improvement_suggestion: string;
  }
}> = ({ correction }) => {
  const { t } = useLanguage();

  return (
    <Card className={`mt-4 border-l-4 ${correction.is_correct ? 'border-l-green-500' : 'border-l-red-500'}`}>
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          {correction.is_correct ? (
            <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5" />
          ) : (
            <XCircle className="h-5 w-5 text-red-600 mt-0.5" />
          )}
          <div className="flex-1 space-y-3">
            <div className="flex items-center gap-2">
              <span className={`font-medium ${correction.is_correct ? 'text-green-700' : 'text-red-700'}`}>
                {correction.is_correct ? t('quiz.correct') : t('quiz.incorrect')}
              </span>
            </div>
            
            {!correction.is_correct && (
              <>
                <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                  <span className="font-medium text-green-700">{t('quiz.correctAnswer')}: </span>
                  <span className="text-green-800">{correction.correct_answer}</span>
                </div>
                
                {correction.explanation && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                    <span className="font-medium text-blue-700">{t('quiz.explanation')}: </span>
                    <span className="text-blue-800">{correction.explanation}</span>
                  </div>
                )}
                
                {correction.improvement_suggestion && (
                  <div className="bg-purple-50 border border-purple-200 rounded-lg p-3">
                    <div className="flex items-start gap-2">
                      <Lightbulb className="h-4 w-4 text-purple-600 mt-0.5" />
                      <div>
                        <span className="font-medium text-purple-700">{t('quiz.suggestion')}: </span>
                        <span className="text-purple-800">{correction.improvement_suggestion}</span>
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

// Question Progress Component
export const QuestionProgress: React.FC<{
  currentIndex: number;
  totalQuestions: number;
  answeredQuestions: number;
  onQuestionSelect: (index: number) => void;
  isQuestionAnswered: (index: number) => boolean;
}> = ({ currentIndex, totalQuestions, answeredQuestions, onQuestionSelect, isQuestionAnswered }) => {
  const { t } = useLanguage();
  const progress = totalQuestions > 0 ? ((currentIndex + 1) / totalQuestions) * 100 : 0;

  return (
    <Card>
      <CardContent className="p-4">
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium text-gray-700">
              {t('quiz.progress')}: {currentIndex + 1} / {totalQuestions}
            </span>
            <span className="text-sm text-gray-500">
              {answeredQuestions} {t('quiz.answered')}
            </span>
          </div>
          
          <Progress value={progress} className="h-2" />
          
          <div className="flex flex-wrap gap-2">
            {Array.from({ length: totalQuestions }, (_, index) => {
              const isAnswered = isQuestionAnswered(index);
              const isCurrent = index === currentIndex;
              
              return (
                <Button
                  key={index}
                  variant={isCurrent ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => onQuestionSelect(index)}
                  className={`
                    relative w-10 h-10 p-0 transition-all duration-200
                    ${isCurrent ? 'bg-blue-600 hover:bg-blue-700 text-white' : ''}
                    ${isAnswered && !isCurrent ? 'bg-green-50 border-green-300 text-green-700 hover:bg-green-100' : ''}
                    ${!isAnswered && !isCurrent ? 'hover:border-orange-300 hover:bg-orange-50' : ''}
                  `}
                  title={`${t('quiz.question')} ${index + 1}${isAnswered ? ` - ${t('quiz.answered')}` : ''}`}
                >
                  {index + 1}
                  {isAnswered && (
                    <CheckCircle2 className="h-3 w-3 absolute -top-1 -right-1 text-green-600 bg-white rounded-full" />
                  )}
                </Button>
              );
            })}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};