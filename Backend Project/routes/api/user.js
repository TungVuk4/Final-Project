const express = require("express");
const pool = require("../../dbpool/db");
const bcrypt = require("bcryptjs"); // Đảm bảo đã import bcrypt cho chức năng đổi mật khẩu
const { requireAuth, requireAdmin, requireAdminLevel1 } = require("../../middlewares/auth");
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

// ----------------------------------------------------------------
// [CUSTOMER] Cập nhật hồ sơ cá nhân (Họ tên, SĐT, Địa chỉ)
// PUT /api/user/profile
// ----------------------------------------------------------------
router.put("/profile", requireAuth, async (req, res) => {
  const userId = req.user.userId;
  const { FullName, PhoneNumber, Address } = req.body;
  if (!FullName) return res.status(400).json({ message: "Họ tên không được để trống." });
  try {
    await pool.query(
      "UPDATE Users SET FullName = ?, PhoneNumber = ?, Address = ? WHERE UserID = ?",
      [FullName, PhoneNumber || null, Address || null, userId]
    );
    res.status(200).json({ success: true, message: "Cập nhật hồ sơ thành công." });
  } catch (error) {
    res.status(500).json({ error: "Lỗi server khi cập nhật hồ sơ" });
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
            SELECT UserID, FullName, Email, Role, Address, PhoneNumber, CreatedAt, IsActive
            FROM Users
            ORDER BY CreatedAt DESC
        `; // Kèm IsActive
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
// [ADMIN] Xóa người dùng (CÓ XỬ LÝ FK)
// ----------------------------------------------------------------
router.delete("/admin/:id", requireAuth, requireAdmin, async (req, res) => {
  const targetUserId = req.params.id;
  let connection;
  try {
    if (req.user.userId == targetUserId) {
      return res.status(400).json({ success: false, message: "Không thể tự xóa chính mình." });
    }
    connection = await pool.getConnection();
    await connection.beginTransaction();
    
    // 1. Lấy tất cả orders của user để xoá orderdetails
    const [userOrders] = await connection.query("SELECT OrderID FROM orders WHERE UserID = ?", [targetUserId]);
    if (userOrders.length > 0) {
      const orderIds = userOrders.map(o => o.OrderID);
      const placeholders = orderIds.map(() => "?").join(",");
      await connection.query(`DELETE FROM orderdetails WHERE OrderID IN (${placeholders})`, orderIds);
      // Tiếp theo xoá orders
      await connection.query("DELETE FROM orders WHERE UserID = ?", [targetUserId]);
    }
    
    // 2. Xóa giỏ hàng
    await connection.query("DELETE ci FROM cart_items ci JOIN shopping_carts sc ON ci.CartID = sc.CartID WHERE sc.UserID = ?", [targetUserId]);
    await connection.query("DELETE FROM shopping_carts WHERE UserID = ?", [targetUserId]);
    
    // 3. Xóa reviews
    await connection.query("DELETE FROM reviews WHERE UserID = ?", [targetUserId]);
    
    // 4. Xóa admin logs 
    await connection.query("DELETE FROM admin_activity_logs WHERE AdminID = ?", [targetUserId]);
    
    // 5. Cuối cùng xóa User
    const [result] = await connection.query("DELETE FROM Users WHERE UserID = ?", [targetUserId]);
    await connection.commit();
    
    if (result.affectedRows === 0) return res.status(404).json({ success: false, message: "Không tìm thấy người dùng." });
    res.status(200).json({ success: true, message: "Đã xóa người dùng thành công." });
  } catch (error) {
    if (connection) await connection.rollback();
    console.error("Lỗi xóa user:", error.message);
    res.status(500).json({ error: "Lỗi server khi xóa: " + error.message });
  } finally {
    if (connection) connection.release();
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

// ----------------------------------------------------------------
// [ADMIN 1 ONLY] Quản lý quyền hệ thống Admin 2 & 3
// ----------------------------------------------------------------
router.get("/admin/permissions", requireAuth, requireAdminLevel1, async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT Email, CanDeleteProduct, IsActive FROM Users WHERE Email IN ('admin2@fashionstyle.com', 'admin3@fashionstyle.com')");
    
    const admin2 = rows.find(r => r.Email === 'admin2@fashionstyle.com');
    const admin3 = rows.find(r => r.Email === 'admin3@fashionstyle.com');

    res.status(200).json({ 
      success: true, 
      admin2CanDelete: !!admin2?.CanDeleteProduct,
      admin2IsActive: admin2?.IsActive !== 0,
      admin3IsActive: admin3?.IsActive !== 0
    });
  } catch(error) { 
    console.error("Lỗi get permissions:", error);
    res.status(500).json({error: "Lỗi server"}) 
  }
});

router.put("/admin/permissions", requireAuth, requireAdminLevel1, async (req, res) => {
  const { admin2CanDelete } = req.body;
  try {
    await pool.query("UPDATE Users SET CanDeleteProduct = ? WHERE Email = 'admin2@fashionstyle.com'", [admin2CanDelete ? 1 : 0]);
    res.status(200).json({ success: true, message: "Cập nhật quyền thành công" });
  } catch(error) { 
    console.error("Lỗi update permissions:", error);
    res.status(500).json({error: "Lỗi server"}) 
  }
});

router.put("/admin/lock", requireAuth, requireAdminLevel1, async (req, res) => {
  const { email, lock } = req.body;
  try {
    await pool.query("UPDATE Users SET IsActive = ? WHERE Email = ?", [lock ? 0 : 1, email]);
    res.status(200).json({ success: true, message: lock ? "Đã khóa tài khoản" : "Đã mở khóa tài khoản" });
  } catch(error) { 
    console.error("Lỗi update lock:", error);
    res.status(500).json({error: "Lỗi server"}) 
  }
});

module.exports = router;
