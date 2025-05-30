
import { useQuery } from "@tanstack/react-query";
import { useDispatch } from "react-redux";
import { setLanguages } from "@/config/store/dataSlice";
import { useEffect } from "react";
import { getLanguages } from "@/api/languages";

export const useAppData = () => {
  const dispatch = useDispatch();

  const languagesQuery = useQuery({
    queryKey: ["languages"],
    queryFn: getLanguages,
    staleTime: 60 * 60 * 1000, // 1 hour
  });

  // Handle side effect with useEffect
  useEffect(() => {
    if (languagesQuery.data?.data) {
      dispatch(setLanguages(languagesQuery.data.data));
    }
  }, [languagesQuery.data, dispatch]);

  return {
    isLoading: languagesQuery.isLoading,
    languages: languagesQuery.data?.data || [],
  };
};
