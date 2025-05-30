
import { Language, ApiResponse } from "@/types";

const mockLanguages: Language[] = [
  {
    id: "1",
    code: "en", 
    name: "English",
    nativeName: "English",
    flag: "🇺🇸",
    teachers: []
  },
  {
    id: "2",
    code: "fr",
    name: "French",
    nativeName: "Français",
    flag: "🇫🇷", 
    teachers: []
  },
  {
    id: "3",
    code: "de", 
    name: "German",
    nativeName: "Deutsch",
    flag: "🇩🇪",
    teachers: []
  }
];

export const getLanguages = async (): Promise<ApiResponse<Language[]>> => {
  await new Promise(resolve => setTimeout(resolve, 500));
  return {
    data: mockLanguages,
    success: true
  };
};

export const createLanguage = async (languageData: { name: string; nativeName: string; flag: string }): Promise<Language> => {
  await new Promise(resolve => setTimeout(resolve, 500));
  const newLanguage: Language = {
    ...languageData,
    id: (mockLanguages.length + 1).toString(),
    code: languageData.name.toLowerCase().slice(0, 2),
    teachers: []
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
