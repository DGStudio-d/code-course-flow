// store/appDataSlice.ts
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface AppDataState {
  languages: unknown[];
  
}

const initialState: AppDataState = {
  languages: []
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
