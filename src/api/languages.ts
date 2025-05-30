
import { Language } from "@/types";

const mockLanguages: Language[] = [
  {
    id: "1",
    code: "en", 
    name: "English",
    flag: "🇺🇸",
    teachers: []
  },
  {
    id: "2",
    code: "fr",
    name: "French",
    flag: "🇫🇷", 
    teachers: []
  },
  {
    id: "3",
    code: "de", 
    name: "German",
    flag: "🇩🇪",
    teachers: []
  }
];

export const getLanguages = async (): Promise<Language[]> => {
  await new Promise(resolve => setTimeout(resolve, 500));
  return mockLanguages;
};

export const createLanguage = async (language: Omit<Language, "id">): Promise<Language> => {
  await new Promise(resolve => setTimeout(resolve, 500));
  const newLanguage = {
    ...language,
    id: (mockLanguages.length + 1).toString()
  };
  mockLanguages.push(newLanguage);
  return newLanguage;
};

export const deleteLanguage = async (id: string): Promise<void> => {
  await new Promise(resolve => setTimeout(resolve, 500));
  const index = mockLanguages.findIndex(lang => lang.id === id);
  if (index > -1) {
    mockLanguages.splice(index, 1);
  }
};
