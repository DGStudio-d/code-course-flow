
import api from "@/config/axios";
import { Language } from "@/types";



export const fetchLanguages = async (): Promise<Language[]> => {
  // Simulate API call delay
  const res = await api.get<Language[]>("/languages");
  return res.data;
};

export const addLanguage = async (language: Omit<Language, "id">): Promise<Language> => {
  // Simulate API call delay
  const res= await api.post<Language>("/languages", language);
  return res.data;
};

export const deleteLanguage = async (id: string): Promise<void> => {
  // Simulate API call delay
  await api.delete(`/languages/${id}`);
}
export const  registerUser = async (userData:any): Promise<any> => {
  // Simulate API call delay
  const res = await api.post("/register", userData);
  return res;
}
export const loginUser = async (credentials: { email: string; password: string }): Promise<any> => {
  // Simulate API call delay
  const res = await api.post("/login", credentials);
  return res;
}
export const resetPassword = async (email: string): Promise<any> => {
  // Simulate API call delay
  const res = await api.post("/reset-password", { email });
  return res.data;
}
