import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  ArrowLeft, 
  BookOpen, 
  Users, 
  Upload,
  FileText,
  Lightbulb,
  CheckCircle2,
  AlertTriangle
} from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { DocumentUpload } from '@/components/teacher/DocumentUpload';
import { fetchProgramById } from '@/services/api';

interface Program {
  id: string;
  name: string;
  description?: string;
  language: string;
  level: string;
  teacher_id: string;
  students_count: number;
  quizzes_count: number;
}

const CreateQuizFromDocument: React.FC = () => {
  const { programId } = useParams<{ programId: string }>();
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [showUpload, setShowUpload] = useState(false);

  const { data: programData, isLoading, error } = useQuery({
    queryKey: ['program', programId],
    queryFn: () => fetchProgramById(programId!),
    enabled: !!programId,
  });

  const program: Program | undefined = programData?.data;

  const handleQuizCreated = (quizId: string) => {
    navigate(`/teacher/quizzes/${quizId}`);
  };

  const handleCancel = () => {
    navigate(`/teacher/programs/${programId}/quizzes`);
  };

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="animate-pulse">
          <Card>
            <CardContent className="p-6">
              <div className="h-8 bg-gray-300 rounded w-1/3 mb-4"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2 mb-6"></div>
              <div className="h-32 bg-gray-200 rounded"></div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (error || !program) {
    return (
      <div className="max-w-2xl mx-auto text-center py-8">
        <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
        <h2 className="text-xl font-semibold text-gray-900 mb-2">{t('program.loadError')}</h2>
        <p className="text-gray-600 mb-4">{t('program.loadErrorDesc')}</p>
        <Button onClick={() => navigate('/teacher/programs')} variant="outline">
          {t('program.backToPrograms')}
        </Button>
      </div>
    );
  }

  if (showUpload) {
    return (
      <div className="space-y-6">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/teacher/programs')}
            className="p-0 h-auto font-normal"
          >
            {t('nav.programs')}
          </Button>
          <span>/</span>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate(`/teacher/programs/${programId}`)}
            className="p-0 h-auto font-normal"
          >
            {program.name}
          </Button>
          <span>/</span>
          <span className="text-gray-900">{t('quiz.createFromDocument')}</span>
        </div>

        <DocumentUpload
          programId={programId!}
          onQuizCreated={handleQuizCreated}
          onCancel={() => setShowUpload(false)}
        />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-gray-600">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate('/teacher/programs')}
          className="p-0 h-auto font-normal"
        >
          {t('nav.programs')}
        </Button>
        <span>/</span>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate(`/teacher/programs/${programId}`)}
          className="p-0 h-auto font-normal"
        >
          {program.name}
        </Button>
        <span>/</span>
        <span className="text-gray-900">{t('quiz.createFromDocument')}</span>
      </div>

      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl flex items-center gap-2">
                <FileText className="h-6 w-6" />
                {t('quiz.createFromDocument')}
              </CardTitle>
              <p className="text-gray-600 mt-2">{t('quiz.createFromDocumentDesc')}</p>
            </div>
            <Button
              variant="outline"
              onClick={handleCancel}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              {t('button.back')}
            </Button>
          </div>
        </CardHeader>
      </Card>

      {/* Program Info */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5" />
            {t('program.targetProgram')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">{program.name}</h3>
              {program.description && (
                <p className="text-gray-600 mt-1">{program.description}</p>
              )}
              <div className="flex items-center gap-4 mt-3">
                <Badge variant="outline" className="flex items-center gap-1">
                  <BookOpen className="h-3 w-3" />
                  {program.language}
                </Badge>
                <Badge variant="outline" className="flex items-center gap-1">
                  <Users className="h-3 w-3" />
                  {program.students_count} {t('program.students')}
                </Badge>
                <Badge variant="outline">
                  {program.level}
                </Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Getting Started */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lightbulb className="h-5 w-5" />
            {t('upload.gettingStarted')}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center p-4 border rounded-lg">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <FileText className="h-6 w-6 text-blue-600" />
              </div>
              <h4 className="font-medium text-gray-900 mb-2">{t('upload.step1Title')}</h4>
              <p className="text-sm text-gray-600">{t('upload.step1Desc')}</p>
            </div>

            <div className="text-center p-4 border rounded-lg">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <Upload className="h-6 w-6 text-green-600" />
              </div>
              <h4 className="font-medium text-gray-900 mb-2">{t('upload.step2Title')}</h4>
              <p className="text-sm text-gray-600">{t('upload.step2Desc')}</p>
            </div>

            <div className="text-center p-4 border rounded-lg">
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <CheckCircle2 className="h-6 w-6 text-purple-600" />
              </div>
              <h4 className="font-medium text-gray-900 mb-2">{t('upload.step3Title')}</h4>
              <p className="text-sm text-gray-600">{t('upload.step3Desc')}</p>
            </div>
          </div>

          <Separator />

          {/* Document Format Guidelines */}
          <div className="space-y-4">
            <h4 className="font-medium text-gray-900">{t('upload.formatGuidelines')}</h4>
            
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h5 className="font-medium text-blue-900 mb-2">{t('upload.multipleChoice')}</h5>
              <div className="text-sm text-blue-800 space-y-1">
                <p>{t('upload.mcExample1')}</p>
                <p className="font-mono bg-white p-2 rounded border">
                  What is the capital of France?<br/>
                  A) London<br/>
                  B) Berlin<br/>
                  C) Paris*<br/>
                  D) Madrid
                </p>
                <p className="text-xs text-blue-600">{t('upload.mcNote')}</p>
              </div>
            </div>

            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <h5 className="font-medium text-green-900 mb-2">{t('upload.fillBlank')}</h5>
              <div className="text-sm text-green-800 space-y-1">
                <p>{t('upload.fbExample1')}</p>
                <p className="font-mono bg-white p-2 rounded border">
                  The capital of France is _____.
                </p>
                <p className="text-xs text-green-600">{t('upload.fbNote')}</p>
              </div>
            </div>

            <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
              <h5 className="font-medium text-orange-900 mb-2">{t('upload.shortAnswer')}</h5>
              <div className="text-sm text-orange-800 space-y-1">
                <p>{t('upload.saExample1')}</p>
                <p className="font-mono bg-white p-2 rounded border">
                  Explain the process of photosynthesis in plants.
                </p>
                <p className="text-xs text-orange-600">{t('upload.saNote')}</p>
              </div>
            </div>
          </div>

          <Separator />

          {/* Tips for Better Results */}
          <div className="space-y-3">
            <h4 className="font-medium text-gray-900">{t('upload.tipsTitle')}</h4>
            <ul className="space-y-2 text-sm text-gray-600">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5" />
                <span>{t('upload.tip1')}</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5" />
                <span>{t('upload.tip2')}</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5" />
                <span>{t('upload.tip3')}</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5" />
                <span>{t('upload.tip4')}</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5" />
                <span>{t('upload.tip5')}</span>
              </li>
            </ul>
          </div>

          {/* Action Button */}
          <div className="flex justify-center pt-4">
            <Button
              onClick={() => setShowUpload(true)}
              size="lg"
              className="bg-academy-green hover:bg-academy-green/90 flex items-center gap-2"
            >
              <Upload className="h-5 w-5" />
              {t('upload.startUpload')}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Additional Resources */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5" />
            {t('upload.additionalResources')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Alert>
              <FileText className="h-4 w-4" />
              <AlertDescription>
                <strong>{t('upload.sampleTemplate')}</strong><br/>
                {t('upload.sampleTemplateDesc')}
                <Button variant="link" className="p-0 h-auto ml-2">
                  {t('upload.downloadTemplate')}
                </Button>
              </AlertDescription>
            </Alert>

            <Alert>
              <Lightbulb className="h-4 w-4" />
              <AlertDescription>
                <strong>{t('upload.needHelp')}</strong><br/>
                {t('upload.needHelpDesc')}
                <Button variant="link" className="p-0 h-auto ml-2">
                  {t('upload.viewGuide')}
                </Button>
              </AlertDescription>
            </Alert>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CreateQuizFromDocument;