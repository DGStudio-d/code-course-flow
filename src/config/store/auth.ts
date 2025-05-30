// store/DtaUser.ts
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface User {
  id: number;
  name: string;
  email: string;
  // Add other user fields as needed
}

interface AppDataState {
  user: User | null;
  token: string;
  role: string;
}

const initialState: AppDataState = {
  user: JSON.parse(localStorage.getItem("user") || "null"),
  token: localStorage.getItem("token") || "",
  role: localStorage.getItem("role") || "",
};

const auth = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setUser: (
      state,
      action: PayloadAction<{
        user: User;
        token: string;
        role: { name: string };
      }>
    ) => {
      const { user, token } = action.payload;
    //   console.log("Setting user:", user, "Token:", token, "Role:", user?.role);
      state.user = user;
      state.token = token;
      state.role = user?.role?.name || "";

      localStorage.setItem("user", JSON.stringify(user) || "");
      localStorage.setItem("token", token || "");
      localStorage.setItem("role", user?.role?.name || "");
    },
    logout: (state) => {
      state.user = null;
      state.token = "";
      state.role = "";
      localStorage.removeItem("user");
      localStorage.removeItem("token");
      localStorage.removeItem("role");
    },
  },
});

export const { setUser, logout } = auth.actions;
export default auth.reducer;
