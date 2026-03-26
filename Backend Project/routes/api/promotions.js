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
// [ADMIN] Lấy tất cả khuyến mãi (bao gồm đã hết hạn/vô hiệu hóa)
// GET /api/promotions/admin
// ----------------------------------------------------------------
router.get("/admin", requireAuth, requireAdminLevel2, async (req, res) => {
  try {
    const sql = `
            SELECT PromotionID, Code, DiscountPercent, StartDate, EndDate, IsActive 
            FROM Promotions 
            ORDER BY StartDate DESC
        `;
    const [promotions] = await pool.query(sql);
    res.status(200).json({ success: true, data: promotions });
  } catch (error) {
    console.error("Lỗi khi lấy khuyến mãi admin:", error);
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
// ----------------------------------------------------------------
// [ADMIN] Xóa sạch khuyến mãi (Thorough Delete)
// DELETE /api/promotions/:id
// ----------------------------------------------------------------
router.delete("/:id", requireAuth, requireAdminLevel2, async (req, res) => {
  const id = req.params.id;
  let connection;
  try {
    connection = await pool.getConnection();
    await connection.beginTransaction();

    // 1. Gỡ bỏ liên kết trong bảng Orders (Đặt PromotionID về NULL)
    // Việc này giữ nguyên số tiền nhưng xóa tham chiếu đến khuyến mãi đã bị xóa
    await connection.query("UPDATE Orders SET PromotionID = NULL WHERE PromotionID = ?", [id]);

    // 2. Xóa các mã đơn lẻ (Single-Use Codes) liên quan
    await connection.query("DELETE FROM promotions_code WHERE PromotionID = ?", [id]);

    // 3. Xóa các mã VIP đã gán cho user
    await connection.query("DELETE FROM UserVouchers WHERE PromotionID = ?", [id]);

    // 4. Cuối cùng mới xóa chiến dịch gốc
    const [result] = await connection.query(`DELETE FROM Promotions WHERE PromotionID = ?`, [id]);

    await connection.commit();

    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: "Không tìm thấy khuyến mãi để xóa." });
    }

    res.json({ success: true, message: "Đã xóa sạch hoàn toàn khuyến mãi và các dữ liệu liên quan khỏi database thành công!" });
  } catch (error) {
    if (connection) await connection.rollback();
    console.error("Lỗi khi xóa sạch khuyến mãi:", error);
    res.status(500).json({ error: "Lỗi server khi xóa dữ liệu", detail: error.message });
  } finally {
    if (connection) connection.release();
  }
});

// ----------------------------------------------------------------
// [ADMIN 2] Gán mã khuyến mãi cho một User cụ thể (VIP)
// POST /api/promotions/assign-to-user
// Body: { UserID, PromotionID, CodeValue? }
// ----------------------------------------------------------------
router.post("/assign-to-user", requireAuth, requireAdminLevel2, async (req, res) => {
  const { UserID, PromotionID, CodeValue } = req.body;
  if (!UserID || !PromotionID) {
    return res.status(400).json({ message: "Thiếu UserID hoặc PromotionID." });
  }
  let connection;
  try {
    connection = await pool.getConnection();
    await connection.beginTransaction();

    // 1. Kiểm tra promo tồn tại và còn hiệu lực
    const [[promo]] = await connection.query(
      `SELECT * FROM Promotions WHERE PromotionID = ? AND IsActive = 1`,
      [PromotionID]
    );
    if (!promo) {
      return res.status(404).json({ message: "Mã khuyến mãi không tồn tại hoặc đã hết hạn." });
    }

    // 2. Kiểm tra user tồn tại
    const [[user]] = await connection.query(`SELECT UserID FROM Users WHERE UserID = ? AND Role != 'Admin'`, [UserID]);
    if (!user) {
      return res.status(404).json({ message: "Không tìm thấy khách hàng." });
    }

    // 3. Nếu gán một mã Random cụ thể
    if (CodeValue) {
      const [[codeData]] = await connection.query(
        "SELECT CodeID FROM promotions_code WHERE CodeValue = ? AND PromotionID = ? AND IsUsed = 0",
        [CodeValue, PromotionID]
      );
      if (!codeData) {
        return res.status(400).json({ message: "Mã random này không hợp lệ hoặc đã được sử dụng." });
      }
      // Đánh dấu mã này chỉ dành cho User này
      await connection.query("UPDATE promotions_code SET AssignedToUserID = ? WHERE CodeValue = ?", [UserID, CodeValue]);
    }

    // 4. Lưu vào bảng quà tặng UserVoucher
    await connection.query(
      `INSERT INTO UserVouchers (UserID, PromotionID, SpecificCode) VALUES (?, ?, ?)
       ON DUPLICATE KEY UPDATE AssignedAt = CURRENT_TIMESTAMP, IsUsed = 0, SpecificCode = ?`,
      [UserID, PromotionID, CodeValue || null, CodeValue || null]
    );

    await connection.commit();
    res.status(201).json({ success: true, message: "Đã gán mã quà tặng thành công cho khách hàng!" });
  } catch (error) {
    if (connection) await connection.rollback();
    console.error("Lỗi khi gán voucher:", error);
    res.status(500).json({ error: "Lỗi server" });
  } finally {
    if (connection) connection.release();
  }
});

// ----------------------------------------------------------------
// [AUTH USER] Lấy danh sách voucher được gán cho user đang đăng nhập
// GET /api/promotions/my-vouchers
// ----------------------------------------------------------------
router.get("/my-vouchers", requireAuth, async (req, res) => {
  const userId = req.user.userId;
  try {
    const [rows] = await pool.query(`
      SELECT
        uv.VoucherID,
        uv.AssignedAt,
        uv.IsUsed,
        p.PromotionID,
        p.Code,
        p.DiscountPercent,
        p.StartDate,
        p.EndDate
      FROM UserVouchers uv
      JOIN Promotions p ON uv.PromotionID = p.PromotionID
      WHERE uv.UserID = ? AND p.IsActive = 1 AND p.EndDate >= NOW()
      ORDER BY uv.AssignedAt DESC
    `, [userId]);
    res.status(200).json({ success: true, data: rows });
  } catch (error) {
    console.error("Lỗi lấy voucher user:", error);
    res.status(500).json({ error: "Lỗi server" });
  }
});

// ----------------------------------------------------------------
// [ADMIN] Lấy danh sách mã đơn lẻ đã sinh (promotions_code)
// GET /api/promotions/:id/codes
// ----------------------------------------------------------------
router.get("/:id/codes", requireAuth, requireAdminLevel2, async (req, res) => {
  const promotionId = req.params.id;
  try {
    const [codes] = await pool.query(
      `SELECT CodeID, CodeValue, IsUsed, CreatedAt 
       FROM promotions_code 
       WHERE PromotionID = ? 
       ORDER BY CreatedAt DESC`,
      [promotionId]
    );
    res.status(200).json({ success: true, data: codes });
  } catch (error) {
    console.error("Lỗi khi lấy danh sách mã con:", error);
    res.status(500).json({ error: "Lỗi server" });
  }
});

// ----------------------------------------------------------------
// [ADMIN] Phát hành mã ngẫu nhiên (sinh tự động)
// POST /api/promotions/:id/generate-codes
// Body: { quantity, prefix }
// ----------------------------------------------------------------
router.post("/:id/generate-codes", requireAuth, requireAdminLevel2, async (req, res) => {
  const promotionId = req.params.id;
  const { quantity, prefix } = req.body;

  if (!quantity || quantity <= 0 || quantity > 500) {
    return res.status(400).json({ message: "Số lượng không hợp lệ (hỗ trợ tối đa 500 mã/lần)." });
  }

  try {
    // Kiểm tra chiến dịch tồn tại
    const [[promo]] = await pool.query("SELECT * FROM Promotions WHERE PromotionID = ?", [promotionId]);
    if (!promo) return res.status(404).json({ message: "Không tìm thấy chiến dịch khuyến mãi." });

    const prefixStr = prefix ? `${prefix.toUpperCase().trim()}-` : `${promo.Code}-`;
    const codesToInsert = [];

    // Sinh mã ngẫu nhiên (Prefix-XXXXXX)
    const generateRandomString = (length) => {
      const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
      let result = '';
      for (let i = 0; i < length; i++) result += chars.charAt(Math.floor(Math.random() * chars.length));
      return result;
    };

    for (let i = 0; i < quantity; i++) {
        const codeValue = prefixStr + generateRandomString(6);
        codesToInsert.push([promotionId, codeValue]);
    }

    if (codesToInsert.length > 0) {
      // Bulk insert
      await pool.query(
        "INSERT INTO promotions_code (PromotionID, CodeValue) VALUES ?",
        [codesToInsert]
      );
    }

    res.status(201).json({
      success: true,
      message: `Đã phát hành thành công ${quantity} mã.`,
    });
  } catch (error) {
    console.error("Lỗi khi sinh mã:", error);
    res.status(500).json({ error: "Lỗi server" });
  }
});

module.exports = router;
