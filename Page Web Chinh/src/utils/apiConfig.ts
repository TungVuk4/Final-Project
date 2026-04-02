/**
 * apiConfig.ts
 * ─────────────────────────────────────────────────────────────────
 * Tự động phát hiện môi trường để chọn đúng địa chỉ Backend:
 *
 *  • Trình duyệt Web trên máy tính  → localhost:8080
 *  • Android Emulator (10.0.2.2)    → 10.0.2.2:8080  (host loopback)
 *
 * Nguyên lý: Nếu trang web được WebView trong Android phục vụ qua
 * địa chỉ 10.0.2.2, thì window.location.hostname sẽ là "10.0.2.2".
 * Trong mọi trường hợp còn lại (localhost, 127.0.0.1, IP mạng LAN…)
 * ta vẫn gọi Backend qua localhost.
 * ─────────────────────────────────────────────────────────────────
 */

const isAndroidEmulator =
  typeof window !== "undefined" &&
  window.location.hostname === "10.0.2.2";

export const API_HOST = isAndroidEmulator
  ? "http://10.0.2.2:8080"
  : "http://localhost:8080";

export const API_BASE_URL = `${API_HOST}/api`;
