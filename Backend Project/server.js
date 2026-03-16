require("rootpath")();
const http = require("http");
const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const path = require("path");
require("dotenv").config();

const app = express();
const errorHandler = require("_helpers/error-handler");

// --- CẤU HÌNH GLOBAL ---
global.__basedir = __dirname;
const httpPort = 8080;
const hostname = "localhost";

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

// =======================================================
// --- ĐỊNH TUYẾN API (ROUTES) ---
// =======================================================

// 1. Nhóm Public (Không cần đăng nhập)
app.use("/api/auth-temp", authRoutes); // Đăng ký, Đăng nhập, OTP
app.use("/api/categories", categoryRoutes); // Xem danh mục
app.use("/api/products", productRoutes); // Xem sản phẩm, Tìm kiếm

// 2. Nhóm Thành viên (Cần Token Customer/Admin)
// Ghi chú: Middleware requireAuth đã được đặt bên trong các file route này
app.use("/api/cart", cartRoutes); // Giỏ hàng cá nhân
app.use("/api/orders", orderRoutes); // Đặt hàng, Lịch sử đơn hàng
app.use("/api/user", userRoutes); // Hồ sơ cá nhân, Đổi mật khẩu

// 3. Nhóm Quản trị (Cần Token Admin)
// Ghi chú: Middleware requireAdmin đã được áp dụng trong các file route này
app.use("/api/promotions", promotionRoutes); // Quản lý mã giảm giá
app.use("/api/stats", statsRoutes); // Báo cáo doanh thu, tồn kho

// =======================================================

// --- XỬ LÝ LỖI (Phải đặt cuối cùng sau các Routes) ---
app.use(errorHandler);

// --- KHỞI CHẠY SERVER ---
const httpServer = http.createServer(app);
httpServer.listen(httpPort, hostname, () => {
  console.log(`-------------------------------------------`);
  console.log(`🚀 FashionStyle Server started successfully!`);
  console.log(`📡 URL: http://${hostname}:${httpPort}`);
  console.log(`-------------------------------------------`);
});
