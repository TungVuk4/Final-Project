# FashionStyle Mobile App

Chào mừng đến với dự án Mobile App của hệ thống thương mại điện tử FashionStyle! App này đóng vai trò là cầu nối mang giao diện siêu mượt mà của gian hàng Web lên nền tảng Mobile (Android & iOS).

## 📐 Kiến Trúc Thực Hiện (Architecture)

Đây là một ứng dụng di động **Hybrid (Lai)** được phát triển trên nền tảng **React Native**.
Thay vì lập trình lại toàn bộ giao diện từ số 0 bằng mã C++/Java thuần túy, ứng dụng này sử dụng kiến trúc **WebView Wrapper** vô cùng thông minh:
1. **Lớp vỏ Native (React Native):** Khởi tạo một bộ khung phần mềm của hệ điều hành, đảm nhận việc xin quyền hệ thống, theo dõi phần cứng, loại bỏ rào cản mạng (ClearText Traffic) và duy trì sự ổn định.
2. **Lõi Giao Diện (WebView):** Bên trong lớp vỏ, ứng dụng nhúng trực tiếp giao diện linh hoạt từ dự án web Vite (`Page Web Chinh`). WebView sẽ đóng vai trò như một lõi trình duyệt tối tân không viền.
3. **Kết Nối Dữ Liệu:** Toàn bộ dữ liệu sản phẩm, đăng nhập, giỏ hàng đều được truyền động bộ hóa song song giữa App, Web và Backend thông qua cổng hầm ảo (ADB Reverse Tunnel).

---

## 🚀 Hướng Dẫn Kích Hoạt Dự Án (Từ A đến Z)

Do ứng dụng có mô hình phụ thuộc vào Web và Backend nội bộ, bạn cần thực hiện MỞ/CHẠY theo đúng trình tự sau để không bao giờ bị dính lỗi "Màn hình trắng" hay "Màn hình đen xoay liên tục":

### Bước 1: Khởi động hệ sinh thái chính
1. Khởi động phần mềm **Backend Project** (Spring Boot 8080) và chắc chắn Database đã lên.
2. Bật Terminal chạy dự án Web Chính (**Page Web Chinh**) bằng lệnh:
   ```bash
   npm run dev
   ```
   *Quá trình này sẽ sử dụng cổng `5174` (hoặc cổng cấu hình khai báo trong `vite.config.ts`).*

### Bước 2: Bật máy ảo điện thoại (Emulator)
- Mở **Android Studio**, vào **Device Manager** và bật máy ảo Pixel lên (nhấn nút Play). Chờ tới khi màn hình điện thoại Android hiện lên rõ ràng và có thể lướt được.

### Bước 3: Đào hầm bảo mật truyền tải dữ liệu (ADB Reverse Tunnel)
Cắm "cáp mạng ảo" để điện thoại điện tử hiểu và liên kết với máy phân tích số trên Windows. Mở 1 cửa sổ Powershell/Terminal MỚI và dán dứt điểm lệnh này:

```bash
adb reverse tcp:8081 tcp:8081
adb reverse tcp:8080 tcp:8080
```
> **Giải thích siêu kĩ:** Lệnh trên ép cổng `8080` (Của Backend) và cổng `8081` (Của Metro React Native) truyền tín hiệu xuyên âm tầng vào máy ảo Android. Nhờ đó điện thoại Android mới chọc vào được Database ở máy Windows.

### Bước 4: Khởi động Trạm phát Metro
Mở cửa sổ Terminal ngay tại thư mục **FashionStyleApp** này và gõ:
```bash
npm start
```
*Lệnh này sẽ biến Terminal thành trung tâm theo dõi mã lệnh, không được tắt cửa sổ này.*

### Bước 5: Đẩy ứng dụng vào Điện thoại
Mở thêm một Terminal thứ 2 tại thư mục **FashionStyleApp** và gõ lệnh:
```bash
npm run android
```
- Việc cài đặt mất tầm 15 - 30s. Bạn sẽ thấy ứng dụng tự mở lên trên điện thoại ảo.
- Lần đầu tiên: Màn hình đen với cục tròn vàng xoay xoay sẽ diễn ra tầm 10-30s. Lý do đơn giản do Nodejs Web đùn hàng ngàn File Code siêu nhẹ vào khung WebView. Sang các lần mở kế tiếp nó đều lưu lại ở cache và thao tác sẽ nhanh như gió.

---

## 🛠 Cách Xử Lý Các Sự Cố (Troubleshooting)

1. **Lỗi "Invalid email or password" (khi nhập đúng 100%):**
   - Sự cố này là do Cổng `8080` của Database không gắn kết được vào máy ảo. Trở lại **Bước 3** và gõ lại lệnh `adb reverse tcp:8080 tcp:8080`.

2. **Gặp màn hình nhấp nháy Trắng rồi Văng:**
   - Chắc chắn đường dẫn IP đã bị sai trong lúc thử nghiệm. Vào file `config.ts` đổi lại thành IP chuẩn của máy chủ Android ảo là `http://10.0.2.2:5174`.

3. **Chữ Vàng Hiện "No apps connected" ở trạm phát Metro:**
   - Hoàn toàn bình thường! Ứng dụng điện thoại đã bị vô định tuyến sang kết nối cái Trạm Metro khác do bạn bật 2 Terminal Metro cùng 1 lúc. Chỉ việc tắt bỏ cửa sổ hiển thị dòng Vàng đó đi là được.

4. **Cảnh Báo Đỏ ở Android Studio (Về phiên bản AGP):**
   - React Native 0.84 dùng AGP `8.12.0`. Đừng tự ý hạ cấp, hệ thống tự tương thích, chỉ việc bấm nút "X" và bỏ qua lỗi đó.

> Viết bởi kỹ sư AntiGravity. Phiên bản hệ thống 1.0.0.
