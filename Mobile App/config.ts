/**
 * =============================================================
 * FashionStyle Mobile App — config.ts
 * =============================================================
 *
 * File này chứa các URL cấu hình trung tâm.
 * Khi dùng ngrok/localtunnel, chỉ cần sửa 2 biến bên dưới là xong.
 *
 * HƯỚNG DẪN:
 *   1. Cài ngrok: https://ngrok.com/download
 *   2. Tạo tunnel cho Web (Port 5173):
 *        ngrok http 5173
 *   3. Tạo tunnel cho Backend (Port 8080):
 *        ngrok http 8080
 *   4. Copy 2 URL https://xxxx.ngrok-free.app và dán vào đây.
 *   5. Đồng thời cập nhật baseURL trong:
 *        Page Web Chinh/src/axios/custom.ts (cho Web Admin đang test thực tế)
 * =============================================================
 */

// --- CẤU HÌNH URL ---
// Thay URL ở đây khi tunneling hoặc khi deploy lên production

// URL trỏ vào Web App của bạn (Page Web Chinh)
export const WEB_URL = 'http://10.0.2.2:5173'; // Android Emulator
// export const WEB_URL = 'http://localhost:5173'; // iOS Simulator
// export const WEB_URL = 'https://xxxx.ngrok-free.app'; // khi dùng ngrok với điện thoại thật

// URL trỏ vào Backend API (dùng cho debug nếu cần gọi API trực tiếp từ App)
export const API_URL = 'http://10.0.2.2:8080'; // Android Emulator
// export const API_URL = 'http://localhost:8080'; // iOS Simulator
// export const API_URL = 'https://yyyy.ngrok-free.app'; // khi dùng ngrok với điện thoại thật
