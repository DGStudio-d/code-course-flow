import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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
  DialogTrigger,
} from '@/components/ui/dialog';
import { 
  CheckCircle2, 
  XCircle, 
  AlertCircle, 
  Edit3,
  Save,
  RefreshCw,
  Eye,
  Users,
  BarChart3,
  Clock,
  Target,
  BookOpen,
  Lightbulb,
  MessageSquare,
  TrendingUp,
  Filter,
  Search,
  Download,
  Upload,
  Zap,
  Award
} from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useMutation, useQuery } from '@tanstack/react-query';
import { useToast } from '@/components/ui/use-toast';

// Enhanced interfaces
interface StudentSubmission {
  id: string;
  student_id: string;
  student_name: string;
  submitted_at: string;
  total_score: number;
  max_possible_score: number;
  percentage: number;
  is_passed: boolean;
  correction_status: 'pending' | 'in_progress' | 'completed' | 'reviewed';
  answers: Array<{
    id: string;
    question_id: string;
    question_text: string;
    question_type: string;
    answer_text?: string;
    selected_option_id?: string;
    is_correct: boolean;
    points_earned: number;
    max_points: number;
  }>;
}

interface CorrectionTemplate {
  id: string;
  name: string;
  question_type: string;
  common_mistakes: string[];
  improvement_suggestions: string[];
  learning_resources: Array<{
    title: string;
    url: string;
    type: 'video' | 'article' | 'exercise';
  }>;
}

interface CorrectionManagementProps {
  quizId: string;
  quizTitle: string;
  onCorrectionComplete?: (submissionId: string) => void;
  onBulkCorrection?: (submissionIds: string[]) => void;
}

export const CorrectionManagement: React.FC<CorrectionManagementProps> = ({
  quizId,
  quizTitle,
  onCorrectionComplete,
  onBulkCorrection
}) => {
  const { t } = useLanguage();
  const { toast } = useToast();

  // State management
  const [selectedSubmissions, setSelectedSubmissions] = useState<string[]>([]);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [editingSubmission, setEditingSubmission] = useState<string | null>(null);
  const [correctionData, setCorrectionData] = useState<Record<string, any>>({});
  const [showTemplateDialog, setShowTemplateDialog] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<CorrectionTemplate | null>(null);

  // Fetch submissions
  const { data: submissionsData, isLoading, refetch } = useQuery({
    queryKey: ['quiz-submissions', quizId],
    queryFn: async () => {
      const response = await fetch(`/api/v1/teacher/quizzes/${quizId}/submissions`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });
      if (!response.ok) throw new Error('Failed to fetch submissions');
      return response.json();
    },
  });

  // Fetch correction templates
  const { data: templatesData } = useQuery({
    queryKey: ['correction-templates'],
    queryFn: async () => {
      const response = await fetch('/api/v1/teacher/correction-templates', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });
      if (!response.ok) throw new Error('Failed to fetch templates');
      return response.json();
    },
  });

  // Generate corrections mutation
  const generateCorrectionsMutation = useMutation({
    mutationFn: async (submissionId: string) => {
      const response = await fetch(`/api/v1/teacher/corrections/submissions/${submissionId}/generate`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json',
        },
      });
      if (!response.ok) throw new Error('Failed to generate corrections');
      return response.json();
    },
    onSuccess: (data, submissionId) => {
      toast({
        title: t('corrections.generated'),
        description: t('corrections.generatedDesc'),
      });
      refetch();
      if (onCorrectionComplete) {
        onCorrectionComplete(submissionId);
      }
    },
    onError: (error: any) => {
      toast({
        title: t('corrections.generateError'),
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  // Update correction mutation
  const updateCorrectionMutation = useMutation({
    mutationFn: async ({ correctionId, data }: { correctionId: string; data: any }) => {
      const response = await fetch(`/api/v1/teacher/corrections/${correctionId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error('Failed to update correction');
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: t('corrections.updated'),
        description: t('corrections.updatedDesc'),
      });
      refetch();
    },
  });

  const submissions: StudentSubmission[] = submissionsData?.data || [];
  const templates: CorrectionTemplate[] = templatesData?.data || [];

  // Filter submissions
  const filteredSubmissions = submissions.filter(submission => {
    const matchesStatus = filterStatus === 'all' || submission.correction_status === filterStatus;
    const matchesSearch = submission.student_name.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'in_progress': return 'bg-blue-100 text-blue-800';
      case 'reviewed': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle2 className="h-4 w-4" />;
      case 'in_progress': return <Clock className="h-4 w-4" />;
      case 'reviewed': return <Eye className="h-4 w-4" />;
      default: return <AlertCircle className="h-4 w-4" />;
    }
  };

  const handleSelectSubmission = (submissionId: string) => {
    setSelectedSubmissions(prev => 
      prev.includes(submissionId) 
        ? prev.filter(id => id !== submissionId)
        : [...prev, submissionId]
    );
  };

  const handleSelectAll = () => {
    if (selectedSubmissions.length === filteredSubmissions.length) {
      setSelectedSubmissions([]);
    } else {
      setSelectedSubmissions(filteredSubmissions.map(s => s.id));
    }
  };

  const handleBulkGenerate = () => {
    selectedSubmissions.forEach(submissionId => {
      generateCorrectionsMutation.mutate(submissionId);
    });
    setSelectedSubmissions([]);
  };

  const handleApplyTemplate = (submission: StudentSubmission, template: CorrectionTemplate) => {
    // Apply template to submission corrections
    const templateData = {
      improvement_suggestions: template.improvement_suggestions,
      learning_resources: template.learning_resources,
      common_mistakes: template.common_mistakes,
    };
    
    // Update each answer's correction with template data
    submission.answers.forEach(answer => {
      if (answer.question_type === template.question_type && !answer.is_correct) {
        updateCorrectionMutation.mutate({
          correctionId: answer.id,
          data: templateData
        });
      }
    });

    setShowTemplateDialog(false);
    setSelectedTemplate(null);
  };

  const getCorrectionStats = () => {
    const total = submissions.length;
    const completed = submissions.filter(s => s.correction_status === 'completed').length;
    const inProgress = submissions.filter(s => s.correction_status === 'in_progress').length;
    const pending = submissions.filter(s => s.correction_status === 'pending').length;

    return { total, completed, inProgress, pending };
  };

  const stats = getCorrectionStats();

  if (isLoading) {
    return (
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="animate-pulse">
          <Card>
            <CardContent className="p-6">
              <div className="h-8 bg-gray-300 rounded w-1/3 mb-4"></div>
              <div className="space-y-3">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="h-16 bg-gray-200 rounded"></div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl flex items-center gap-2">
                <MessageSquare className="h-6 w-6" />
                {t('corrections.management')}
              </CardTitle>
              <p className="text-gray-600 mt-1">{quizTitle}</p>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                onClick={() => refetch()}
                className="flex items-center gap-2"
              >
                <RefreshCw className="h-4 w-4" />
                {t('corrections.refresh')}
              </Button>
              <Dialog open={showTemplateDialog} onOpenChange={setShowTemplateDialog}>
                <DialogTrigger asChild>
                  <Button variant="outline" className="flex items-center gap-2">
                    <BookOpen className="h-4 w-4" />
                    {t('corrections.templates')}
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>{t('corrections.correctionTemplates')}</DialogTitle>
                    <DialogDescription>
                      {t('corrections.templatesDesc')}
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 max-h-96 overflow-y-auto">
                    {templates.map(template => (
                      <Card key={template.id} className="cursor-pointer hover:bg-gray-50">
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between">
                            <div>
                              <h4 className="font-medium">{template.name}</h4>
                              <Badge variant="outline" className="mt-1">
                                {t(`quiz.type.${template.question_type}`)}
                              </Badge>
                              <p className="text-sm text-gray-600 mt-2">
                                {template.improvement_suggestions.length} {t('corrections.suggestions')}, {' '}
                                {template.learning_resources.length} {t('corrections.resources')}
                              </p>
                            </div>
                            <Button
                              size="sm"
                              onClick={() => setSelectedTemplate(template)}
                            >
                              {t('corrections.select')}
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Statistics */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            {t('corrections.statistics')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-blue-50 rounded-lg border border-blue-200">
              <div className="text-3xl font-bold text-blue-600">{stats.total}</div>
              <div className="text-sm text-gray-600">{t('corrections.totalSubmissions')}</div>
            </div>
            
            <div className="text-center p-4 bg-green-50 rounded-lg border border-green-200">
              <div className="text-3xl font-bold text-green-600">{stats.completed}</div>
              <div className="text-sm text-gray-600">{t('corrections.completed')}</div>
            </div>
            
            <div className="text-center p-4 bg-yellow-50 rounded-lg border border-yellow-200">
              <div className="text-3xl font-bold text-yellow-600">{stats.inProgress}</div>
              <div className="text-sm text-gray-600">{t('corrections.inProgress')}</div>
            </div>
            
            <div className="text-center p-4 bg-red-50 rounded-lg border border-red-200">
              <div className="text-3xl font-bold text-red-600">{stats.pending}</div>
              <div className="text-sm text-gray-600">{t('corrections.pending')}</div>
            </div>
          </div>

          <div className="mt-4">
            <div className="flex justify-between text-sm mb-2">
              <span>{t('corrections.completionProgress')}</span>
              <span>{stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0}%</span>
            </div>
            <Progress value={stats.total > 0 ? (stats.completed / stats.total) * 100 : 0} className="h-2" />
          </div>
        </CardContent>
      </Card>

      {/* Filters and Actions */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2">
              <Search className="h-4 w-4 text-gray-500" />
              <Input
                placeholder={t('corrections.searchStudents')}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-64"
              />
            </div>

            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t('corrections.allStatuses')}</SelectItem>
                <SelectItem value="pending">{t('corrections.pending')}</SelectItem>
                <SelectItem value="in_progress">{t('corrections.inProgress')}</SelectItem>
                <SelectItem value="completed">{t('corrections.completed')}</SelectItem>
                <SelectItem value="reviewed">{t('corrections.reviewed')}</SelectItem>
              </SelectContent>
            </Select>

            <div className="flex items-center gap-2 ml-auto">
              <span className="text-sm text-gray-600">
                {selectedSubmissions.length} {t('corrections.selected')}
              </span>
              
              {selectedSubmissions.length > 0 && (
                <>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleBulkGenerate}
                    disabled={generateCorrectionsMutation.isPending}
                    className="flex items-center gap-2"
                  >
                    <Zap className="h-4 w-4" />
                    {t('corrections.bulkGenerate')}
                  </Button>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setSelectedSubmissions([])}
                  >
                    {t('corrections.clearSelection')}
                  </Button>
                </>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Submissions List */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              {t('corrections.submissions')} ({filteredSubmissions.length})
            </CardTitle>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleSelectAll}
              >
                {selectedSubmissions.length === filteredSubmissions.length 
                  ? t('corrections.deselectAll') 
                  : t('corrections.selectAll')}
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredSubmissions.map(submission => (
              <Card key={submission.id} className="border-l-4 border-l-blue-500">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3">
                      <input
                        type="checkbox"
                        checked={selectedSubmissions.includes(submission.id)}
                        onChange={() => handleSelectSubmission(submission.id)}
                        className="mt-1"
                      />
                      
                      <div>
                        <h4 className="font-medium text-gray-900">{submission.student_name}</h4>
                        <div className="flex items-center gap-4 mt-1 text-sm text-gray-600">
                          <span>{new Date(submission.submitted_at).toLocaleDateString()}</span>
                          <span>{submission.percentage.toFixed(1)}% ({submission.total_score}/{submission.max_possible_score})</span>
                          <Badge className={submission.is_passed ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                            {submission.is_passed ? t('corrections.passed') : t('corrections.failed')}
                          </Badge>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Badge className={getStatusColor(submission.correction_status)}>
                        {getStatusIcon(submission.correction_status)}
                        {t(`corrections.status.${submission.correction_status}`)}
                      </Badge>

                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => generateCorrectionsMutation.mutate(submission.id)}
                        disabled={generateCorrectionsMutation.isPending}
                        className="flex items-center gap-2"
                      >
                        {generateCorrectionsMutation.isPending ? (
                          <RefreshCw className="h-4 w-4 animate-spin" />
                        ) : (
                          <Zap className="h-4 w-4" />
                        )}
                        {t('corrections.generate')}
                      </Button>

                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setEditingSubmission(submission.id)}
                        className="flex items-center gap-2"
                      >
                        <Edit3 className="h-4 w-4" />
                        {t('corrections.edit')}
                      </Button>
                    </div>
                  </div>

                  {/* Question Summary */}
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="text-center p-3 bg-green-50 rounded">
                        <div className="text-lg font-bold text-green-600">
                          {submission.answers.filter(a => a.is_correct).length}
                        </div>
                        <div className="text-xs text-green-700">{t('corrections.correct')}</div>
                      </div>
                      
                      <div className="text-center p-3 bg-yellow-50 rounded">
                        <div className="text-lg font-bold text-yellow-600">
                          {submission.answers.filter(a => !a.is_correct && a.points_earned > 0).length}
                        </div>
                        <div className="text-xs text-yellow-700">{t('corrections.partial')}</div>
                      </div>
                      
                      <div className="text-center p-3 bg-red-50 rounded">
                        <div className="text-lg font-bold text-red-600">
                          {submission.answers.filter(a => !a.is_correct && a.points_earned === 0).length}
                        </div>
                        <div className="text-xs text-red-700">{t('corrections.incorrect')}</div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}

            {filteredSubmissions.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                <MessageSquare className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                <p>{t('corrections.noSubmissions')}</p>
                <p className="text-sm mt-2">{t('corrections.noSubmissionsDesc')}</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Bulk Actions */}
      {selectedSubmissions.length > 0 && (
        <Card className="border-blue-200 bg-blue-50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Award className="h-5 w-5 text-blue-600" />
                <span className="font-medium text-blue-800">
                  {selectedSubmissions.length} {t('corrections.submissionsSelected')}
                </span>
              </div>
              
              <div className="flex items-center gap-2">
                <Button
                  onClick={handleBulkGenerate}
                  disabled={generateCorrectionsMutation.isPending}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  <Zap className="h-4 w-4 mr-2" />
                  {t('corrections.generateAll')}
                </Button>
                
                <Button
                  variant="outline"
                  onClick={() => {
                    if (onBulkCorrection) {
                      onBulkCorrection(selectedSubmissions);
                    }
                  }}
                >
                  <Download className="h-4 w-4 mr-2" />
                  {t('corrections.exportSelected')}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};