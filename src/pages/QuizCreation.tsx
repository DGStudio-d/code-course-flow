
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Badge } from '@/components/ui/badge';
import { Trash2, Plus, Save, ArrowLeft } from 'lucide-react';
import { useSelector } from 'react-redux';
import type { RootState } from '@/config/store/store';

const questionSchema = z.object({
  question: z.string().min(1, 'Question text is required').max(500, 'Question text must be 500 characters or less'),
  options: z.array(z.string().min(1, 'Option cannot be empty').max(200, 'Option must be 200 characters or less')).min(2, 'At least 2 options required').max(6, 'Maximum 6 options allowed'),
  correct_answer: z.string().min(1, 'Correct answer is required'),
  points: z.number().min(1).max(10).optional().default(1),
  type: z.string().optional().default('multiple_choice'),
  audio_file: z.string().optional().nullable(),
});

const quizSchema = z.object({
  title: z.string().min(1, 'Title is required').max(255, 'Title must be 255 characters or less'),
  description: z.string().max(1000, 'Description must be 1000 characters or less').optional(),
  language_id: z.number().min(1, 'Language is required'),
  difficulty: z.enum(['beginner', 'intermediate', 'advanced'], {
    required_error: 'Difficulty is required',
  }),
  time_limit: z.number().min(1).max(300).optional().nullable(),
  questions: z.array(questionSchema).min(1, 'At least one question is required').max(50, 'Maximum 50 questions allowed'),
});

type QuizFormData = z.infer<typeof quizSchema>;

const QuizCreation = () => {
  const navigate = useNavigate();
  const languages = useSelector((state: RootState) => state.appData.languages);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<QuizFormData>({
    resolver: zodResolver(quizSchema),
    defaultValues: {
      title: '',
      description: '',
      language_id: 0,
      difficulty: 'beginner',
      time_limit: null,
      questions: [
        {
          question: '',
          options: ['', ''],
          correct_answer: '',
          points: 1,
          type: 'multiple_choice',
          audio_file: null,
        },
      ],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'questions',
  });

  const addQuestion = () => {
    if (fields.length < 50) {
      append({
        question: '',
        options: ['', ''],
        correct_answer: '',
        points: 1,
        type: 'multiple_choice',
        audio_file: null,
      });
    }
  };

  const addOption = (questionIndex: number) => {
    const currentOptions = form.getValues(`questions.${questionIndex}.options`);
    if (currentOptions.length < 6) {
      form.setValue(`questions.${questionIndex}.options`, [...currentOptions, '']);
    }
  };

  const removeOption = (questionIndex: number, optionIndex: number) => {
    const currentOptions = form.getValues(`questions.${questionIndex}.options`);
    if (currentOptions.length > 2) {
      const newOptions = currentOptions.filter((_, index) => index !== optionIndex);
      form.setValue(`questions.${questionIndex}.options`, newOptions);
      
      const correctAnswer = form.getValues(`questions.${questionIndex}.correct_answer`);
      if (correctAnswer === currentOptions[optionIndex]) {
        form.setValue(`questions.${questionIndex}.correct_answer`, '');
      }
    }
  };

  const onSubmit = async (data: QuizFormData) => {
    setIsSubmitting(true);
    try {
      // Validate that correct answers match options for each question
      for (const question of data.questions) {
        if (!question.options.includes(question.correct_answer)) {
          throw new Error('Correct answer must match one of the provided options');
        }
      }

      console.log('Quiz data:', data);
      // TODO: Implement API call to save quiz
      
      navigate('/admin/quizzes');
    } catch (error) {
      console.error('Error creating quiz:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              onClick={() => navigate('/admin/quizzes')}
              className="flex items-center space-x-2"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Quizzes</span>
            </Button>
            <h1 className="text-3xl font-bold text-gray-900">Create New Quiz</h1>
          </div>
        </div>

        <p className="text-gray-600 mb-6">
          Fill out the following form to create your quiz. Make sure to follow the rules shown below each field.
        </p>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Quiz Info Section */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <span>🏷️</span>
                  <span>Quiz Info</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Title (required)</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          placeholder="Enter a unique title"
                          maxLength={255}
                        />
                      </FormControl>
                      <p className="text-sm text-gray-500">
                        → Enter a unique title (max 255 characters). Must not match the title of an existing quiz.
                      </p>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description (optional)</FormLabel>
                      <FormControl>
                        <Textarea
                          {...field}
                          placeholder="Briefly describe your quiz"
                          maxLength={1000}
                          rows={3}
                        />
                      </FormControl>
                      <p className="text-sm text-gray-500">
                        → Briefly describe your quiz (max 1000 characters).
                      </p>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <FormField
                    control={form.control}
                    name="language_id"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Language (required)</FormLabel>
                        <Select onValueChange={(value) => field.onChange(parseInt(value))} value={field.value ? String(field.value) : ''}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select language" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {languages?.map((lang: any) => (
                              <SelectItem key={lang.id} value={String(lang.id)}>
                                {lang.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <p className="text-sm text-gray-500">
                          → Select the language this quiz is written in. You must choose from the available options.
                        </p>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="difficulty"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Difficulty (required)</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select difficulty" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="beginner">Beginner</SelectItem>
                            <SelectItem value="intermediate">Intermediate</SelectItem>
                            <SelectItem value="advanced">Advanced</SelectItem>
                          </SelectContent>
                        </Select>
                        <p className="text-sm text-gray-500">
                          → Choose one: Beginner, Intermediate, or Advanced.
                        </p>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="time_limit"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Time Limit (optional)</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            type="number"
                            placeholder="Minutes"
                            min={1}
                            max={300}
                            onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : null)}
                            value={field.value || ''}
                          />
                        </FormControl>
                        <p className="text-sm text-gray-500">
                          → Duration in minutes (between 1 and 300). Leave blank for no time limit.
                        </p>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Questions Section */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center space-x-2">
                    <span>❓</span>
                    <span>Questions (Min: 1, Max: 50)</span>
                  </CardTitle>
                  <Badge variant="secondary">
                    {fields.length} question{fields.length !== 1 ? 's' : ''}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {fields.map((field, questionIndex) => (
                  <Card key={field.id} className="border-l-4 border-l-blue-500">
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <h4 className="text-lg font-semibold">Question {questionIndex + 1}</h4>
                        {fields.length > 1 && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => remove(questionIndex)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <FormField
                        control={form.control}
                        name={`questions.${questionIndex}.question`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Question Text (required)</FormLabel>
                            <FormControl>
                              <Textarea
                                {...field}
                                placeholder="Enter your question"
                                maxLength={500}
                                rows={2}
                              />
                            </FormControl>
                            <p className="text-sm text-gray-500">
                              → Up to 500 characters.
                            </p>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <div>
                        <Label>Options (2 to 6 required)</Label>
                        <p className="text-sm text-gray-500 mb-3">
                          → Add at least two answer choices (each max 200 characters).
                        </p>
                        <div className="space-y-2">
                          {form.watch(`questions.${questionIndex}.options`).map((option, optionIndex) => (
                            <div key={optionIndex} className="flex items-center space-x-2">
                              <span className="text-sm font-medium min-w-[20px]">
                                {String.fromCharCode(65 + optionIndex)}.
                              </span>
                              <FormField
                                control={form.control}
                                name={`questions.${questionIndex}.options.${optionIndex}`}
                                render={({ field }) => (
                                  <FormItem className="flex-1">
                                    <FormControl>
                                      <Input
                                        {...field}
                                        placeholder={`Option ${optionIndex + 1}`}
                                        maxLength={200}
                                      />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                              {form.watch(`questions.${questionIndex}.options`).length > 2 && (
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => removeOption(questionIndex, optionIndex)}
                                  className="text-red-600 hover:text-red-700"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              )}
                            </div>
                          ))}
                          {form.watch(`questions.${questionIndex}.options`).length < 6 && (
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => addOption(questionIndex)}
                              className="w-full"
                            >
                              <Plus className="w-4 h-4 mr-2" />
                              Add Option
                            </Button>
                          )}
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <FormField
                          control={form.control}
                          name={`questions.${questionIndex}.correct_answer`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Correct Answer (required)</FormLabel>
                              <Select onValueChange={field.onChange} value={field.value}>
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select correct answer" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  {form.watch(`questions.${questionIndex}.options`).map((option, index) => (
                                    option && (
                                      <SelectItem key={index} value={option}>
                                        {String.fromCharCode(65 + index)}. {option}
                                      </SelectItem>
                                    )
                                  ))}
                                </SelectContent>
                              </Select>
                              <p className="text-sm text-gray-500">
                                → Must exactly match one of the provided options.
                              </p>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name={`questions.${questionIndex}.points`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Points (optional)</FormLabel>
                              <FormControl>
                                <Input
                                  {...field}
                                  type="number"
                                  placeholder="1"
                                  min={1}
                                  max={10}
                                  onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : 1)}
                                  value={field.value || 1}
                                />
                              </FormControl>
                              <p className="text-sm text-gray-500">
                                → Integer between 1 and 10. Leave blank to default to 1 point.
                              </p>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name={`questions.${questionIndex}.audio_file`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Audio File (optional)</FormLabel>
                              <FormControl>
                                <Input
                                  {...field}
                                  placeholder="Audio file URL"
                                  value={field.value || ''}
                                />
                              </FormControl>
                              <p className="text-sm text-gray-500">
                                → Optional audio file URL or upload.
                              </p>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </CardContent>
                  </Card>
                ))}

                {fields.length < 50 && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={addQuestion}
                    className="w-full border-2 border-dashed border-green-300 text-green-600 hover:border-green-400 hover:text-green-700 py-6"
                  >
                    <Plus className="w-5 h-5 mr-2" />
                    🟢 Add Another Question
                  </Button>
                )}
              </CardContent>
            </Card>

            {/* Submit Button */}
            <div className="flex justify-end space-x-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate('/admin/quizzes')}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
                className="flex items-center space-x-2"
              >
                <Save className="w-4 h-4" />
                <span>{isSubmitting ? 'Creating...' : 'Create Quiz'}</span>
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
};

export default QuizCreation;
