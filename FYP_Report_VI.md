# BÁO CÁO ĐỒ ÁN TỐT NGHIỆP — TIẾNG VIỆT
## Theo hướng dẫn: Final Year Project Handbook (International Edition - V1)
## Loại đồ án: Rubric A — Phát triển Hệ thống (System Development)

> **Môn học:** CBBR4106 – Final Year Project
> **Trường:** Open University Malaysia / FPT-Greenwich
> **Chương trình:** Cử nhân Công nghệ Thông tin (Có Danh hiệu)
> **Loại dự án:** Phát triển Hệ thống Thương Mại Điện Tử + Ứng Dụng Di Động Android

---

## 📋 THỨ TỰ CÁC PHẦN TRONG BÁO CÁO (BẮT BUỘC theo Handbook)

```
1. TRANG BÌA (Title Page)
2. LỜI CAM ĐOAN (Declaration)
3. TÓM TẮT (Abstract)
4. LỜI CẢM ƠN (Acknowledgements)
5. MỤC LỤC (Table of Contents)
6. DANH SÁCH BẢNG (List of Tables)
7. DANH SÁCH HÌNH ẢNH (List of Figures)
8. DANH MỤC TỪ VIẾT TẮT (List of Abbreviations)
──────────────────────────────────────────
CHƯƠNG 1: GIỚI THIỆU
CHƯƠNG 2: TỔNG QUAN TÀI LIỆU (Literature Review)
CHƯƠNG 3: PHÂN TÍCH VÀ THIẾT KẾ HỆ THỐNG
CHƯƠNG 4: TRIỂN KHAI VÀ KIỂM THỬ HỆ THỐNG
CHƯƠNG 5: KẾT LUẬN VÀ ĐỀ XUẤT
──────────────────────────────────────────
TÀI LIỆU THAM KHẢO (References)
PHỤ LỤC (Appendices)
```

> ⚠️ **Lưu ý quan trọng:** Tổng số trang từ Chương 1 đến Chương 5 phải **tối thiểu 50 trang**

---

# PHÁT TRIỂN NỀN TẢNG THƯƠNG MẠI ĐIỆN TỬ THỜI TRANG VÀ ỨNG DỤNG DI ĐỘNG ANDROID

*(Font: Arial Narrow, cỡ 18, CHỮ HOA — dùng cho trang bìa)*

**[TÊN SINH VIÊN — VIẾT HOA]**

**OPEN UNIVERSITY MALAYSIA**
**2026**

---

## LỜI CAM ĐOAN

**Họ và tên:** [Điền tên sinh viên]
**Mã số sinh viên:** [Điền mã số]

Tôi xin cam đoan rằng đồ án tốt nghiệp này là kết quả của công việc nghiên cứu độc lập của bản thân, ngoại trừ các trích dẫn và tóm tắt đã được ghi nhận đầy đủ nguồn gốc.

**Chữ ký:** __________________ &nbsp;&nbsp;&nbsp;&nbsp; **Ngày:** __________________

*(Trang này được đánh số La Mã: ii)*

---

## TÓM TẮT (ABSTRACT)

**PHÁT TRIỂN NỀN TẢNG THƯƠNG MẠI ĐIỆN TỬ THỜI TRANG VÀ ỨNG DỤNG DI ĐỘNG ANDROID**

*(Font Times New Roman, cỡ 12, giãn dòng đơn — KHÔNG QUÁ 250 TỪ)*

Đồ án này trình bày quá trình phát triển một nền tảng thương mại điện tử thời trang đa tầng có tên FashionStyle, được thiết kế nhằm cung cấp trải nghiệm mua sắm trực tuyến liền mạch trên cả nền tảng web và di động. Hệ thống được xây dựng theo kiến trúc đa tầng gồm bốn thành phần chính: REST API nền tảng Node.js, ứng dụng web khách hàng sử dụng React, bảng điều khiển quản trị viên sử dụng React, và ứng dụng di động Android xây dựng bằng React Native.

Ứng dụng di động sử dụng kiến trúc Hybrid WebView, nhúng giao diện web vào trong lớp vỏ native Android để cung cấp trải nghiệm đồng nhất. Hệ thống triển khai phân quyền ba cấp quản trị viên, quy trình xử lý đơn hàng tự động với thông báo email, hệ thống mã khuyến mãi VIP dùng một lần cá nhân hóa, và mô-đun cấu hình hệ thống theo thời gian thực.

**Từ khóa:** Thương mại điện tử, React Native, WebView, Node.js, Full-Stack, Ứng dụng di động

---

## LỜI CẢM ƠN

Tôi xin gửi lời cảm ơn chân thành đến giảng viên hướng dẫn **[Tên thầy/cô]** đã tận tình hỗ trợ và định hướng trong suốt quá trình thực hiện đồ án này.

Tôi cũng xin gửi lời cảm ơn đến gia đình và bạn bè đã luôn ủng hộ và động viên tôi trong những lúc khó khăn. Nếu không có sự hỗ trợ của các bên đã đề cập, tôi không thể hoàn thành đồ án này một cách thành công.

**XIN CHÂN THÀNH CẢM ƠN.**

**[TÊN SINH VIÊN]**
*Ngày 28 tháng 3 năm 2026*

---

## MỤC LỤC

| Phần | Trang |
|------|-------|
| LỜI CAM ĐOAN | ii |
| TÓM TẮT | iii |
| LỜI CẢM ƠN | iv |
| MỤC LỤC | v |
| DANH SÁCH BẢNG | vi |
| DANH SÁCH HÌNH ẢNH | vii |
| DANH MỤC TỪ VIẾT TẮT | viii |
| **CHƯƠNG 1: GIỚI THIỆU** | 1 |
| 1.1 Bối cảnh nghiên cứu | 1 |
| 1.2 Xác định vấn đề | 2 |
| 1.3 Mục tiêu nghiên cứu | 3 |
| 1.4 Phạm vi và giới hạn | 4 |
| 1.5 Kế hoạch thực hiện | 5 |
| **CHƯƠNG 2: TỔNG QUAN TÀI LIỆU** | 6 |
| 2.1 Hệ thống thương mại điện tử | 6 |
| 2.2 Công nghệ ứng dụng di động | 8 |
| 2.3 Kiến trúc Hybrid WebView | 9 |
| 2.4 Thiết kế RESTful API | 11 |
| 2.5 Tóm tắt | 12 |
| **CHƯƠNG 3: PHÂN TÍCH VÀ THIẾT KẾ HỆ THỐNG** | 13 |
| 3.1 Nghiên cứu tính khả thi | 13 |
| 3.2 Phân tích yêu cầu | 15 |
| 3.3 Phương pháp phát triển hệ thống | 17 |
| 3.4 Sơ đồ dữ liệu và quy trình | 18 |
| 3.5 Thiết kế cơ sở dữ liệu | 22 |
| 3.6 Thiết kế giao diện | 28 |
| **CHƯƠNG 4: TRIỂN KHAI VÀ KIỂM THỬ** | 35 |
| 4.1 Hướng dẫn cài đặt hệ thống | 35 |
| 4.2 Hướng dẫn sử dụng hệ thống | 38 |
| 4.3 Kế hoạch kiểm thử và kết quả | 44 |
| 4.4 Mã nguồn các chức năng chính | 50 |
| **CHƯƠNG 5: KẾT LUẬN VÀ ĐỀ XUẤT** | 55 |
| 5.1 Tóm tắt kết quả đạt được | 55 |
| 5.2 Thảo luận và ý nghĩa | 56 |
| 5.3 Hạn chế của hệ thống | 57 |
| 5.4 Hướng phát triển tương lai | 58 |
| TÀI LIỆU THAM KHẢO | 59 |
| PHỤ LỤC | 61 |

---

## DANH SÁCH BẢNG

| Bảng | Tiêu đề | Trang |
|------|---------|-------|
| Bảng 3.1 | Yêu cầu chức năng của hệ thống | 15 |
| Bảng 3.2 | Yêu cầu phi chức năng của hệ thống | 16 |
| Bảng 3.3 | Lược đồ cơ sở dữ liệu — Bảng Users | 22 |
| Bảng 3.4 | Lược đồ cơ sở dữ liệu — Bảng Products | 23 |
| Bảng 3.5 | Lược đồ cơ sở dữ liệu — Bảng Orders | 24 |
| Bảng 3.6 | Lược đồ cơ sở dữ liệu — Bảng Promotions | 25 |
| Bảng 4.1 | Các trường hợp kiểm thử — Module xác thực | 44 |
| Bảng 4.2 | Các trường hợp kiểm thử — Module quản lý sản phẩm | 46 |
| Bảng 4.3 | Các trường hợp kiểm thử — Module xử lý đơn hàng | 48 |
| Bảng 4.4 | Các trường hợp kiểm thử — Ứng dụng di động Android | 50 |

---

## DANH SÁCH HÌNH ẢNH

| Hình | Tiêu đề | Trang |
|------|---------|-------|
| Hình 3.1 | Sơ đồ kiến trúc tổng thể hệ thống | 14 |
| Hình 3.2 | Sơ đồ Use Case — Khách hàng | 18 |
| Hình 3.3 | Sơ đồ Use Case — Quản trị viên | 19 |
| Hình 3.4 | Sơ đồ Luồng Dữ Liệu (DFD) Mức 0 | 20 |
| Hình 3.5 | Sơ đồ Thực Thể Liên Kết (ERD) | 21 |
| Hình 3.6 | Lược đồ cơ sở dữ liệu đầy đủ | 27 |
| Hình 3.7 | Thiết kế giao diện — Trang chủ | 28 |
| Hình 3.8 | Thiết kế giao diện — Trang sản phẩm | 29 |
| Hình 3.9 | Thiết kế giao diện — Bảng điều khiển Admin | 30 |
| Hình 3.10 | Thiết kế giao diện — Ứng dụng di động | 31 |
| Hình 4.1 | Màn hình thực tế — Trang chủ web | 38 |
| Hình 4.2 | Màn hình thực tế — Chi tiết sản phẩm | 39 |
| Hình 4.3 | Màn hình thực tế — Bảng điều khiển Admin | 41 |
| Hình 4.4 | Màn hình thực tế — App Android trên máy ảo | 43 |

---

## DANH MỤC TỪ VIẾT TẮT

| Từ viết tắt | Nghĩa đầy đủ |
|------------|--------------|
| API | Giao diện lập trình ứng dụng (Application Programming Interface) |
| APK | Gói ứng dụng Android (Android Package Kit) |
| ADB | Cầu nối gỡ lỗi Android (Android Debug Bridge) |
| CRUD | Tạo, Đọc, Cập nhật, Xóa (Create, Read, Update, Delete) |
| DFD | Sơ đồ Luồng Dữ Liệu (Data Flow Diagram) |
| ERD | Sơ đồ Thực Thể Liên Kết (Entity Relationship Diagram) |
| HTTP | Giao thức Truyền Siêu Văn Bản (Hypertext Transfer Protocol) |
| JWT | Mã thông báo JSON Web (JSON Web Token) |
| OUM | Đại học Mở Malaysia (Open University Malaysia) |
| REST | Kiểu kiến trúc Truyền Trạng Thái Đại Diện (Representational State Transfer) |
| SDLC | Vòng đời Phát triển Phần mềm (Software Development Life Cycle) |
| SQL | Ngôn ngữ Truy vấn Có Cấu trúc (Structured Query Language) |
| UI | Giao diện Người dùng (User Interface) |
| UX | Trải nghiệm Người dùng (User Experience) |

---

---

# CHƯƠNG 1: GIỚI THIỆU

## 1.1 Bối Cảnh Nghiên Cứu

Sự phát triển nhanh chóng của thương mại điện tử đã thay đổi căn bản cách người tiêu dùng mua sắm hàng hóa và dịch vụ trên toàn cầu. Theo Statista (2024), doanh thu thương mại điện tử toàn cầu dự kiến vượt 7 nghìn tỷ USD vào năm 2025, được thúc đẩy bởi sự phổ biến ngày càng tăng của điện thoại thông minh và kết nối internet. Tại Việt Nam, nền kinh tế số đã phát triển mạnh mẽ, với bán lẻ trực tuyến trở thành kênh chủ đạo cho các sản phẩm thời trang và phong cách sống.

Mặc dù thương mại điện tử phổ biến rộng rãi, nhiều nhà bán lẻ thời trang vừa và nhỏ vẫn thiếu giải pháp kỹ thuật số tích hợp hỗ trợ cả trải nghiệm mua sắm trên web và di động. Sự thiếu hụt nền tảng thống nhất thường dẫn đến hành trình khách hàng bị phân mảnh, kiểm soát hàng tồn kho kém hiệu quả và quy trình quản lý đơn hàng thiếu tổ chức.

Đồ án **FashionStyle** này giải quyết khoảng cách đó bằng cách phát triển một nền tảng thương mại điện tử đa tầng toàn diện, tích hợp ứng dụng web dành cho khách hàng, bảng điều khiển quản trị viên, và ứng dụng di động Android native. Hệ thống được xây dựng bằng các công nghệ web hiện đại bao gồm Node.js, React và React Native, cung cấp giải pháp có thể mở rộng và bảo trì phù hợp với triển khai thực tế trong kinh doanh.

## 1.2 Xác Định Vấn Đề

Các thách thức hiện tại mà các doanh nghiệp thời trang thương mại điện tử nhỏ đang phải đối mặt bao gồm:

1. **Thiếu trải nghiệm di động tích hợp:** Hầu hết các trang web của nhà bán lẻ nhỏ không được tối ưu hóa cho thiết bị di động, dẫn đến tỷ lệ chuyển đổi từ người dùng di động thấp.

2. **Quản lý đơn hàng không hiệu quả:** Xử lý đơn hàng thủ công hay xảy ra lỗi và làm chậm giao tiếp với khách hàng.

3. **Kiểm soát tồn kho không đầy đủ:** Không có hệ thống theo dõi kho theo kích thước và màu sắc, doanh nghiệp thường xuyên đối mặt với tình trạng bán vượt quá tồn kho.

4. **Không có hệ thống khuyến mãi cá nhân hóa:** Nhà bán lẻ nhỏ gặp khó khăn trong việc triển khai các chiến dịch khuyến mãi nhắm mục tiêu cho khách hàng VIP.

## 1.3 Mục Tiêu Nghiên Cứu

Các mục tiêu của đồ án này là:

1. Thiết kế và phát triển nền tảng thương mại điện tử full-stack gồm REST API backend, ứng dụng web khách hàng và bảng điều khiển quản trị viên.
2. Phát triển ứng dụng di động Android sử dụng React Native, nhúng giao diện web thông qua kiến trúc WebView để cung cấp trải nghiệm nhất quán trên đa nền tảng.
3. Triển khai hệ thống kiểm soát truy cập dựa trên vai trò hỗ trợ ba cấp độ quản trị.
4. Phát triển quy trình quản lý đơn hàng tự động với thông báo email.
5. Triển khai hệ thống mã khuyến mãi VIP cá nhân hóa với xác thực sử dụng một lần.

## 1.4 Phạm Vi Và Giới Hạn

### Phạm vi

Hệ thống FashionStyle bao gồm các lĩnh vực chức năng sau:

- **Module Khách hàng:** Duyệt sản phẩm, tìm kiếm, thêm vào giỏ hàng (cho cả người dùng đã đăng nhập và khách), thanh toán, lịch sử đơn hàng, quản lý hồ sơ.
- **Module Quản trị viên:** Hệ thống quản trị ba cấp bao gồm quản lý sản phẩm, xử lý và duyệt đơn hàng, quản lý mã khuyến mãi, quản lý người dùng và cấu hình hệ thống.
- **Module Di động:** Ứng dụng Android nhúng ứng dụng web khách hàng qua WebView, hỗ trợ điều hướng nút Back phần cứng.

### Giới hạn

- **Giới hạn nền tảng:** Ứng dụng di động chỉ phát triển cho Android. Hỗ trợ iOS không nằm trong phạm vi đồ án.
- **Cổng thanh toán:** Hệ thống không tích hợp cổng thanh toán thực tế. Đơn hàng được đặt bằng COD hoặc thanh toán online mô phỏng.
- **Triển khai:** Hệ thống được lưu trữ trên môi trường phát triển cục bộ. Triển khai đám mây không thuộc phạm vi đồ án.

## 1.5 Kế Hoạch Thực Hiện (Gantt Chart)

| Giai đoạn | Nội dung công việc | Thời gian |
|-----------|--------------------|-----------|
| Giai đoạn 1 | Phân tích yêu cầu & Thiết kế hệ thống | 2 tuần |
| Giai đoạn 2 | Phát triển Backend API | 3 tuần |
| Giai đoạn 3 | Phát triển Web App Khách hàng | 4 tuần |
| Giai đoạn 4 | Phát triển Admin Dashboard | 2 tuần |
| Giai đoạn 5 | Phát triển Ứng dụng Android | 2 tuần |
| Giai đoạn 6 | Tích hợp hệ thống & Kiểm thử | 2 tuần |
| Giai đoạn 7 | Viết báo cáo & Tài liệu | 1 tuần |
| **Tổng cộng** | | **16 tuần** |

---

# CHƯƠNG 2: TỔNG QUAN TÀI LIỆU (LITERATURE REVIEW)

> ⚠️ **Đây là chương bạn phải tự viết nhiều nhất — cần 6-10 trang và cite tối thiểu 8-10 nguồn học thuật từ Google Scholar, IEEE, hoặc sách giáo khoa.**

## 2.1 Hệ Thống Thương Mại Điện Tử

Các hệ thống thương mại điện tử đã phát triển đáng kể từ các danh mục tĩnh sang các nền tảng năng động, điều khiển bởi cơ sở dữ liệu. Theo Turban và cộng sự (2018), các nền tảng thương mại điện tử hiệu quả phải giải quyết bốn yêu cầu chức năng cốt lõi: khám phá sản phẩm, xử lý giao dịch, quản lý đơn hàng và quản lý quan hệ khách hàng.

*(→ Hướng dẫn viết: Phân tích các hệ thống thương mại điện tử hiện có như Shopify, WooCommerce, Magento. So sánh kiến trúc của chúng với cách tiếp cận custom-built của đồ án này. Giải thích lý do bạn chọn xây dựng từ đầu thay vì dùng framework có sẵn. Tối thiểu 3-4 đoạn văn.)*

## 2.2 Công Nghệ Ứng Dụng Di Động

*(→ Hướng dẫn viết: Phân tích sự khác biệt giữa Native App (Swift/Kotlin), Cross-Platform (React Native/Flutter), và Hybrid App (Cordova/Ionic). So sánh hiệu suất, chi phí phát triển và khả năng bảo trì. Giải thích lý do chọn React Native cho đồ án này. Tối thiểu 3-4 đoạn văn.)*

## 2.3 Kiến Trúc Hybrid WebView

*(→ Hướng dẫn viết: Nghiên cứu về WebView trong các ứng dụng lớn. Trích dẫn các ứng dụng nổi tiếng sử dụng WebView — Facebook, Shopee. Phân tích ưu điểm: cập nhật tức thì không cần release app mới, tái sử dụng code. Phân tích nhược điểm: phụ thuộc kết nối mạng, hiệu suất thấp hơn native. Tối thiểu 2-3 đoạn.)*

## 2.4 Thiết Kế RESTful API Và Xác Thực JWT

*(→ Hướng dẫn viết: Giải thích 6 nguyên tắc REST của Roy Fielding (2000). So sánh JWT với Session-based authentication. Lý giải tại sao JWT phù hợp hơn cho kiến trúc stateless API. Tối thiểu 2-3 đoạn.)*

## 2.5 Tóm Tắt

*(→ Hướng dẫn viết: Tóm gọn những gì đã review trong 4 mục trên. Kết nối với hướng tiếp cận kỹ thuật của đồ án. Giải thích tại sao các công nghệ đã chọn (Node.js, React, React Native, MySQL) là phù hợp nhất dựa trên các nghiên cứu đã đọc.)*

---

# CHƯƠNG 3: PHÂN TÍCH VÀ THIẾT KẾ HỆ THỐNG

## 3.1 Nghiên Cứu Tính Khả Thi

### 3.1.1 Khả Thi Kỹ Thuật
Hệ thống FashionStyle sử dụng các công nghệ nguồn mở phổ biến bao gồm Node.js (v22+), React 18, và React Native 0.84.1. Tất cả công cụ phát triển, framework và thư viện đều miễn phí, đảm bảo tính khả thi kỹ thuật mà không tốn chi phí bản quyền.

### 3.1.2 Khả Thi Vận Hành
Hệ thống được thiết kế với phân quyền dựa trên vai trò để mỗi nhóm người dùng (khách hàng, Admin cấp 1/2/3) chỉ tương tác với các chức năng liên quan, giảm thiểu yêu cầu đào tạo và lỗi vận hành.

### 3.1.3 Phân Tích Chi Phí - Lợi Ích

| Khoản mục | Chi phí |
|-----------|---------|
| Công cụ phát triển (VS Code, Android Studio) | Miễn phí (Nguồn mở) |
| Backend (Node.js, Express) | Miễn phí (Nguồn mở) |
| Frontend (React, React Native) | Miễn phí (Nguồn mở) |
| Cơ sở dữ liệu (MySQL Community) | Miễn phí |
| Môi trường lưu trữ (Cục bộ) | 0 USD |

**Lợi ích:** Giảm thời gian xử lý đơn hàng, quản lý tồn kho tập trung, mở rộng tiếp cận khách hàng qua ứng dụng di động.

## 3.2 Phân Tích Yêu Cầu

### 3.2.1 Yêu Cầu Chức Năng

| Mã | Yêu cầu | Ưu tiên |
|----|---------|---------|
| YC01 | Khách hàng có thể đăng ký, đăng nhập và quản lý hồ sơ | Cao |
| YC02 | Khách hàng có thể duyệt sản phẩm theo danh mục, màu sắc, giá | Cao |
| YC03 | Khách hàng có thể thêm vào giỏ hàng và thanh toán | Cao |
| YC04 | Khách vãng lai có thể thêm mặt hàng vào giỏ bằng GuestToken | Trung bình |
| YC05 | Admin 1 có thể quản lý toàn bộ cấu hình hệ thống | Cao |
| YC06 | Admin 2 có thể quản lý sản phẩm và mã khuyến mãi | Cao |
| YC07 | Admin 3 có thể xử lý và cập nhật trạng thái đơn hàng | Cao |
| YC08 | Hệ thống gửi thông báo email tự động cho đơn hàng | Cao |
| YC09 | Ứng dụng di động nhúng giao diện web trên Android | Cao |
| YC10 | Admin 1 có thể bật/tắt chế độ bảo trì qua dashboard | Trung bình |

### 3.2.2 Yêu Cầu Phi Chức Năng

| Mã | Yêu cầu |
|----|---------|
| YCP01 | Thời gian phản hồi API phải dưới 500ms |
| YCP02 | Giao diện web phải hoàn toàn responsive trên màn hình 375px1440px |
| YCP03 | JWT token của khách hàng hết hạn sau 7 ngày |
| YCP04 | JWT token của Admin không có thời hạn |
| YCP05 | Hệ thống phải hỗ trợ giao diện Tiếng Anh và Tiếng Việt |

## 3.3 Phương Pháp Phát Triển Hệ Thống

Đồ án này áp dụng phương pháp **Phát triển Ứng dụng Nhanh (RAD)** kết hợp với các yếu tố của mô hình **Vòng đời Phát triển Phần mềm (SDLC)** theo mô hình Thác nước. RAD được lựa chọn do tính chất lặp lại của các yêu cầu thiết kế giao diện người dùng.

Quá trình phát triển theo 4 giai đoạn:
1. Thu thập yêu cầu và Lập kế hoạch
2. Thiết kế người dùng và Tạo mẫu thử
3. Xây dựng và Lập trình
4. Chuyển giao và Kiểm thử

## 3.4 Sơ Đồ Dữ Liệu Và Quy Trình

### 3.4.1 Sơ Đồ Kiến Trúc Hệ Thống

*( Chèn ảnh sơ đồ kiến trúc tại đây)*

```
[BACKEND :8080]  Axios HTTP  [Page Web Chinh :5174]
                                             
[MySQL DB]                        [FashionStyleApp Android]
                                     (WebView + ADB Reverse)
[BACKEND :8080]  Axios HTTP  [Admin Dashboard :5173]
```

### 3.4.2 Sơ Đồ Use Case

*( Chèn ảnh Use Case Diagram tại đây)*

**Khách hàng:** Đăng ký  Đăng nhập  Duyệt sản phẩm  Tìm kiếm  Thêm vào giỏ  Thanh toán  Xem lịch sử đơn  Áp mã khuyến mãi

**Admin 1:** Xem Dashboard  Quản lý người dùng  Duyệt đơn hàng  Cấu hình hệ thống  Xem log

**Admin 2:** Thêm/Sửa sản phẩm  Upload ảnh  Quản lý khuyến mãi  Tạo mã VIP

**Admin 3:** Xem đơn hàng chờ  Lên đơn hàng  Cập nhật trạng thái

### 3.4.3 Sơ Đồ Luồng Dữ Liệu (DFD) Mức 0

*( Chèn ảnh DFD tại đây  mô tả luồng: Khách hàng  Web App  API  Database  Admin)*

## 3.5 Thiết Kế cơ Sở Dữ Liệu

### 3.5.1 Sơ Đồ ERD

*( Chèn ảnh ERD tại đây)*

### 3.5.2 Lược Đồ Cơ Sở Dữ Liệu

**Bảng Users (Người dùng)**

| Cột | Kiểu dữ liệu | Ràng buộc |
|-----|-------------|-----------|
| UserID | INT | KHÓA CHÍNH, TỰ TĂNG |
| FullName | VARCHAR(255) | KHÔNG NULL |
| Email | VARCHAR(255) | DUY NHẤT, KHÔNG NULL |
| PasswordHash | VARCHAR(255) | KHÔNG NULL |
| Role | ENUM('Customer','Admin') | MẶC ĐỊNH 'Customer' |
| IsActive | TINYINT(1) | MẶC ĐỊNH 1 |
| CanDeleteProduct | TINYINT(1) | MẶC ĐỊNH 0 |
| CreatedAt | DATETIME | MẶC ĐỊNH THỜI GIAN HIỆN TẠI |

**Bảng Products (Sản phẩm)**

| Cột | Kiểu dữ liệu | Ràng buộc |
|-----|-------------|-----------|
| ProductID | INT | KHÓA CHÍNH, TỰ TĂNG |
| Name | VARCHAR(255) | KHÔNG NULL |
| Description | TEXT | |
| Price | DECIMAL(10,2) | KHÔNG NULL |
| CategoryID | INT | KHÓA NGOẠI  Categories |
| ImageURL | VARCHAR(500) | |
| CreatedAt | DATETIME | MẶC ĐỊNH THỜI GIAN HIỆN TẠI |

**Bảng Orders (Đơn hàng)**

| Cột | Kiểu dữ liệu | Ràng buộc |
|-----|-------------|-----------|
| OrderID | INT | KHÓA CHÍNH, TỰ TĂNG |
| UserID | INT | KHÓA NGOẠI  Users |
| TotalAmount | DECIMAL(10,2) | KHÔNG NULL |
| Status | VARCHAR(50) | MẶC ĐỊNH 'PENDING' |
| PaymentMethod | VARCHAR(50) | |
| ShippingAddress | TEXT | |
| CreatedAt | DATETIME | MẶC ĐỊNH THỜI GIAN HIỆN TẠI |

**Bảng UserVouchers (Phiếu giảm giá VIP)**

| Cột | Kiểu dữ liệu | Ràng buộc |
|-----|-------------|-----------|
| VoucherID | INT | KHÓA CHÍNH, TỰ TĂNG |
| UserID | INT | KHÓA NGOẠI  Users |
| PromotionID | INT | KHÓA NGOẠI  Promotions |
| IsUsed | TINYINT(1) | MẶC ĐỊNH 0 |
| AssignedAt | DATETIME | MẶC ĐỊNH THỜI GIAN HIỆN TẠI |

## 3.6 Thiết Kế Giao Diện

*( Chèn screenshots hoặc wireframes của các màn hình chính: Trang chủ, Chi tiết sản phẩm, Giỏ hàng, Thanh toán, Admin Dashboard, App di động)*

---

# CHƯƠNG 4: TRIỂN KHAI VÀ KIỂM THỬ HỆ THỐNG

>  **Chương này chiếm 40/100 điểm theo Rubric A  hãy đầu tư nhiều ảnh chụp màn hình và test cases thực tế!**

## 4.1 Hướng Dẫn Cài Đặt Hệ Thống

### 4.1.1 Yêu Cầu Phần Mềm Cần Thiết

| Phần mềm | Phiên bản | Mục đích |
|----------|----------|---------|
| Node.js |  22.11.0 | Chạy Backend và Frontend |
| MySQL |  8.0 | Cơ sở dữ liệu |
| Android Studio | Ladybug trở lên | Máy ảo Android |
| VS Code | Mới nhất | Soạn thảo mã nguồn |
| Git | Mới nhất | Quản lý phiên bản |

### 4.1.2 Cài Đặt Backend

```bash
# Bước 1: Clone dự án
git clone https://github.com/TungVuk4/Final-Project.git
cd "Backend Project"

# Bước 2: Cài đặt thư viện
npm install

# Bước 3: Tạo file .env với nội dung:
DB_HOST=localhost
DB_USER=root
DB_PASS=matkhaudb
DB_NAME=fashionstyle
JWT_SECRET=khoa_bi_mat_jwt
SMTP_EMAIL=email_gmail@gmail.com
SMTP_PASS=mat_khau_ung_dung

# Bước 4: Khởi động server
npm run dev
# Server chạy tại http://localhost:8080
```

### 4.1.3 Cài Đặt Ứng Dụng Di Động Android

```bash
# Bước 1: Bật máy ảo Android (Android Studio  Device Manager  Play)

# Bước 2: Thiết lập đường hầm ADB Reverse
adb reverse tcp:8081 tcp:8081   # Metro Bundler
adb reverse tcp:8080 tcp:8080   # Backend API
adb reverse tcp:5174 tcp:5174   # Vite Web Server

# Bước 3: Khởi động Metro Bundler
cd "FashionStyleApp"
npm start

# Bước 4: Build và cài APK lên máy ảo (Terminal mới)
npm run android
```

## 4.2 Hướng Dẫn Sử Dụng Hệ Thống

### 4.2.1 Ứng Dụng Web Khách Hàng (Port 5174)

*( Chèn screenshots từng bước: Đăng ký  Đăng nhập  Duyệt sản phẩm  Thêm giỏ hàng  Thanh toán  Xem lịch sử đơn)*

### 4.2.2 Bảng Điều Khiển Quản Trị (Port 5173)

| Tài khoản | Email đăng nhập | Mật khẩu | Chức năng |
|-----------|----------------|----------|-----------|
| Admin 1 (Chính) | admin1@fashionstyle.com | Admin@123 | Toàn quyền hệ thống |
| Admin 2 (Kho) | admin2@fashionstyle.com | Admin@456 | Quản lý sản phẩm & khuyến mãi |
| Admin 3 (Vận Hành) | admin3@fashionstyle.com | Admin@789 | Xử lý đơn hàng |

*( Chèn screenshots của từng trang Admin: Dashboard, Sản phẩm, Đơn hàng, Khuyến mãi)*

### 4.2.3 Ứng Dụng Di Động Android

*( Chèn screenshots ứng dụng chạy trên máy ảo Android: Trang chủ, Sản phẩm, Đăng nhập, Giỏ hàng)*

## 4.3 Kế Hoạch Kiểm Thử Và Kết Quả

### 4.3.1 Phương Pháp Kiểm Thử

Đồ án này sử dụng phương pháp **Kiểm thử Hộp Đen (Black Box Testing)**, xác minh hành vi của hệ thống theo các yêu cầu chức năng mà không kiểm tra logic mã nguồn nội bộ.

### 4.3.2 Kiểm Thử Module Xác Thực

| Mã KT | Trường hợp kiểm thử | Đầu vào | Kết quả kỳ vọng | Kết quả thực tế | Trạng thái |
|-------|--------------------|---------|-----------------|--------------------|------------|
| KT-XTH-01 | Đăng nhập khách hàng đúng thông tin | Email + Mật khẩu đúng | Chuyển đến trang chủ, JWT được lưu | Như kỳ vọng |  Đạt |
| KT-XTH-02 | Đăng nhập sai mật khẩu | Mật khẩu sai | Thông báo "Email hoặc mật khẩu không đúng" | Như kỳ vọng |  Đạt |
| KT-XTH-03 | Đăng nhập Admin | admin1@fashionstyle.com / Admin@123 | Chuyển đến Admin Dashboard | Như kỳ vọng |  Đạt |
| KT-XTH-04 | Đăng ký email đã tồn tại | Email đã có trong DB | Thông báo lỗi "Email đã tồn tại" | Như kỳ vọng |  Đạt |

### 4.3.3 Kiểm Thử Module Đơn Hàng

| Mã KT | Trường hợp kiểm thử | Kết quả kỳ vọng | Trạng thái |
|-------|--------------------|--------------------|------------|
| KT-DH-01 | Đặt hàng khi đã đăng nhập | Đơn hàng lưu DB, email xác nhận gửi |  Đạt |
| KT-DH-02 | Đặt hàng với mã khuyến mãi hợp lệ | Giảm giá được áp dụng, mã đánh dấu đã dùng |  Đạt |
| KT-DH-03 | Đặt hàng với mã đã sử dụng | Thông báo "Mã đã được sử dụng" |  Đạt |
| KT-DH-04 | Admin 3 cập nhật trạng thái đơn | Trạng thái cập nhật trong DB |  Đạt |

### 4.3.4 Kiểm Thử Ứng Dụng Di Động

| Mã KT | Trường hợp kiểm thử | Kết quả kỳ vọng | Trạng thái |
|-------|--------------------|--------------------|------------|
| KT-DD-01 | Khởi động app trên Android Emulator | Trang chủ FashionStyle tải trong WebView |  Đạt |
| KT-DD-02 | Đăng nhập trong ứng dụng di động | JWT token lưu qua localStorage domStorage |  Đạt |
| KT-DD-03 | Nhấn nút Back phần cứng Android | Điều hướng  trang trước, không thoát app |  Đạt |
| KT-DD-04 | Điều hướng đến trang sản phẩm trên di động | Giao diện responsive hiển thị đúng |  Đạt |

## 4.4 Mã Nguồn Các Chức Năng Chính

### 4.4.1 Backend  Middleware Xác Thực JWT

```javascript
// middlewares/auth.js
const jwt = require('jsonwebtoken');

function requireAuth(req, res, next) {
    const token = req.headers['authorization']?.split(' ')[1];
    if (!token) return res.status(401).json({ message: 'Không có token' });
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        next();
    } catch (err) {
        return res.status(401).json({ message: 'Token không hợp lệ hoặc đã hết hạn' });
    }
}
```

### 4.4.2 Ứng Dụng Di Động  Xử Lý Nút Back Android (App.tsx)

```typescript
// FashionStyleApp/App.tsx
const handleBackButton = useCallback(() => {
    if (canGoBack && webViewRef.current) {
        webViewRef.current.goBack(); // Quay lại trang trước trong WebView
        return true; // Ngăn ứng dụng thoát
    }
    return false; // Cho phép thoát nếu không còn trang trước
}, [canGoBack]);
```

### 4.4.3 Backend  Xác Thực Mã Khuyến Mãi VIP Dùng Một Lần

```javascript
// routes/api/orders.js
if (promoCode) {
    const [voucher] = await pool.query(
        `SELECT uv.VoucherID, p.DiscountPercent
         FROM UserVouchers uv 
         JOIN Promotions p ON uv.PromotionID = p.PromotionID
         WHERE uv.UserID = ? AND p.Code = ? AND uv.IsUsed = 0`,
        [req.user.UserID, promoCode]
    );
    if (!voucher.length) {
        return res.status(400).json({ message: 'Mã không hợp lệ hoặc đã được sử dụng' });
    }
    // Gán chiết khấu và đánh dấu mã đã dùng sau khi tạo đơn hàng
    await pool.query('UPDATE UserVouchers SET IsUsed = 1 WHERE VoucherID = ?',
        [voucher[0].VoucherID]);
}
```

---

# CHƯƠNG 5: KẾT LUẬN VÀ ĐỀ XUẤT

## 5.1 Tóm Tắt Kết Quả Đạt Được

Đồ án này đã hoàn thành thành công tất cả năm mục tiêu đề ra:

1. Một nền tảng thương mại điện tử full-stack đã được thiết kế và phát triển, gồm **REST API Node.js Express** (13 nhóm endpoint), **ứng dụng web khách hàng React** và **bảng điều khiển quản trị viên React** với kiểm soát truy cập dựa trên vai trò cho ba cấp admin.

2. **Ứng dụng di động Android** được xây dựng bằng React Native 0.84.1 với kiến trúc Hybrid WebView. Ứng dụng giao tiếp với backend qua ADB Reverse Tunnel, đảm bảo kết nối đáng tin cậy trong môi trường phát triển cục bộ.

3. **Hệ thống kiểm soát truy cập ba cấp** được triển khai, với Admin Cấp 1 (toàn quyền), Admin Cấp 2 (quản lý sản phẩm và khuyến mãi) và Admin Cấp 3 (xử lý đơn hàng), tự động cấp quyền khi server khởi động.

4. **Quy trình quản lý đơn hàng tự động** được triển khai, tích hợp Nodemailer để gửi thông báo email bất đồng bộ đến cả khách hàng và quản trị viên.

5. **Hệ thống mã khuyến mãi VIP cá nhân hóa dùng một lần** được triển khai bằng bảng `UserVouchers`, liên kết mã khuyến mãi cụ thể với tài khoản người dùng cá nhân với xác thực sử dụng một lần ở cấp cơ sở dữ liệu.

## 5.2 Thảo Luận Và Ý Nghĩa

Kiến trúc Hybrid WebView được áp dụng trong đồ án này chứng minh rằng có thể đạt được trải nghiệm di động chất lượng cao mà không cần phát triển giao diện di động riêng biệt từ đầu. Cách tiếp cận này giảm đáng kể thời gian phát triển và chi phí bảo trì, vì mọi cập nhật cho giao diện web đều tự động phản ánh trong ứng dụng di động mà không cần phát hành APK mới.

Hệ thống kiểm soát truy cập dựa trên vai trò phản ánh các yêu cầu doanh nghiệp thực tế, nơi các vai trò vận hành khác nhau cần các mức độ truy cập hệ thống khác nhau. Việc tự động cấp phép tài khoản admin khi server khởi động đảm bảo tính linh hoạt của hệ thống.

## 5.3 Hạn Chế Của Hệ Thống

1. **Chỉ hỗ trợ Android:** Ứng dụng di động chỉ nhắm mục tiêu Android. Triển khai iOS sẽ yêu cầu cấu hình bổ sung và môi trường phát triển macOS có Xcode.
2. **Môi trường phát triển cục bộ:** Hệ thống chỉ được kiểm thử trên môi trường phát triển cục bộ. Triển khai sản xuất trên máy chủ đám mây sẽ yêu cầu cấu hình bổ sung (HTTPS, CI/CD pipeline).
3. **Không có cổng thanh toán thực tế:** Triển khai hiện tại mô phỏng thanh toán online mà không tích hợp với các nhà cung cấp thanh toán thực tế như VNPay hoặc PayPal.
4. **Hiệu suất ở chế độ DEV:** Server Vite dev phục vụ các tài nguyên chưa được tối ưu hóa, dẫn đến thời gian tải ban đầu chậm hơn trong mobile WebView. Build production sẽ cải thiện đáng kể hiệu suất.

## 5.4 Hướng Phát Triển Tương Lai

1. **Hỗ trợ iOS:** Cấu hình dự án React Native để hỗ trợ triển khai iOS.
2. **Triển khai đám mây:** Triển khai backend trên nhà cung cấp đám mây (AWS, Google Cloud) và frontend trên máy chủ tĩnh (Vercel, Netlify).
3. **Tích hợp cổng thanh toán:** Tích hợp VNPay hoặc Stripe cho xử lý thanh toán thực tế.
4. **Thông báo đẩy (Push Notifications):** Thay thế thông báo email bằng thông báo đẩy FCM để cập nhật đơn hàng thời gian thực trên di động.
5. **Đánh giá sản phẩm kèm hình ảnh:** Mở rộng hệ thống đánh giá để hỗ trợ đính kèm hình ảnh.

---

## TÀI LIỆU THAM KHẢO

*(Sử dụng định dạng APA. Cần tối thiểu 10 nguồn tham khảo)*

1. Fielding, R. T. (2000). *Architectural styles and the design of network-based software architectures* (Luận án Tiến sĩ). Đại học California, Irvine.

2. Turban, E., Outland, J., King, D., Lee, J. K., Liang, T. P., & Turban, D. C. (2018). *Electronic Commerce 2018: A Managerial and Social Networks Perspective* (Lần 9). Springer.

3. React Native Documentation. (2024). *React Native  Learn once, write anywhere.* https://reactnative.dev/docs/getting-started

4. Mozilla Developer Network. (2024). *HTTP Overview.* https://developer.mozilla.org/en-US/docs/Web/HTTP/Overview

5. Open University Malaysia. (2022). *Final Year Project Handbook  International Edition V1.* Khoa Công nghệ và Khoa học Ứng dụng.

6. Statista. (2024). *Global e-commerce revenue forecast 2024-2029.* https://www.statista.com/forecasts/1286699/global-e-commerce-sales

7. Auth0. (2023). *JSON Web Tokens Introduction.* https://jwt.io/introduction

8. MySQL Documentation. (2024). *MySQL 8.0 Reference Manual.* https://dev.mysql.com/doc/

9. Google. (2024). *Android Developer Guide  WebView.* https://developer.android.com/develop/ui/views/layout/webapps/webview

10. Aggarwal, S. (2018). *Modern web-development using ReactJS*. International Journal of Recent Research Aspects, 5(1), 133-137.

---

## PHỤ LỤC

### Phụ lục A  Mẫu Đăng Ký Đồ Án
*(Đính kèm form đã điền và có chữ ký)*

### Phụ lục B  Nhật Ký Sinh Viên (Student Log Book)
*(Đính kèm log book với chữ ký giảng viên hướng dẫn từng buổi)*

### Phụ lục C  Toàn Bộ Ảnh Chụp Màn Hình Hệ Thống

### Phụ lục D  Kho Mã Nguồn
**URL GitHub:** https://github.com/TungVuk4/Final-Project

---

---

#  HƯỚNG DẪN SỬ DỤNG FILE NÀY

## Những phần BẮT BUỘC phải tự viết trước khi nộp:

| Mục | Việc cần làm |
|-----|-------------|
| Tên sinh viên | Điền tên, mã số, tên giảng viên hướng dẫn thực tế |
| Tóm tắt (Abstract) | Viết lại bằng ngôn ngữ của bạn  đảm bảo  250 từ tiếng Anh |
| Chương 2  Tổng quan | Tự viết 6-10 trang, cite tối thiểu 8-10 nguồn học thuật |
| Sơ đồ (Chương 3) | Chèn ảnh ERD, DFD, Use Case, kiến trúc hệ thống thực tế |
| Ảnh chụp màn hình (Chương 4) | Chụp màn hình thực tế từ hệ thống đang chạy |
| Tài liệu tham khảo | Bổ sung thêm 5-8 nguồn từ Google Scholar / IEEE |

## Bảng Điểm Theo Rubric A (Handbook trang 32-35):

| Tiêu chí đánh giá | Hệ số | Điểm tối đa |
|-------------------|-------|-------------|
| Phần Giới thiệu (Chương 1) | x2.5 | 10 điểm |
| Tổng quan tài liệu (Chương 2) | x2.5 | 10 điểm |
| Phân tích & Thiết kế hệ thống (Chương 3) | x5 | 20 điểm |
| **Triển khai & Kiểm thử (Chương 4)** | **x10** | **40 điểm** |
| Kết luận (Chương 5) | x2.5 | 10 điểm |
| Phong cách viết & Ngữ pháp | x1.25 | 5 điểm |
| Trình bày tổng thể | x1.25 | 5 điểm |
| **TỔNG CỘNG** | | **100 điểm** |

>  **Mẹo để đạt điểm cao Chương 4 (40 điểm):**
> - Chụp màn hình TẤT CẢ các chức năng chính của hệ thống
> - Viết test cases đầy đủ với kết quả thực tế (không bịa)
> - Trình bày mã nguồn của ít nhất 5-6 chức năng quan trọng nhất
> - Mô tả chi tiết cách cài đặt từng thành phần

## Định Dạng Trình Bày (QUAN TRỌNG):

| Yếu tố | Yêu cầu |
|--------|---------|
| Font chữ | Times New Roman, cỡ 12 |
| Giãn dòng | 1.5 giữa các dòng, 3.0 giữa các đoạn |
| Lề trang | 2.5cm (1 inch) tất cả các phía |
| Trang đầu mỗi chương | Lề trên 5cm (2 inch) |
| Đánh số trang phần mở đầu | Số La Mã (ii, iii, iv...) |
| Đánh số trang nội dung | Số Ả Rập (1, 2, 3...) |
| Tiêu đề bảng | Căn trái, đặt TRÊN bảng |
| Tiêu đề hình ảnh | Căn giữa, đặt DƯỚI hình |
| Tài liệu tham khảo | Định dạng APA |
