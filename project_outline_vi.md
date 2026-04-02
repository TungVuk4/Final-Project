# Dàn ý chi tiết cho Báo cáo Đồ án Tốt nghiệp
## PHÁT TRIỂN NỀN TẢNG THƯƠNG MẠI ĐIỆN TỬ THỜI TRANG VÀ ỨNG DỤNG DI ĐỘNG ANDROID

### 1. Giới thiệu (Introduction)
#### 1.1 Bối cảnh nghiên cứu (Background to the Study)
- Tổng quan về sự phát triển của thương mại điện tử và ngành thời trang ảo.
- Xu hướng chuyển dịch sang các nền tảng đa kênh (Web + Mobile).
- Nhu cầu về một giải pháp kỹ thuật số tích hợp cho các doanh nghiệp bán lẻ thời trang vừa và nhỏ.

#### 1.2 Xác định vấn đề (Problem Statement)
- Những thách thức của các nhà bán lẻ hiện nay (thiếu trải nghiệm di động đồng nhất).
- Quản lý đơn hàng thủ công, thiếu hiệu quả và dễ sai sót.
- Thiếu hệ thống quản lý kho chặt chẽ (theo dõi theo kích thước, màu sắc).
- Chưa có hệ thống khuyến mãi cá nhân hóa VIP dùng một lần.

#### 1.3 Mục tiêu nghiên cứu (Objectives of the Study)
- Thiết kế và phát triển nền tảng thương mại điện tử full-stack (Web Khách hàng + Trang Quản trị).
- Xây dựng ứng dụng di động Android bằng React Native với kiến trúc WebView để đồng bộ nền tảng.
- Triển khai hệ thống phân quyền (RBAC) với 3 cấp độ quản trị viên.
- Tự động hóa quy trình xử lý đơn hàng và gửi email thông báo.
- Xây dựng hệ thống mã khuyến mãi VIP cá nhân hóa, sử dụng một lần.

#### 1.4 Phạm vi và Giới hạn (Scope and Limitation)
- **Phạm vi:** Module Khách hàng (mua sắm, giỏ hàng, thanh toán), Module Admin (phân quyền 3 cấp, quản lý sản phẩm, đơn hàng), App di động (WebView Android).
- **Giới hạn:** Chỉ hỗ trợ hệ điều hành Android, lưu trữ ở môi trường phát triển cục bộ, thanh toán mô phỏng (chủ yếu là COD).

#### 1.5 Kế hoạch tiến độ thực hiện (Implementation Plan)
- Biểu đồ Gantt phân bổ thời gian: Thu thập yêu cầu, Thiết kế, Lập trình Backend, Lập trình Frontend, Phát triển Mobile App, Tích hợp, Kiểm thử, Viết báo cáo.

---

### 2. Phân tích & Thiết kế Hệ thống (System Analysis & Design)
#### 2.1 Nghiên cứu tính khả thi (Feasibility Studies)
- **Khả thi công nghệ:** Sử dụng các công nghệ mã nguồn mở phổ biến (Node.js, React, React Native, MySQL).
- **Khả thi vận hành:** Phân quyền quản trị rõ ràng, dễ dàng thao tác.
- **Phân tích Chi phí - Lợi ích:** Chi phí ban đầu thấp (0 USD) do dùng phần mềm mã nguồn mở.

#### 2.2 Phương pháp phân tích yêu cầu (Requirement Methods)
- **Yêu cầu chức năng (FR):** Quản lý tài khoản, Giỏ hàng, Đặt hàng, Áp dụng mã giảm giá, Quản lý từ Admin (sản phẩm, đơn hàng, hệ thống).
- **Yêu cầu phi chức năng (NFR):** Tốc độ tải trang (<500ms), Tương thích đa thiết bị, Bảo mật JWT, Hỗ trợ song ngữ.

#### 2.3 Phương pháp phát triển hệ thống (System Development Methods)
- Kết hợp Phát triển Ứng dụng Nhanh (RAD) và vòng đời phát triển phần mềm (SDLC) để linh hoạt trong thiết kế UI/UX.

#### 2.4 Sơ đồ Mô hình hóa Dữ liệu và Quy trình (Data and Process Modelling Diagrams)
- **Sơ đồ Kiến trúc Hệ thống:** Mô hình đa tầng kết nối Web, Backend và Mobile App.
- **Sơ đồ Use Case:** Tương tác của Khách hàng, Khách vãng lai, Admin 1, Admin 2, Admin 3.
- **Sơ đồ Luồng Dữ liệu (DFD Mức 0):** Giao tiếp giữa người dùng, hệ thống và cơ sở dữ liệu.

#### 2.5 Thiết kế Cơ sở dữ liệu (Database Design)
- **Sơ đồ Thực thể liên kết (ERD):** Trực quan hóa mối quan hệ giữa các bảng.
- **Lược đồ CSDL (Schemas):** Chi tiết các bảng Users, Products, Categories, Orders, Promotions, UserVouchers.

#### 2.6 Thiết kế Giao diện (Interface Design)
- Wireframes/Mockups của: Trang chủ, Chi tiết sản phẩm, Giỏ hàng, Admin Dashboard, App di động.

---

### 3. Công cụ & Môi trường Phát triển Phần mềm (Tools and Environments for Software Development)
#### 3.1 Ngôn ngữ & Framework Lập trình
- **Backend:** Node.js, Express.js (Xây dựng RESTful API).
- **Frontend (Web):** React 18, Vite (Biên dịch nhanh, thiết kế component-based).
- **Ứng dụng Di động:** React Native 0.84.1 (Kiến trúc Hybrid WebView).

#### 3.2 Hệ quản trị Cơ sở dữ liệu
- **MySQL 8.0:** Lưu trữ dữ liệu quan hệ, đảm bảo tính toàn vẹn (ACID rules).

#### 3.3 Công cụ và Môi trường (IDEs)
- **Trình soạn thảo mã (Code Editor):** Visual Studio Code.
- **Máy ảo Di động:** Android Studio (Ladybug) cấu hình ADB Reverse Tunnel.
- **Kiểm thử API:** Postman / Insomnia.
- **Quản lý phiên bản:** Git & GitHub.

#### 3.4 Thư viện tích hợp cốt lõi
- **Bảo mật & Xác thực:** JSON Web Tokens (JWT), bcrypt (Mã hóa mật khẩu).
- **Gửi Email:** Nodemailer.
- **Quản lý State & Request:** Axios, React Router.

---

### 4. Triển khai & Đánh giá (Implementation & Evaluation)
#### 4.1 Triển khai và Cài đặt Hệ thống (System Installation)
- **Cấu hình môi trường:** Node.js, MySQL, Android SDK.
- **Cài đặt Backend:** File biến môi trường (.env), kết nối CSDL, cổng 8080.
- **Triển khai Web & Admin:** Khởi chạy bằng Vite (cổng 5174, 5173).
- **Thiết lập Mobile:** Khởi chạy Metro Bundler, map cổng bằng ADB reverse.

#### 4.2 Triển khai các chức năng cốt lõi (Main Function Codes)
- Code xử lý Middleware xác thực JWT.
- Code WebView trong React Native và xử lý nút Back phần cứng của Android.
- Thuật toán kiểm tra và áp dụng mã khuyến mãi VIP (One-time Use).
- Code tích hợp Nodemailer gửi thông báo tự động.

#### 4.3 Hướng dẫn sử dụng hệ thống (System User Guides)
- Giao diện Khách hàng: Luồng Đăng nhập -> Chọn SP -> Thanh toán.
- Giao diện Quản trị: Luồng từ duyệt đơn hàng, cấu hình hệ thống, quản lý kho.

#### 4.4 Kế hoạch Kiểm thử & Kết quả (Testing Plan & Output)
- **Phương pháp kiểm thử:** Kiểm thử hộp đen (Black Box Testing).
- **Module Xác thực:** Test case đăng nhập sai, kịch bản đăng ký thành công.
- **Module Đơn hàng:** Kiểm tra tính toán tổng tiền, áp mã giảm giá, kiểm tra trừ tồn kho.
- **Module Di động:** Tốc độ render WebView, kiểm tra lưu trữ local storage trên app máy ảo.

---

### 5. Kết luận (Conclusions)
#### 5.1 Tóm tắt các kết quả chính (Summary of Main Findings)
- Hoàn thành thiết kế kiến trúc toàn diện (Web, App, API, Database).
- Tích hợp thành công WebView app phân quyền và hệ thống mail tự động.

#### 5.2 Thảo luận & Ý nghĩa thực tiễn (Discussion and Implications)
- Khẳng định tính hiệu quả của WebView để giảm thiểu thời gian ra mắt sản phẩm đa nền tảng.
- Tầm quan trọng của phân quyền RBAC và mã khuyến mãi VIP cá nhân.

#### 5.3 Hạn chế của hệ thống (Limitations of the System)
- Chỉ chạy trên nền tảng Android.
- Hoạt động ở môi trường cục bộ, thiếu cổng thanh toán quốc tế và trong nước thực tế.

#### 5.4 Hướng phát triển trong tương lai (Future Development)
- Tối ưu hóa WebView để chuẩn bị publish.
- Mở rộng hỗ trợ hệ điều hành iOS bằng React Native.
- Đưa hệ thống lên Cloud (AWS/Vercel) để truy cập qua Internet.
- Tích hợp các cổng thanh toán online thật như VNPay, MoMo.
