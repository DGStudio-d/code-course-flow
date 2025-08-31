import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { DocumentUpload } from '../DocumentUpload';

// Mock the language context
jest.mock('@/contexts/LanguageContext', () => ({
  useLanguage: () => ({
    t: (key: string) => key,
    dir: 'ltr'
  })
}));

// Mock the toast hook
jest.mock('@/components/ui/use-toast', () => ({
  useToast: () => ({
    toast: jest.fn()
  })
}));

// Mock fetch
global.fetch = jest.fn();

describe('DocumentUpload', () => {
  let queryClient: QueryClient;
  const mockOnQuizCreated = jest.fn();
  const mockOnCancel = jest.fn();

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false },
      },
    });
    
    mockOnQuizCreated.mockClear();
    mockOnCancel.mockClear();
    (fetch as jest.Mock).mockClear();
  });

  const renderComponent = (props = {}) => {
    return render(
      <QueryClientProvider client={queryClient}>
        <DocumentUpload
          programId="test-program-id"
          onQuizCreated={mockOnQuizCreated}
          onCancel={mockOnCancel}
          {...props}
        />
      </QueryClientProvider>
    );
  };

  it('renders upload interface', () => {
    renderComponent();

    expect(screen.getByText('upload.title')).toBeInTheDocument();
    expect(screen.getByText('upload.selectDocument')).toBeInTheDocument();
    expect(screen.getByText('upload.dragDrop')).toBeInTheDocument();
    expect(screen.getByText('upload.browseFiles')).toBeInTheDocument();
  });

  it('shows file requirements', () => {
    renderComponent();

    expect(screen.getByText('upload.requirements')).toBeInTheDocument();
    expect(screen.getByText(/upload.supportedFormats/)).toBeInTheDocument();
    expect(screen.getByText(/upload.maxSize/)).toBeInTheDocument();
  });

  it('handles file selection via input', async () => {
    const user = userEvent.setup();
    renderComponent();

    const file = new File(['test content'], 'test.docx', {
      type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    });

    const fileInput = screen.getByRole('button', { name: /upload.browseFiles/ });
    await user.click(fileInput);

    // Simulate file selection
    const hiddenInput = document.querySelector('input[type="file"]') as HTMLInputElement;
    Object.defineProperty(hiddenInput, 'files', {
      value: [file],
      writable: false,
    });

    fireEvent.change(hiddenInput);

    expect(screen.getByText('test.docx')).toBeInTheDocument();
  });

  it('validates file size', async () => {
    const user = userEvent.setup();
    renderComponent();

    // Create a file that's too large (15MB)
    const largeFile = new File(['x'.repeat(15 * 1024 * 1024)], 'large.docx', {
      type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    });

    const fileInput = screen.getByRole('button', { name: /upload.browseFiles/ });
    await user.click(fileInput);

    const hiddenInput = document.querySelector('input[type="file"]') as HTMLInputElement;
    Object.defineProperty(hiddenInput, 'files', {
      value: [largeFile],
      writable: false,
    });

    fireEvent.change(hiddenInput);

    expect(screen.getByText('upload.fileTooLarge')).toBeInTheDocument();
  });

  it('validates file type', async () => {
    const user = userEvent.setup();
    renderComponent();

    const invalidFile = new File(['test'], 'test.exe', {
      type: 'application/x-executable'
    });

    const fileInput = screen.getByRole('button', { name: /upload.browseFiles/ });
    await user.click(fileInput);

    const hiddenInput = document.querySelector('input[type="file"]') as HTMLInputElement;
    Object.defineProperty(hiddenInput, 'files', {
      value: [invalidFile],
      writable: false,
    });

    fireEvent.change(hiddenInput);

    expect(screen.getByText('upload.invalidFileType')).toBeInTheDocument();
  });

  it('handles drag and drop', async () => {
    renderComponent();

    const file = new File(['test content'], 'test.docx', {
      type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    });

    const dropZone = screen.getByText('upload.dragDrop').closest('div');
    
    fireEvent.dragOver(dropZone!);
    fireEvent.drop(dropZone!, {
      dataTransfer: {
        files: [file],
      },
    });

    expect(screen.getByText('test.docx')).toBeInTheDocument();
  });

  it('removes selected file', async () => {
    const user = userEvent.setup();
    renderComponent();

    const file = new File(['test content'], 'test.docx', {
      type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    });

    // Select file
    const fileInput = screen.getByRole('button', { name: /upload.browseFiles/ });
    await user.click(fileInput);

    const hiddenInput = document.querySelector('input[type="file"]') as HTMLInputElement;
    Object.defineProperty(hiddenInput, 'files', {
      value: [file],
      writable: false,
    });

    fireEvent.change(hiddenInput);

    expect(screen.getByText('test.docx')).toBeInTheDocument();

    // Remove file
    const removeButton = screen.getByRole('button', { name: '' }); // Trash icon button
    await user.click(removeButton);

    expect(screen.queryByText('test.docx')).not.toBeInTheDocument();
    expect(screen.getByText('upload.dragDrop')).toBeInTheDocument();
  });

  it('uploads and parses document', async () => {
    const user = userEvent.setup();
    
    const mockParsedData = {
      title: 'Test Quiz',
      description: 'Test Description',
      proficiency_level: 'B1',
      questions: [
        {
          type: 'multiple_choice',
          question: 'What is 2+2?',
          points: 2,
          options: [
            { option_text: '3', is_correct: false },
            { option_text: '4', is_correct: true }
          ]
        }
      ],
      metadata: {
        total_questions: 1,
        total_points: 2,
        estimated_duration: 5,
        question_types: ['multiple_choice'],
        difficulty_distribution: { medium: 1 }
      }
    };

    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ data: mockParsedData })
    });

    renderComponent();

    const file = new File(['test content'], 'test.docx', {
      type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    });

    // Select file
    const fileInput = screen.getByRole('button', { name: /upload.browseFiles/ });
    await user.click(fileInput);

    const hiddenInput = document.querySelector('input[type="file"]') as HTMLInputElement;
    Object.defineProperty(hiddenInput, 'files', {
      value: [file],
      writable: false,
    });

    fireEvent.change(hiddenInput);

    // Upload and parse
    const uploadButton = screen.getByText('upload.uploadAndParse');
    await user.click(uploadButton);

    await waitFor(() => {
      expect(screen.getByText('upload.parseResults')).toBeInTheDocument();
    });

    expect(screen.getByText('1')).toBeInTheDocument(); // Total questions
    expect(screen.getByText('2')).toBeInTheDocument(); // Total points
  });

  it('shows question preview', async () => {
    const user = userEvent.setup();
    
    const mockParsedData = {
      title: 'Test Quiz',
      questions: [
        {
          type: 'multiple_choice',
          question: 'What is 2+2?',
          points: 2,
          options: [
            { option_text: '3', is_correct: false },
            { option_text: '4', is_correct: true }
          ]
        }
      ],
      metadata: {
        total_questions: 1,
        total_points: 2,
        estimated_duration: 5,
        question_types: ['multiple_choice'],
        difficulty_distribution: {}
      }
    };

    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ data: mockParsedData })
    });

    renderComponent();

    const file = new File(['test content'], 'test.docx', {
      type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    });

    // Select and upload file
    const fileInput = screen.getByRole('button', { name: /upload.browseFiles/ });
    await user.click(fileInput);

    const hiddenInput = document.querySelector('input[type="file"]') as HTMLInputElement;
    Object.defineProperty(hiddenInput, 'files', {
      value: [file],
      writable: false,
    });

    fireEvent.change(hiddenInput);

    const uploadButton = screen.getByText('upload.uploadAndParse');
    await user.click(uploadButton);

    await waitFor(() => {
      expect(screen.getByText('upload.parseResults')).toBeInTheDocument();
    });

    // Open preview
    const previewButton = screen.getByText('upload.previewQuestions');
    await user.click(previewButton);

    expect(screen.getByText('upload.questionPreview')).toBeInTheDocument();
    expect(screen.getByText('What is 2+2?')).toBeInTheDocument();
    expect(screen.getByText('3')).toBeInTheDocument();
    expect(screen.getByText('4')).toBeInTheDocument();
  });

  it('configures quiz settings', async () => {
    const user = userEvent.setup();
    
    const mockParsedData = {
      title: 'Test Quiz',
      questions: [{ type: 'multiple_choice', question: 'Test?', points: 1 }],
      metadata: {
        total_questions: 1,
        total_points: 1,
        estimated_duration: 5,
        question_types: ['multiple_choice'],
        difficulty_distribution: {}
      }
    };

    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ data: mockParsedData })
    });

    renderComponent();

    const file = new File(['test'], 'test.docx', {
      type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    });

    // Upload file
    const fileInput = screen.getByRole('button', { name: /upload.browseFiles/ });
    await user.click(fileInput);

    const hiddenInput = document.querySelector('input[type="file"]') as HTMLInputElement;
    Object.defineProperty(hiddenInput, 'files', {
      value: [file],
      writable: false,
    });

    fireEvent.change(hiddenInput);

    const uploadButton = screen.getByText('upload.uploadAndParse');
    await user.click(uploadButton);

    await waitFor(() => {
      expect(screen.getByText('upload.quizConfiguration')).toBeInTheDocument();
    });

    // Update quiz title
    const titleInput = screen.getByLabelText('upload.quizTitle');
    await user.clear(titleInput);
    await user.type(titleInput, 'My Custom Quiz');

    expect(titleInput).toHaveValue('My Custom Quiz');

    // Update time limit
    const timeLimitInput = screen.getByLabelText('upload.timeLimit');
    await user.clear(timeLimitInput);
    await user.type(timeLimitInput, '90');

    expect(timeLimitInput).toHaveValue(90);
  });

  it('creates quiz from parsed data', async () => {
    const user = userEvent.setup();
    
    const mockParsedData = {
      title: 'Test Quiz',
      questions: [{ type: 'multiple_choice', question: 'Test?', points: 1 }],
      metadata: {
        total_questions: 1,
        total_points: 1,
        estimated_duration: 5,
        question_types: ['multiple_choice'],
        difficulty_distribution: {}
      }
    };

    const mockCreatedQuiz = { id: 'quiz-123' };

    (fetch as jest.Mock)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ data: mockParsedData })
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ data: mockCreatedQuiz })
      });

    renderComponent();

    const file = new File(['test'], 'test.docx', {
      type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    });

    // Upload and parse
    const fileInput = screen.getByRole('button', { name: /upload.browseFiles/ });
    await user.click(fileInput);

    const hiddenInput = document.querySelector('input[type="file"]') as HTMLInputElement;
    Object.defineProperty(hiddenInput, 'files', {
      value: [file],
      writable: false,
    });

    fireEvent.change(hiddenInput);

    const uploadButton = screen.getByText('upload.uploadAndParse');
    await user.click(uploadButton);

    await waitFor(() => {
      expect(screen.getByText('upload.createQuiz')).toBeInTheDocument();
    });

    // Create quiz
    const createButton = screen.getByText('upload.createQuiz');
    await user.click(createButton);

    await waitFor(() => {
      expect(mockOnQuizCreated).toHaveBeenCalledWith('quiz-123');
    });
  });

  it('handles upload errors', async () => {
    const user = userEvent.setup();
    
    (fetch as jest.Mock).mockRejectedValueOnce(new Error('Upload failed'));

    renderComponent();

    const file = new File(['test'], 'test.docx', {
      type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    });

    // Select file
    const fileInput = screen.getByRole('button', { name: /upload.browseFiles/ });
    await user.click(fileInput);

    const hiddenInput = document.querySelector('input[type="file"]') as HTMLInputElement;
    Object.defineProperty(hiddenInput, 'files', {
      value: [file],
      writable: false,
    });

    fireEvent.change(hiddenInput);

    // Try to upload
    const uploadButton = screen.getByText('upload.uploadAndParse');
    await user.click(uploadButton);

    // Should handle error gracefully
    await waitFor(() => {
      expect(screen.queryByText('upload.parseResults')).not.toBeInTheDocument();
    });
  });

  it('calls onCancel when cancel button is clicked', async () => {
    const user = userEvent.setup();
    renderComponent();

    // Mock parsed data to show cancel button
    const mockParsedData = {
      title: 'Test Quiz',
      questions: [{ type: 'multiple_choice', question: 'Test?', points: 1 }],
      metadata: {
        total_questions: 1,
        total_points: 1,
        estimated_duration: 5,
        question_types: ['multiple_choice'],
        difficulty_distribution: {}
      }
    };

    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ data: mockParsedData })
    });

    const file = new File(['test'], 'test.docx', {
      type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    });

    // Upload file to show cancel button
    const fileInput = screen.getByRole('button', { name: /upload.browseFiles/ });
    await user.click(fileInput);

    const hiddenInput = document.querySelector('input[type="file"]') as HTMLInputElement;
    Object.defineProperty(hiddenInput, 'files', {
      value: [file],
      writable: false,
    });

    fireEvent.change(hiddenInput);

    const uploadButton = screen.getByText('upload.uploadAndParse');
    await user.click(uploadButton);

    await waitFor(() => {
      expect(screen.getByText('button.cancel')).toBeInTheDocument();
    });

    const cancelButton = screen.getByText('button.cancel');
    await user.click(cancelButton);

    expect(mockOnCancel).toHaveBeenCalled();
  });
});