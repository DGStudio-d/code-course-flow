
export interface Professor {
  id: string;
  name: string;
  title: string;
  language: string;
  image: string;
  description: string;
}

export const professors: Professor[] = [
  {
    id: "1",
    name: "أحمد محمد",
    title: "أستاذ اللغة الإنجليزية",
    language: "English",
    image: "/placeholder.svg",
    description: "أستاذ محنك في تدريس اللغة الإنجليزية مع خبرة 10 سنوات"
  },
  {
    id: "2",
    name: "فاطمة علي",
    title: "أستاذة اللغة الفرنسية",
    language: "French",
    image: "/placeholder.svg",
    description: "متخصصة في تدريس اللغة الفرنسية للمبتدئين والمتقدمين"
  },
  {
    id: "3",
    name: "محمد خالد",
    title: "أستاذ اللغة الألمانية",
    language: "German",
    image: "/placeholder.svg",
    description: "خبير في تدريس اللغة الألمانية مع شهادات دولية"
  }
];
