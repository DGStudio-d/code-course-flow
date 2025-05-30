
import { Language } from "@/types";

// Mock data for languages
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
  },
  {
    id: "4",
    code: "es",
    name: "Spanish",
    flag: "🇪🇸",
    teachers: []
  },
  {
    id: "5",
    code: "it",
    name: "Italian",
    flag: "🇮🇹",
    teachers: []
  }
];

export const fetchLanguages = async (): Promise<Language[]> => {
  // Simulate API call delay
  await new Promise(resolve => setTimeout(resolve, 500));
  return mockLanguages;
};

export const addLanguage = async (language: Omit<Language, "id">): Promise<Language> => {
  // Simulate API call delay
  await new Promise(resolve => setTimeout(resolve, 500));
  const newLanguage = {
    ...language,
    id: (mockLanguages.length + 1).toString()
  };
  mockLanguages.push(newLanguage);
  return newLanguage;
};

export const deleteLanguage = async (id: string): Promise<void> => {
  // Simulate API call delay
  await new Promise(resolve => setTimeout(resolve, 500));
  const index = mockLanguages.findIndex(lang => lang.id === id);
  if (index > -1) {
    mockLanguages.splice(index, 1);
  }
};
