const express = require("express");
const router = express.Router();
const pool = require("../../dbpool/db");

// [PUBLIC/ADMIN] Lấy danh sách tất cả các màu
// GET /api/colors
router.get("/", async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT * FROM colors");
    res.status(200).json({ success: true, data: rows });
  } catch (error) {
    console.error("Lỗi khi lấy danh sách màu:", error);
    res.status(500).json({ error: "Lỗi server khi lấy dữ liệu màu sắc" });
  }
});

module.exports = router;
