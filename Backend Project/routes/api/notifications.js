const express = require("express");
const router = express.Router();
const pool = require("../../dbpool/db");
const { requireAuth, requireAdmin } = require("../../middlewares/auth");

// ---------------------------------------------------------------
// GET /api/notifications
// Gom thông báo từ: đơn hàng mới, đánh giá mới, log admin
// Trả về 30 thông báo gần nhất cho Admin
// ---------------------------------------------------------------
router.get("/", requireAuth, requireAdmin, async (req, res) => {
  try {
    const [orders] = await pool.query(`
      SELECT
        o.OrderID as id,
        'NEW_ORDER' as type,
        CONCAT('Đơn hàng mới #', o.OrderID, ' từ ', u.FullName) as message,
        CONCAT('Khách đặt ', FORMAT(o.TotalAmount, 0), ' VNĐ - Trạng thái: ', o.Status) as detail,
        o.OrderDate as createdAt,
        'order' as category
      FROM orders o
      JOIN Users u ON o.UserID = u.UserID
      ORDER BY o.OrderDate DESC
      LIMIT 10
    `);

    const [reviews] = await pool.query(`
      SELECT
        r.ReviewID as id,
        'NEW_REVIEW' as type,
        CONCAT(u.FullName, ' đánh giá "', p.ProductName, '"') as message,
        CONCAT(r.Rating, '⭐ — ', COALESCE(LEFT(r.Comment, 60), '(Không có nội dung)')) as detail,
        r.CreatedAt as createdAt,
        'review' as category
      FROM reviews r
      JOIN Users u ON r.UserID = u.UserID
      JOIN products p ON r.ProductID = p.ProductID
      ORDER BY r.CreatedAt DESC
      LIMIT 10
    `);

    const [adminLogs] = await pool.query(`
      SELECT
        al.LogID as id,
        'ADMIN_ACTION' as type,
        CONCAT(u.FullName, ': ', al.ActionType) as message,
        COALESCE(al.Details, '') as detail,
        al.Timestamp as createdAt,
        'admin' as category
      FROM admin_activity_logs al
      JOIN Users u ON al.AdminID = u.UserID
      ORDER BY al.Timestamp DESC
      LIMIT 15
    `);

    const [systemNotifs] = await pool.query(`
      SELECT
        NotificationID as id,
        Type as type,
        'Hệ thống Cảnh Báo' as message,
        Message as detail,
        CreatedAt as createdAt,
        'system' as category,
        ProductID
      FROM Notifications
      ORDER BY CreatedAt DESC
      LIMIT 10
    `);

    // Gộp, sắp xếp theo ngày mới nhất
    const all = [...orders, ...reviews, ...adminLogs, ...systemNotifs]
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 30)
      .map((n, idx) => ({ ...n, uniqueKey: `${n.category}_${n.id}_${idx}` }));

    res.status(200).json({ success: true, data: all, total: all.length });
  } catch (error) {
    console.error("Lỗi lấy notifications:", error.message);
    res.status(500).json({ error: "Lỗi server khi lấy thông báo: " + error.message });
  }
});

module.exports = router;
