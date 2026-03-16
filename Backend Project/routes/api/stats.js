// routes/api/stats.js
const express = require("express");
const pool = require("../../dbpool/db");
const { requireAuth, requireAdmin } = require("../../middlewares/auth");
const router = express.Router();

router.use(requireAuth, requireAdmin); // Áp dụng Admin Middleware cho toàn bộ file này

// ----------------------------------------------------------------
// Thống kê Doanh thu theo tháng
// GET /api/stats/sales/monthly
// ----------------------------------------------------------------
router.get("/sales/monthly", async (req, res) => {
  try {
    const sql = `
            SELECT 
                DATE_FORMAT(OrderDate, '%Y-%m') AS month,
                SUM(TotalAmount) AS totalRevenue,
                COUNT(OrderID) AS totalOrders
            FROM Orders
            WHERE Status = 'Đã giao'
            GROUP BY month
            ORDER BY month DESC
        `;
    const [stats] = await pool.query(sql);
    res.status(200).json({ success: true, data: stats });
  } catch (error) {
    console.error("Lỗi khi thống kê doanh thu:", error);
    res.status(500).json({ error: "Lỗi server" });
  }
});

// ----------------------------------------------------------------
// Thống kê Tồn kho theo danh mục
// GET /api/stats/inventory
// ----------------------------------------------------------------
router.get("/inventory", async (req, res) => {
  try {
    const sql = `
            SELECT 
                c.CategoryName,
                SUM(p.StockQuantity) AS totalStock
            FROM Products p
            JOIN Categories c ON p.CategoryID = c.CategoryID
            GROUP BY c.CategoryName
            ORDER BY totalStock DESC
        `;
    const [stats] = await pool.query(sql);
    res.status(200).json({ success: true, data: stats });
  } catch (error) {
    console.error("Lỗi khi thống kê tồn kho:", error);
    res.status(500).json({ error: "Lỗi server" });
  }
});

// ----------------------------------------------------------------
// Thống kê Sản phẩm bán chạy nhất
// GET /api/stats/top-products
// ----------------------------------------------------------------
router.get("/top-products", async (req, res) => {
  try {
    const sql = `
            SELECT 
                p.ProductName,
                SUM(od.Quantity) AS totalSold
            FROM OrderDetails od
            JOIN Products p ON od.ProductID = p.ProductID
            GROUP BY p.ProductName
            ORDER BY totalSold DESC
            LIMIT 10
        `;
    const [stats] = await pool.query(sql);
    res.status(200).json({ success: true, data: stats });
  } catch (error) {
    console.error("Lỗi khi thống kê sản phẩm bán chạy:", error);
    res.status(500).json({ error: "Lỗi server" });
  }
});

module.exports = router;
