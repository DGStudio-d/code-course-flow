import { configureStore } from "@reduxjs/toolkit";
import appDataReducer from "./dataSlice";
import authReducer from "./auth";


export const store = configureStore({
  reducer: {
    appData: appDataReducer,
    auth: authReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
