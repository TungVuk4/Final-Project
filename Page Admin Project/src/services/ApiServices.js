import axios from "axios";

// Cấu hình Base URL khớp với server.js của bạn
const API_URL = "http://localhost:8080/api";

// ----------------------------------------------------------------
// 1. MODULE: AUTH (Đăng nhập)
// ----------------------------------------------------------------
export const loginApi = async (email, password) => {
  try {
    const response = await axios.post(`${API_URL}/auth-temp/login`, {
      Email: email, // Chữ E viết hoa theo Backend yêu cầu
      Password: password, // Chữ P viết hoa theo Backend yêu cầu
    });
    return response.data;
  } catch (error) {
    throw error.response?.data?.message || "Lỗi server khi đăng nhập.";
  }
};

// ----------------------------------------------------------------
// 2. MODULE: USER (Quản lý người dùng)
// ----------------------------------------------------------------

// Lấy danh sách tất cả người dùng (Admin)
export const getAllUsersApi = async (token) => {
  try {
    const response = await axios.get(`${API_URL}/user/admin/all`, {
      headers: { Authorization: `Bearer ${token}` }, // Gửi kèm token để xác thực
    });
    return response.data;
  } catch (error) {
    throw (
      error.response?.data?.message || "Không thể lấy danh sách người dùng."
    );
  }
};

// Cập nhật vai trò người dùng
export const updateUserRoleApi = async (userId, role, token) => {
  try {
    const response = await axios.put(
      `${API_URL}/user/admin/${userId}/role`,
      { Role: role },
      { headers: { Authorization: `Bearer ${token}` } }
    );
    return response.data;
  } catch (error) {
    throw error.response?.data?.message || "Lỗi khi cập nhật vai trò.";
  }
};

// Xóa người dùng
export const deleteUserApi = async (userId, token) => {
  try {
    const response = await axios.delete(`${API_URL}/user/admin/${userId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  } catch (error) {
    throw error.response?.data?.message || "Lỗi khi xóa người dùng.";
  }
};
