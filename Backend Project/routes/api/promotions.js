// routes/api/promotions.js
const express = require("express");
const pool = require("../../dbpool/db");
const { requireAuth, requireAdminLevel2 } = require("../../middlewares/auth");
const router = express.Router();

// ----------------------------------------------------------------
// [PUBLIC] Lấy danh sách khuyến mãi đang hoạt động (cho trang khuyến mãi)
// GET /api/promotions
// ----------------------------------------------------------------
router.get("/", async (req, res) => {
  try {
    const sql = `
            SELECT PromotionID, Code, DiscountPercent, StartDate, EndDate 
            FROM Promotions 
            WHERE IsActive = 1 AND EndDate >= NOW()
            ORDER BY StartDate ASC
        `;
    const [promotions] = await pool.query(sql);
    res.status(200).json({ success: true, data: promotions });
  } catch (error) {
    console.error("Lỗi khi lấy khuyến mãi:", error);
    res.status(500).json({ error: "Lỗi server" });
  }
});

// ----------------------------------------------------------------
// [ADMIN] Thêm chương trình khuyến mãi
// POST /api/promotions
// ----------------------------------------------------------------
router.post("/", requireAuth, requireAdminLevel2, async (req, res) => {
  const { Code, DiscountPercent, StartDate, EndDate } = req.body;

  if (!Code || !DiscountPercent || !StartDate || !EndDate) {
    return res.status(400).json({ message: "Thiếu thông tin cần thiết." });
  }

  try {
    const sql = `
            INSERT INTO Promotions (Code, DiscountPercent, StartDate, EndDate, IsActive)
            VALUES (?, ?, ?, ?, 1)
        `;
    const [result] = await pool.query(sql, [
      Code,
      DiscountPercent,
      StartDate,
      EndDate,
    ]);
    res.status(201).json({
      success: true,
      message: "Thêm khuyến mãi thành công.",
      promotionId: result.insertId,
    });
  } catch (error) {
    console.error("Lỗi khi thêm khuyến mãi:", error);
    res.status(500).json({ error: "Lỗi server" });
  }
});

// ----------------------------------------------------------------
// [ADMIN] Cập nhật khuyến mãi
// PUT /api/promotions/:id
// ----------------------------------------------------------------
router.put("/:id", requireAuth, requireAdminLevel2, async (req, res) => {
  const id = req.params.id;
  const { Code, DiscountPercent, StartDate, EndDate, IsActive } = req.body;

  try {
    const [result] = await pool.query(
      `UPDATE Promotions SET Code=?, DiscountPercent=?, StartDate=?, EndDate=?, IsActive=? WHERE PromotionID=?`,
      [Code, DiscountPercent, StartDate, EndDate, IsActive, id]
    );

    if (result.affectedRows === 0) {
      return res
        .status(404)
        .json({ success: false, message: "Không tìm thấy khuyến mãi." });
    }
    res
      .status(200)
      .json({ success: true, message: "Cập nhật khuyến mãi thành công." });
  } catch (error) {
    console.error("Lỗi khi cập nhật khuyến mãi:", error);
    res.status(500).json({ error: "Lỗi server" });
  }
});

// ----------------------------------------------------------------
// [ADMIN] Xóa khuyến mãi
// DELETE /api/promotions/:id
// ----------------------------------------------------------------
router.delete("/:id", requireAuth, requireAdminLevel2, async (req, res) => {
  const id = req.params.id;
  try {
    const [result] = await pool.query(
      `DELETE FROM Promotions WHERE PromotionID = ?`,
      [id]
    );
    if (result.affectedRows === 0) {
      return res
        .status(404)
        .json({ success: false, message: "Không tìm thấy khuyến mãi để xóa." });
    }
    res
      .status(200)
      .json({ success: true, message: "Xóa khuyến mãi thành công." });
  } catch (error) {
    // Cảnh báo lỗi khóa ngoại nếu có đơn hàng sử dụng PromotionID này
    console.error("Lỗi khi xóa khuyến mãi:", error);
    res.status(500).json({ error: "Lỗi server" });
  }
});

module.exports = router;
