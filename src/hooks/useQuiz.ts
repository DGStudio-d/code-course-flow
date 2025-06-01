import api from "@/config/axios";
import { useQueries } from "@tanstack/react-query";

const useQuiz = (id?: number) => {
  const listQuizzes = id
    ? [
        // Fetch specific quiz
        {
          queryKey: ["quiz", id],
          queryFn: () => api.get(`/quizzes/${id}`).then((res) => res.data),
          enabled: !!id,
        },
        // Fetch questions for specific quiz
        {
          queryKey: ["questions", id],
          queryFn: () =>
            api.get(`/quizzes/${id}/questions`).then((res) => res.data),
          enabled: !!id,
        },
      ]
    : [
        // Fetch all quizzes for student
        {
          queryKey: ["quizzes"],
          queryFn: () => api.get("/quizzes").then((res) => res.data),
        },
      ];
  const queries = useQueries({
    queries: listQuizzes,
  });

  const [quizQuery, questionsQuery] = queries;
  const [quizzesQuery] = queries;

  const quizzes = id
    ? {
        quiz:
          quizQuery.data && questionsQuery.data
            ? { ...quizQuery.data, questions: questionsQuery.data }
            : undefined,
        isLoading: quizQuery.isLoading || questionsQuery.isLoading,
        error: quizQuery.error || questionsQuery.error,
        refetch: () => {
          quizQuery.refetch();
          questionsQuery.refetch();
        },
      }
    : {
        quizzes: quizzesQuery.data,
        isLoading: quizzesQuery.isLoading,
        error: quizzesQuery.error,
        refetch: quizzesQuery.refetch,
      };
  return { quizzes };
};

export default useQuiz;
