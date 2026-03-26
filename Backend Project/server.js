require("rootpath")();
const http = require("http");
const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const path = require("path");
const bcrypt = require("bcryptjs");
require("dotenv").config();

const app = express();
const errorHandler = require("_helpers/error-handler");
const pool = require("./dbpool/db");

// --- CẤU HÌNH GLOBAL ---
global.__basedir = __dirname;
const httpPort = 8080;
// Bỏ hostname hoặc đổi thành 0.0.0.0 để Server mở trên cả IPv4/IPv6
const hostname = "0.0.0.0";

// --- MIDDLEWARES HỆ THỐNG ---
app.use(cors());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Phục vụ file tĩnh (để hiển thị ảnh sản phẩm lên Web/Postman)
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// --- IMPORT ROUTES ---
const authRoutes = require("./routes/api/auth-temp");
const categoryRoutes = require("./routes/api/categories");
const productRoutes = require("./routes/api/products");
const cartRoutes = require("./routes/api/cart");
const orderRoutes = require("./routes/api/orders");
const promotionRoutes = require("./routes/api/promotions");
const statsRoutes = require("./routes/api/stats");
const userRoutes = require("./routes/api/user");
const adminLogsRoutes = require("./routes/api/admin_logs");
const colorsRoutes = require("./routes/api/colors");
const notificationsRoutes = require("./routes/api/notifications");
const reviewsRoutes = require("./routes/api/reviews");
const systemConfigRoutes = require("./routes/api/system-config");

// =======================================================
// --- ĐỊNH TUYẾN API (ROUTES) ---
// =======================================================

// 1. Nhóm Public (Không cần đăng nhập)
app.use("/api/auth-temp", authRoutes); // Đăng ký, Đăng nhập, OTP
app.use("/api/categories", categoryRoutes); // Xem danh mục
app.use("/api/products", productRoutes); // Xem sản phẩm, Tìm kiếm
app.use("/api/reviews", reviewsRoutes); // Xem, gửi đánh giá sản phẩm

// 2. Nhóm Thành viên (Cần Token Customer/Admin)
app.use("/api/cart", cartRoutes); // Giỏ hàng cá nhân
app.use("/api/orders", orderRoutes); // Đặt hàng, Lịch sử đơn hàng
app.use("/api/user", userRoutes); // Hồ sơ cá nhân, Đổi mật khẩu

// 3. Nhóm Quản trị (Cần Token Admin)
app.use("/api/promotions", promotionRoutes); // Quản lý mã giảm giá
app.use("/api/stats", statsRoutes); // Báo cáo doanh thu, tồn kho
app.use("/api/admin-logs", adminLogsRoutes); // Quản lý Lịch sử HĐ Admin
app.use("/api/colors", colorsRoutes); // Quản lý Màu sắc sản phẩm
app.use("/api/notifications", notificationsRoutes); // Thông báo tổng hợp (Orders, Reviews, Admin)
app.use("/api/system-config", systemConfigRoutes); // Cấu hình hệ thống (Admin 1)


// =======================================================

// --- XỬ LÝ LỖI (Phải đặt cuối cùng sau các Routes) ---
app.use(errorHandler);

// =======================================================
// --- TỰ ĐỘNG TẠO 3 TÀI KHOẢN ADMIN CỐ ĐỊNH ---
// Chạy mỗi khi server khởi động, bỏ qua nếu đã tồn tại
// =======================================================
const FIXED_ADMINS = [
  {
    FullName: "Admin Chính",
    Email: "admin1@fashionstyle.com",
    Password: "Admin@123",
    Address: "Hà Nội, Việt Nam",
    PhoneNumber: "0900000001",
  },
  {
    FullName: "Admin Kho",
    Email: "admin2@fashionstyle.com",
    Password: "Admin@456",
    Address: "Hồ Chí Minh, Việt Nam",
    PhoneNumber: "0900000002",
  },
  {
    FullName: "Admin Vận Hành",
    Email: "admin3@fashionstyle.com",
    Password: "Admin@789",
    Address: "Đà Nẵng, Việt Nam",
    PhoneNumber: "0900000003",
  },
];

async function initAdminAccounts() {
  try {
    for (const admin of FIXED_ADMINS) {
      const [rows] = await pool.query(
        "SELECT UserID FROM Users WHERE Email = ?",
        [admin.Email]
      );
      if (rows.length > 0) continue; // Đã tồn tại → bỏ qua

      const salt = await bcrypt.genSalt(10);
      const passwordHash = await bcrypt.hash(admin.Password, salt);
      await pool.query(
        `INSERT INTO Users (FullName, Email, PasswordHash, Address, PhoneNumber, Role)
         VALUES (?, ?, ?, ?, ?, 'Admin')`,
        [admin.FullName, admin.Email, passwordHash, admin.Address, admin.PhoneNumber]
      );
      console.log(`✅ Admin account created: ${admin.Email}`);
    }
  } catch (err) {
    console.error("⚠️  Could not initialize admin accounts:", err.message);
  }
}

// Tự động tạo bảng UserVouchers nếu chưa có
async function initUserVouchersTable() {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS UserVouchers (
        VoucherID    INT AUTO_INCREMENT PRIMARY KEY,
        UserID       INT NOT NULL,
        PromotionID  INT NOT NULL,
        AssignedAt   DATETIME DEFAULT CURRENT_TIMESTAMP,
        IsUsed       TINYINT(1) DEFAULT 0,
        FOREIGN KEY (UserID) REFERENCES Users(UserID) ON DELETE CASCADE,
        FOREIGN KEY (PromotionID) REFERENCES Promotions(PromotionID) ON DELETE CASCADE,
        UNIQUE KEY uq_user_promo (UserID, PromotionID)
      )
    `);
    console.log("✅ UserVouchers table ready.");
  } catch (err) {
    console.error("⚠️  Could not init UserVouchers table:", err.message);
  }
}


// --- KHỞI CHẠY SERVER ---
const httpServer = http.createServer(app);
httpServer.listen(httpPort, hostname, async () => {
  console.log(`-------------------------------------------`);
  console.log(`🚀 FashionStyle Server started successfully!`);
  console.log(`📡 URL: http://${hostname}:${httpPort}`);
  console.log(`-------------------------------------------`);
  await initAdminAccounts(); // Tự động tạo admin khi server start
  await initUserVouchersTable(); // Tự động tạo bảng UserVouchers nếu chưa có
});

