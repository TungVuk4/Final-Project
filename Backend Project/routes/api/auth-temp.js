// routes/api/auth.js
const express = require("express");
const crypto = require("crypto");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const pool = require("../../dbpool/db");
const router = express.Router();
const secret = process.env.JWT_SECRET || "YOUR_SUPER_SECRET_KEY";
const { requireAuth, requireAdmin, requireAdminLevel1 } = require("../../middlewares/auth");
const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
  tls: {
    rejectUnauthorized: false, // Cho phép gửi từ môi trường local
  },
});
// ----------------------------------------------------------------
// 1. ĐĂNG KÝ (Dành cho khách hàng mới trên Web chính)
// ----------------------------------------------------------------
router.post("/register", async (req, res) => {
  const { FullName, Email, Password, Address, PhoneNumber } = req.body;
  let connection;

  if (!Email || !Password || !FullName) {
    return res
      .status(400)
      .json({ message: "Vui lòng cung cấp đầy đủ thông tin bắt buộc." });
  }

  try {
    connection = await pool.getConnection();
    await connection.beginTransaction();

    // Kiểm tra email trùng
    const [existing] = await connection.query(
      "SELECT UserID FROM Users WHERE Email = ?",
      [Email]
    );
    if (existing.length > 0) {
      await connection.rollback();
      return res.status(400).json({ message: "Email đã được sử dụng." });
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(Password, salt);

    // Chèn User mới (Mặc định là Customer)
    const [userResult] = await connection.query(
      `INSERT INTO Users (FullName, Email, PasswordHash, Address, PhoneNumber, Role) VALUES (?, ?, ?, ?, ?, 'Customer')`,
      [FullName, Email, passwordHash, Address, PhoneNumber]
    );

    // --- LOGIC TỐI ƯU: Tự động tạo giỏ hàng ---
    await connection.query("INSERT INTO Shopping_Carts (UserID) VALUES (?)", [
      userResult.insertId,
    ]);

    await connection.commit();
    res.status(201).json({
      success: true,
      message: "Đăng ký thành công và đã khởi tạo giỏ hàng.",
    });
  } catch (error) {
    if (connection) await connection.rollback();
    console.error("Lỗi đăng ký:", error);
    res.status(500).json({ error: "Lỗi server khi đăng ký." });
  } finally {
    if (connection) connection.release();
  }
});

// ----------------------------------------------------------------
// 2. ĐĂNG NHẬP CHUNG (Web bán hàng & Web Admin dùng chung)
// ----------------------------------------------------------------
router.post("/login", async (req, res) => {
  const { Email, Password } = req.body;
  try {
    // XÓA 'Avatar' khỏi danh sách SELECT bên dưới
    const [rows] = await pool.query(
      "SELECT UserID, FullName, Email, PasswordHash, Role, IsActive FROM Users WHERE Email = ?",
      [Email]
    );

    if (rows.length === 0) {
      return res
        .status(400)
        .json({ message: "Email hoặc mật khẩu không đúng." });
    }

    const user = rows[0];

    // KIỂM TRA TÀI KHOẢN CÓ BỊ KHÓA KHÔNG
    if (user.IsActive === 0) {
      return res.status(403).json({ message: "Tài khoản của bạn đã bị Admin khóa." });
    }
    const isMatch = await bcrypt.compare(Password, user.PasswordHash);
    if (!isMatch) {
      return res
        .status(400)
        .json({ message: "Email hoặc mật khẩu không đúng." });
    }

    // ✅ Admin → token vô hạn (không có expiresIn)
    // ✅ Customer → token hết hạn sau 7 ngày
    const tokenPayload = { userId: user.UserID, role: user.Role, email: user.Email };
    const token =
      user.Role === "Admin"
        ? jwt.sign(tokenPayload, secret)          // Vô hạn
        : jwt.sign(tokenPayload, secret, { expiresIn: "7d" }); // 7 ngày

    res.status(200).json({
      success: true,
      token,
      user: {
        id: user.UserID,
        name: user.FullName,
        role: user.Role,
        email: user.Email || Email,
        avatar: null, // Trả về null vì DB chưa có cột này
      },
    });
  } catch (error) {
    console.error("Lỗi Đăng Nhập:", error);
    res.status(500).json({ error: "Lỗi server khi đăng nhập." });
  }
});
// ----------------------------------------------------------------
// 3. QUÊN MẬT KHẨU - Gửi OTP qua Gmail
// ----------------------------------------------------------------
router.post("/forgot-password", async (req, res) => {
  const { Email } = req.body;
  try {
    const [rows] = await pool.query(
      "SELECT UserID FROM Users WHERE Email = ?",
      [Email]
    );
    if (rows.length === 0)
      return res.status(404).json({ message: "Email không tồn tại." });

    const userId = rows[0].UserID;
    const otp = Math.floor(100000 + Math.random() * 900000).toString(); // Mã 6 số
    const expiration = new Date(Date.now() + 10 * 60000); // Hạn 10 phút

    // Lưu OTP vào DB bảng User_Password_Reset
    await pool.query(
      `INSERT INTO User_Password_Reset (UserID, ResetToken, ExpiresAt) 
             VALUES (?, ?, ?) ON DUPLICATE KEY UPDATE ResetToken = ?, ExpiresAt = ?`,
      [userId, otp, expiration, otp, expiration]
    );

    // Gửi mã OTP thực tế qua Gmail
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: Email,
      subject: "[FashionStyle] Mã OTP khôi phục mật khẩu",
      html: `<h3>Mã xác minh của bạn là: <b style="color: blue;">${otp}</b></h3>
                   <p>Mã này có hiệu lực trong 10 phút. Vui lòng không cung cấp mã này cho bất kỳ ai.</p>`,
    };

    await transporter.sendMail(mailOptions);
    res.status(200).json({
      success: true,
      message: "Mã OTP đã được gửi đến Gmail của bạn.",
    });
  } catch (error) {
    console.error("Lỗi gửi mail:", error);
    res
      .status(500)
      .json({ error: "Không thể gửi mã OTP, vui lòng thử lại sau." });
  }
});

// ----------------------------------------------------------------
// 4. XÁC MINH OTP & ĐẶT MẬT KHẨU MỚI (Reset Password)
// ----------------------------------------------------------------
router.put("/reset-password", async (req, res) => {
  const { Email, OTP, newPassword } = req.body;
  try {
    // Tìm User và kiểm tra mã OTP còn hạn không
    const [rows] = await pool.query(
      `SELECT u.UserID FROM Users u 
             JOIN User_Password_Reset r ON u.UserID = r.UserID 
             WHERE u.Email = ? AND r.ResetToken = ? AND r.ExpiresAt > NOW()`,
      [Email, OTP]
    );

    if (rows.length === 0)
      return res
        .status(400)
        .json({ message: "Mã OTP không đúng hoặc đã hết hạn." });

    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(newPassword, salt);

    // Cập nhật mật khẩu mới và xóa mã OTP đã dùng
    await pool.query("UPDATE Users SET PasswordHash = ? WHERE UserID = ?", [
      hash,
      rows[0].UserID,
    ]);
    await pool.query("DELETE FROM User_Password_Reset WHERE UserID = ?", [
      rows[0].UserID,
    ]);

    res.status(200).json({
      success: true,
      message: "Mật khẩu đã được thay đổi thành công.",
    });
  } catch (error) {
    res.status(500).json({ error: "Lỗi server khi đổi mật khẩu." });
  }
});

// ----------------------------------------------------------------
// [ADMIN] Thêm người dùng mới và chỉ định Role
// POST /api/auth/admin/add-user
// Chú ý: Nhớ hash mật khẩu và tạo giỏ hàng nếu Role là Customer
// ----------------------------------------------------------------
router.post("/admin/add-user", requireAuth, requireAdmin, async (req, res) => {
  const { FullName, Email, Password, Address, PhoneNumber, Role } = req.body;

  if (!Email || !Password || !FullName || !Role) {
    return res.status(400).json({
      message: "Vui lòng cung cấp đầy đủ thông tin bắt buộc, bao gồm Role.",
    });
  }

  // Ràng buộc Role: Chỉ cho phép Admin tạo Admin hoặc Customer
  const validRoles = ["Customer", "Admin"];
  if (!validRoles.includes(Role)) {
    return res.status(400).json({
      message: "Vai trò không hợp lệ. Chỉ chấp nhận 'Customer' hoặc 'Admin'.",
    });
  }

  try {
    // 1. Kiểm tra email đã tồn tại
    const [existingUser] = await pool.query(
      "SELECT UserID FROM Users WHERE Email = ?",
      [Email]
    );
    if (existingUser.length > 0) {
      return res.status(400).json({ message: "Email đã được sử dụng." });
    }

    // 2. Mã hóa mật khẩu
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(Password, salt);

    // 3. Chèn người dùng mới với Role được chỉ định
    const sql = `
            INSERT INTO Users (FullName, Email, PasswordHash, Address, PhoneNumber, Role)
            VALUES (?, ?, ?, ?, ?, ?)
        `;
    await pool.query(sql, [
      FullName,
      Email,
      passwordHash,
      Address,
      PhoneNumber,
      Role, // Sử dụng Role được Admin chỉ định
    ]);

    res
      .status(201)
      .json({ success: true, message: `Thêm người dùng ${Role} thành công.` });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Lỗi server khi thêm người dùng." });
  }
});
module.exports = router;
