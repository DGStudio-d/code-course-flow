import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  CheckCircle2, 
  XCircle, 
  AlertCircle, 
  Eye,
  EyeOff,
  Lightbulb,
  Target,
  Zap,
  ArrowRight,
  RotateCcw
} from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

// Enhanced interfaces
interface HighlightedText {
  text: string;
  type: 'correct' | 'incorrect' | 'missing' | 'extra' | 'neutral';
  explanation?: string;
}

interface CorrectionHighlightProps {
  userAnswer: string;
  correctAnswer: string;
  questionType: 'multiple_choice' | 'true_false' | 'fill_blank' | 'short_answer' | 'essay';
  showCorrection?: boolean;
  showExplanation?: boolean;
  animateReveal?: boolean;
  onToggleCorrection?: () => void;
  detailedAnalysis?: {
    grammar_errors: Array<{
      error: string;
      correction: string;
      explanation: string;
      position: { start: number; end: number };
    }>;
    vocabulary_suggestions: Array<{
      word: string;
      suggestion: string;
      reason: string;
      position: { start: number; end: number };
    }>;
    structure_feedback: {
      clarity_score: number;
      coherence_score: number;
      suggestions: string[];
    };
  };
}

export const CorrectionHighlight: React.FC<CorrectionHighlightProps> = ({
  userAnswer,
  correctAnswer,
  questionType,
  showCorrection = false,
  showExplanation = true,
  animateReveal = true,
  onToggleCorrection,
  detailedAnalysis
}) => {
  const { t } = useLanguage();
  const [isRevealed, setIsRevealed] = useState(showCorrection);
  const [highlightedSegments, setHighlightedSegments] = useState<HighlightedText[]>([]);
  const [showDetailedAnalysis, setShowDetailedAnalysis] = useState(false);

  useEffect(() => {
    if (isRevealed) {
      generateHighlights();
    }
  }, [isRevealed, userAnswer, correctAnswer, questionType]);

  const generateHighlights = () => {
    let segments: HighlightedText[] = [];

    switch (questionType) {
      case 'multiple_choice':
      case 'true_false':
        segments = generateChoiceHighlights();
        break;
      case 'fill_blank':
        segments = generateFillBlankHighlights();
        break;
      case 'short_answer':
        segments = generateShortAnswerHighlights();
        break;
      case 'essay':
        segments = generateEssayHighlights();
        break;
      default:
        segments = [{ text: userAnswer, type: 'neutral' }];
    }

    setHighlightedSegments(segments);
  };

  const generateChoiceHighlights = (): HighlightedText[] => {
    const isCorrect = userAnswer.toLowerCase().trim() === correctAnswer.toLowerCase().trim();
    return [
      {
        text: userAnswer,
        type: isCorrect ? 'correct' : 'incorrect',
        explanation: isCorrect ? t('corrections.correctChoice') : t('corrections.incorrectChoice')
      }
    ];
  };

  const generateFillBlankHighlights = (): HighlightedText[] => {
    const userWords = userAnswer.toLowerCase().split(/\s+/);
    const correctWords = correctAnswer.toLowerCase().split(/\s+/);
    const segments: HighlightedText[] = [];

    // Simple word-by-word comparison
    const maxLength = Math.max(userWords.length, correctWords.length);
    
    for (let i = 0; i < maxLength; i++) {
      const userWord = userWords[i] || '';
      const correctWord = correctWords[i] || '';

      if (userWord && correctWord) {
        if (userWord === correctWord) {
          segments.push({
            text: userWord,
            type: 'correct',
            explanation: t('corrections.correctWord')
          });
        } else {
          segments.push({
            text: userWord,
            type: 'incorrect',
            explanation: t('corrections.shouldBe', { correct: correctWord })
          });
        }
      } else if (userWord && !correctWord) {
        segments.push({
          text: userWord,
          type: 'extra',
          explanation: t('corrections.extraWord')
        });
      } else if (!userWord && correctWord) {
        segments.push({
          text: `[${correctWord}]`,
          type: 'missing',
          explanation: t('corrections.missingWord')
        });
      }

      // Add space between words
      if (i < maxLength - 1) {
        segments.push({ text: ' ', type: 'neutral' });
      }
    }

    return segments;
  };

  const generateShortAnswerHighlights = (): HighlightedText[] => {
    // Simple keyword matching for short answers
    const userWords = userAnswer.toLowerCase().split(/\s+/);
    const correctWords = correctAnswer.toLowerCase().split(/\s+/);
    const segments: HighlightedText[] = [];

    userWords.forEach((word, index) => {
      const isKeyword = correctWords.some(correctWord => 
        correctWord.includes(word) || word.includes(correctWord)
      );

      segments.push({
        text: word,
        type: isKeyword ? 'correct' : 'neutral',
        explanation: isKeyword ? t('corrections.keywordFound') : undefined
      });

      if (index < userWords.length - 1) {
        segments.push({ text: ' ', type: 'neutral' });
      }
    });

    return segments;
  };

  const generateEssayHighlights = (): HighlightedText[] => {
    // For essays, we'll highlight based on detailed analysis if available
    if (!detailedAnalysis) {
      return [{ text: userAnswer, type: 'neutral' }];
    }

    const segments: HighlightedText[] = [];
    let currentPosition = 0;
    const text = userAnswer;

    // Combine all errors and sort by position
    const allErrors = [
      ...detailedAnalysis.grammar_errors.map(error => ({
        ...error,
        type: 'grammar' as const,
        start: error.position.start,
        end: error.position.end
      })),
      ...detailedAnalysis.vocabulary_suggestions.map(suggestion => ({
        error: suggestion.word,
        correction: suggestion.suggestion,
        explanation: suggestion.reason,
        type: 'vocabulary' as const,
        start: suggestion.position.start,
        end: suggestion.position.end
      }))
    ].sort((a, b) => a.start - b.start);

    allErrors.forEach(error => {
      // Add text before error
      if (currentPosition < error.start) {
        segments.push({
          text: text.substring(currentPosition, error.start),
          type: 'neutral'
        });
      }

      // Add highlighted error
      segments.push({
        text: text.substring(error.start, error.end),
        type: 'incorrect',
        explanation: `${error.explanation} → ${error.correction}`
      });

      currentPosition = error.end;
    });

    // Add remaining text
    if (currentPosition < text.length) {
      segments.push({
        text: text.substring(currentPosition),
        type: 'neutral'
      });
    }

    return segments;
  };

  const getSegmentClassName = (type: string) => {
    switch (type) {
      case 'correct':
        return 'bg-green-100 text-green-800 border-b-2 border-green-400';
      case 'incorrect':
        return 'bg-red-100 text-red-800 border-b-2 border-red-400';
      case 'missing':
        return 'bg-yellow-100 text-yellow-800 border-b-2 border-yellow-400 italic';
      case 'extra':
        return 'bg-orange-100 text-orange-800 border-b-2 border-orange-400 line-through';
      default:
        return '';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'correct':
        return <CheckCircle2 className="h-3 w-3 text-green-600" />;
      case 'incorrect':
        return <XCircle className="h-3 w-3 text-red-600" />;
      case 'missing':
        return <AlertCircle className="h-3 w-3 text-yellow-600" />;
      case 'extra':
        return <Target className="h-3 w-3 text-orange-600" />;
      default:
        return null;
    }
  };

  const handleToggleCorrection = () => {
    setIsRevealed(!isRevealed);
    if (onToggleCorrection) {
      onToggleCorrection();
    }
  };

  return (
    <div className="space-y-4">
      {/* Control Buttons */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleToggleCorrection}
            className="flex items-center gap-2"
          >
            {isRevealed ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            {isRevealed ? t('corrections.hideCorrection') : t('corrections.showCorrection')}
          </Button>
          
          {detailedAnalysis && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowDetailedAnalysis(!showDetailedAnalysis)}
              className="flex items-center gap-2"
            >
              <Lightbulb className="h-4 w-4" />
              {t('corrections.detailedAnalysis')}
            </Button>
          )}
        </div>

        <div className="flex items-center gap-2">
          <Badge variant="outline" className="flex items-center gap-1">
            {getTypeIcon(highlightedSegments.some(s => s.type === 'correct') ? 'correct' : 'incorrect')}
            {t(`quiz.type.${questionType}`)}
          </Badge>
        </div>
      </div>

      {/* User Answer Display */}
      <Card className="border-l-4 border-l-blue-500">
        <CardContent className="p-4">
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <span className="font-medium text-gray-800">{t('corrections.yourAnswer')}</span>
              {isRevealed && (
                <Badge variant="outline" className="text-xs">
                  {t('corrections.withCorrections')}
                </Badge>
              )}
            </div>

            <div className={`text-lg leading-relaxed ${animateReveal && isRevealed ? 'animate-pulse' : ''}`}>
              {isRevealed ? (
                <div className="space-y-2">
                  <div>
                    {highlightedSegments.map((segment, index) => (
                      <span
                        key={index}
                        className={`${getSegmentClassName(segment.type)} ${
                          segment.explanation ? 'cursor-help' : ''
                        } transition-all duration-300`}
                        title={segment.explanation}
                      >
                        {segment.text}
                      </span>
                    ))}
                  </div>
                  
                  {/* Legend */}
                  <div className="flex flex-wrap gap-2 mt-3 pt-3 border-t border-gray-200">
                    <div className="flex items-center gap-1 text-xs">
                      <div className="w-3 h-3 bg-green-100 border-b-2 border-green-400"></div>
                      <span>{t('corrections.correct')}</span>
                    </div>
                    <div className="flex items-center gap-1 text-xs">
                      <div className="w-3 h-3 bg-red-100 border-b-2 border-red-400"></div>
                      <span>{t('corrections.incorrect')}</span>
                    </div>
                    <div className="flex items-center gap-1 text-xs">
                      <div className="w-3 h-3 bg-yellow-100 border-b-2 border-yellow-400"></div>
                      <span>{t('corrections.missing')}</span>
                    </div>
                    <div className="flex items-center gap-1 text-xs">
                      <div className="w-3 h-3 bg-orange-100 border-b-2 border-orange-400"></div>
                      <span>{t('corrections.extra')}</span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-gray-700">{userAnswer}</div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Correct Answer Display */}
      {isRevealed && (
        <Card className="border-l-4 border-l-green-500">
          <CardContent className="p-4">
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-green-600" />
                <span className="font-medium text-green-800">{t('corrections.correctAnswer')}</span>
              </div>
              <div className="text-lg text-green-700 bg-green-50 p-3 rounded">
                {correctAnswer}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Detailed Analysis */}
      {showDetailedAnalysis && detailedAnalysis && (
        <Card className="border-l-4 border-l-purple-500">
          <CardContent className="p-4">
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Lightbulb className="h-5 w-5 text-purple-600" />
                <span className="font-medium text-purple-800">{t('corrections.detailedAnalysis')}</span>
              </div>

              {/* Grammar Errors */}
              {detailedAnalysis.grammar_errors.length > 0 && (
                <div className="space-y-2">
                  <h4 className="font-medium text-red-800">{t('corrections.grammarErrors')}</h4>
                  <div className="space-y-2">
                    {detailedAnalysis.grammar_errors.map((error, index) => (
                      <div key={index} className="p-3 bg-red-50 border border-red-200 rounded">
                        <div className="flex items-start gap-2">
                          <XCircle className="h-4 w-4 text-red-600 mt-0.5" />
                          <div>
                            <div className="font-medium text-red-800">
                              "{error.error}" → "{error.correction}"
                            </div>
                            <div className="text-sm text-red-700">{error.explanation}</div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Vocabulary Suggestions */}
              {detailedAnalysis.vocabulary_suggestions.length > 0 && (
                <div className="space-y-2">
                  <h4 className="font-medium text-blue-800">{t('corrections.vocabularySuggestions')}</h4>
                  <div className="space-y-2">
                    {detailedAnalysis.vocabulary_suggestions.map((suggestion, index) => (
                      <div key={index} className="p-3 bg-blue-50 border border-blue-200 rounded">
                        <div className="flex items-start gap-2">
                          <ArrowRight className="h-4 w-4 text-blue-600 mt-0.5" />
                          <div>
                            <div className="font-medium text-blue-800">
                              "{suggestion.word}" → "{suggestion.suggestion}"
                            </div>
                            <div className="text-sm text-blue-700">{suggestion.reason}</div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Structure Feedback */}
              {detailedAnalysis.structure_feedback && (
                <div className="space-y-2">
                  <h4 className="font-medium text-purple-800">{t('corrections.structureFeedback')}</h4>
                  <div className="grid grid-cols-2 gap-4 mb-3">
                    <div className="text-center p-3 bg-purple-50 border border-purple-200 rounded">
                      <div className="text-2xl font-bold text-purple-600">
                        {detailedAnalysis.structure_feedback.clarity_score}%
                      </div>
                      <div className="text-sm text-purple-700">{t('corrections.clarity')}</div>
                    </div>
                    <div className="text-center p-3 bg-purple-50 border border-purple-200 rounded">
                      <div className="text-2xl font-bold text-purple-600">
                        {detailedAnalysis.structure_feedback.coherence_score}%
                      </div>
                      <div className="text-sm text-purple-700">{t('corrections.coherence')}</div>
                    </div>
                  </div>
                  <div className="space-y-1">
                    {detailedAnalysis.structure_feedback.suggestions.map((suggestion, index) => (
                      <div key={index} className="flex items-start gap-2 text-sm text-purple-700">
                        <Zap className="h-4 w-4 text-purple-600 mt-0.5" />
                        <span>{suggestion}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Quick Actions */}
      {isRevealed && (
        <div className="flex justify-center">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setIsRevealed(false);
              setShowDetailedAnalysis(false);
            }}
            className="flex items-center gap-2"
          >
            <RotateCcw className="h-4 w-4" />
            {t('corrections.resetView')}
          </Button>
        </div>
      )}
    </div>
  );
};