const express = require("express");
const pool = require("../../dbpool/db");
const bcrypt = require("bcryptjs"); // Đảm bảo đã import bcrypt cho chức năng đổi mật khẩu
const { requireAuth, requireAdmin } = require("../../middlewares/auth");
const router = express.Router();

// ----------------------------------------------------------------
// [CUSTOMER] Lấy hồ sơ người dùng hiện tại (Cần xác thực)
// ----------------------------------------------------------------
router.get("/profile", requireAuth, async (req, res) => {
  const userId = req.user.userId;
  try {
    const sql = `SELECT UserID, FullName, Email, Address, PhoneNumber, Role, CreatedAt FROM Users WHERE UserID = ?`;
    const [rows] = await pool.query(sql, [userId]);
    if (rows.length === 0)
      return res
        .status(404)
        .json({ success: false, message: "Không tìm thấy hồ sơ." });
    res.status(200).json({ success: true, data: rows[0] });
  } catch (error) {
    res.status(500).json({ error: "Lỗi server khi lấy dữ liệu" });
  }
});

// ================================================================
//               CHỨC NĂNG DÀNH CHO ADMIN
// ================================================================

// ----------------------------------------------------------------
// [ADMIN] Lấy danh sách tất cả người dùng (ĐÃ THÊM Address, PhoneNumber)
// ----------------------------------------------------------------
router.get("/admin/all", requireAuth, requireAdmin, async (req, res) => {
  try {
    const sql = `
            SELECT UserID, FullName, Email, Role, Address, PhoneNumber, CreatedAt
            FROM Users
            ORDER BY CreatedAt DESC
        `; // Thêm Address và PhoneNumber vào đây để Frontend nhận được dữ liệu
    const [rows] = await pool.query(sql);
    res.status(200).json({ success: true, data: rows });
  } catch (error) {
    console.error("Lỗi khi lấy danh sách người dùng (Admin):", error);
    res.status(500).json({ error: "Lỗi server" });
  }
});

// ----------------------------------------------------------------
// [ADMIN] Cập nhật hồ sơ cho MỘT người dùng bất kỳ (FIX LỖI THÀNH CÔNG ẢO)
// PUT /api/user/admin/update-profile/:id
// ----------------------------------------------------------------
router.put(
  "/admin/update-profile/:id",
  requireAuth,
  requireAdmin,
  async (req, res) => {
    const targetUserId = req.params.id; // Lấy ID từ URL người cần sửa
    const { FullName, Address, PhoneNumber } = req.body;

    if (!FullName) {
      return res
        .status(400)
        .json({ success: false, message: "Họ tên không được để trống." });
    }

    try {
      const sql = `
            UPDATE Users
            SET FullName = ?, Address = ?, PhoneNumber = ?
            WHERE UserID = ?
        `;
      const [result] = await pool.query(sql, [
        FullName,
        Address,
        PhoneNumber,
        targetUserId,
      ]);

      if (result.affectedRows === 0) {
        return res
          .status(404)
          .json({
            success: false,
            message: "Không tìm thấy người dùng để cập nhật.",
          });
      }
      res
        .status(200)
        .json({ success: true, message: "Cập nhật Database thành công!" });
    } catch (error) {
      console.error("Lỗi cập nhật hồ sơ từ Admin:", error);
      res.status(500).json({ error: "Lỗi server khi cập nhật" });
    }
  }
);

// ----------------------------------------------------------------
// [ADMIN] Cập nhật vai trò (Role)
// ----------------------------------------------------------------
router.put("/admin/:id/role", requireAuth, requireAdmin, async (req, res) => {
  const targetUserId = req.params.id;
  const { Role } = req.body;

  if (!Role || (Role !== "Admin" && Role !== "Customer")) {
    return res
      .status(400)
      .json({ success: false, message: "Vai trò không hợp lệ." });
  }

  try {
    const [result] = await pool.query(
      "UPDATE Users SET Role = ? WHERE UserID = ?",
      [Role, targetUserId]
    );
    if (result.affectedRows === 0)
      return res
        .status(404)
        .json({ success: false, message: "Không tìm thấy người dùng." });
    res
      .status(200)
      .json({ success: true, message: "Cập nhật vai trò thành công." });
  } catch (error) {
    res.status(500).json({ error: "Lỗi server" });
  }
});

// ----------------------------------------------------------------
// [ADMIN] Xóa người dùng
// ----------------------------------------------------------------
router.delete("/admin/:id", requireAuth, requireAdmin, async (req, res) => {
  const targetUserId = req.params.id;
  try {
    if (req.user.userId == targetUserId) {
      return res
        .status(400)
        .json({ success: false, message: "Không thể tự xóa chính mình." });
    }
    const [result] = await pool.query("DELETE FROM Users WHERE UserID = ?", [
      targetUserId,
    ]);
    if (result.affectedRows === 0)
      return res
        .status(404)
        .json({ success: false, message: "Không tìm thấy người dùng." });
    res
      .status(200)
      .json({ success: true, message: "Đã xóa người dùng thành công." });
  } catch (error) {
    res.status(500).json({ error: "Lỗi server khi xóa dữ liệu" });
  }
});

// ----------------------------------------------------------------
// [CUSTOMER/ADMIN] Thay đổi mật khẩu
// ----------------------------------------------------------------
router.put("/change-password", requireAuth, async (req, res) => {
  const userId = req.user.userId;
  const { oldPassword, newPassword } = req.body;

  if (!oldPassword || !newPassword)
    return res.status(400).json({ message: "Thiếu thông tin mật khẩu." });

  try {
    const [rows] = await pool.query(
      "SELECT PasswordHash FROM Users WHERE UserID = ?",
      [userId]
    );
    const isMatch = await bcrypt.compare(oldPassword, rows[0].PasswordHash);
    if (!isMatch)
      return res.status(400).json({ message: "Mật khẩu cũ không đúng." });

    const salt = await bcrypt.genSalt(10);
    const newPasswordHash = await bcrypt.hash(newPassword, salt);
    await pool.query("UPDATE Users SET PasswordHash = ? WHERE UserID = ?", [
      newPasswordHash,
      userId,
    ]);

    res
      .status(200)
      .json({ success: true, message: "Thay đổi mật khẩu thành công." });
  } catch (error) {
    res.status(500).json({ error: "Lỗi server" });
  }
});

module.exports = router;
