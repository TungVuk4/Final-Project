const express = require("express");
const pool = require("../../dbpool/db");
const { requireAuth } = require("../../middlewares/auth");
const router = express.Router();

// ----------------------------------------------------------------
// [GUEST] Helper: Lấy hoặc tạo CartID cho khách vãng lai theo GuestToken
// ----------------------------------------------------------------
const getOrCreateGuestCart = async (guestToken) => {
  if (!guestToken) return null;
  const [rows] = await pool.query(
    `SELECT CartID FROM Shopping_Carts WHERE GuestToken = ?`,
    [guestToken]
  );
  if (rows.length > 0) return rows[0].CartID;
  const [result] = await pool.query(
    `INSERT INTO Shopping_Carts (UserID, GuestToken) VALUES (NULL, ?)`,
    [guestToken]
  );
  return result.insertId;
};

// ----------------------------------------------------------------
// GET /api/cart/guest?guestToken=xxx — Xem giỏ hàng khách vãng lai
// ----------------------------------------------------------------
router.get("/guest", async (req, res) => {
  const { guestToken } = req.query;
  if (!guestToken) return res.status(400).json({ message: "Thiếu guestToken." });
  try {
    const cartId = await getOrCreateGuestCart(guestToken);
    const sql = `
      SELECT ci.ItemID, ci.ProductID, ci.Quantity, ci.size, p.ProductName, p.Price, p.DiscountPercent, p.StockQuantity,
             (SELECT FileName FROM Image WHERE ProductID = p.ProductID LIMIT 1) as image
      FROM Cart_Items ci
      JOIN Products p ON ci.ProductID = p.ProductID
      WHERE ci.CartID = ?
    `;
    const [items] = await pool.query(sql, [cartId]);
    let total = 0;
    items.forEach((item) => {
      const discountPercent = item.DiscountPercent || 0;
      const finalPrice = discountPercent > 0 ? (item.Price * (1 - discountPercent / 100)) : item.Price;
      total += item.Quantity * finalPrice;
    });
    res.status(200).json({ success: true, cartId, items, totalAmount: total });
  } catch (error) {
    console.error("Lỗi lấy giỏ hàng guest:", error);
    res.status(500).json({ error: "Lỗi server" });
  }
});

// ----------------------------------------------------------------
// POST /api/cart/guest/add — Thêm sản phẩm vào giỏ khách vãng lai
// ----------------------------------------------------------------
router.post("/guest/add", async (req, res) => {
  const { guestToken, productId, quantity = 1, size } = req.body;
  if (!guestToken) return res.status(400).json({ message: "Thiếu guestToken." });
  if (!productId) return res.status(400).json({ message: "Thiếu productId." });
  if (!size) return res.status(400).json({ message: "Vui lòng chọn size." });
  try {
    const cartId = await getOrCreateGuestCart(guestToken);
    const [existing] = await pool.query(
      `SELECT ItemID, Quantity FROM Cart_Items WHERE CartID = ? AND ProductID = ? AND size = ?`,
      [cartId, productId, size]
    );
    if (existing.length > 0) {
      const newQty = existing[0].Quantity + parseInt(quantity);
      await pool.query(`UPDATE Cart_Items SET Quantity = ? WHERE ItemID = ?`, [newQty, existing[0].ItemID]);
      return res.status(200).json({ success: true, message: "Đã tăng số lượng." });
    }
    await pool.query(
      `INSERT INTO Cart_Items (CartID, ProductID, Quantity, size) VALUES (?, ?, ?, ?)`,
      [cartId, productId, quantity, size]
    );
    res.status(201).json({ success: true, message: "Đã thêm vào giỏ hàng." });
  } catch (error) {
    console.error("Lỗi thêm giỏ hàng guest:", error);
    res.status(500).json({ error: "Lỗi server" });
  }
});

// ----------------------------------------------------------------
// DELETE /api/cart/guest/remove/:productId?guestToken=xxx&size=xxx
// ----------------------------------------------------------------
router.delete("/guest/remove/:productId", async (req, res) => {
  const { guestToken, size } = req.query;
  const { productId } = req.params;
  if (!guestToken) return res.status(400).json({ message: "Thiếu guestToken." });
  try {
    const cartId = await getOrCreateGuestCart(guestToken);
    let sql = `DELETE FROM Cart_Items WHERE CartID = ? AND ProductID = ?`;
    let params = [cartId, productId];
    if (size) { sql += ` AND size = ?`; params.push(size); }
    const [result] = await pool.query(sql, params);
    if (result.affectedRows === 0) return res.status(404).json({ success: false, message: "Không tìm thấy để xóa." });
    res.status(200).json({ success: true, message: "Đã xóa khỏi giỏ hàng." });
  } catch (error) {
    res.status(500).json({ error: "Lỗi server" });
  }
});

// ----------------------------------------------------------------
// Middleware tìm hoặc tạo CartID (cho User đã đăng nhập)
// ----------------------------------------------------------------
const getOrCreateCart = async (req, res, next) => {
  const userId = req.user.userId;
  try {
    let [cartRows] = await pool.query(
      `SELECT CartID FROM Shopping_Carts WHERE UserID = ?`,
      [userId]
    );
    if (cartRows.length === 0) {
      const [result] = await pool.query(
        `INSERT INTO Shopping_Carts (UserID) VALUES (?)`,
        [userId]
      );
      req.cartId = result.insertId;
    } else {
      req.cartId = cartRows[0].CartID;
    }
    next();
  } catch (error) {
    console.error("Lỗi khi lấy/tạo giỏ hàng:", error);
    res.status(500).json({ error: "Lỗi server" });
  }
};

// Áp dụng cho các route cần auth (đặt SAU các guest routes)
router.use(requireAuth, getOrCreateCart);

// ----------------------------------------------------------------
// GET /api/cart - Xem giỏ hàng (Hiển thị cả Size)
// ----------------------------------------------------------------
router.get("/", async (req, res) => {
  try {
    const sql = `
            SELECT ci.ItemID, ci.ProductID, ci.Quantity, ci.size, p.ProductName, p.Price, p.DiscountPercent, p.StockQuantity,
                   (SELECT FileName FROM Image WHERE ProductID = p.ProductID LIMIT 1) as image
            FROM Cart_Items ci
            JOIN Products p ON ci.ProductID = p.ProductID
            WHERE ci.CartID = ?
        `;
    const [items] = await pool.query(sql, [req.cartId]);

    let total = 0;
    items.forEach((item) => {
      const discountPercent = item.DiscountPercent || 0;
      const finalPrice = discountPercent > 0 ? (item.Price * (1 - discountPercent / 100)) : item.Price;
      total += item.Quantity * finalPrice;
    });

    res.status(200).json({
      success: true,
      cartId: req.cartId,
      items: items,
      totalAmount: total,
    });
  } catch (error) {
    console.error("Lỗi khi lấy giỏ hàng:", error);
    res.status(500).json({ error: "Lỗi server" });
  }
});

// ----------------------------------------------------------------
// POST /api/cart/add - Thêm vào giỏ (Đã sửa lỗi ProductID và thêm Size)
// ----------------------------------------------------------------
router.post("/add", async (req, res) => {
  // Lấy thêm size từ body
  const { productId, quantity = 1, size } = req.body;
  const cartId = req.cartId; // Lấy từ Middleware trên đầu

  if (!productId) return res.status(400).json({ message: "Thiếu productId." });
  if (!size) return res.status(400).json({ message: "Vui lòng chọn size." });

  try {
    // Kiểm tra xem cùng sản phẩm và CÙNG SIZE đã có trong giỏ chưa
    const [existingItem] = await pool.query(
      `SELECT ItemID, Quantity FROM Cart_Items WHERE CartID = ? AND ProductID = ? AND size = ?`,
      [cartId, productId, size]
    );

    if (existingItem.length > 0) {
      const newQuantity = existingItem[0].Quantity + parseInt(quantity);
      await pool.query(`UPDATE Cart_Items SET Quantity = ? WHERE ItemID = ?`, [
        newQuantity,
        existingItem[0].ItemID,
      ]);
      return res
        .status(200)
        .json({ success: true, message: "Đã tăng số lượng sản phẩm." });
    } else {
      await pool.query(
        `INSERT INTO Cart_Items (CartID, ProductID, Quantity, size) VALUES (?, ?, ?, ?)`,
        [cartId, productId, quantity, size]
      );
      return res
        .status(201)
        .json({ success: true, message: "Đã thêm vào giỏ hàng." });
    }
  } catch (error) {
    console.error("Lỗi khi thêm giỏ hàng:", error);
    res.status(500).json({ error: "Lỗi server" });
  }
});

// ----------------------------------------------------------------
// PUT /api/cart/update - Cập nhật số lượng
// ----------------------------------------------------------------
router.put("/update", async (req, res) => {
  const { productId, quantity, size } = req.body;
  const cartId = req.cartId;

  if (!productId || !size || quantity < 1) {
    return res.status(400).json({ message: "Thiếu thông tin cập nhật." });
  }

  try {
    const [result] = await pool.query(
      `UPDATE Cart_Items SET Quantity = ? WHERE CartID = ? AND ProductID = ? AND size = ?`,
      [quantity, cartId, productId, size]
    );

    if (result.affectedRows === 0) {
      return res
        .status(404)
        .json({ success: false, message: "Sản phẩm không có trong giỏ." });
    }
    res.status(200).json({ success: true, message: "Cập nhật thành công." });
  } catch (error) {
    res.status(500).json({ error: "Lỗi server" });
  }
});

// ----------------------------------------------------------------
// DELETE /api/cart/remove/:product_id
// ----------------------------------------------------------------
router.delete("/remove/:product_id", async (req, res) => {
  const productID = req.params.product_id;
  const cartId = req.cartId;
  // Lưu ý: Nếu muốn xóa chính xác theo size, cần thêm query parameter ?size=L
  const size = req.query.size;

  try {
    let sql = `DELETE FROM Cart_Items WHERE CartID = ? AND ProductID = ?`;
    let params = [cartId, productID];

    if (size) {
      sql += ` AND size = ?`;
      params.push(size);
    }

    const [result] = await pool.query(sql, params);

    if (result.affectedRows === 0) {
      return res
        .status(404)
        .json({ success: false, message: "Không tìm thấy để xóa." });
    }
    res.status(200).json({ success: true, message: "Đã xóa khỏi giỏ hàng." });
  } catch (error) {
    res.status(500).json({ error: "Lỗi server" });
  }
});

module.exports = router;
