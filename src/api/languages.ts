
import api from "@/config/axios";
import { Language, ApiResponse } from "@/types";


export const getLanguages = async (): Promise<ApiResponse<Language[]>> => {
  const response = await api.get<ApiResponse<Language[]>>("/admin/languages");
  console.log('data languages',response)
  return response.data;
};

export const createLanguage = async (languageData: { name: string; nativeName: string; flag: string }): Promise<Language> => {
  const response = await api.post<ApiResponse<Language>>("/admin/languages", languageData);
  return response.data.data;
};

export const deleteLanguage = async (id: string): Promise<void> => {
  await api.delete(`/admin/languages/${id}`);
};
