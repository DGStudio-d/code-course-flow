import React, { useState, useEffect } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  CheckCircle2, 
  XCircle, 
  AlertCircle, 
  Eye,
  EyeOff,
  Lightbulb,
  Target
} from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

interface CorrectionHighlightProps {
  text: string;
  corrections: Array<{
    start: number;
    end: number;
    type: 'incorrect' | 'missing' | 'extra' | 'suggestion';
    original: string;
    corrected: string;
    explanation?: string;
  }>;
  showCorrections?: boolean;
  onToggleCorrections?: () => void;
  className?: string;
}

export const CorrectionHighlight: React.FC<CorrectionHighlightProps> = ({
  text,
  corrections,
  showCorrections = true,
  onToggleCorrections,
  className = ''
}) => {
  const { t } = useLanguage();
  const [hoveredCorrection, setHoveredCorrection] = useState<number | null>(null);

  const getCorrectionColor = (type: string) => {
    switch (type) {
      case 'incorrect': return 'bg-red-100 border-red-300 text-red-800';
      case 'missing': return 'bg-yellow-100 border-yellow-300 text-yellow-800';
      case 'extra': return 'bg-orange-100 border-orange-300 text-orange-800';
      case 'suggestion': return 'bg-blue-100 border-blue-300 text-blue-800';
      default: return 'bg-gray-100 border-gray-300 text-gray-800';
    }
  };

  const getCorrectionIcon = (type: string) => {
    switch (type) {
      case 'incorrect': return <XCircle className="h-3 w-3" />;
      case 'missing': return <AlertCircle className="h-3 w-3" />;
      case 'extra': return <AlertCircle className="h-3 w-3" />;
      case 'suggestion': return <Lightbulb className="h-3 w-3" />;
      default: return <AlertCircle className="h-3 w-3" />;
    }
  };

  const renderHighlightedText = () => {
    if (!showCorrections || corrections.length === 0) {
      return <span>{text}</span>;
    }

    // Sort corrections by start position
    const sortedCorrections = [...corrections].sort((a, b) => a.start - b.start);
    const segments = [];
    let lastIndex = 0;

    sortedCorrections.forEach((correction, index) => {
      // Add text before correction
      if (correction.start > lastIndex) {
        segments.push(
          <span key={`text-${index}`}>
            {text.substring(lastIndex, correction.start)}
          </span>
        );
      }

      // Add highlighted correction
      const correctionText = text.substring(correction.start, correction.end);
      segments.push(
        <span
          key={`correction-${index}`}
          className={`
            relative inline-block px-1 py-0.5 rounded border cursor-pointer
            ${getCorrectionColor(correction.type)}
            ${hoveredCorrection === index ? 'shadow-md' : ''}
          `}
          onMouseEnter={() => setHoveredCorrection(index)}
          onMouseLeave={() => setHoveredCorrection(null)}
        >
          {correctionText}
          
          {/* Tooltip */}
          {hoveredCorrection === index && (
            <div className="absolute z-10 bottom-full left-0 mb-2 p-3 bg-white border border-gray-300 rounded-lg shadow-lg min-w-64 max-w-80">
              <div className="flex items-start gap-2 mb-2">
                {getCorrectionIcon(correction.type)}
                <div className="flex-1">
                  <div className="font-medium text-sm text-gray-900">
                    {t(`correction.type.${correction.type}`)}
                  </div>
                  <div className="text-xs text-gray-600 mt-1">
                    <span className="font-medium">{t('correction.original')}:</span> "{correction.original}"
                  </div>
                  <div className="text-xs text-green-700 mt-1">
                    <span className="font-medium">{t('correction.suggested')}:</span> "{correction.corrected}"
                  </div>
                  {correction.explanation && (
                    <div className="text-xs text-blue-700 mt-2 pt-2 border-t border-gray-200">
                      {correction.explanation}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </span>
      );

      lastIndex = correction.end;
    });

    // Add remaining text
    if (lastIndex < text.length) {
      segments.push(
        <span key="text-end">
          {text.substring(lastIndex)}
        </span>
      );
    }

    return segments;
  };

  return (
    <div className={`space-y-3 ${className}`}>
      {/* Controls */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="flex items-center gap-1">
            <Target className="h-3 w-3" />
            {corrections.length} {t('correction.corrections')}
          </Badge>
          
          {corrections.length > 0 && (
            <div className="flex items-center gap-1">
              {corrections.map((correction, index) => (
                <div
                  key={index}
                  className={`w-2 h-2 rounded-full ${getCorrectionColor(correction.type).split(' ')[0]}`}
                  title={t(`correction.type.${correction.type}`)}
                />
              ))}
            </div>
          )}
        </div>

        {onToggleCorrections && (
          <Button
            variant="outline"
            size="sm"
            onClick={onToggleCorrections}
            className="flex items-center gap-2"
          >
            {showCorrections ? (
              <>
                <EyeOff className="h-3 w-3" />
                {t('correction.hideCorrections')}
              </>
            ) : (
              <>
                <Eye className="h-3 w-3" />
                {t('correction.showCorrections')}
              </>
            )}
          </Button>
        )}
      </div>

      {/* Highlighted Text */}
      <div className="p-4 bg-gray-50 rounded-lg border leading-relaxed">
        {renderHighlightedText()}
      </div>

      {/* Correction Summary */}
      {showCorrections && corrections.length > 0 && (
        <div className="space-y-2">
          <h4 className="font-medium text-gray-800 text-sm">{t('correction.summary')}</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {corrections.map((correction, index) => (
              <div
                key={index}
                className={`p-2 rounded border text-xs ${getCorrectionColor(correction.type)}`}
              >
                <div className="flex items-start gap-2">
                  {getCorrectionIcon(correction.type)}
                  <div className="flex-1">
                    <div className="font-medium">
                      "{correction.original}" → "{correction.corrected}"
                    </div>
                    {correction.explanation && (
                      <div className="mt-1 opacity-80">
                        {correction.explanation}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

// Component for showing before/after comparison
interface BeforeAfterComparisonProps {
  originalText: string;
  correctedText: string;
  corrections: Array<{
    start: number;
    end: number;
    type: string;
    original: string;
    corrected: string;
    explanation?: string;
  }>;
}

export const BeforeAfterComparison: React.FC<BeforeAfterComparisonProps> = ({
  originalText,
  correctedText,
  corrections
}) => {
  const { t } = useLanguage();

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Original Text */}
        <div className="space-y-2">
          <h4 className="font-medium text-gray-800 flex items-center gap-2">
            <XCircle className="h-4 w-4 text-red-600" />
            {t('correction.original')}
          </h4>
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
            <CorrectionHighlight
              text={originalText}
              corrections={corrections}
              showCorrections={true}
            />
          </div>
        </div>

        {/* Corrected Text */}
        <div className="space-y-2">
          <h4 className="font-medium text-gray-800 flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-green-600" />
            {t('correction.corrected')}
          </h4>
          <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
            <p className="leading-relaxed">{correctedText}</p>
          </div>
        </div>
      </div>

      {/* Improvement Score */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="font-medium text-blue-800">{t('correction.improvementScore')}</h4>
            <p className="text-sm text-blue-700 mt-1">
              {corrections.length} {t('correction.correctionsApplied')}
            </p>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-blue-600">
              {Math.max(0, 100 - (corrections.length * 10))}%
            </div>
            <div className="text-xs text-blue-600">{t('correction.accuracy')}</div>
          </div>
        </div>
      </div>
    </div>
  );
};