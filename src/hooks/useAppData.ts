import { useQuery } from "@tanstack/react-query";
import { useDispatch } from "react-redux";
import { setLanguages } from "@/config/store/dataSlice.ts";
import { useEffect } from "react";
import api from "@/config/axios";

const fetcher = (url: string) => api.get(url).then((res) => res.data);

export const useAppData = () => {
  const dispatch = useDispatch();

  const languagesQuery = useQuery({
    queryKey: ["languages"],
    queryFn: () => fetcher("/languages"),
    staleTime: 60 * 60 * 1000, // 1 hour
  });

  // Handle side effect with useEffect
  useEffect(() => {
    if (languagesQuery.data) {
      dispatch(setLanguages(languagesQuery.data));
    }
  }, [languagesQuery.data, dispatch]);

  return {
    isLoading: languagesQuery.isLoading,
    languages: languagesQuery.data,
  };
};
