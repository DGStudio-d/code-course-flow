import { Language, Teacher, Course, Quiz } from '@/types';

export const languages: Language[] = [
  {
    id: '1',
    name: 'الإنجليزية',
    code: 'en',
    flag: '🇺🇸',
    teachers: [],
    difficultyLevels: ['مبتدئ', 'متوسط', 'متقدم'],
    teacherCount: 15,
    studentCount: 1250
  },
  {
    id: '2',
    name: 'الفرنسية',
    code: 'fr',
    flag: '🇫🇷',
    teachers: [],
    difficultyLevels: ['مبتدئ', 'متوسط', 'متقدم'],
    teacherCount: 12,
    studentCount: 890
  },
  {
    id: '3',
    name: 'الألمانية',
    code: 'de',
    flag: '🇩🇪',
    teachers: [],
    difficultyLevels: ['مبتدئ', 'متوسط', 'متقدم'],
    teacherCount: 8,
    studentCount: 650
  },
  {
    id: '4',
    name: 'الإسبانية',
    code: 'es',
    flag: '🇪🇸',
    teachers: [],
    difficultyLevels: ['مبتدئ', 'متوسط', 'متقدم'],
    teacherCount: 10,
    studentCount: 720
  },
  {
    id: '5',
    name: 'الإيطالية',
    code: 'it',
    flag: '🇮🇹',
    teachers: [],
    difficultyLevels: ['مبتدئ', 'متوسط', 'متقدم'],
    teacherCount: 6,
    studentCount: 450
  }
];

export const teachers: Teacher[] = [
  {
    id: '1',
    name: 'محمد فريد',
    avatar: '/lovable-uploads/172058d4-07d8-4779-9ca1-f90f76012746.png',
    language: 'الإسبانية',
    specialization: 'معلم اللغة الإسبانية',
    rating: 4.9,
    testimonial: 'تعرف على محمد فريد، معلم اللغة الإسبانية المتميز! بشغفه الكبير بثقافة اللغة الإسبانية وتاريخها، يجعل محمد من تعلم اللغة رحلة ملئة بالمتعة والإلهام.',
    experience: 8
  },
  {
    id: '2',
    name: 'محمد أبو حفص',
    avatar: '/lovable-uploads/172058d4-07d8-4779-9ca1-f90f76012746.png',
    language: 'الإيطالية',
    specialization: 'أستاذ اللغة الإيطالية',
    rating: 4.8,
    testimonial: 'تعرف على محمد أبو حفص، معلم اللغة الإيطالية الشغوف! بخبرة طويلة وحب عميق للثقافة الإيطالية، يجعل تعلم اللغة الإيطالية ممتعاً وفعالاً.',
    experience: 12
  },
  {
    id: '3',
    name: 'مريم سمير',
    avatar: '/lovable-uploads/172058d4-07d8-4779-9ca1-f90f76012746.png',
    language: 'الإنجليزية',
    specialization: 'أستاذة اللغة الإنجليزية',
    rating: 4.9,
    testimonial: 'التجربة كانت أكثر من رائعة! مركز اللغات تجاوز توقعاتي، لقد جربت العديد من الدورات في أماكن أخرى، لكن هنا شعرت بالفرق.',
    experience: 10
  }
];

export const courses: Course[] = [
  {
    id: '1',
    title: 'دورة الإنجليزية للمبتدئين',
    description: 'تعلم أساسيات اللغة الإنجليزية من الصفر',
    languageId: '1',
    difficulty: 'beginner',
    duration: '8 أسابيع',
    lessonsCount: 32,
    price: 299,
    thumbnail: '/lovable-uploads/cec2c3f2-aa59-4991-911a-debb45524167.png'
  },
  {
    id: '2',
    title: 'دورة الفرنسية المتوسطة',
    description: 'طور مهاراتك في اللغة الفرنسية',
    languageId: '2',
    difficulty: 'intermediate',
    duration: '10 أسابيع',
    lessonsCount: 40,
    price: 399,
    thumbnail: '/lovable-uploads/cec2c3f2-aa59-4991-911a-debb45524167.png'
  }
];

export const sampleQuiz: Quiz = {
  id: '1',
  title: 'اختبار الإنجليزية - المستوى المبتدئ',
  languageId: '1',
  courseId: '1',
  difficulty: 'beginner',
  duration: 900, // 15 minutes
  questions: [
    {
      id: '1',
      type: 'mcq',
      text: 'What is the correct translation of "مرحبا"?',
      options: ['Hello', 'Goodbye', 'Thank you', 'Please'],
      correctAnswer: 'Hello',
      explanation: '"مرحبا" تعني "Hello" في اللغة الإنجليزية وهي أشهر طريقة للترحيب.'
    },
    {
      id: '2',
      type: 'fill',
      text: 'Complete the sentence: "My name ___ Ahmed."',
      correctAnswer: 'is',
      explanation: 'نستخدم "is" مع الضمائر المفردة مثل "My name".'
    },
    {
      id: '3',
      type: 'mcq',
      text: 'Choose the correct plural form of "book":',
      options: ['book', 'books', 'bookes', 'booking'],
      correctAnswer: 'books',
      explanation: 'الجمع العادي في الإنجليزية يكون بإضافة "s" في نهاية الكلمة.'
    }
  ]
};
