// middlewares/auth.js
const jwt = require("jsonwebtoken");
const secret = process.env.JWT_SECRET || "YOUR_SUPER_SECRET_KEY";

// ----------------------------------------------------------------
// Middleware 1: Kiểm tra xác thực JWT (tất cả user đã đăng nhập)
// ----------------------------------------------------------------
const requireAuth = (req, res, next) => {
  const authHeader = req.header("Authorization");
  if (!authHeader)
    return res.status(401).json({ message: "Access denied. Token missing." });

  const token = authHeader.replace("Bearer ", "");
  try {
    const decoded = jwt.verify(token, secret);
    req.user = decoded; // { userId, role, email }
    next();
  } catch (ex) {
    res.status(401).json({ message: "Invalid or expired token." });
  }
};

// ----------------------------------------------------------------
// Middleware 2: Chỉ cho phép Role = 'Admin' (cả 3 admin đều vào được)
// ----------------------------------------------------------------
const requireAdmin = (req, res, next) => {
  if (req.user && req.user.role === "Admin") {
    next();
  } else {
    res.status(403).json({ message: "Access denied. Admin role required." });
  }
};

// ----------------------------------------------------------------
// Middleware 3: Chỉ Admin 1 (Admin Chính — toàn quyền)
// Email: admin1@fashionstyle.com
// Dùng cho: duyệt đơn hàng, quản lý người dùng, thống kê, cấu hình
// ----------------------------------------------------------------
const requireAdminLevel1 = (req, res, next) => {
  if (
    req.user &&
    req.user.role === "Admin" &&
    req.user.email === "admin1@fashionstyle.com"
  ) {
    next();
  } else {
    res.status(403).json({
      message: "Access denied. Chỉ Admin Chính mới có quyền thực hiện thao tác này.",
    });
  }
};

// ----------------------------------------------------------------
// Middleware 4: Admin 1 + Admin 2 (Admin Kho — quản lý sản phẩm)
// Email: admin1@ hoặc admin2@fashionstyle.com
// Dùng cho: thêm/sửa/xóa sản phẩm, quản lý danh mục, kho hàng
// ----------------------------------------------------------------
const requireAdminLevel2 = (req, res, next) => {
  const allowedEmails = [
    "admin1@fashionstyle.com",
    "admin2@fashionstyle.com",
  ];
  if (
    req.user &&
    req.user.role === "Admin" &&
    allowedEmails.includes(req.user.email)
  ) {
    next();
  } else {
    res.status(403).json({
      message: "Access denied. Chỉ Admin Chính hoặc Admin Kho mới có quyền quản lý sản phẩm.",
    });
  }
};

// ----------------------------------------------------------------
// Middleware 5: Admin 1 + Admin 3 (Admin Vận Hành — xử lý đơn hàng)
// Email: admin1@ hoặc admin3@fashionstyle.com
// Dùng cho: xem đơn hàng, lên đơn, cập nhật trạng thái vận chuyển
// ----------------------------------------------------------------
const requireAdminLevel3 = (req, res, next) => {
  const allowedEmails = [
    "admin1@fashionstyle.com",
    "admin3@fashionstyle.com",
  ];
  if (
    req.user &&
    req.user.role === "Admin" &&
    allowedEmails.includes(req.user.email)
  ) {
    next();
  } else {
    res.status(403).json({
      message: "Access denied. Chỉ Admin Chính hoặc Admin Vận Hành mới có quyền xử lý đơn hàng.",
    });
  }
};

module.exports = {
  requireAuth,
  requireAdmin,
  requireAdminLevel1,
  requireAdminLevel2,
  requireAdminLevel3,
};
