# 📱 Kiến Trúc Đồ Án — FashionStyle eCommerce Platform

> **Tên đồ án:** FashionStyle — Hệ thống thương mại điện tử thời trang đa nền tảng
> **Công nghệ:** Node.js · React · React Native · MySQL · Android
> **Số lượng thành phần:** 4 module hoạt động độc lập và đồng bộ với nhau

---

## 1. Tổng Quan Kiến Trúc Hệ Thống

Tôi xây dựng hệ thống FashionStyle theo kiến trúc **Multi-Tier (Đa tầng)** với 4 thành phần chính, mỗi thành phần đóng một vai trò riêng biệt và giao tiếp với nhau thông qua **RESTful API** trên cổng `8080`.

### Sơ đồ tổng thể

```
┌─────────────────────────────────────────────────────────────┐
│                    TẦNG TRÌNH BÀY (Presentation)            │
│                                                             │
│  ┌──────────────────┐  ┌──────────────────┐  ┌──────────┐  │
│  │  Page Web Chinh  │  │ Page Admin Proj. │  │ Fashion  │  │
│  │  (React + Vite)  │  │ (React + Vite)   │  │ StyleApp │  │
│  │  Port: 5174      │  │  Port: 5173      │  │ Android  │  │
│  │  Khách hàng      │  │  3 Admin roles   │  │ WebView  │  │
│  └────────┬─────────┘  └────────┬─────────┘  └────┬─────┘  │
│           │ Axios HTTP          │ Axios HTTP        │ ADB    │
└───────────┼─────────────────────┼───────────────────┼───────┘
            │                     │                   │
            └──────────┬──────────┘                   │
                       │          HTTP REST API        │
┌──────────────────────▼──────────────────────────────▼──────┐
│                TẦNG XỬ LÝ (Application Layer)               │
│                                                             │
│           Backend Project — Node.js + Express               │
│                      Port: 8080                             │
│   13 Route Groups · JWT Auth · Multer · Nodemailer          │
└──────────────────────────────┬──────────────────────────────┘
                               │ MySQL2 / TCP
┌──────────────────────────────▼──────────────────────────────┐
│                    TẦNG DỮ LIỆU (Data Layer)                 │
│                                                             │
│              MySQL Database (SQL Server)                    │
│   Users · Products · Orders · Cart · Promotions · Reviews   │
└─────────────────────────────────────────────────────────────┘
```

---

## 2. Chi Tiết Từng Thành Phần

---

### 🔵 2.1. Backend Project — REST API Server

**Công nghệ:** Node.js · Express.js · MySQL2 · JWT · Bcrypt · Multer · Nodemailer · Node-Schedule

**Vai trò:** Trung tâm điều phối toàn bộ dữ liệu và nghiệp vụ. Tất cả các thành phần (Web, Admin, App) đều giao tiếp duy nhất qua đây.

#### Cấu trúc thư mục

```
Backend Project/
├── server.js               # Entry point: khởi Express, đăng ký 13 route groups,
│                           #   tự động tạo 3 Admin cố định khi server start
├── .env                    # Biến môi trường (DB host, JWT secret, SMTP Gmail)
├── _helpers/
│   └── error-handler.js    # Global error handler middleware (xử lý lỗi tập trung)
├── dbpool/
│   └── db.js               # MySQL connection pool (tái sử dụng kết nối, không tạo mới mỗi request)
├── middlewares/
│   └── auth.js             # JWT middleware: requireAuth · requireAdmin · Level 1/2/3
├── services/
│   └── login.js            # Business logic đăng nhập, sinh JWT token
├── routes/api/
│   ├── auth-temp.js        # Đăng ký · Đăng nhập · OTP · Quên mật khẩu
│   ├── products.js         # CRUD sản phẩm · Upload ảnh (Multer) · Tồn kho theo Size+Color
│   ├── categories.js       # 4 Bộ sưu tập: Luxury · Special · Summer · Unique
│   ├── colors.js           # 6 màu cơ bản: BLACK · RED · BLUE · WHITE · ROSE · GREEN
│   ├── cart.js             # Giỏ hàng User đã đăng nhập + Giỏ hàng Guest (GuestToken)
│   ├── orders.js           # Đặt hàng (COD/Online) · Lịch sử · Duyệt đơn · Email nền
│   ├── promotions.js       # Mã giảm giá · Sinh mã Random dùng 1 lần · Tặng VIP
│   ├── stats.js            # Dashboard thống kê: doanh thu · tồn kho · biểu đồ
│   ├── reviews.js          # Đánh giá sản phẩm (Guest + User)
│   ├── admin_logs.js       # Nhật ký hành động của 3 Admin
│   ├── notifications.js    # Thông báo: Hết hàng (OUT_OF_STOCK) · Đơn mới · Reviews
│   ├── system-config.js    # Bật/tắt: Bảo trì · Đóng đăng ký · Cảnh báo hệ thống
│   └── user.js             # Hồ sơ · Phân quyền CanDeleteProduct · Khóa tài khoản
└── uploads/                # Thư mục lưu ảnh sản phẩm được upload bằng Multer
```

#### Danh sách 13 API Endpoint

| # | Prefix | Phạm vi | Chức năng chính |
|---|--------|---------|-----------------|
| 1 | `/api/auth-temp` | Public | Đăng ký, Đăng nhập, OTP, Quên mật khẩu |
| 2 | `/api/products` | Public / Admin | CRUD sản phẩm, upload ảnh, quản lý tồn kho Size |
| 3 | `/api/categories` | Public / Admin | 4 bộ sưu tập thời trang |
| 4 | `/api/colors` | Public / Admin | 6 màu sắc chuẩn |
| 5 | `/api/reviews` | Public | Xem và gửi đánh giá (cả Guest lẫn User) |
| 6 | `/api/cart` | Customer/Guest | Giỏ hàng cá nhân và Guest cart |
| 7 | `/api/orders` | Customer / Admin | Đặt hàng, lịch sử, trạng thái, áp dụng mã |
| 8 | `/api/user` | Customer / Admin | Hồ sơ, đổi mật khẩu, phân quyền |
| 9 | `/api/promotions` | Admin 2 | Quản lý mã giảm giá, sinh mã Random VIP |
| 10 | `/api/stats` | Admin 1 | Báo cáo doanh thu, tồn kho, chart |
| 11 | `/api/admin-logs` | Admin All | Nhật ký hoạt động Admin |
| 12 | `/api/notifications` | Admin All | Thông báo tổng hợp (chuông báo Topbar) |
| 13 | `/api/system-config` | Admin 1 | Bảo trì · Đóng đăng ký · Toggle hệ thống |

#### Hệ thống phân quyền 3 Admin tự động khởi tạo

Khi server khởi động, hàm `initAdminAccounts()` trong `server.js` tự động tạo 3 tài khoản Admin cố định nếu chưa tồn tại trong database:

| Admin | Email | Mật khẩu | Chức vụ |
|-------|-------|-----------|---------|
| Admin Chính | `admin1@fashionstyle.com` | `Admin@123` | Toàn quyền hệ thống |
| Admin Kho | `admin2@fashionstyle.com` | `Admin@456` | Quản lý sản phẩm & kho |
| Admin Vận Hành | `admin3@fashionstyle.com` | `Admin@789` | Xử lý đơn hàng |

> **Token JWT:** Admin nhận token **không có thời hạn**. Khách hàng nhận token hết hạn sau **7 ngày**.

#### Luồng xử lý đơn hàng (3 Admin phối hợp)

```
Khách đặt hàng (Web hoặc App)
        ↓
Backend POST /api/orders → Lưu DB + Gửi 2 email đồng thời (Nodemailer)
        │
        ├── 📧 Email khách: "Đơn hàng #xxx đã đặt thành công"
        └── 📧 Email Admin 3: "Có đơn hàng mới cần xử lý"
                ↓
        Admin 3 (Vận Hành) → Lên đơn hàng, xem thông tin
                ↓
        Admin 1 (Chính) → Duyệt hoặc Từ chối đơn
                ↓
        Nodemailer gửi email cập nhật trạng thái về khách hàng
```

---

### 🟢 2.2. Page Web Chinh — Giao Diện Khách Hàng

**Công nghệ:** React 18 · TypeScript · Vite · Redux Toolkit · React Router v6 · Tailwind CSS · Axios · i18next

**Vai trò:** Giao diện mua sắm dành cho khách hàng cuối. Đây cũng là nền tảng giao diện được nhúng vào ứng dụng Android (FashionStyleApp) thông qua WebView.

**Cổng:** `http://localhost:5174`

#### Cấu trúc thư mục

```
Page Web Chinh/
├── index.html              # Entry HTML với meta viewport (thiết kế Mobile-First)
├── vite.config.ts          # Cấu hình Vite (port: 5174)
├── tailwind.config.js
└── src/
    ├── main.tsx            # Entry: Provider (Redux) + BrowserRouter + i18n
    ├── App.tsx             # Root: SystemConfigGuard bọc ngoài (chặn khi bảo trì)
    ├── store.ts            # Redux Store: auth + cart + shop
    ├── i18n.ts             # Đa ngôn ngữ Tiếng Anh / Tiếng Việt (i18next)
    ├── axios/
    │   └── custom.ts       # Axios instance: baseURL = http://localhost:8080/api
    ├── actions/            # Redux async thunks (fetchProducts, login, addToCart...)
    ├── features/           # Redux slices
    │   ├── auth/           # Trạng thái đăng nhập, user info, JWT token
    │   ├── cart/           # Giỏ hàng: thêm, xóa, số lượng, tổng tiền
    │   └── shop/           # Bộ lọc, sắp xếp sản phẩm
    ├── hooks/
    │   ├── index.ts               # Typed Redux hooks
    │   └── useSystemConfig.ts     # Fetch cấu hình hệ thống (cache 30 giây)
    ├── components/         # 22 UI Component tái sử dụng
    │   ├── Header.tsx · Footer.tsx · Banner.tsx
    │   ├── ProductItem.tsx · ProductGrid.tsx
    │   ├── SidebarMenu.tsx (responsive mobile menu)
    │   └── ...
    ├── pages/              # 15 Trang chính
    │   ├── Landing.tsx         # Trang chủ + Hero Banner + Bộ sưu tập nổi bật
    │   ├── Shop.tsx            # Danh sách sản phẩm với bộ lọc/sắp xếp
    │   ├── SingleProduct.tsx   # Chi tiết sản phẩm + Chọn Size/Color + Đánh giá
    │   ├── Cart.tsx            # Giỏ hàng + Áp dụng mã giảm giá
    │   ├── Checkout.tsx        # Thanh toán + Điền địa chỉ giao hàng
    │   ├── OrderHistory.tsx    # Lịch sử đơn hàng của tài khoản
    │   ├── Login.tsx · Register.tsx · UserProfile.tsx
    │   ├── Search.tsx          # Tìm kiếm sản phẩm theo tên/từ khóa
    │   └── MaintenancePage.tsx # Hiển thị khi Admin bật chế độ bảo trì
    └── utils/              # 10 hàm tiện ích (format tiền tệ, ngày, URL ảnh...)
```

#### Luồng dữ liệu

```
User tương tác với Component
        ↓
dispatch(action) → Redux Thunk
        ↓
Axios (axios/custom.ts) → Backend API :8080
        ↓
Backend xử lý → Trả JSON
        ↓
Redux Slice cập nhật State → Re-render UI
```

#### Thiết kế đáp ứng Mobile (điều kiện sống còn)

> Vì toàn bộ giao diện Mobile App là WebView nhúng trang này, nếu web bị vỡ trên điện thoại thì App cũng vỡ theo. Tôi đảm bảo:

| Hạng mục | Cách thực hiện |
|----------|---------------|
| Meta viewport | `width=device-width, initial-scale=1.0` trong `index.html` |
| Tailwind Responsive | Các prefix `sm:` `md:` `lg:` cho từng component |
| Mobile Menu | `SidebarMenu.tsx` riêng biệt cho màn hình nhỏ |
| Flexbox/Grid | Layout tự co giãn theo kích thước màn hình |

---

### 🟡 2.3. Page Admin Project — Dashboard Quản Trị

**Công nghệ:** React 19 · JavaScript · Vite · Zustand · PrimeReact · Tailwind CSS v4 · React Router v7 · i18next

**Vai trò:** Bảng điều khiển nội bộ dành cho 3 Admin. Mỗi Admin đăng nhập sẽ thấy giao diện cá nhân hóa theo vai trò của mình.

**Cổng:** `http://localhost:5173`

#### Cấu trúc thư mục

```
Page Admin Project/
├── index.html
├── vite.config.js
└── src/
    ├── main.jsx            # Entry: BrowserRouter + i18n setup
    ├── App.jsx             # Root component
    ├── i18n.js             # Đa ngôn ngữ EN/VI cho giao diện Admin
    ├── router/
    │   └── AppRouter.jsx   # ProtectedRoute: chặn truy cập nếu chưa đăng nhập
    ├── stores/
    │   └── auth.jsx        # Zustand store: lưu token + user vào localStorage
    ├── services/
    │   └── ApiServices.js  # Axios instance → Backend :8080
    ├── layout/
    │   ├── AppLayout.jsx   # Layout chính: Sidebar + Topbar
    │   ├── Sidebar.jsx     # Menu điều hướng (ẩn/hiện theo quyền)
    │   └── Topbar.jsx      # Chuông thông báo + Breadcrumb + User popover
    └── pages/
        ├── Dashboard.jsx       # Tổng quan thống kê + Toggle Cấu hình hệ thống (Admin 1)
        ├── Product.jsx         # CRUD sản phẩm + Upload ảnh + Tồn kho chi tiết theo Size
        ├── Users.jsx           # Quản lý khách hàng (Khóa, Phân quyền)
        ├── Promotions.jsx      # Mã giảm giá + Random code + Tặng VIP
        ├── Orders.jsx          # Danh sách đơn hàng + Cập nhật trạng thái (Admin 3)
        ├── Roles.jsx           # Xem phân quyền + 3 Toggle cấu hình hệ thống (Admin 1)
        └── auth/Login.jsx      # Đăng nhập Admin (chỉ Role = 'Admin' được vào)
```

#### Phân quyền hiển thị giao diện

| Tính năng | Admin 1 | Admin 2 | Admin 3 |
|-----------|:-------:|:-------:|:-------:|
| Dashboard & Thống kê | ✅ | ❌ | ❌ |
| Quản lý Người dùng | ✅ | ❌ | ❌ |
| Sản phẩm (Thêm/Sửa/Xóa) | ✅ | ✅ | ❌ |
| Khuyến Mãi & Mã Random | ✅ | ✅ | ❌ |
| Đơn hàng (Xem + Lên đơn) | ✅ | ❌ | ✅ |
| Duyệt đơn hàng cuối | ✅ | ❌ | ❌ |
| Cấu hình hệ thống | ✅ | ❌ | ❌ |
| Nhật ký Admin Logs | ✅ (Xem+Xóa) | ✅ (Chỉ xem) | ✅ (Chỉ xem) |

---

### 🔴 2.4. FashionStyleApp — Ứng Dụng Android

**Công nghệ:** React Native 0.84.1 · TypeScript · React Native WebView · react-native-safe-area-context · Hermes Engine · AGP 8.12.0 · Gradle 9.0

**Vai trò:** Ứng dụng Android gốc (`.apk`) bọc toàn bộ giao diện web (`Page Web Chinh`) bên trong một WebView. Người dùng cài App lên điện thoại và trải nghiệm mua sắm y như trên web mà không cần mở trình duyệt.

#### Kiến trúc Hybrid WebView

```
┌─────────────────────────────────────────────┐
│              FashionStyleApp (.apk)          │
│                                             │
│  ┌─────────────────────────────────────┐    │
│  │    React Native Native Shell        │    │
│  │  (Kotlin/Java via Hermes Engine)    │    │
│  │                                     │    │
│  │  ┌───────────────────────────────┐  │    │
│  │  │    React Native WebView       │  │    │
│  │  │                               │  │    │
│  │  │  ┌─────────────────────────┐  │  │    │
│  │  │  │   Page Web Chinh        │  │  │    │
│  │  │  │  (React + Tailwind CSS) │  │  │    │
│  │  │  │  http://10.0.2.2:5174   │  │  │    │
│  │  │  └─────────────────────────┘  │  │    │
│  │  └───────────────────────────────┘  │    │
│  └─────────────────────────────────────┘    │
└─────────────────────────────────────────────┘
             │ ADB Reverse Tunnel
             ▼
   Backend Project :8080 (máy Windows)
```

#### Cấu trúc thư mục

```
FashionStyleApp/
├── App.tsx                 # Component gốc: WebView + Back Button + Loading Spinner + Error Handler
├── config.ts               # URL trung tâm: WEB_URL = http://10.0.2.2:5174
├── package.json            # Chỉ dùng cho Android (đã xóa iOS dependency)
├── tsconfig.json
├── android/
│   ├── build.gradle        # Cấu hình Gradle toàn project (AGP 8.12.0)
│   ├── gradle.properties   # Hermes enabled · AndroidX · VFS Watch disabled
│   ├── settings.gradle     # Include React Native gradle plugin
│   ├── gradle/wrapper/
│   │   └── gradle-wrapper.properties  # Gradle 9.0.0
│   └── app/
│       ├── build.gradle    # Cấu hình module app (compileSdk, minSdk, targetSdk)
│       └── src/main/
│           ├── AndroidManifest.xml    # Quyền INTERNET · usesCleartextTraffic=true
│           ├── java/com/fashionstyleapp/
│           │   ├── MainActivity.kt    # Activity gốc: kế thừa ReactActivity
│           │   └── MainApplication.kt # Khởi động Hermes Engine + RN packages
│           └── res/                   # Icons, theme, strings
```

#### Các tính năng đặc biệt đã triển khai trong App.tsx

| Tính năng | Cách thực hiện |
|-----------|---------------|
| **Nút Back Android** | `BackHandler.addEventListener` → gọi `webViewRef.goBack()` thay vì thoát App |
| **Loading ban đầu** | Spinner vàng chỉ hiển thị ở **lần tải đầu tiên** (state `hasInitialLoaded`) |
| **Hiển thị lỗi rõ ràng** | `onError` + `onHttpError` → hiển thị mã lỗi trên màn hình đen thay vì trắng tinh |
| **JWT đồng bộ** | `domStorageEnabled=true` → WebView dùng được `localStorage` để lưu token |
| **HTTP nội bộ** | `android:usesCleartextTraffic="true"` → kết nối `http://` với Vite dev server |

#### Cơ chế kết nối (ADB Reverse Tunnel)

```
Android Emulator              Windows (máy phát triển)
─────────────────             ──────────────────────────
localhost:8081     ←────────── tcp:8081  (Metro Bundler)
localhost:8080     ←────────── tcp:8080  (Backend API)
localhost:5174     ←────────── tcp:5174  (Vite Web Server)
```

Nhờ cơ chế ADB Reverse, điện thoại ảo "nghĩ" rằng cả 3 server (Metro, Backend, Web) đang chạy ngay trên chính nó, trong khi thực tế chúng đang chạy trên máy Windows.

---

## 3. Luồng Dữ Liệu Toàn Hệ Thống

### Khách hàng đặt hàng (Web hoặc App — hoạt động giống hệt)

```
1. Khách chọn sản phẩm → Thêm vào giỏ hàng
        ↓ POST /api/cart/add (kèm JWT token hoặc GuestToken)
2. Backend lưu CartItems vào DB
        ↓
3. Khách vào Checkout → Nhập địa chỉ + Áp mã giảm giá (nếu có)
        ↓ POST /api/orders (kèm PromoCode nếu có)
4. Backend:
   ├── Tạo Order trong DB
   ├── Đánh dấu mã đã dùng (IsUsed = 1)
   ├── Gửi email khách hàng (Nodemailer bất đồng bộ)
   └── Gửi email Admin 3
        ↓
5. Admin 3 lên đơn → Admin 1 duyệt → Email xác nhận gửi lại khách
```

### Luồng mã giảm giá VIP cá nhân hóa

```
Admin 2 tạo Promotion (% hoặc số tiền)
        ↓
Admin 2 sinh mã Random Code (dùng 1 lần, không ánh sáng)
        ↓
Admin 1 gán mã vào tài khoản khách VIP (bảng UserVouchers)
        ↓
Khách VIP đăng nhập → Xem ví voucher cá nhân của mình
        ↓
Khách áp mã khi Checkout → Backend kiểm tra:
   ├── Mã tồn tại và chưa dùng (IsUsed = 0)?
   ├── Mã được gán cho đúng User ID này?
   └── Nếu hợp lệ → Giảm giá + Đánh dấu IsUsed = 1
```

---

## 4. Cách Chạy Toàn Bộ Dự Án

Thực hiện theo đúng thứ tự từng bước này:

### Bước 1: Khởi động Backend
```bash
cd "Backend Project"
npm run dev
# Server lắng nghe tại http://0.0.0.0:8080
# Tự động tạo 3 Admin + bảng UserVouchers nếu chưa có
```

### Bước 2: Khởi động Web Khách Hàng
```bash
cd "Page Web Chinh"
npm run dev
# Chạy tại http://localhost:5174
```

### Bước 3: Khởi động Admin Dashboard
```bash
cd "Page Admin Project"
npm run dev
# Chạy tại http://localhost:5173
```

### Bước 4: Khởi động Ứng Dụng Android

**4a. Bật máy ảo Android** (Android Studio → Device Manager → Play)

**4b. Đào hầm ADB Reverse** (mở PowerShell mới):
```bash
adb reverse tcp:8081 tcp:8081   # Metro Bundler
adb reverse tcp:8080 tcp:8080   # Backend API
adb reverse tcp:5174 tcp:5174   # Vite Web Server
```

**4c. Khởi Metro Bundler:**
```bash
cd "FashionStyleApp"
npm start
```

**4d. Build và cài APK vào máy ảo** (mở Terminal mới):
```bash
cd "FashionStyleApp"
npm run android
```

---

## 5. Bảng Tóm Tắt Công Nghệ

| Thành phần | Ngôn ngữ | Framework | Cổng | Giao tiếp |
|------------|----------|-----------|------|-----------|
| Backend | JavaScript | Node.js + Express | 8080 | REST API (JSON) |
| Page Web Chinh | TypeScript | React 18 + Vite | 5174 | Axios → Backend |
| Page Admin | JavaScript | React 19 + Vite | 5173 | Axios → Backend |
| FashionStyleApp | TypeScript | React Native 0.84 | — | WebView + ADB Reverse |
| Database | SQL | MySQL | 3306 | mysql2 pool |

---

## 6. Điểm Nổi Bật Kỹ Thuật

| # | Điểm nổi bật | Mô tả |
|---|--------------|-------|
| 1 | **Kiến trúc Hybrid WebView** | Mobile App sử dụng 100% giao diện Web, không cần viết lại UI — cập nhật tức thì không cần release App mới |
| 2 | **Phân quyền 3 Admin tự động** | `initAdminAccounts()` chạy mỗi lần server start, đảm bảo không bao giờ mất tài khoản Admin |
| 3 | **Mã VIP 1 lần cá nhân hóa** | Hệ thống gán mã riêng cho từng khách VIP, xác thực theo UserID — không thể chia sẻ hay dùng chung |
| 4 | **Email bất đồng bộ** | Nodemailer gửi email ngầm (non-blocking) — API trả response ngay, không chờ email gửi xong |
| 5 | **ADB Reverse Tunnel** | Giải pháp chuẩn mực nhất để app trên Emulator kết nối vào máy phát triển, không bị Firewall chặn |
| 6 | **Đa ngôn ngữ EN/VI** | Cả Web và Admin đều hỗ trợ Tiếng Anh và Tiếng Việt với i18next |
| 7 | **Guest Cart** | Khách chưa đăng nhập vẫn mua được hàng bằng GuestToken — trải nghiệm mượt mà như sàn thương mại thật |
| 8 | **Cấu hình hệ thống thời gian thực** | Admin 1 có thể bật/tắt bảo trì, đóng đăng ký ngay lập tức mà không cần deploy lại |

---

*📅 Tài liệu được tổng hợp và cập nhật ngày: 28/03/2026*
*✍️ Tác giả: Sinh viên — Đồ án môn Lập trình Ứng dụng Web & Mobile*
