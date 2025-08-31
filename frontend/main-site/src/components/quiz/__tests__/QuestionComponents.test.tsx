import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { 
  MultipleChoiceQuestion,
  TrueFalseQuestion,
  FillBlankQuestion,
  ShortAnswerQuestion,
  EssayQuestion,
  QuestionTypeIcon,
  DifficultyBadge,
  QuestionProgress
} from '../QuestionComponents';

// Mock the language context
jest.mock('@/contexts/LanguageContext', () => ({
  useLanguage: () => ({
    t: (key: string) => key,
    dir: 'ltr'
  })
}));

describe('QuestionComponents', () => {
  const mockOnAnswerChange = jest.fn();

  beforeEach(() => {
    mockOnAnswerChange.mockClear();
  });

  describe('MultipleChoiceQuestion', () => {
    const mockQuestion = {
      id: '1',
      type: 'multiple_choice' as const,
      question: 'What is 2+2?',
      points: 2,
      options: [
        { id: 'a', option_text: '3', is_correct: false },
        { id: 'b', option_text: '4', is_correct: true },
        { id: 'c', option_text: '5', is_correct: false }
      ]
    };

    it('renders question with options', () => {
      render(
        <MultipleChoiceQuestion
          question={mockQuestion}
          onAnswerChange={mockOnAnswerChange}
        />
      );

      expect(screen.getByText('3')).toBeInTheDocument();
      expect(screen.getByText('4')).toBeInTheDocument();
      expect(screen.getByText('5')).toBeInTheDocument();
    });

    it('calls onAnswerChange when option is selected', async () => {
      const user = userEvent.setup();
      
      render(
        <MultipleChoiceQuestion
          question={mockQuestion}
          onAnswerChange={mockOnAnswerChange}
        />
      );

      const option = screen.getByLabelText(/4/);
      await user.click(option);

      expect(mockOnAnswerChange).toHaveBeenCalledWith('1', { selected_option_id: 'b' });
    });

    it('shows selected answer', () => {
      const answer = { question_id: '1', selected_option_id: 'b' };
      
      render(
        <MultipleChoiceQuestion
          question={mockQuestion}
          answer={answer}
          onAnswerChange={mockOnAnswerChange}
        />
      );

      const selectedOption = screen.getByRole('radio', { checked: true });
      expect(selectedOption).toHaveValue('b');
    });

    it('shows correction when provided', () => {
      const correction = {
        is_correct: false,
        correct_answer: '4',
        explanation: 'Basic math',
        improvement_suggestion: 'Practice more'
      };

      render(
        <MultipleChoiceQuestion
          question={mockQuestion}
          onAnswerChange={mockOnAnswerChange}
          showCorrection={true}
          correction={correction}
        />
      );

      expect(screen.getByText('quiz.incorrect')).toBeInTheDocument();
      expect(screen.getByText('4')).toBeInTheDocument();
    });

    it('is read-only when specified', async () => {
      const user = userEvent.setup();
      
      render(
        <MultipleChoiceQuestion
          question={mockQuestion}
          onAnswerChange={mockOnAnswerChange}
          isReadOnly={true}
        />
      );

      const option = screen.getByLabelText(/4/);
      await user.click(option);

      expect(mockOnAnswerChange).not.toHaveBeenCalled();
    });
  });

  describe('TrueFalseQuestion', () => {
    const mockQuestion = {
      id: '2',
      type: 'true_false' as const,
      question: 'The sky is blue.',
      points: 1,
      options: [
        { id: 'true', option_text: 'True', is_correct: true },
        { id: 'false', option_text: 'False', is_correct: false }
      ]
    };

    it('renders true/false options', () => {
      render(
        <TrueFalseQuestion
          question={mockQuestion}
          onAnswerChange={mockOnAnswerChange}
        />
      );

      expect(screen.getByText('True')).toBeInTheDocument();
      expect(screen.getByText('False')).toBeInTheDocument();
    });

    it('handles selection correctly', async () => {
      const user = userEvent.setup();
      
      render(
        <TrueFalseQuestion
          question={mockQuestion}
          onAnswerChange={mockOnAnswerChange}
        />
      );

      const trueOption = screen.getByLabelText('True');
      await user.click(trueOption);

      expect(mockOnAnswerChange).toHaveBeenCalledWith('2', { selected_option_id: 'true' });
    });
  });

  describe('FillBlankQuestion', () => {
    const mockQuestion = {
      id: '3',
      type: 'fill_blank' as const,
      question: 'The capital of France is _____.',
      points: 2
    };

    it('renders input field for blank', () => {
      render(
        <FillBlankQuestion
          question={mockQuestion}
          onAnswerChange={mockOnAnswerChange}
        />
      );

      expect(screen.getByPlaceholderText('quiz.blank 1')).toBeInTheDocument();
      expect(screen.getByText('The capital of France is')).toBeInTheDocument();
    });

    it('handles multiple blanks', () => {
      const multiBlankQuestion = {
        ...mockQuestion,
        question: 'The _____ of France is _____ and it is _____.'
      };

      render(
        <FillBlankQuestion
          question={multiBlankQuestion}
          onAnswerChange={mockOnAnswerChange}
        />
      );

      expect(screen.getByPlaceholderText('quiz.blank 1')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('quiz.blank 2')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('quiz.blank 3')).toBeInTheDocument();
    });

    it('updates answer when typing', async () => {
      const user = userEvent.setup();
      
      render(
        <FillBlankQuestion
          question={mockQuestion}
          onAnswerChange={mockOnAnswerChange}
        />
      );

      const input = screen.getByPlaceholderText('quiz.blank 1');
      await user.type(input, 'Paris');

      await waitFor(() => {
        expect(mockOnAnswerChange).toHaveBeenCalledWith('3', { answer_text: 'Paris' });
      });
    });
  });

  describe('ShortAnswerQuestion', () => {
    const mockQuestion = {
      id: '4',
      type: 'short_answer' as const,
      question: 'Explain photosynthesis.',
      points: 5
    };

    it('renders textarea for answer', () => {
      render(
        <ShortAnswerQuestion
          question={mockQuestion}
          onAnswerChange={mockOnAnswerChange}
        />
      );

      expect(screen.getByPlaceholderText('quiz.writeAnswerHere')).toBeInTheDocument();
      expect(screen.getByText('quiz.shortAnswerInstruction')).toBeInTheDocument();
    });

    it('shows character and word count', async () => {
      const user = userEvent.setup();
      
      render(
        <ShortAnswerQuestion
          question={mockQuestion}
          onAnswerChange={mockOnAnswerChange}
        />
      );

      const textarea = screen.getByPlaceholderText('quiz.writeAnswerHere');
      await user.type(textarea, 'This is a test answer');

      expect(screen.getByText('5 quiz.words')).toBeInTheDocument();
      expect(screen.getByText(/22\/500 quiz.characters/)).toBeInTheDocument();
    });

    it('provides helpful tips', () => {
      render(
        <ShortAnswerQuestion
          question={mockQuestion}
          onAnswerChange={mockOnAnswerChange}
        />
      );

      expect(screen.getByText('quiz.shortAnswerTips')).toBeInTheDocument();
      expect(screen.getByText('quiz.shortAnswerTip1')).toBeInTheDocument();
    });
  });

  describe('EssayQuestion', () => {
    const mockQuestion = {
      id: '5',
      type: 'essay' as const,
      question: 'Discuss the impact of climate change.',
      points: 10
    };

    it('renders essay textarea', () => {
      render(
        <EssayQuestion
          question={mockQuestion}
          onAnswerChange={mockOnAnswerChange}
        />
      );

      expect(screen.getByPlaceholderText('quiz.writeEssayHere')).toBeInTheDocument();
      expect(screen.getByText('quiz.essayInstruction')).toBeInTheDocument();
    });

    it('shows word count status', async () => {
      const user = userEvent.setup();
      
      render(
        <EssayQuestion
          question={mockQuestion}
          onAnswerChange={mockOnAnswerChange}
        />
      );

      const textarea = screen.getByPlaceholderText('quiz.writeEssayHere');
      
      // Short text
      await user.type(textarea, 'Short');
      expect(screen.getByText('quiz.tooShort')).toBeInTheDocument();

      // Clear and type longer text
      await user.clear(textarea);
      const longText = 'This is a much longer essay that contains many words and should be considered good length for an essay response in this quiz system.';
      await user.type(textarea, longText);
      
      expect(screen.getByText('quiz.goodLength')).toBeInTheDocument();
    });

    it('shows estimated reading time', async () => {
      const user = userEvent.setup();
      
      render(
        <EssayQuestion
          question={mockQuestion}
          onAnswerChange={mockOnAnswerChange}
        />
      );

      const textarea = screen.getByPlaceholderText('quiz.writeEssayHere');
      const longText = Array(250).fill('word').join(' '); // 250 words
      await user.type(textarea, longText);

      expect(screen.getByText(/quiz.minRead/)).toBeInTheDocument();
    });
  });

  describe('QuestionTypeIcon', () => {
    it('renders correct icon for each question type', () => {
      const types = ['multiple_choice', 'true_false', 'fill_blank', 'short_answer', 'essay'];
      
      types.forEach(type => {
        const { container } = render(<QuestionTypeIcon type={type} />);
        expect(container.firstChild).toBeInTheDocument();
      });
    });

    it('renders default icon for unknown type', () => {
      const { container } = render(<QuestionTypeIcon type="unknown" />);
      expect(container.firstChild).toBeInTheDocument();
    });
  });

  describe('DifficultyBadge', () => {
    it('renders badge for each difficulty level', () => {
      const levels = ['easy', 'medium', 'hard'];
      
      levels.forEach(level => {
        render(<DifficultyBadge level={level} />);
        expect(screen.getByText(`quiz.difficulty.${level}`)).toBeInTheDocument();
      });
    });

    it('renders nothing when no level provided', () => {
      const { container } = render(<DifficultyBadge />);
      expect(container.firstChild).toBeNull();
    });
  });

  describe('QuestionProgress', () => {
    const mockProps = {
      currentIndex: 2,
      totalQuestions: 5,
      answeredQuestions: 3,
      onQuestionSelect: jest.fn(),
      isQuestionAnswered: jest.fn((index) => index < 3)
    };

    it('renders progress information', () => {
      render(<QuestionProgress {...mockProps} />);

      expect(screen.getByText('quiz.progress: 3 / 5')).toBeInTheDocument();
      expect(screen.getByText('3 quiz.answered')).toBeInTheDocument();
    });

    it('renders question buttons', () => {
      render(<QuestionProgress {...mockProps} />);

      for (let i = 1; i <= 5; i++) {
        expect(screen.getByText(i.toString())).toBeInTheDocument();
      }
    });

    it('handles question selection', async () => {
      const user = userEvent.setup();
      const onQuestionSelect = jest.fn();
      
      render(
        <QuestionProgress 
          {...mockProps} 
          onQuestionSelect={onQuestionSelect}
        />
      );

      const questionButton = screen.getByText('4');
      await user.click(questionButton);

      expect(onQuestionSelect).toHaveBeenCalledWith(3); // 0-indexed
    });

    it('shows answered questions with checkmarks', () => {
      render(<QuestionProgress {...mockProps} />);

      // First 3 questions should be marked as answered
      const answeredButtons = screen.getAllByTitle(/quiz.answered/);
      expect(answeredButtons).toHaveLength(3);
    });

    it('highlights current question', () => {
      render(<QuestionProgress {...mockProps} />);

      const currentButton = screen.getByText('3'); // currentIndex + 1
      expect(currentButton).toHaveClass('bg-blue-600');
    });
  });
});