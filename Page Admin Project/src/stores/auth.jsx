import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

export const useAuthStore = create(
  persist(
    (set) => ({
      isAuthenticated: false,
      token: null,
      user: null, // Lưu trữ id, name, role...

      // Cập nhật hàm setLogin để nhận dữ liệu từ API
      setLogin: (token, userData) =>
        set({
          isAuthenticated: true,
          token: token,
          user: userData,
        }),

      // Hàm đăng xuất: Xóa sạch trạng thái
      logout: () =>
        set({
          isAuthenticated: false,
          token: null,
          user: null,
        }),
    }),
    {
      name: "auth-storage",
      storage: createJSONStorage(() => localStorage),
    }
  )
);
