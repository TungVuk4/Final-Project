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

// ================================================================
// QUẢN LÝ DỮ LIỆU BẢNG ĐIỀU KHIỂN (DASHBOARD)
// ================================================================

// ----------------------------------------------------------------
// [ADMIN] Lấy các thống kê tổng quan cho phần đầu Dashboard
// GET /api/stats/dashboard/overview
// ----------------------------------------------------------------
router.get('/dashboard/overview', async (req, res) => {
  try {
    const [[revenueResult]] = await pool.query(
      `SELECT SUM(TotalAmount) as totalRevenue FROM orders WHERE Status != 'Đã hủy'`
    );
    const [[usersResult]] = await pool.query(
      `SELECT COUNT(*) as totalUsers FROM Users WHERE Role != 'Admin'`
    );
    const [[ordersResult]] = await pool.query(
      `SELECT COUNT(*) as totalOrders FROM orders`
    );
    const [[pendingResult]] = await pool.query(
      `SELECT COUNT(*) as pendingOrders FROM orders WHERE Status IN ('PENDING_COD', 'AWAITING_PAYMENT', 'PROCESSING', 'Chờ xử lý')`
    );
    const [[shippingResult]] = await pool.query(
      `SELECT COUNT(*) as shippingOrders FROM orders WHERE Status IN ('SHIPPING', 'Đang giao')`
    );
    const [[completedResult]] = await pool.query(
      `SELECT COUNT(*) as completedOrders FROM orders WHERE Status IN ('DELIVERED', 'Đã giao')`
    );
    const [[reviewsResult]] = await pool.query(
      `SELECT COUNT(*) as totalReviews FROM reviews`
    );

    res.status(200).json({
      success: true,
      data: {
        totalRevenue: revenueResult.totalRevenue || 0,
        totalUsers: usersResult.totalUsers || 0,
        totalOrders: ordersResult.totalOrders || 0,
        totalReviews: reviewsResult.totalReviews || 0,
        pendingOrders: pendingResult.pendingOrders || 0,
        shippingOrders: shippingResult.shippingOrders || 0,
        completedOrders: completedResult.completedOrders || 0
      }
    });
  } catch (error) {
    console.error('Lỗi khi lấy stats dashboard:', error);
    res.status(500).json({ error: 'Lỗi server' });
  }
});

// ----------------------------------------------------------------
// [ADMIN] Lấy dữ liệu cho biểu đồ (Charts)
// GET /api/stats/dashboard/charts
// ----------------------------------------------------------------
router.get('/dashboard/charts', async (req, res) => {
  try {
    const [pieData] = await pool.query(`
      SELECT 
        c.CategoryName as label, 
        SUM(od.Quantity) as value 
      FROM orderdetails od
      JOIN products p ON od.ProductID = p.ProductID
      JOIN categories c ON p.CategoryID = c.CategoryID
      JOIN orders o ON od.OrderID = o.OrderID
      WHERE o.Status != 'Đã hủy'
      GROUP BY c.CategoryID
      ORDER BY value DESC
      LIMIT 5
    `);

    const [barData] = await pool.query(`
      SELECT 
        DATE_FORMAT(OrderDate, '%d/%m') as date, 
        SUM(TotalAmount) as revenue 
      FROM orders 
      WHERE Status != 'Đã hủy'
      GROUP BY DATE(OrderDate)
      ORDER BY DATE(OrderDate) DESC
      LIMIT 7
    `);

    res.status(200).json({
      success: true,
      data: { pieChart: pieData, barChart: barData.reverse() }
    });
  } catch (error) {
    console.error('Lỗi khi lấy chart data:', error);
    res.status(500).json({ error: 'Lỗi server' });
  }
});

module.exports = router;
