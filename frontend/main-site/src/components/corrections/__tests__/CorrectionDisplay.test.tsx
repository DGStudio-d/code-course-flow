import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { CorrectionDisplay } from '../CorrectionDisplay';

// Mock the language context
jest.mock('@/contexts/LanguageContext', () => ({
  useLanguage: () => ({
    t: (key: string, params?: any) => {
      if (params) {
        return key.replace(/\{(\w+)\}/g, (match, param) => params[param] || match);
      }
      return key;
    },
    dir: 'ltr'
  })
}));

describe('CorrectionDisplay', () => {
  const mockQuestion = {
    id: '1',
    type: 'multiple_choice' as const,
    question: 'What is 2+2?',
    points: 2,
    options: [
      { id: 'a', option_text: '3', is_correct: false },
      { id: 'b', option_text: '4', is_correct: true },
      { id: 'c', option_text: '5', is_correct: false }
    ],
    explanation: 'Basic arithmetic',
    difficulty_level: 'easy' as const
  };

  const mockUserAnswer = {
    question_id: '1',
    selected_option_id: 'a'
  };

  const mockCorrection = {
    id: 'corr-1',
    question_id: '1',
    is_correct: false,
    points_earned: 0,
    max_points: 2,
    correct_answer: '4',
    explanation: 'The correct answer is 4 because 2+2=4',
    improvement_suggestion: 'Practice basic arithmetic',
    detailed_feedback: 'You selected 3, but the correct answer is 4. Review addition facts.',
    common_mistakes: ['Confusing addition with subtraction', 'Calculation errors'],
    learning_resources: [
      {
        title: 'Basic Math Tutorial',
        url: 'https://example.com/math',
        type: 'video' as const
      }
    ],
    difficulty_analysis: {
      student_level: 'below' as const,
      question_difficulty: 'easy' as const,
      success_rate: 85
    }
  };

  const mockOnFeedbackRating = jest.fn();

  beforeEach(() => {
    mockOnFeedbackRating.mockClear();
  });

  it('renders correction display with basic information', () => {
    render(
      <CorrectionDisplay
        question={mockQuestion}
        userAnswer={mockUserAnswer}
        correction={mockCorrection}
        onFeedbackRating={mockOnFeedbackRating}
      />
    );

    expect(screen.getByText('corrections.incorrect')).toBeInTheDocument();
    expect(screen.getByText('corrections.question')).toBeInTheDocument();
    expect(screen.getByText('0/2 corrections.points')).toBeInTheDocument();
  });

  it('shows correct status for correct answers', () => {
    const correctCorrection = {
      ...mockCorrection,
      is_correct: true,
      points_earned: 2
    };

    render(
      <CorrectionDisplay
        question={mockQuestion}
        userAnswer={mockUserAnswer}
        correction={correctCorrection}
      />
    );

    expect(screen.getByText('corrections.correct')).toBeInTheDocument();
    expect(screen.getByText('2/2 corrections.points')).toBeInTheDocument();
  });

  it('displays user answer and correct answer', () => {
    render(
      <CorrectionDisplay
        question={mockQuestion}
        userAnswer={mockUserAnswer}
        correction={mockCorrection}
      />
    );

    expect(screen.getByText('corrections.yourAnswer')).toBeInTheDocument();
    expect(screen.getByText('3')).toBeInTheDocument(); // User's selected option
    expect(screen.getByText('corrections.correctAnswer')).toBeInTheDocument();
    expect(screen.getByText('4')).toBeInTheDocument(); // Correct answer
  });

  it('shows partial credit progress bar', () => {
    const partialCorrection = {
      ...mockCorrection,
      points_earned: 1,
      max_points: 2
    };

    render(
      <CorrectionDisplay
        question={mockQuestion}
        userAnswer={mockUserAnswer}
        correction={partialCorrection}
      />
    );

    expect(screen.getByText('corrections.partialCredit')).toBeInTheDocument();
  });

  it('displays explanation in explanation tab', async () => {
    const user = userEvent.setup();
    
    render(
      <CorrectionDisplay
        question={mockQuestion}
        userAnswer={mockUserAnswer}
        correction={mockCorrection}
      />
    );

    // Explanation tab should be active by default
    expect(screen.getByText(mockCorrection.explanation)).toBeInTheDocument();
  });

  it('shows improvement suggestions in improvement tab', async () => {
    const user = userEvent.setup();
    
    render(
      <CorrectionDisplay
        question={mockQuestion}
        userAnswer={mockUserAnswer}
        correction={mockCorrection}
      />
    );

    const improvementTab = screen.getByText('corrections.improvement');
    await user.click(improvementTab);

    expect(screen.getByText(mockCorrection.improvement_suggestion)).toBeInTheDocument();
  });

  it('displays common mistakes', async () => {
    const user = userEvent.setup();
    
    render(
      <CorrectionDisplay
        question={mockQuestion}
        userAnswer={mockUserAnswer}
        correction={mockCorrection}
      />
    );

    const improvementTab = screen.getByText('corrections.improvement');
    await user.click(improvementTab);

    expect(screen.getByText('corrections.commonMistakes')).toBeInTheDocument();
    expect(screen.getByText('Confusing addition with subtraction')).toBeInTheDocument();
    expect(screen.getByText('Calculation errors')).toBeInTheDocument();
  });

  it('shows learning resources when toggled', async () => {
    const user = userEvent.setup();
    
    render(
      <CorrectionDisplay
        question={mockQuestion}
        userAnswer={mockUserAnswer}
        correction={mockCorrection}
      />
    );

    const improvementTab = screen.getByText('corrections.improvement');
    await user.click(improvementTab);

    const showResourcesButton = screen.getByText('corrections.showResources');
    await user.click(showResourcesButton);

    expect(screen.getByText('Basic Math Tutorial')).toBeInTheDocument();
  });

  it('displays difficulty analysis in analysis tab', async () => {
    const user = userEvent.setup();
    
    render(
      <CorrectionDisplay
        question={mockQuestion}
        userAnswer={mockUserAnswer}
        correction={mockCorrection}
      />
    );

    const analysisTab = screen.getByText('corrections.analysis');
    await user.click(analysisTab);

    expect(screen.getByText('corrections.difficultyAnalysis')).toBeInTheDocument();
    expect(screen.getByText('corrections.level.below')).toBeInTheDocument();
    expect(screen.getByText('85%')).toBeInTheDocument();
  });

  it('handles feedback rating', async () => {
    const user = userEvent.setup();
    
    render(
      <CorrectionDisplay
        question={mockQuestion}
        userAnswer={mockUserAnswer}
        correction={mockCorrection}
        onFeedbackRating={mockOnFeedbackRating}
      />
    );

    const helpfulButton = screen.getByText('corrections.helpful');
    await user.click(helpfulButton);

    expect(mockOnFeedbackRating).toHaveBeenCalledWith('corr-1', 'helpful');
  });

  it('handles not helpful feedback', async () => {
    const user = userEvent.setup();
    
    render(
      <CorrectionDisplay
        question={mockQuestion}
        userAnswer={mockUserAnswer}
        correction={mockCorrection}
        onFeedbackRating={mockOnFeedbackRating}
      />
    );

    const notHelpfulButton = screen.getByText('corrections.notHelpful');
    await user.click(notHelpfulButton);

    expect(mockOnFeedbackRating).toHaveBeenCalledWith('corr-1', 'not_helpful');
  });

  it('can be collapsed when expandable', async () => {
    const user = userEvent.setup();
    
    render(
      <CorrectionDisplay
        question={mockQuestion}
        userAnswer={mockUserAnswer}
        correction={mockCorrection}
        isExpandable={true}
      />
    );

    // Should start expanded
    expect(screen.getByText(mockCorrection.explanation)).toBeInTheDocument();

    // Find and click collapse button
    const collapseButton = screen.getByRole('button', { name: '' }); // ChevronUp icon
    await user.click(collapseButton);

    // Content should be hidden
    expect(screen.queryByText(mockCorrection.explanation)).not.toBeInTheDocument();
  });

  it('handles text answers correctly', () => {
    const textAnswer = {
      question_id: '1',
      answer_text: 'My text answer'
    };

    render(
      <CorrectionDisplay
        question={mockQuestion}
        userAnswer={textAnswer}
        correction={mockCorrection}
      />
    );

    expect(screen.getByText('My text answer')).toBeInTheDocument();
  });

  it('handles missing user answer', () => {
    render(
      <CorrectionDisplay
        question={mockQuestion}
        correction={mockCorrection}
      />
    );

    expect(screen.getByText('corrections.noAnswer')).toBeInTheDocument();
  });

  it('shows question explanation when available', () => {
    render(
      <CorrectionDisplay
        question={mockQuestion}
        userAnswer={mockUserAnswer}
        correction={mockCorrection}
      />
    );

    expect(screen.getByText('corrections.questionExplanation')).toBeInTheDocument();
    expect(screen.getByText(mockQuestion.explanation!)).toBeInTheDocument();
  });

  it('displays question type and difficulty badges', () => {
    render(
      <CorrectionDisplay
        question={mockQuestion}
        userAnswer={mockUserAnswer}
        correction={mockCorrection}
      />
    );

    expect(screen.getByText('quiz.type.multiple_choice')).toBeInTheDocument();
    expect(screen.getByText('quiz.difficulty.easy')).toBeInTheDocument();
  });

  it('shows performance metrics in analysis tab', async () => {
    const user = userEvent.setup();
    
    render(
      <CorrectionDisplay
        question={mockQuestion}
        userAnswer={mockUserAnswer}
        correction={mockCorrection}
      />
    );

    const analysisTab = screen.getByText('corrections.analysis');
    await user.click(analysisTab);

    expect(screen.getByText('0')).toBeInTheDocument(); // Points earned
    expect(screen.getByText('0%')).toBeInTheDocument(); // Accuracy
  });

  it('handles different question types appropriately', () => {
    const essayQuestion = {
      ...mockQuestion,
      type: 'essay' as const
    };

    render(
      <CorrectionDisplay
        question={essayQuestion}
        userAnswer={mockUserAnswer}
        correction={mockCorrection}
      />
    );

    expect(screen.getByText('quiz.type.essay')).toBeInTheDocument();
  });
});