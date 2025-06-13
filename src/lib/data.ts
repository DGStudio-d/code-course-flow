import { Quiz, Question } from '@/types';

export const sampleQuiz: Quiz = {
  id: '1',
  title: 'اختبار اللغة الإنجليزية - المستوى المبتدئ',
  questions: [
    {
      id: '1',
      type: 'mcq',
      text: 'What is the correct form of the verb "to be" for "I"?',
      options: ['am', 'is', 'are', 'be'],
      correctAnswer: 'am',
      explanation: 'The correct form of "to be" for the first person singular "I" is "am".'
    },
    {
      id: '2',
      type: 'mcq',
      text: 'Which article is used before a consonant sound?',
      options: ['a', 'an', 'the', 'no article'],
      correctAnswer: 'a',
      explanation: 'The article "a" is used before words that begin with a consonant sound.'
    },
    {
      id: '3',
      type: 'fill',
      text: 'Complete the sentence: "She ___ to school every day."',
      correctAnswer: 'goes',
      explanation: 'The third person singular form of "go" is "goes".'
    }
  ],
  difficulty: 'beginner',
  courseId: '1',
  duration: 1800, // 30 minutes
  languageId: '1'
};