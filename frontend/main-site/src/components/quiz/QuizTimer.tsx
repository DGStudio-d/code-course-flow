import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { 
  Clock, 
  Pause, 
  Play, 
  AlertTriangle, 
  Zap,
  Timer as TimerIcon
} from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

interface QuizTimerProps {
  totalTimeMinutes: number;
  onTimeUp: () => void;
  isActive: boolean;
  isPaused?: boolean;
  onPauseToggle?: () => void;
  showWarnings?: boolean;
  autoSubmitOnTimeUp?: boolean;
}

export const QuizTimer: React.FC<QuizTimerProps> = ({
  totalTimeMinutes,
  onTimeUp,
  isActive,
  isPaused = false,
  onPauseToggle,
  showWarnings = true,
  autoSubmitOnTimeUp = true
}) => {
  const { t } = useLanguage();
  const [timeLeft, setTimeLeft] = useState(totalTimeMinutes * 60);
  const [hasWarned5Min, setHasWarned5Min] = useState(false);
  const [hasWarned1Min, setHasWarned1Min] = useState(false);
  const [isBlinking, setIsBlinking] = useState(false);

  // Timer effect
  useEffect(() => {
    if (!isActive || isPaused || timeLeft <= 0) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        const newTime = prev - 1;
        
        // Handle warnings
        if (showWarnings) {
          if (newTime === 300 && !hasWarned5Min) { // 5 minutes
            setHasWarned5Min(true);
            // Could trigger a toast notification here
          }
          if (newTime === 60 && !hasWarned1Min) { // 1 minute
            setHasWarned1Min(true);
            setIsBlinking(true);
            // Could trigger a toast notification here
          }
        }
        
        // Time up
        if (newTime <= 0) {
          if (autoSubmitOnTimeUp) {
            onTimeUp();
          }
          return 0;
        }
        
        return newTime;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isActive, isPaused, timeLeft, onTimeUp, showWarnings, hasWarned5Min, hasWarned1Min, autoSubmitOnTimeUp]);

  // Blinking effect for last minute
  useEffect(() => {
    if (!isBlinking) return;

    const blinkTimer = setInterval(() => {
      setIsBlinking(prev => !prev);
    }, 1000);

    return () => clearInterval(blinkTimer);
  }, [isBlinking]);

  const formatTime = useCallback((seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = seconds % 60;
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  }, []);

  const getTimeStatus = useCallback(() => {
    const totalSeconds = totalTimeMinutes * 60;
    const percentage = (timeLeft / totalSeconds) * 100;
    
    if (percentage > 50) return { color: 'text-green-600', bgColor: 'bg-green-100', status: 'good' };
    if (percentage > 25) return { color: 'text-yellow-600', bgColor: 'bg-yellow-100', status: 'warning' };
    if (percentage > 10) return { color: 'text-orange-600', bgColor: 'bg-orange-100', status: 'urgent' };
    return { color: 'text-red-600', bgColor: 'bg-red-100', status: 'critical' };
  }, [timeLeft, totalTimeMinutes]);

  const getProgressColor = useCallback(() => {
    const status = getTimeStatus().status;
    switch (status) {
      case 'good': return 'bg-green-500';
      case 'warning': return 'bg-yellow-500';
      case 'urgent': return 'bg-orange-500';
      case 'critical': return 'bg-red-500';
      default: return 'bg-blue-500';
    }
  }, [getTimeStatus]);

  const timeStatus = getTimeStatus();
  const progressPercentage = (timeLeft / (totalTimeMinutes * 60)) * 100;

  if (!isActive) return null;

  return (
    <Card className={`transition-all duration-300 ${timeStatus.bgColor} border-2 ${
      timeLeft <= 60 && isBlinking ? 'animate-pulse border-red-500' : 'border-transparent'
    }`}>
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <Clock className={`h-5 w-5 ${timeStatus.color}`} />
              <span className="text-sm font-medium text-gray-700">
                {t('quiz.timeRemaining')}
              </span>
            </div>
            
            {onPauseToggle && (
              <Button
                variant="outline"
                size="sm"
                onClick={onPauseToggle}
                className="h-8 px-2"
              >
                {isPaused ? (
                  <>
                    <Play className="h-3 w-3 mr-1" />
                    {t('quiz.resume')}
                  </>
                ) : (
                  <>
                    <Pause className="h-3 w-3 mr-1" />
                    {t('quiz.pause')}
                  </>
                )}
              </Button>
            )}
          </div>

          <div className="flex items-center gap-3">
            {/* Time warnings */}
            {timeLeft <= 300 && timeLeft > 60 && (
              <Badge variant="outline" className="text-orange-600 border-orange-300 bg-orange-50">
                <AlertTriangle className="h-3 w-3 mr-1" />
                {t('quiz.fiveMinutesLeft')}
              </Badge>
            )}
            
            {timeLeft <= 60 && timeLeft > 0 && (
              <Badge variant="destructive" className="animate-pulse">
                <Zap className="h-3 w-3 mr-1" />
                {t('quiz.oneMinuteLeft')}
              </Badge>
            )}

            {/* Time display */}
            <div className={`font-mono text-xl font-bold ${timeStatus.color} ${
              timeLeft <= 60 && isBlinking ? 'animate-pulse' : ''
            }`}>
              {formatTime(timeLeft)}
            </div>

            {/* Status indicator */}
            <div className="flex items-center gap-1">
              <TimerIcon className={`h-4 w-4 ${timeStatus.color}`} />
              <span className={`text-xs font-medium ${timeStatus.color}`}>
                {t(`quiz.timeStatus.${timeStatus.status}`)}
              </span>
            </div>
          </div>
        </div>

        {/* Progress bar */}
        <div className="mt-3">
          <Progress 
            value={progressPercentage} 
            className="h-2"
            style={{
              '--progress-background': getProgressColor()
            } as React.CSSProperties}
          />
          <div className="flex justify-between text-xs text-gray-500 mt-1">
            <span>{t('quiz.started')}</span>
            <span>{Math.round(progressPercentage)}% {t('quiz.remaining')}</span>
            <span>{t('quiz.timeUp')}</span>
          </div>
        </div>

        {/* Time management tips */}
        {timeLeft <= 300 && timeLeft > 0 && (
          <div className="mt-3 p-2 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-start gap-2">
              <AlertTriangle className="h-4 w-4 text-blue-600 mt-0.5" />
              <div className="text-xs text-blue-700">
                <p className="font-medium">{t('quiz.timeManagementTip')}</p>
                <p>{t('quiz.timeManagementAdvice')}</p>
              </div>
            </div>
          </div>
        )}

        {/* Pause indicator */}
        {isPaused && (
          <div className="mt-3 p-2 bg-gray-100 border border-gray-300 rounded-lg">
            <div className="flex items-center gap-2">
              <Pause className="h-4 w-4 text-gray-600" />
              <span className="text-sm text-gray-700 font-medium">
                {t('quiz.timerPaused')}
              </span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

// Compact timer for header
export const CompactTimer: React.FC<{
  timeLeft: number;
  totalTime: number;
  isActive: boolean;
}> = ({ timeLeft, totalTime, isActive }) => {
  const { t } = useLanguage();

  const formatTime = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const getStatusColor = () => {
    const percentage = (timeLeft / totalTime) * 100;
    if (percentage > 25) return 'text-green-600';
    if (percentage > 10) return 'text-orange-600';
    return 'text-red-600';
  };

  if (!isActive) return null;

  return (
    <div className="flex items-center gap-2">
      <Clock className={`h-4 w-4 ${getStatusColor()}`} />
      <span className={`font-mono font-bold ${getStatusColor()}`}>
        {formatTime(timeLeft)}
      </span>
      {timeLeft <= 300 && (
        <Badge 
          variant={timeLeft <= 60 ? 'destructive' : 'outline'}
          className={timeLeft <= 60 ? 'animate-pulse' : ''}
        >
          {timeLeft <= 60 ? t('quiz.urgent') : t('quiz.hurryUp')}
        </Badge>
      )}
    </div>
  );
};