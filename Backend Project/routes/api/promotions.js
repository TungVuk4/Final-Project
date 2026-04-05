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
// [PUBLIC / AUTH] Kiểm tra tính hợp lệ của mã khuyến mãi
// POST /api/promotions/validate-promo
// Body: { code }
// Header: Authorization Bearer <token> (tuỳ chọn — nếu có sẽ check thêm VIP voucher)
// ----------------------------------------------------------------
router.post("/validate-promo", async (req, res) => {
  const { code } = req.body;
  if (!code || !code.trim()) {
    return res.status(400).json({ valid: false, message: "Vui lòng nhập mã khuyến mãi." });
  }
  const codeUpper = code.trim().toUpperCase();

  // Lấy UserID từ token nếu có (không bắt buộc)
  let userId = null;
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith("Bearer ")) {
    try {
      const jwt = require("jsonwebtoken");
      const secret = process.env.JWT_SECRET || "YOUR_SUPER_SECRET_KEY";
      const decoded = jwt.verify(authHeader.split(" ")[1], secret);
      userId = decoded.userId || decoded.UserID || null;
    } catch (e) { /* Token không hợp lệ — bỏ qua, coi như guest */ }
  }

  try {
    // ── Bước 1: Kiểm tra mã random dùng 1 lần (promotions_code) ──────────
    const [singleUseRows] = await pool.query(
      `SELECT pc.CodeID, pc.CodeValue, pc.PromotionID, pc.IsUsed, pc.AssignedToUserID,
              p.DiscountPercent, p.StartDate, p.EndDate, p.IsActive
       FROM promotions_code pc
       JOIN Promotions p ON pc.PromotionID = p.PromotionID
       WHERE pc.CodeValue = ?
         AND p.IsActive = 1
         AND p.StartDate <= CURDATE()
         AND p.EndDate >= CURDATE()`,
      [codeUpper]
    );

    if (singleUseRows.length > 0) {
      const row = singleUseRows[0];
      if (row.IsUsed) {
        return res.json({ valid: false, message: "Mã này đã được sử dụng mà không còn hiệu lực." });
      }
      // Kiểm tra xem mã có bị gán riêng cho user khác không
      if (row.AssignedToUserID && Number(row.AssignedToUserID) !== Number(userId)) {
        return res.json({ valid: false, message: "Mã này không thuộc về tài khoản của bạn." });
      }
      return res.json({
        valid: true,
        code: row.CodeValue,
        discountPercent: row.DiscountPercent,
        type: "single-use",
      });
    }

    // ── Bước 2: Nếu có token → kiểm tra VIP Voucher được gán (UserVouchers) ──
    if (userId) {
      const [vipRows] = await pool.query(
        `SELECT uv.VoucherID, uv.IsUsed, uv.SpecificCode,
                p.Code, p.DiscountPercent
         FROM UserVouchers uv
         JOIN Promotions p ON uv.PromotionID = p.PromotionID
         WHERE uv.UserID = ?
           AND (p.Code = ? OR uv.SpecificCode = ?)
           AND p.IsActive = 1
           AND p.EndDate >= CURDATE()`,
        [userId, codeUpper, codeUpper]
      );
      if (vipRows.length > 0) {
        const vip = vipRows[0];
        if (vip.IsUsed) {
          return res.json({ valid: false, message: "Voucher VIP này đã được sử dụng." });
        }
        return res.json({
          valid: true,
          code: vip.SpecificCode || vip.Code,
          discountPercent: vip.DiscountPercent,
          type: "vip",
        });
      }
    }

    // ── Bước 3: Kiểm tra mã chung (Promotions) ──────────────────────────
    const [generalRows] = await pool.query(
      `SELECT PromotionID, Code, DiscountPercent
       FROM Promotions
       WHERE Code = ?
         AND IsActive = 1
         AND StartDate <= CURDATE()
         AND EndDate >= CURDATE()`,
      [codeUpper]
    );

    if (generalRows.length > 0) {
      return res.json({
        valid: true,
        code: generalRows[0].Code,
        discountPercent: generalRows[0].DiscountPercent,
        type: "general",
      });
    }

    // ── Không tìm thấy ──────────────────────────────────────────────────
    return res.json({ valid: false, message: "Mã khuyến mãi không tồn tại, đã hết hạn hoặc không hợp lệ." });

  } catch (error) {
    console.error("Lỗi validate promo:", error);
    res.status(500).json({ valid: false, message: "Lỗi hệ thống khi kiểm tra mã." });
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
        "SELECT CodeID FROM promotions_code WHERE CodeValue = ? AND PromotionID = ? AND IsUsed = 0 AND AssignedToUserID IS NULL",
        [CodeValue, PromotionID]
      );
      if (!codeData) {
        return res.status(400).json({ message: "Mã cấp phát này đã được gán cho người khác hoặc không còn khả dụng!" });
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
        uv.SpecificCode,
        p.PromotionID,
        p.Code,
        p.DiscountPercent,
        p.StartDate,
        p.EndDate
      FROM UserVouchers uv
      JOIN Promotions p ON uv.PromotionID = p.PromotionID
      WHERE uv.UserID = ? AND p.IsActive = 1 AND p.EndDate >= NOW()
      ORDER BY uv.IsUsed ASC, uv.AssignedAt DESC
    `, [userId]);

    // Auto-sync: Nếu promotions_code.IsUsed = 1 nhưng UserVouchers.IsUsed = 0, tự đồng bộ
    for (const row of rows) {
      if (!row.IsUsed && row.SpecificCode) {
        const [codeCheck] = await pool.query(
          "SELECT IsUsed FROM promotions_code WHERE CodeValue = ? AND IsUsed = 1",
          [row.SpecificCode]
        );
        if (codeCheck.length > 0) {
          // Đồng bộ lại UserVouchers
          await pool.query(
            "UPDATE UserVouchers SET IsUsed = 1 WHERE VoucherID = ?",
            [row.VoucherID]
          );
          row.IsUsed = 1;
          console.log(`[SYNC] Auto-sync UserVouchers VoucherID=${row.VoucherID} → IsUsed=1`);
        }
      }
    }

    const mappedRows = rows.map(r => ({
      ...r,
      Code: r.SpecificCode ? r.SpecificCode : r.Code
    }));

    res.status(200).json({ success: true, data: mappedRows });
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
      `SELECT pc.CodeID, pc.CodeValue, pc.IsUsed, pc.CreatedAt, pc.AssignedToUserID,
              u.FullName AS AssignedToUserName
       FROM promotions_code pc
       LEFT JOIN Users u ON pc.AssignedToUserID = u.UserID
       WHERE pc.PromotionID = ? 
       ORDER BY pc.AssignedToUserID DESC, pc.CreatedAt DESC`,
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
