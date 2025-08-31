import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter } from "react-router-dom";
import { vi, describe, it, expect, beforeEach } from "vitest";
import TakeQuiz from "../../../pages/student/TakeQuiz";
import { LanguageProvider } from "../../../contexts/LanguageContext";
import * as api from "../../../services/api";

// Mock the API functions
vi.mock("../../../services/api", () => ({
  fetchQuizById: vi.fn(),
  startQuiz: vi.fn(),
  submitQuiz: vi.fn(),
}));

// Mock the toast hook
vi.mock("../../../components/ui/use-toast", () => ({
  useToast: () => ({
    toast: vi.fn(),
  }),
}));

// Mock react-router-dom hooks
const mockNavigate = vi.fn();
vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return {
    ...actual,
    useNavigate: () => mockNavigate,
    useParams: () => ({ quizId: "test-quiz-id" }),
  };
});

const mockQuizData = {
  data: {
    id: "test-quiz-id",
    title: "Test Quiz",
    description: "A test quiz for unit testing",
    time_limit_minutes: 30,
    max_attempts: 3,
    passing_score: 70,
    total_questions: 4,
    proficiency_level: "B1",
    correction_mode: "immediate",
    show_results_immediately: true,
    questions: [
      {
        id: "q1",
        type: "multiple_choice",
        question: "What is 2 + 2?",
        points: 2,
        options: [
          { id: "opt1", option_text: "3", is_correct: false },
          { id: "opt2", option_text: "4", is_correct: true },
          { id: "opt3", option_text: "5", is_correct: false },
        ],
      },
      {
        id: "q2",
        type: "true_false",
        question: "The sky is blue.",
        points: 1,
        options: [
          { id: "opt4", option_text: "True", is_correct: true },
          { id: "opt5", option_text: "False", is_correct: false },
        ],
      },
      {
        id: "q3",
        type: "fill_blank",
        question: "The capital of France is _____.",
        points: 2,
      },
      {
        id: "q4",
        type: "short_answer",
        question: "Explain the water cycle.",
        points: 3,
      },
    ],
    program: {
      title: "Test Program",
    },
  },
};

const mockSubmissionResponse = {
  data: {
    id: "submission-id",
    total_score: 6,
    max_possible_score: 8,
    percentage: 75,
    is_passed: true,
  },
  show_results_immediately: true,
  correction_mode: "immediate",
  corrections: [
    {
      question_id: "q1",
      is_correct: true,
      correct_answer: "4",
      explanation: "Basic arithmetic",
      improvement_suggestion: "Keep practicing math",
    },
  ],
};

const TestWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <LanguageProvider>{children}</LanguageProvider>
      </BrowserRouter>
    </QueryClientProvider>
  );
};

describe("TakeQuiz Component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(api.fetchQuizById).mockResolvedValue(mockQuizData);
  });

  it("renders quiz loading state", () => {
    vi.mocked(api.fetchQuizById).mockImplementation(
      () => new Promise(() => {})
    );

    render(
      <TestWrapper>
        <TakeQuiz />
      </TestWrapper>
    );

    expect(screen.getByTestId("quiz-loading")).toBeInTheDocument();
  });

  it("renders quiz start screen with quiz information", async () => {
    render(
      <TestWrapper>
        <TakeQuiz />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(screen.getByText("Test Quiz")).toBeInTheDocument();
    });

    expect(screen.getByText("Test Program")).toBeInTheDocument();
    expect(screen.getByText("4")).toBeInTheDocument(); // Total questions
    expect(screen.getByText("70%")).toBeInTheDocument(); // Passing score
    expect(screen.getByText("30")).toBeInTheDocument(); // Time limit
    expect(screen.getByText("3")).toBeInTheDocument(); // Max attempts
    expect(screen.getByText("B1")).toBeInTheDocument(); // Proficiency level
  });

  it("displays question types in the start screen", async () => {
    render(
      <TestWrapper>
        <TakeQuiz />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(screen.getByText("Test Quiz")).toBeInTheDocument();
    });

    expect(screen.getByText("multiple_choice")).toBeInTheDocument();
    expect(screen.getByText("true_false")).toBeInTheDocument();
    expect(screen.getByText("fill_blank")).toBeInTheDocument();
    expect(screen.getByText("short_answer")).toBeInTheDocument();
  });

  it("starts quiz when start button is clicked", async () => {
    const mockStartResponse = { data: { id: "submission-id" } };
    vi.mocked(api.startQuiz).mockResolvedValue(mockStartResponse);

    render(
      <TestWrapper>
        <TakeQuiz />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(screen.getByText("Test Quiz")).toBeInTheDocument();
    });

    const startButton = screen.getByRole("button", { name: /start quiz/i });
    fireEvent.click(startButton);

    await waitFor(() => {
      expect(api.startQuiz).toHaveBeenCalledWith("test-quiz-id");
    });
  });

  it("renders multiple choice question correctly", async () => {
    const mockStartResponse = { data: { id: "submission-id" } };
    vi.mocked(api.startQuiz).mockResolvedValue(mockStartResponse);

    render(
      <TestWrapper>
        <TakeQuiz />
      </TestWrapper>
    );

    // Start the quiz
    await waitFor(() => {
      expect(screen.getByText("Test Quiz")).toBeInTheDocument();
    });

    const startButton = screen.getByRole("button", { name: /start quiz/i });
    fireEvent.click(startButton);

    // Wait for quiz to start and first question to appear
    await waitFor(() => {
      expect(screen.getByText("What is 2 + 2?")).toBeInTheDocument();
    });

    expect(screen.getByText("A. 3")).toBeInTheDocument();
    expect(screen.getByText("B. 4")).toBeInTheDocument();
    expect(screen.getByText("C. 5")).toBeInTheDocument();
  });

  it("handles multiple choice answer selection", async () => {
    const mockStartResponse = { data: { id: "submission-id" } };
    vi.mocked(api.startQuiz).mockResolvedValue(mockStartResponse);

    render(
      <TestWrapper>
        <TakeQuiz />
      </TestWrapper>
    );

    // Start the quiz
    await waitFor(() => {
      expect(screen.getByText("Test Quiz")).toBeInTheDocument();
    });

    const startButton = screen.getByRole("button", { name: /start quiz/i });
    fireEvent.click(startButton);

    await waitFor(() => {
      expect(screen.getByText("What is 2 + 2?")).toBeInTheDocument();
    });

    // Select an answer
    const option = screen.getByLabelText("B. 4");
    fireEvent.click(option);

    // Check that the answer is selected
    expect(option).toBeChecked();
  });

  it("navigates between questions", async () => {
    const mockStartResponse = { data: { id: "submission-id" } };
    vi.mocked(api.startQuiz).mockResolvedValue(mockStartResponse);

    render(
      <TestWrapper>
        <TakeQuiz />
      </TestWrapper>
    );

    // Start the quiz
    await waitFor(() => {
      expect(screen.getByText("Test Quiz")).toBeInTheDocument();
    });

    const startButton = screen.getByRole("button", { name: /start quiz/i });
    fireEvent.click(startButton);

    await waitFor(() => {
      expect(screen.getByText("What is 2 + 2?")).toBeInTheDocument();
    });

    // Navigate to next question
    const nextButton = screen.getByRole("button", { name: /next question/i });
    fireEvent.click(nextButton);

    await waitFor(() => {
      expect(screen.getByText("The sky is blue.")).toBeInTheDocument();
    });

    // Navigate back to previous question
    const prevButton = screen.getByRole("button", {
      name: /previous question/i,
    });
    fireEvent.click(prevButton);

    await waitFor(() => {
      expect(screen.getByText("What is 2 + 2?")).toBeInTheDocument();
    });
  });

  it("renders fill-in-the-blank question correctly", async () => {
    const mockStartResponse = { data: { id: "submission-id" } };
    vi.mocked(api.startQuiz).mockResolvedValue(mockStartResponse);

    render(
      <TestWrapper>
        <TakeQuiz />
      </TestWrapper>
    );

    // Start the quiz and navigate to fill-blank question
    await waitFor(() => {
      expect(screen.getByText("Test Quiz")).toBeInTheDocument();
    });

    const startButton = screen.getByRole("button", { name: /start quiz/i });
    fireEvent.click(startButton);

    await waitFor(() => {
      expect(screen.getByText("What is 2 + 2?")).toBeInTheDocument();
    });

    // Navigate to question 3 (fill-blank)
    const question3Button = screen.getByRole("button", { name: "3" });
    fireEvent.click(question3Button);

    await waitFor(() => {
      expect(screen.getByText("The capital of France is")).toBeInTheDocument();
    });

    // Check that input field is present
    const blankInput = screen.getByPlaceholderText("Blank 1");
    expect(blankInput).toBeInTheDocument();

    // Type in the blank
    fireEvent.change(blankInput, { target: { value: "Paris" } });
    expect(blankInput).toHaveValue("Paris");
  });

  it("renders short answer question correctly", async () => {
    const mockStartResponse = { data: { id: "submission-id" } };
    vi.mocked(api.startQuiz).mockResolvedValue(mockStartResponse);

    render(
      <TestWrapper>
        <TakeQuiz />
      </TestWrapper>
    );

    // Start the quiz and navigate to short answer question
    await waitFor(() => {
      expect(screen.getByText("Test Quiz")).toBeInTheDocument();
    });

    const startButton = screen.getByRole("button", { name: /start quiz/i });
    fireEvent.click(startButton);

    await waitFor(() => {
      expect(screen.getByText("What is 2 + 2?")).toBeInTheDocument();
    });

    // Navigate to question 4 (short answer)
    const question4Button = screen.getByRole("button", { name: "4" });
    fireEvent.click(question4Button);

    await waitFor(() => {
      expect(screen.getByText("Explain the water cycle.")).toBeInTheDocument();
    });

    // Check that textarea is present
    const textarea = screen.getByPlaceholderText(/write.*answer/i);
    expect(textarea).toBeInTheDocument();

    // Type in the textarea
    fireEvent.change(textarea, {
      target: { value: "Water evaporates and condenses." },
    });
    expect(textarea).toHaveValue("Water evaporates and condenses.");
  });

  it("shows question navigator with answered status", async () => {
    const mockStartResponse = { data: { id: "submission-id" } };
    vi.mocked(api.startQuiz).mockResolvedValue(mockStartResponse);

    render(
      <TestWrapper>
        <TakeQuiz />
      </TestWrapper>
    );

    // Start the quiz
    await waitFor(() => {
      expect(screen.getByText("Test Quiz")).toBeInTheDocument();
    });

    const startButton = screen.getByRole("button", { name: /start quiz/i });
    fireEvent.click(startButton);

    await waitFor(() => {
      expect(screen.getByText("What is 2 + 2?")).toBeInTheDocument();
    });

    // Answer the first question
    const option = screen.getByLabelText("B. 4");
    fireEvent.click(option);

    // Check that question 1 button shows as answered
    const question1Button = screen.getByRole("button", { name: "1" });
    expect(question1Button).toHaveClass("bg-green-50");
  });

  it("submits quiz with all answers", async () => {
    const mockStartResponse = { data: { id: "submission-id" } };
    vi.mocked(api.startQuiz).mockResolvedValue(mockStartResponse);
    vi.mocked(api.submitQuiz).mockResolvedValue(mockSubmissionResponse);

    render(
      <TestWrapper>
        <TakeQuiz />
      </TestWrapper>
    );

    // Start the quiz
    await waitFor(() => {
      expect(screen.getByText("Test Quiz")).toBeInTheDocument();
    });

    const startButton = screen.getByRole("button", { name: /start quiz/i });
    fireEvent.click(startButton);

    await waitFor(() => {
      expect(screen.getByText("What is 2 + 2?")).toBeInTheDocument();
    });

    // Answer all questions
    // Question 1: Multiple choice
    const option1 = screen.getByLabelText("B. 4");
    fireEvent.click(option1);

    // Navigate to question 2
    const nextButton = screen.getByRole("button", { name: /next question/i });
    fireEvent.click(nextButton);

    await waitFor(() => {
      expect(screen.getByText("The sky is blue.")).toBeInTheDocument();
    });

    // Question 2: True/False
    const trueOption = screen.getByLabelText("True");
    fireEvent.click(trueOption);

    // Navigate to question 3
    fireEvent.click(nextButton);

    await waitFor(() => {
      expect(screen.getByText("The capital of France is")).toBeInTheDocument();
    });

    // Question 3: Fill blank
    const blankInput = screen.getByPlaceholderText("Blank 1");
    fireEvent.change(blankInput, { target: { value: "Paris" } });

    // Navigate to question 4
    fireEvent.click(nextButton);

    await waitFor(() => {
      expect(screen.getByText("Explain the water cycle.")).toBeInTheDocument();
    });

    // Question 4: Short answer
    const textarea = screen.getByPlaceholderText(/write.*answer/i);
    fireEvent.change(textarea, {
      target: { value: "Water cycle explanation" },
    });

    // Submit the quiz
    const submitButton = screen.getByRole("button", { name: /submit quiz/i });
    fireEvent.click(submitButton);

    // Confirm submission in dialog
    const confirmButton = screen.getByRole("button", { name: /submit quiz/i });
    fireEvent.click(confirmButton);

    await waitFor(() => {
      expect(api.submitQuiz).toHaveBeenCalledWith("test-quiz-id", {
        answers: expect.arrayContaining([
          expect.objectContaining({
            question_id: "q1",
            selected_option_id: "opt2",
          }),
          expect.objectContaining({
            question_id: "q2",
            selected_option_id: "opt4",
          }),
          expect.objectContaining({
            question_id: "q3",
            answer_text: "Paris",
          }),
          expect.objectContaining({
            question_id: "q4",
            answer_text: "Water cycle explanation",
          }),
        ]),
        time_taken_minutes: expect.any(Number),
      });
    });
  });

  it("displays immediate corrections after submission", async () => {
    const mockStartResponse = { data: { id: "submission-id" } };
    vi.mocked(api.startQuiz).mockResolvedValue(mockStartResponse);
    vi.mocked(api.submitQuiz).mockResolvedValue(mockSubmissionResponse);

    render(
      <TestWrapper>
        <TakeQuiz />
      </TestWrapper>
    );

    // Start quiz, answer questions, and submit
    await waitFor(() => {
      expect(screen.getByText("Test Quiz")).toBeInTheDocument();
    });

    const startButton = screen.getByRole("button", { name: /start quiz/i });
    fireEvent.click(startButton);

    await waitFor(() => {
      expect(screen.getByText("What is 2 + 2?")).toBeInTheDocument();
    });

    // Quick answer and submit
    const option = screen.getByLabelText("B. 4");
    fireEvent.click(option);

    // Navigate to last question for quick submit
    const question4Button = screen.getByRole("button", { name: "4" });
    fireEvent.click(question4Button);

    await waitFor(() => {
      expect(screen.getByText("Explain the water cycle.")).toBeInTheDocument();
    });

    const submitButton = screen.getByRole("button", { name: /submit quiz/i });
    fireEvent.click(submitButton);

    const confirmButton = screen.getByRole("button", { name: /submit quiz/i });
    fireEvent.click(confirmButton);

    // Wait for corrections to appear
    await waitFor(() => {
      expect(screen.getByText("75.0%")).toBeInTheDocument(); // Final score
    });

    expect(screen.getByText("6/8")).toBeInTheDocument(); // Points earned
    expect(screen.getByText("Detailed Review")).toBeInTheDocument();
  });

  it("handles timer countdown", async () => {
    const mockStartResponse = { data: { id: "submission-id" } };
    vi.mocked(api.startQuiz).mockResolvedValue(mockStartResponse);

    render(
      <TestWrapper>
        <TakeQuiz />
      </TestWrapper>
    );

    // Start the quiz
    await waitFor(() => {
      expect(screen.getByText("Test Quiz")).toBeInTheDocument();
    });

    const startButton = screen.getByRole("button", { name: /start quiz/i });
    fireEvent.click(startButton);

    await waitFor(() => {
      expect(screen.getByText("What is 2 + 2?")).toBeInTheDocument();
    });

    // Check that timer is displayed
    expect(screen.getByText(/30:00|29:59/)).toBeInTheDocument();
  });

  it("shows keyboard shortcuts help", async () => {
    const mockStartResponse = { data: { id: "submission-id" } };
    vi.mocked(api.startQuiz).mockResolvedValue(mockStartResponse);

    render(
      <TestWrapper>
        <TakeQuiz />
      </TestWrapper>
    );

    // Start the quiz
    await waitFor(() => {
      expect(screen.getByText("Test Quiz")).toBeInTheDocument();
    });

    const startButton = screen.getByRole("button", { name: /start quiz/i });
    fireEvent.click(startButton);

    await waitFor(() => {
      expect(screen.getByText("What is 2 + 2?")).toBeInTheDocument();
    });

    // Check that keyboard shortcuts are shown
    expect(screen.getByText("Ctrl")).toBeInTheDocument();
    expect(screen.getByText("←")).toBeInTheDocument();
    expect(screen.getByText("→")).toBeInTheDocument();
  });

  it("handles quiz error states", async () => {
    vi.mocked(api.fetchQuizById).mockRejectedValue(new Error("Quiz not found"));

    render(
      <TestWrapper>
        <TakeQuiz />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(screen.getByText("Quiz Load Error")).toBeInTheDocument();
    });

    expect(screen.getByText("Back to Quizzes")).toBeInTheDocument();
  });
});
