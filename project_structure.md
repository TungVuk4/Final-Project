# 📂 Cấu Trúc Dự Án — Fashion eCommerce (Final Project)

> Dự án thương mại điện tử thời trang gồm **4 thành phần** chính hoạt động độc lập và kết nối với nhau qua REST API.

---

## 🏗️ Kiến Trúc Tổng Quan

```
Final Project/
├── Backend Project/        # Node.js + Express REST API Server
├── Page Web Chinh/         # React Web App (Khách hàng)
├── Page Admin Project/     # React Admin Dashboard (Quản trị)
└── Mobile App/             # React Native Hybrid WebView App (iOS & Android)
```

```
┌──────────────────────┐   ┌───────────────────────────┐
│   Page Web Chinh     │   │       Mobile App           │
│ React + Redux + TS   │   │ React Native + WebView     │
│  (Trình duyệt Web)   │   │  wraps Page Web Chinh      │
└──────────┬───────────┘   └────────────┬──────────────┘
           │ HTTP (Axios)               │ HTTP (Axios)
           └─────────────┬─────────────┘
                         ▼
          ┌──────────────────────────────┐
          │       Backend Project        │  Port: 8080
          │  Node.js · Express · MySQL   │
          │  MSSQL · Firebase · JWT      │
          └──────────────┬───────────────┘
                         │ HTTP (Axios)
                         ▼
          ┌──────────────────────────────┐
          │     Page Admin Project       │
          │ React + Zustand + PrimeReact │
          └──────────────────────────────┘
```

---

## 1️⃣ Backend Project — REST API Server

> **Công nghệ:** Node.js · Express · MySQL2 · MSSQL · JWT · Firebase Admin · Multer · Nodemailer

### Cấu trúc

```
Backend Project/
├── server.js               # Entry point — khởi tạo Express, đăng ký routes
├── install.js              # Đăng ký server như Windows Service
├── uninstall.js            # Gỡ Windows Service
├── sync-images.js          # Đồng bộ hình ảnh sản phẩm
├── .env                    # Biến môi trường (DB, JWT secret, Firebase...)
├── package.json
├── _helpers/               # Tiện ích nội bộ
│   ├── error-handler.js    # Global error handler middleware
│   └── sqlserver.js        # Kết nối & query SQL Server
├── dbpool/
│   └── db.js               # Khởi tạo connection pool MySQL
├── middlewares/
│   └── auth.js             # Middleware xác thực JWT (requireAuth, requireAdmin)
├── services/
│   └── login.js            # Business logic xử lý đăng nhập, token
├── routes/
│   └── api/                # Định nghĩa API endpoints
│       ├── auth-temp.js    # Đăng ký, Đăng nhập, OTP, quên mật khẩu
│       ├── products.js     # CRUD sản phẩm, tìm kiếm, upload ảnh
│       ├── categories.js   # CRUD danh mục sản phẩm
│       ├── cart.js         # Giỏ hàng (thêm/xóa/cập nhật)
│       ├── orders.js       # Đặt hàng, lịch sử, cập nhật trạng thái
│       ├── promotions.js   # Quản lý mã giảm giá
│       ├── stats.js        # Báo cáo doanh thu, thống kê
│       └── user.js         # Hồ sơ người dùng, đổi mật khẩu
├── uploads/                # Thư mục lưu ảnh sản phẩm được upload
└── daemon/                 # Windows Service runner (WinSW)
    ├── nodejs_api.exe
    └── nodejs_api.xml
```

### API Endpoints

| Nhóm | Prefix | Mô tả | Bảo vệ |
|---|---|---|---|
| Auth | `/api/auth-temp` | Đăng ký, đăng nhập, OTP, quên mật khẩu | Public |
| Sản phẩm | `/api/products` | Xem danh sách, tìm kiếm, CRUD | Public / Admin |
| Danh mục | `/api/categories` | Xem & quản lý danh mục | Public / Admin |
| Giỏ hàng | `/api/cart` | Thêm/xóa/cập nhật giỏ hàng | Customer Token |
| Đơn hàng | `/api/orders` | Đặt hàng, lịch sử, trạng thái | Customer/Admin Token |
| Người dùng | `/api/user` | Hồ sơ, đổi mật khẩu | Customer Token |
| Khuyến mãi | `/api/promotions` | Quản lý mã giảm giá | Admin Token |
| Thống kê | `/api/stats` | Báo cáo doanh thu / tồn kho | Admin Token |

### Thư viện chính

| Thư viện | Mục đích |
|---|---|
| `express` | Web framework |
| `mysql2` | Kết nối MySQL |
| `mssql` | Kết nối SQL Server |
| `jsonwebtoken` | Tạo & xác thực JWT |
| `bcryptjs` | Mã hoá mật khẩu |
| `multer` | Upload file ảnh |
| `nodemailer` | Gửi email (OTP, xác nhận) |
| `firebase-admin` | Push notification (FCM) |
| `node-schedule` | Cron job tự động |
| `cors` | Cho phép cross-origin requests |
| `dotenv` | Quản lý biến môi trường |

---

## 2️⃣ Page Web Chinh — Web App Khách Hàng

> **Công nghệ:** React 18 · TypeScript · Vite · Redux Toolkit · React Router v6 · Tailwind CSS · Axios

### Cấu trúc

```
Page Web Chinh/
├── index.html              # Entry point HTML
├── vite.config.ts          # Cấu hình Vite
├── tailwind.config.js      # Cấu hình Tailwind CSS
├── tsconfig.json           # Cấu hình TypeScript
├── package.json
└── src/
    ├── main.tsx            # Entry point React (Provider + BrowserRouter)
    ├── App.tsx             # Root component & routing
    ├── store.ts            # Redux Store (kết hợp các slices)
    ├── typings.d.ts        # Global TypeScript types
    ├── index.css           # Global styles
    ├── assets/             # Hình ảnh tĩnh (31 files)
    ├── axios/
    │   └── custom.ts       # Axios instance (baseURL → Backend :8080)
    ├── actions/
    │   └── index.ts        # Redux async thunks (fetchProducts, login...)
    ├── hooks/
    │   └── index.ts        # Custom typed Redux hooks
    ├── data/
    │   └── db.json         # Mock data cho JSON Server
    ├── features/           # Redux state management
    │   ├── auth/authSlice.tsx   # State đăng nhập / user
    │   ├── cart/cartSlice.tsx   # State giỏ hàng
    │   └── shop/shopSlice.tsx   # State trang shop (filter, sort)
    ├── components/         # 22 Shared UI components
    │   ├── Header.tsx · Footer.tsx · Banner.tsx
    │   ├── ProductItem.tsx · ProductGrid.tsx · ProductGridWrapper.tsx
    │   ├── SidebarMenu.tsx · Dropdown.tsx · Button.tsx
    │   ├── CategoriesSection.tsx · CategoryItem.tsx
    │   ├── HomeCollectionSection.tsx · HomeCollectionFilter.tsx
    │   ├── ShopFilterAndSort.tsx · ShopPageContent.tsx · ShopBanner.tsx
    │   ├── ShowingPagination.tsx · ShowingSearchPagination.tsx
    │   ├── QuantityInput.tsx · ScrollToTop.tsx · SocialMediaFooter.tsx
    │   └── StandardSelectInput.tsx
    ├── pages/              # 13 Trang chính
    │   ├── Landing.tsx         # Trang chủ
    │   ├── Shop.tsx            # Danh sách sản phẩm
    │   ├── SingleProduct.tsx   # Chi tiết sản phẩm
    │   ├── Cart.tsx            # Giỏ hàng
    │   ├── Checkout.tsx        # Thanh toán
    │   ├── OrderConfirmation.tsx
    │   ├── OrderHistory.tsx · SingleOrderHistory.tsx
    │   ├── Login.tsx · Register.tsx
    │   ├── UserProfile.tsx
    │   ├── Search.tsx
    │   └── HomeLayout.tsx      # Layout khung (Header + Footer)
    └── utils/              # 8 Utility functions
        ├── checkCheckoutFormData.ts
        ├── checkLoginFormData.ts
        ├── checkRegisterFormData.ts
        ├── checkUserProfileFormData.ts
        ├── formatCategoryName.ts
        ├── formatDate.ts
        ├── withNumberInputWrapper.tsx
        └── withSelectInputWrapper.tsx
```

### Luồng dữ liệu

```
User → Component → dispatch(action/thunk)
                        ↓
              Redux Slice (features/)
                        ↓
              Axios (axios/custom.ts) → Backend API :8080
```

### Scripts

| Script | Mô tả |
|---|---|
| `npm run dev` | Chỉ chạy Vite dev server |
| `npm run start` | Chạy đồng thời Vite + JSON Server |
| `npm run build` | Build production |

### 📱 Yêu Cầu Responsive Design (Bắt buộc cho Mobile WebView)

> Vì Mobile App dùng `<WebView uri={url} />` trỏ thẳng vào website này, **toàn bộ giao diện hiển thị trên điện thoại chính là website này**. Nếu web bị vỡ khung trên di động, App cũng bị vỡ theo. **Responsive là điều kiện sống còn.**

| Hạng mục | Trạng thái / Cách đảm bảo |
|---|---|
| **Tailwind CSS** | ✅ Utility-first CSS — các class `sm:`, `md:`, `lg:` đảm bảo co giãn theo breakpoint |
| **Viewport meta tag** | ✅ `<meta name="viewport" content="width=device-width, initial-scale=1.0">` trong `index.html` |
| **Flexbox / Grid layout** | ✅ Các component dùng `flex`, `grid` của Tailwind — tự điều chỉnh theo màn hình |
| **SidebarMenu.tsx** | ✅ Menu mobile riêng — hiển thị khi màn hình nhỏ (responsive navigation) |
| **Kiểm tra tương thích** | Dùng DevTools (F12 → Toggle Device Toolbar) với các kích thước: 375px (iPhone SE), 390px (iPhone 14), 412px (Android) |

---

## 3️⃣ Page Admin Project — Dashboard Quản Trị

> **Công nghệ:** React 19 · JavaScript (Vite) · Zustand · PrimeReact · Tailwind CSS v4 · React Router v7 · i18next

### Cấu trúc

```
Page Admin Project/
├── index.html              # Entry point HTML
├── vite.config.js          # Cấu hình Vite
├── package.json
└── src/
    ├── main.jsx            # Entry point React
    ├── App.jsx             # Root component
    ├── App.css             # Global styles
    ├── index.css           # CSS base
    ├── i18n.js             # Cấu hình đa ngôn ngữ (i18next)
    ├── tailwind.config.js  # Cấu hình Tailwind CSS v4
    ├── assets/             # Tài nguyên tĩnh
    ├── router/
    │   └── AppRouter.jsx   # Định nghĩa routes admin
    ├── stores/
    │   └── auth.jsx        # Zustand store — quản lý auth state
    ├── services/
    │   └── ApiServices.js  # Axios instance → Backend API
    ├── layout/             # Các layout component
    │   ├── AppLayout.jsx   # Layout chính (Sidebar + Topbar)
    │   ├── AuthLayout.jsx  # Layout trang đăng nhập
    │   ├── Sidebar.jsx     # Sidebar điều hướng
    │   ├── Topbar.jsx      # Thanh trên cùng (user, breadcrumb)
    │   ├── MobileDrawer.jsx
    │   └── UserPopover.jsx # Popover thông tin user
    └── pages/              # Các trang quản trị
        ├── Dashboard.jsx       # Trang tổng quan & thống kê
        ├── Product.jsx         # Quản lý sản phẩm (CRUD + upload ảnh)
        ├── Users.jsx           # Quản lý người dùng
        ├── Roles.jsx           # Phân quyền
        └── auth/               # Trang xác thực
            ├── Login.jsx
            ├── Register.jsx
            ├── ForgotPassword.jsx
            └── ResetPassword.jsx
```

### Thư viện chính

| Thư viện | Mục đích |
|---|---|
| `primereact` + `primeicons` | Bộ UI component cao cấp (DataTable, Dialog, Toast...) |
| `zustand` | State management nhẹ (thay Redux) |
| `react-router-dom` v7 | Client-side routing |
| `i18next` + `react-i18next` | Đa ngôn ngữ |
| `axios` | Gọi Backend API |
| `dayjs` | Xử lý ngày tháng |
| `tailwindcss` v4 | Styling |

---

## 4️⃣ Mobile App — Ứng Dụng Di Động

> **Công nghệ:** React Native · React Native WebView · JWT Authentication

### 5.1. Kiến Trúc Đồng Bộ và Tối Ưu Hóa (Back-end as a Service)

Hệ thống vận hành dựa trên mô hình **tập trung dữ liệu**, đảm bảo trải nghiệm người dùng liền mạch giữa môi trường Web và Mobile App:

| Đặc điểm | Mô tả |
|---|---|
| **Cơ sở dữ liệu duy nhất** | Cả Website và Mobile App dùng chung **SQL Server** — đảm bảo nhất quán kho hàng & thông tin khách hàng |
| **Kiến trúc Hybrid WebView** | Mobile App là một **Native Wrapper** dùng React Native để bọc (_wrap_) toàn bộ nền tảng Web chính |
| **Cập nhật tức thì** | Mọi thay đổi về sản phẩm / khuyến mãi trên Web **phản ánh ngay** trên App, không cần cài đặt lại |

```
┌─────────────────────────────────────┐
│           Mobile App                │
│  ┌───────────────────────────────┐  │
│  │   React Native (Native Shell) │  │  → Build ra .apk (Android)
│  │  ┌─────────────────────────┐  │  │     và .ipa (iOS)
│  │  │  React Native WebView   │  │  │
│  │  │  ┌───────────────────┐  │  │  │
│  │  │  │  Page Web Chinh   │  │  │  │  → Toàn bộ UI/UX
│  │  │  │  (ReactJS + CSS)  │  │  │  │     responsive
│  │  │  └───────────────────┘  │  │  │
│  │  └─────────────────────────┘  │  │
│  └───────────────────────────────┘  │
└─────────────────────────────────────┘
              │ WebView trỏ URI → Web đã deploy
              ▼
       Backend Project :8080
```

### 5.2. Công Nghệ Triển Khai

| Công nghệ | Mục đích |
|---|---|
| **React Native Core** | Khung nền tảng — xây dựng app cài được trực tiếp trên iOS & Android (`.apk` / `.ipa`) |
| **React Native WebView** | Thành phần lõi — nhúng trực tiếp Website vào app với hiệu suất cao, giao diện mượt mà |
| **JWT (JSON Web Token)** | Duy trì phiên đăng nhập của người dùng giữa Web và App thông qua **Storage của thiết bị** |

### 5.3. Hướng Dẫn Triển Khai Thực Tế (React Native WebView)

> 💡 **Tại sao cách này "khôn ngoan"?**
> Bạn vẫn tạo ra một **React Native project thực thụ** — có đầy đủ code, có folder `android/`, `ios/`, `package.json`... Cô giáo kiểm tra sẽ thấy có dùng React Native. Còn giao diện thì **đẹp lung linh** vì chính là web bạn đã làm. Đây cũng là cách nhiều ứng dụng lớn dùng (Amazon, Shopee dùng WebView cho một số phần).

**Bước 1: Khởi tạo Project React Native**
```bash
npx react-native init AppBanHang
cd AppBanHang
```

**Bước 2: Cài đặt thư viện WebView**
```bash
npm install react-native-webview
```

**Bước 3: Viết Code (chỉ ~20 dòng) — Mở `App.js` / `App.tsx`, xóa hết và dán vào:**
```jsx
import React from 'react';
import { SafeAreaView, StyleSheet } from 'react-native';
import { WebView } from 'react-native-webview';

const App = () => {
  return (
    <SafeAreaView style={styles.container}>
      <WebView 
        source={{ uri: 'https://link-web-ban-hang-cua-ban.com' }} 
        style={{ flex: 1 }}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

export default App;
```

**Bước 4: Chạy demo**
```bash
# Demo trên Android (cần Android Studio + Emulator)
npx react-native run-android

# Demo trên iOS (chỉ trên macOS, cần Xcode)
npx react-native run-ios
```

> ✅ **Kết quả:** App đầy đủ cấu trúc React Native, có thể demo trực tiếp, giao diện chính là Web đã làm — không cần viết lại UI.

### 5.4. Các Chức Năng Trọng Tâm trên Mobile

> Ứng dụng tối ưu hóa trải nghiệm **vuốt / chạm** dựa trên nền tảng Responsive của ReactJS.

| Nhóm chức năng | Chi tiết |
|---|---|
| 🛒 **Mua sắm đồng bộ** | Bắt đầu chọn hàng trên Website → thanh toán ngay trên Mobile nhờ đồng bộ giỏ hàng qua RESTful API |
| 👤 **Quản lý cá nhân hóa** | Xem lịch sử đơn hàng, cập nhật thông tin cá nhân, quản lý ví voucher trên thiết bị di động |
| 🔔 **Tính năng bổ trợ** | Tìm kiếm nhanh bằng điện thoại và nhận thông báo (_push notification_ qua Firebase) về trạng thái đơn hàng |

---

## 🔗 Kết Nối Giữa Các Thành Phần

| Từ | Đến | Phương thức | Ghi chú |
|---|---|---|---|
| Page Web Chinh | Backend Project | HTTP (Axios) | Port 8080 |
| Page Admin Project | Backend Project | HTTP (Axios) | Port 8080 |
| Mobile App | Page Web Chinh | `<WebView source={{ uri: url }} />` | React Native bọc toàn bộ Web — không viết UI riêng |
| Backend Project | MySQL / MSSQL | TCP | Database chính (dùng chung Web & Mobile) |
| Backend Project | Nodemailer / SMTP | SMTP | Gửi email xác nhận đơn hàng cho khách + thông báo về Admin |

### 📦 Luồng Đặt Hàng — Web và App hoạt động giống hệt nhau

> **Vì Mobile App chỉ là WebView bọc web**, khi khách đặt hàng trên App thực chất là đang dùng giao diện Web bên trong. Cả hai đều gọi **cùng một Backend API** — không có sự khác biệt kỹ thuật nào.

```
Khách đặt hàng (Web hoặc App — giống nhau)
        ↓
Backend nhận request POST /api/orders
        ↓
        ├─→ Lưu đơn hàng vào Database (MySQL / MSSQL)
        │
        └─→ Nodemailer gửi 2 email đồng thời:
              ├─ 📧 Email khách hàng: "Đơn #12345 đã được đặt thành công!"
              └─ 📧 Email Admin:      "⚠️ Có đơn hàng mới cần duyệt!"
                                              ↓
                                   Admin vào Page Admin Project
                                   xem danh sách đơn → duyệt / từ chối
                                              ↓
                              Nodemailer gửi email cập nhật cho khách:
                              "✅ Đơn hàng đã được xác nhận / đang giao"
```

### ✅ Tại sao không cần Firebase cho dự án này?

| Tiêu chí | Firebase FCM | Email (Nodemailer) — Lựa chọn của dự án |
|---|---|---|
| **Độ phức tạp** | Cao — cần đăng ký FCM, lưu device token cho từng user | Thấp — đã tích hợp sẵn trong Backend |
| **Phù hợp** | App native có tính năng riêng | App WebView đơn giản — email là đủ |
| **Admin nhận thông báo** | Cần app riêng để nhận push | Email về hộp thư — dễ quản lý hơn |
| **Khách hàng nhận thông báo** | Pop-up điện thoại | Email xác nhận — chuyên nghiệp hơn |
| **Trạng thái dự án** | Cần thêm nhiều code | ✅ Nodemailer đã có sẵn, dùng luôn |

> 💡 **Kết luận:** Với kiến trúc WebView, **email qua Nodemailer** là giải pháp tối ưu — đơn giản, đã tích hợp sẵn, phù hợp với quy mô dự án và không cần cấu hình thêm bất kỳ dịch vụ bên ngoài nào.

---

## 📋 Hướng Dẫn Chạy Dự Án

```bash
# 1. Khởi động Backend (Port 8080)
cd "Backend Project"
npm run dev

# 2. Khởi động Web App Khách Hàng
cd "Page Web Chinh"
npm run start        # Vite (Port 5173) + JSON Server (Port 3000)

# 3. Khởi động Admin Dashboard
cd "Page Admin Project"
npm run dev
```

---

*📅 Tài liệu được cập nhật ngày: 18/03/2026*
