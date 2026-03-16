// middlewares/auth.js
const jwt = require("jsonwebtoken");
const secret = process.env.JWT_SECRET || "YOUR_SUPER_SECRET_KEY"; // Đặt key trong .env!

// Middleware kiểm tra xác thực (Bắt buộc đăng nhập)
const requireAuth = (req, res, next) => {
  // 1. Lấy token từ header
  const authHeader = req.header("Authorization");
  if (!authHeader)
    return res.status(401).json({ message: "Access denied. Token missing." });

  const token = authHeader.replace("Bearer ", "");

  try {
    // 2. Xác thực token
    const decoded = jwt.verify(token, secret);
    req.user = decoded; // { userId, role }
    next();
  } catch (ex) {
    res.status(401).json({ message: "Invalid or expired token." });
  }
};

// Middleware kiểm tra vai trò Admin
const requireAdmin = (req, res, next) => {
  // Phải chạy sau requireAuth
  if (req.user && req.user.role === "Admin") {
    next();
  } else {
    res.status(403).json({ message: "Access denied. Admin role required." });
  }
};

module.exports = {
  requireAuth,
  requireAdmin,
};
