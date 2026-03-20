import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

// 3 tài khoản Admin cố định dùng cho account switcher
export const FIXED_ADMINS = [
  {
    email: "admin1@fashionstyle.com",
    password: "Admin@123",
    name: "Admin Chính",
    level: 1,
    color: "from-violet-600 to-purple-700",
    badge: "bg-violet-500",
  },
  {
    email: "admin2@fashionstyle.com",
    password: "Admin@456",
    name: "Admin Kho",
    level: 2,
    color: "from-cyan-500 to-blue-600",
    badge: "bg-cyan-500",
  },
  {
    email: "admin3@fashionstyle.com",
    password: "Admin@789",
    name: "Admin Vận Hành",
    level: 3,
    color: "from-emerald-500 to-teal-600",
    badge: "bg-emerald-500",
  },
];

export const useAuthStore = create(
  persist(
    (set, get) => ({
      isAuthenticated: false,
      token: null,
      user: null,
      isSwitching: false, // trạng thái đang chuyển tài khoản
      activityLog: [], // lịch sử hoạt động
      notifications: [], // Lưu trữ thông báo nội bộ

      // Quản lý thông báo
      addNotification: (toEmail, message) => {
        set((state) => ({
          notifications: [
            ...state.notifications || [],
            { id: Date.now(), toEmail, message, time: new Date().toISOString() }
          ]
        }));
      },
      clearNotifications: (email) => {
        set((state) => ({
          notifications: (state.notifications || []).filter(n => n.toEmail !== email)
        }));
      },

      // Đăng nhập
      setLogin: (token, userData) => {
        const now = new Date().toISOString();
        set((state) => ({
          isAuthenticated: true,
          token: token,
          user: userData,
          activityLog: [
            {
              id: Date.now(),
              email: userData.email,
              name: userData.name,
              action: "Đăng nhập",
              time: now,
              status: "success",
            },
            ...state.activityLog.slice(0, 99), // giữ tối đa 100 log
          ],
        }));

        // Ghi log vào DB
        fetch("http://localhost:8080/api/admin-logs", {
          method: "POST",
          headers: { 
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
          },
          body: JSON.stringify({ action: "Đăng nhập", details: "Admin truy cập hệ thống" }),
        }).catch(err => console.error("Lỗi ghi log DB:", err));
      },

      // Chuyển đổi tài khoản (gọi API login với tài khoản khác)
      switchAccount: async (targetEmail) => {
        const admin = FIXED_ADMINS.find((a) => a.email === targetEmail);
        if (!admin) return { success: false, message: "Tài khoản không tìm thấy" };

        set({ isSwitching: true });
        try {
          const res = await fetch("http://localhost:8080/api/auth-temp/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ Email: admin.email, Password: admin.password }),
          });
          const data = await res.json();
          if (data.success) {
            const now = new Date().toISOString();
            set((state) => ({
              isAuthenticated: true,
              token: data.token,
              user: data.user,
              isSwitching: false,
              activityLog: [
                {
                  id: Date.now(),
                  email: data.user.email,
                  name: data.user.name,
                  action: `Chuyển sang ${admin.name}`,
                  time: now,
                  status: "switch",
                },
                ...state.activityLog.slice(0, 99),
              ],
            }));

            // Ghi log vào DB
            fetch("http://localhost:8080/api/admin-logs", {
              method: "POST",
              headers: { 
                "Content-Type": "application/json",
                "Authorization": `Bearer ${data.token}`
              },
              body: JSON.stringify({ action: `Chuyển sang ${admin.name}`, details: `Admin chuyển quyền từ Account Switcher` }),
            }).catch(err => console.error("Lỗi ghi log DB:", err));

            return { success: true };
          } else {
            set({ isSwitching: false });
            return { success: false, message: data.message };
          }
        } catch (err) {
          set({ isSwitching: false });
          return { success: false, message: "Lỗi kết nối server" };
        }
      },

      // Thêm activity log thủ công (khi admin thực hiện hành động)
      addLog: async (action, details = "") => {
        const { user, token } = get();
        if (!user) return;
        const now = new Date().toISOString();
        
        set((state) => ({
          activityLog: [
            {
              id: Date.now(),
              email: user.email,
              name: user.name,
              action,
              time: now,
              status: "action",
            },
            ...state.activityLog.slice(0, 99),
          ],
        }));

        // Ghi log vào DB
        if (token) {
          fetch("http://localhost:8080/api/admin-logs", {
            method: "POST",
            headers: { 
              "Content-Type": "application/json",
              "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify({ action, details: details || `Hành động: ${action}` }),
          }).catch(err => console.error("Lỗi ghi log DB:", err));
        }
      },

      // Đăng xuất
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
