import React, { useState, useCallback, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { 
  Upload, 
  FileText, 
  CheckCircle2, 
  XCircle, 
  AlertTriangle,
  Eye,
  Download,
  Trash2,
  RefreshCw,
  BookOpen,
  Target,
  Clock,
  Users,
  Zap,
  FileCheck,
  AlertCircle,
  Lightbulb
} from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useToast } from '@/components/ui/use-toast';
import { useMutation } from '@tanstack/react-query';

// Enhanced interfaces
interface ParsedQuestion {
  type: 'multiple_choice' | 'true_false' | 'fill_blank' | 'short_answer' | 'essay';
  question: string;
  points: number;
  options?: Array<{
    option_text: string;
    is_correct: boolean;
  }>;
  explanation?: string;
  difficulty_level?: 'easy' | 'medium' | 'hard';
  estimated_time?: number;
}

interface ParsedQuizData {
  title: string;
  description?: string;
  proficiency_level: string;
  time_limit_minutes?: number;
  passing_score: number;
  max_attempts: number;
  correction_mode: 'immediate' | 'end_of_quiz' | 'manual';
  show_results_immediately: boolean;
  questions: ParsedQuestion[];
  metadata: {
    total_questions: number;
    total_points: number;
    estimated_duration: number;
    question_types: string[];
    difficulty_distribution: Record<string, number>;
  };
}

interface DocumentUploadProps {
  programId: string;
  onQuizCreated?: (quizId: string) => void;
  onCancel?: () => void;
}

export const DocumentUpload: React.FC<DocumentUploadProps> = ({
  programId,
  onQuizCreated,
  onCancel
}) => {
  const { t } = useLanguage();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // State management
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [isParsing, setIsParsing] = useState(false);
  const [parsedData, setParsedData] = useState<ParsedQuizData | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [isCreatingQuiz, setIsCreatingQuiz] = useState(false);

  // Quiz configuration state
  const [quizConfig, setQuizConfig] = useState({
    title: '',
    description: '',
    proficiency_level: 'B1',
    time_limit_minutes: 60,
    passing_score: 70,
    max_attempts: 3,
    correction_mode: 'end_of_quiz' as const,
    show_results_immediately: true
  });

  // File validation
  const validateFile = useCallback((file: File): string[] => {
    const errors: string[] = [];
    const maxSize = 10 * 1024 * 1024; // 10MB
    const allowedTypes = [
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/msword',
      'application/pdf',
      'text/plain'
    ];

    if (file.size > maxSize) {
      errors.push(t('upload.fileTooLarge'));
    }

    if (!allowedTypes.includes(file.type)) {
      errors.push(t('upload.invalidFileType'));
    }

    if (file.name.length > 255) {
      errors.push(t('upload.fileNameTooLong'));
    }

    return errors;
  }, [t]);

  // File selection handler
  const handleFileSelect = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const errors = validateFile(file);
    if (errors.length > 0) {
      setValidationErrors(errors);
      return;
    }

    setSelectedFile(file);
    setValidationErrors([]);
    setParsedData(null);
    
    // Auto-populate quiz title from filename
    const fileName = file.name.replace(/\.[^/.]+$/, '');
    setQuizConfig(prev => ({
      ...prev,
      title: prev.title || fileName
    }));
  }, [validateFile]);

  // Drag and drop handlers
  const handleDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.stopPropagation();
  }, []);

  const handleDrop = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.stopPropagation();

    const files = Array.from(event.dataTransfer.files);
    if (files.length > 0) {
      const file = files[0];
      const errors = validateFile(file);
      
      if (errors.length > 0) {
        setValidationErrors(errors);
        return;
      }

      setSelectedFile(file);
      setValidationErrors([]);
      setParsedData(null);
      
      const fileName = file.name.replace(/\.[^/.]+$/, '');
      setQuizConfig(prev => ({
        ...prev,
        title: prev.title || fileName
      }));
    }
  }, [validateFile]);

  // Document upload and parsing
  const uploadAndParseMutation = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append('document', file);
      formData.append('program_id', programId);

      // Simulate upload progress
      setIsUploading(true);
      setUploadProgress(0);

      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 200);

      try {
        const response = await fetch('/api/v1/teacher/quizzes/upload-document', {
          method: 'POST',
          body: formData,
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
          },
        });

        clearInterval(progressInterval);
        setUploadProgress(100);

        if (!response.ok) {
          throw new Error('Upload failed');
        }

        const result = await response.json();
        return result.data;
      } catch (error) {
        clearInterval(progressInterval);
        throw error;
      } finally {
        setIsUploading(false);
      }
    },
    onSuccess: (data: ParsedQuizData) => {
      setParsedData(data);
      setIsParsing(false);
      
      // Update quiz config with parsed data
      setQuizConfig(prev => ({
        ...prev,
        title: prev.title || data.title,
        description: prev.description || data.description || '',
        proficiency_level: data.proficiency_level || prev.proficiency_level,
        time_limit_minutes: data.time_limit_minutes || prev.time_limit_minutes,
        passing_score: data.passing_score || prev.passing_score,
        max_attempts: data.max_attempts || prev.max_attempts,
        correction_mode: data.correction_mode || prev.correction_mode,
        show_results_immediately: data.show_results_immediately ?? prev.show_results_immediately
      }));

      toast({
        title: t('upload.parseSuccess'),
        description: t('upload.parseSuccessDesc').replace('{count}', data.questions.length.toString()),
      });
    },
    onError: (error: any) => {
      setIsParsing(false);
      toast({
        title: t('upload.parseError'),
        description: error.message || t('upload.parseErrorDesc'),
        variant: 'destructive',
      });
    }
  });

  // Quiz creation
  const createQuizMutation = useMutation({
    mutationFn: async () => {
      if (!parsedData) throw new Error('No parsed data available');

      const quizData = {
        ...quizConfig,
        program_id: programId,
        questions: parsedData.questions
      };

      const response = await fetch('/api/v1/teacher/quizzes/create-from-document', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify(quizData),
      });

      if (!response.ok) {
        throw new Error('Quiz creation failed');
      }

      const result = await response.json();
      return result.data;
    },
    onSuccess: (quiz) => {
      toast({
        title: t('upload.quizCreated'),
        description: t('upload.quizCreatedDesc'),
      });
      
      if (onQuizCreated) {
        onQuizCreated(quiz.id);
      }
    },
    onError: (error: any) => {
      toast({
        title: t('upload.createError'),
        description: error.message || t('upload.createErrorDesc'),
        variant: 'destructive',
      });
    }
  });

  const handleUploadAndParse = useCallback(() => {
    if (!selectedFile) return;
    
    setIsParsing(true);
    uploadAndParseMutation.mutate(selectedFile);
  }, [selectedFile, uploadAndParseMutation]);

  const handleCreateQuiz = useCallback(() => {
    setIsCreatingQuiz(true);
    createQuizMutation.mutate();
  }, [createQuizMutation]);

  const handleRemoveFile = useCallback(() => {
    setSelectedFile(null);
    setParsedData(null);
    setValidationErrors([]);
    setUploadProgress(0);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, []);

  const getFileIcon = (file: File) => {
    if (file.type.includes('word')) return <FileText className="h-8 w-8 text-blue-600" />;
    if (file.type.includes('pdf')) return <FileText className="h-8 w-8 text-red-600" />;
    return <FileText className="h-8 w-8 text-gray-600" />;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            {t('upload.title')}
          </CardTitle>
          <p className="text-gray-600">{t('upload.description')}</p>
        </CardHeader>
      </Card>

      {/* File Upload Section */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">{t('upload.selectDocument')}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Drag and Drop Area */}
          <div
            className={`
              border-2 border-dashed rounded-lg p-8 text-center transition-colors
              ${selectedFile ? 'border-green-300 bg-green-50' : 'border-gray-300 hover:border-blue-400 hover:bg-blue-50'}
            `}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
          >
            {selectedFile ? (
              <div className="space-y-4">
                <div className="flex items-center justify-center gap-3">
                  {getFileIcon(selectedFile)}
                  <div className="text-left">
                    <p className="font-medium text-gray-900">{selectedFile.name}</p>
                    <p className="text-sm text-gray-500">{formatFileSize(selectedFile.size)}</p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleRemoveFile}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
                
                {isUploading && (
                  <div className="space-y-2">
                    <Progress value={uploadProgress} className="h-2" />
                    <p className="text-sm text-gray-600">{t('upload.uploading')} {uploadProgress}%</p>
                  </div>
                )}
                
                {isParsing && (
                  <div className="flex items-center justify-center gap-2 text-blue-600">
                    <RefreshCw className="h-4 w-4 animate-spin" />
                    <span>{t('upload.parsing')}</span>
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                <Upload className="h-12 w-12 text-gray-400 mx-auto" />
                <div>
                  <p className="text-lg font-medium text-gray-900">{t('upload.dragDrop')}</p>
                  <p className="text-gray-500">{t('upload.or')}</p>
                </div>
                <Button
                  variant="outline"
                  onClick={() => fileInputRef.current?.click()}
                  className="flex items-center gap-2"
                >
                  <FileText className="h-4 w-4" />
                  {t('upload.browseFiles')}
                </Button>
              </div>
            )}
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept=".docx,.doc,.pdf,.txt"
            onChange={handleFileSelect}
            className="hidden"
          />

          {/* File Requirements */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <Lightbulb className="h-5 w-5 text-blue-600 mt-0.5" />
              <div className="text-sm text-blue-700">
                <p className="font-medium">{t('upload.requirements')}</p>
                <ul className="mt-2 space-y-1">
                  <li>• {t('upload.supportedFormats')}: .docx, .doc, .pdf, .txt</li>
                  <li>• {t('upload.maxSize')}: 10MB</li>
                  <li>• {t('upload.structureHint')}</li>
                  <li>• {t('upload.questionFormats')}</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Validation Errors */}
          {validationErrors.length > 0 && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                <ul className="space-y-1">
                  {validationErrors.map((error, index) => (
                    <li key={index}>• {error}</li>
                  ))}
                </ul>
              </AlertDescription>
            </Alert>
          )}

          {/* Upload Button */}
          {selectedFile && !parsedData && !isParsing && (
            <Button
              onClick={handleUploadAndParse}
              disabled={isUploading || isParsing}
              className="w-full bg-academy-green hover:bg-academy-green/90"
            >
              {isParsing ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  {t('upload.parsing')}
                </>
              ) : (
                <>
                  <Upload className="h-4 w-4 mr-2" />
                  {t('upload.uploadAndParse')}
                </>
              )}
            </Button>
          )}
        </CardContent>
      </Card>

      {/* Parsed Data Preview */}
      {parsedData && (
        <>
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <FileCheck className="h-5 w-5 text-green-600" />
                  {t('upload.parseResults')}
                </CardTitle>
                <Button
                  variant="outline"
                  onClick={() => setShowPreview(true)}
                  className="flex items-center gap-2"
                >
                  <Eye className="h-4 w-4" />
                  {t('upload.previewQuestions')}
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <Target className="h-5 w-5 text-blue-600" />
                  </div>
                  <p className="text-2xl font-bold text-blue-600">{parsedData.metadata.total_questions}</p>
                  <p className="text-sm text-gray-600">{t('upload.questions')}</p>
                </div>
                
                <div className="text-center p-4 bg-green-50 rounded-lg border border-green-200">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <Zap className="h-5 w-5 text-green-600" />
                  </div>
                  <p className="text-2xl font-bold text-green-600">{parsedData.metadata.total_points}</p>
                  <p className="text-sm text-gray-600">{t('upload.totalPoints')}</p>
                </div>
                
                <div className="text-center p-4 bg-orange-50 rounded-lg border border-orange-200">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <Clock className="h-5 w-5 text-orange-600" />
                  </div>
                  <p className="text-2xl font-bold text-orange-600">{parsedData.metadata.estimated_duration}</p>
                  <p className="text-sm text-gray-600">{t('upload.estimatedMinutes')}</p>
                </div>
                
                <div className="text-center p-4 bg-purple-50 rounded-lg border border-purple-200">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <BookOpen className="h-5 w-5 text-purple-600" />
                  </div>
                  <p className="text-2xl font-bold text-purple-600">{parsedData.metadata.question_types.length}</p>
                  <p className="text-sm text-gray-600">{t('upload.questionTypes')}</p>
                </div>
              </div>

              {/* Question Types */}
              <div className="mt-4">
                <h4 className="font-medium text-gray-800 mb-2">{t('upload.detectedTypes')}</h4>
                <div className="flex flex-wrap gap-2">
                  {parsedData.metadata.question_types.map(type => (
                    <Badge key={type} variant="secondary">
                      {t(`quiz.type.${type}`)}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Difficulty Distribution */}
              {Object.keys(parsedData.metadata.difficulty_distribution).length > 0 && (
                <div className="mt-4">
                  <h4 className="font-medium text-gray-800 mb-2">{t('upload.difficultyDistribution')}</h4>
                  <div className="flex gap-2">
                    {Object.entries(parsedData.metadata.difficulty_distribution).map(([level, count]) => (
                      <Badge key={level} variant="outline" className="flex items-center gap-1">
                        <span>{t(`quiz.difficulty.${level}`)}: {count}</span>
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Quiz Configuration */}
          <Card>
            <CardHeader>
              <CardTitle>{t('upload.quizConfiguration')}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="quiz-title">{t('upload.quizTitle')}</Label>
                  <Input
                    id="quiz-title"
                    value={quizConfig.title}
                    onChange={(e) => setQuizConfig(prev => ({ ...prev, title: e.target.value }))}
                    placeholder={t('upload.enterTitle')}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="proficiency-level">{t('upload.proficiencyLevel')}</Label>
                  <Select
                    value={quizConfig.proficiency_level}
                    onValueChange={(value) => setQuizConfig(prev => ({ ...prev, proficiency_level: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="A1">A1 - {t('level.beginner')}</SelectItem>
                      <SelectItem value="A2">A2 - {t('level.elementary')}</SelectItem>
                      <SelectItem value="B1">B1 - {t('level.intermediate')}</SelectItem>
                      <SelectItem value="B2">B2 - {t('level.upperIntermediate')}</SelectItem>
                      <SelectItem value="C1">C1 - {t('level.advanced')}</SelectItem>
                      <SelectItem value="C2">C2 - {t('level.proficiency')}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="time-limit">{t('upload.timeLimit')}</Label>
                  <Input
                    id="time-limit"
                    type="number"
                    min="1"
                    max="300"
                    value={quizConfig.time_limit_minutes}
                    onChange={(e) => setQuizConfig(prev => ({ ...prev, time_limit_minutes: parseInt(e.target.value) || 60 }))}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="passing-score">{t('upload.passingScore')}</Label>
                  <Input
                    id="passing-score"
                    type="number"
                    min="1"
                    max="100"
                    value={quizConfig.passing_score}
                    onChange={(e) => setQuizConfig(prev => ({ ...prev, passing_score: parseInt(e.target.value) || 70 }))}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="max-attempts">{t('upload.maxAttempts')}</Label>
                  <Input
                    id="max-attempts"
                    type="number"
                    min="1"
                    max="10"
                    value={quizConfig.max_attempts}
                    onChange={(e) => setQuizConfig(prev => ({ ...prev, max_attempts: parseInt(e.target.value) || 3 }))}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="correction-mode">{t('upload.correctionMode')}</Label>
                  <Select
                    value={quizConfig.correction_mode}
                    onValueChange={(value: 'immediate' | 'end_of_quiz' | 'manual') => 
                      setQuizConfig(prev => ({ ...prev, correction_mode: value }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="immediate">{t('correction.immediate')}</SelectItem>
                      <SelectItem value="end_of_quiz">{t('correction.endOfQuiz')}</SelectItem>
                      <SelectItem value="manual">{t('correction.manual')}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">{t('upload.description')}</Label>
                <Textarea
                  id="description"
                  value={quizConfig.description}
                  onChange={(e) => setQuizConfig(prev => ({ ...prev, description: e.target.value }))}
                  placeholder={t('upload.enterDescription')}
                  rows={3}
                />
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="show-results"
                  checked={quizConfig.show_results_immediately}
                  onChange={(e) => setQuizConfig(prev => ({ ...prev, show_results_immediately: e.target.checked }))}
                  className="rounded border-gray-300"
                />
                <Label htmlFor="show-results">{t('upload.showResultsImmediately')}</Label>
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <Card>
            <CardContent className="p-4">
              <div className="flex gap-4 justify-end">
                {onCancel && (
                  <Button variant="outline" onClick={onCancel}>
                    {t('button.cancel')}
                  </Button>
                )}
                <Button
                  onClick={handleCreateQuiz}
                  disabled={isCreatingQuiz || !quizConfig.title.trim()}
                  className="bg-academy-green hover:bg-academy-green/90"
                >
                  {isCreatingQuiz ? (
                    <>
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                      {t('upload.creating')}
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="h-4 w-4 mr-2" />
                      {t('upload.createQuiz')}
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </>
      )}

      {/* Question Preview Dialog */}
      <Dialog open={showPreview} onOpenChange={setShowPreview}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{t('upload.questionPreview')}</DialogTitle>
            <DialogDescription>
              {t('upload.previewDescription')}
            </DialogDescription>
          </DialogHeader>
          
          {parsedData && (
            <div className="space-y-4">
              {parsedData.questions.map((question, index) => (
                <Card key={index} className="border-l-4 border-l-blue-500">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{t('quiz.question')} {index + 1}</span>
                        <Badge variant="outline">{t(`quiz.type.${question.type}`)}</Badge>
                        {question.difficulty_level && (
                          <Badge variant="secondary">{t(`quiz.difficulty.${question.difficulty_level}`)}</Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">{question.points} {t('quiz.points')}</Badge>
                        {question.estimated_time && (
                          <Badge variant="outline">{question.estimated_time}m</Badge>
                        )}
                      </div>
                    </div>
                    
                    <p className="text-gray-800 mb-3">{question.question}</p>
                    
                    {question.options && (
                      <div className="space-y-2">
                        {question.options.map((option, optIndex) => (
                          <div 
                            key={optIndex} 
                            className={`p-2 rounded border ${
                              option.is_correct ? 'border-green-300 bg-green-50' : 'border-gray-200'
                            }`}
                          >
                            <div className="flex items-center gap-2">
                              <span className="font-medium text-blue-600">
                                {String.fromCharCode(65 + optIndex)}.
                              </span>
                              <span>{option.option_text}</span>
                              {option.is_correct && (
                                <CheckCircle2 className="h-4 w-4 text-green-600" />
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                    
                    {question.explanation && (
                      <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded">
                        <p className="text-sm text-blue-700">
                          <strong>{t('quiz.explanation')}:</strong> {question.explanation}
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowPreview(false)}>
              {t('button.close')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};