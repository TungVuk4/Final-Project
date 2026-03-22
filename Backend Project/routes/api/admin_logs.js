const express = require("express");
const pool = require("../../dbpool/db");
const { requireAuth, requireAdminLevel1, requireAdmin } = require("../../middlewares/auth");
const router = express.Router();

// Lấy 100 logs gần nhất cho các Admin
router.get("/", requireAuth, requireAdmin, async (req, res) => {
  try {
    const sql = `
      SELECT al.LogID as id, al.ActionType as action, al.TableName, al.Details, al.Timestamp as time,
             u.Email as email, u.FullName as name, u.Role
      FROM admin_activity_logs al
      JOIN Users u ON al.AdminID = u.UserID
      ORDER BY al.Timestamp DESC
      LIMIT 500
    `;
    const [rows] = await pool.query(sql);
    res.status(200).json({ success: true, data: rows });
  } catch (error) {
    console.error("Lỗi get logs:", error);
    res.status(500).json({ error: "Lỗi server" });
  }
});

// Thêm log mới (Từ Frontend Admin)
router.post("/", requireAuth, requireAdmin, async (req, res) => {
  const { action, details } = req.body;
  const adminId = req.user.userId;
  
  try {
    await pool.query(
      "INSERT INTO admin_activity_logs (AdminID, ActionType, TableName, Details) VALUES (?, ?, ?, ?)",
      [adminId, action || "SYSTEM_ACTION", "System", details || ""]
    );
    res.status(201).json({ success: true });
  } catch (error) {
    console.error("Lỗi add log:", error);
    res.status(500).json({ error: "Lỗi server" });
  }
});

// Admin 1 xóa 1 log
router.delete("/:id", requireAuth, requireAdminLevel1, async (req, res) => {
  try {
    await pool.query("DELETE FROM admin_activity_logs WHERE LogID = ?", [req.params.id]);
    res.status(200).json({ success: true });
  } catch (error) {
    console.error("Lỗi delete log:", error);
    res.status(500).json({ error: "Lỗi server" });
  }
});

// Admin 1 xóa tất cả logs
router.delete("/", requireAuth, requireAdminLevel1, async (req, res) => {
  try {
    await pool.query("DELETE FROM admin_activity_logs");
    res.status(200).json({ success: true });
  } catch (error) {
    console.error("Lỗi clear logs:", error);
    res.status(500).json({ error: "Lỗi server" });
  }
});

module.exports = router;
