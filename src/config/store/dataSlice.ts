// store/appDataSlice.ts
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface AppDataState {
  languages: unknown[];
  countries: unknown[];
  categories: unknown[];
  roles: unknown[];
  settings: Record<string, unknown>;
}

const initialState: AppDataState = {
  languages: [],
  countries: [],
  categories: [],
  roles: [],
  settings: {},
};

const appDataSlice = createSlice({
  name: "appData",
  initialState,
  reducers: {
    setLanguages: (state, action: PayloadAction<unknown[]>) => {
      state.languages = action.payload;
    }
  },
});

export const {
  setLanguages,
} = appDataSlice.actions;

export default appDataSlice.reducer;
