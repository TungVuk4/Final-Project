import { createSlice, PayloadAction } from "@reduxjs/toolkit";

type UserInfo = {
  userId: number;
  email: string;
  fullName: string;
  role: string;
  token: string;
};

type AuthState = {
  loginStatus: boolean;
  userInfo: UserInfo | null;
};

const savedUser = (): UserInfo | null => {
  try {
    const raw = localStorage.getItem("fashionUser");
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

const initialState: AuthState = {
  loginStatus: !!savedUser(),
  userInfo: savedUser(),
};

export const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setLoginStatus: (state, action: PayloadAction<boolean>) => {
      state.loginStatus = action.payload;
    },
    setUserInfo: (state, action: PayloadAction<UserInfo | null>) => {
      state.userInfo = action.payload;
      state.loginStatus = !!action.payload;
      if (action.payload) {
        localStorage.setItem("fashionUser", JSON.stringify(action.payload));
      } else {
        localStorage.removeItem("fashionUser");
      }
    },
    logout: (state) => {
      state.loginStatus = false;
      state.userInfo = null;
      localStorage.removeItem("fashionUser");
      // Keep compatibility with old key
      localStorage.removeItem("user");
    },
  },
});

export const { setLoginStatus, setUserInfo, logout } = authSlice.actions;

// Helper: get token from state or localStorage
export const getAuthToken = (): string | null => {
  try {
    const raw = localStorage.getItem("fashionUser");
    return raw ? JSON.parse(raw).token : null;
  } catch {
    return null;
  }
};

export default authSlice.reducer;
