// routes/api/orders.js
const express = require("express");
const pool = require("../../dbpool/db");
const { requireAuth, requireAdmin } = require("../../middlewares/auth");
const router = express.Router();

// ----------------------------------------------------------------
// [CUSTOMER] Đặt hàng (Checkout) - SỬ DỤNG TRANSACTION
// POST /api/orders/checkout
// ----------------------------------------------------------------
router.post("/checkout", requireAuth, async (req, res) => {
  const userId = req.user.userId;
  let connection;
  const { ShippingAddress, PromotionCode, PaymentMethod } = req.body; // THÊM PaymentMethod

  if (!ShippingAddress || !PaymentMethod) {
    return res.status(400).json({
      message: "Vui lòng cung cấp Địa chỉ giao hàng và Phương thức thanh toán.",
    });
  }

  // Kiểm tra PaymentMethod hợp lệ
  const validMethods = ["COD", "MOMO", "BANK TRANSFER"];
  if (!validMethods.includes(PaymentMethod.toUpperCase())) {
    return res
      .status(400)
      .json({ message: "Phương thức thanh toán không hợp lệ." });
  }

  try {
    connection = await pool.getConnection();
    await connection.beginTransaction();

    // 1. Lấy Cart ID của người dùng
    const [cartRows] = await connection.query(
      "SELECT CartID FROM Shopping_Carts WHERE UserID = ?",
      [userId]
    );
    if (cartRows.length === 0) {
      await connection.rollback();
      // Lỗi này không nên xảy ra nếu user được tạo đúng cách
      return res.status(404).json({ error: "Không tìm thấy giỏ hàng." });
    }
    const cartId = cartRows[0].CartID;

    // 2. Lấy chi tiết sản phẩm trong giỏ hàng
    const [cartItems] = await connection.query(
      `SELECT ci.ProductID, ci.Quantity, p.Price 
             FROM Cart_Items ci 
             JOIN Products p ON ci.ProductID = p.ProductID 
             WHERE ci.CartID = ?`,
      [cartId]
    );

    if (cartItems.length === 0) {
      await connection.rollback();
      return res
        .status(400)
        .json({ error: "Giỏ hàng rỗng. Vui lòng thêm sản phẩm." });
    }

    let totalAmount = 0;
    let discount = 0;
    let promotionId = null;

    // 3. Xử lý Khuyến mãi (Giả định logic này hoạt động)
    if (PromotionCode) {
      // ... (Logic kiểm tra mã khuyến mãi và tính discount) ...
      // Đặt promotionId nếu hợp lệ
    }

    // 4. Tính TotalAmount (sau khi đã tính discount)
    cartItems.forEach((item) => {
      totalAmount += item.Quantity * item.Price;
    });

    // Áp dụng khuyến mãi nếu có
    const finalAmount = totalAmount * (1 - discount);

    // 5. Thiết lập Trạng thái Đơn hàng ban đầu
    let initialStatus;
    if (PaymentMethod.toUpperCase() === "COD") {
      initialStatus = "PENDING_COD"; // Chờ giao hàng để thu tiền
    } else {
      initialStatus = "AWAITING_PAYMENT"; // Chờ thanh toán online
    }

    // 6. Tạo Đơn hàng mới (Orders)
    const [orderResult] = await connection.query(
      `INSERT INTO Orders (UserID, TotalAmount, Status, ShippingAddress, PromotionID, PaymentMethod)
             VALUES (?, ?, ?, ?, ?, ?)`,
      [
        userId,
        finalAmount,
        initialStatus,
        ShippingAddress,
        promotionId,
        PaymentMethod,
      ] // THÊM PaymentMethod
    );
    const orderId = orderResult.insertId;

    // 7. Thêm chi tiết đơn hàng (OrderDetails)
    const orderDetailsValues = cartItems.map((item) => [
      orderId,
      item.ProductID,
      item.Quantity,
      item.Price, // Giá tại thời điểm đặt hàng
    ]);

    await connection.query(
      `INSERT INTO OrderDetails (OrderID, ProductID, Quantity, Price) VALUES ?`,
      [orderDetailsValues]
    );

    // 8. Xóa giỏ hàng (Cart_Items)
    await connection.query("DELETE FROM Cart_Items WHERE CartID = ?", [cartId]);

    await connection.commit();

    res.status(201).json({
      success: true,
      message: "Đặt hàng thành công.",
      orderId: orderId,
      status: initialStatus,
    });
  } catch (error) {
    if (connection) await connection.rollback();
    console.error("Lỗi khi checkout:", error);
    res.status(500).json({ error: "Lỗi server" });
  } finally {
    if (connection) connection.release();
  }
});

// ----------------------------------------------------------------
// [CUSTOMER] Lịch sử đơn hàng
// GET /api/orders
// ----------------------------------------------------------------
router.get("/", requireAuth, requireAdmin, async (req, res) => {
  const userId = req.user.userId;
  try {
    const sql = `
            SELECT OrderID, OrderDate, TotalAmount, Status, ShippingAddress 
            FROM Orders 
            WHERE UserID = ? 
            ORDER BY OrderDate DESC
        `;
    const [orders] = await pool.query(sql, [userId]);
    res.status(200).json({ success: true, data: orders });
  } catch (error) {
    console.error("Lỗi khi lấy lịch sử đơn hàng:", error);
    res.status(500).json({ error: "Lỗi server" });
  }
});

// ----------------------------------------------------------------
// [ADMIN] Quản lý đơn hàng (Lấy tất cả)
// GET /api/orders/admin
// ----------------------------------------------------------------
router.get("/admin", requireAuth, requireAdmin, async (req, res) => {
  try {
    const sql = `
            SELECT o.*, u.FullName 
            FROM Orders o
            JOIN Users u ON o.UserID = u.UserID
            ORDER BY o.OrderDate DESC
        `;
    const [orders] = await pool.query(sql);
    res.status(200).json({ success: true, data: orders });
  } catch (error) {
    console.error("Lỗi khi lấy danh sách đơn hàng Admin:", error);
    res.status(500).json({ error: "Lỗi server" });
  }
});

// ----------------------------------------------------------------
// [ADMIN] Cập nhật trạng thái đơn hàng
// PUT /api/orders/admin/:id/status
// ----------------------------------------------------------------
router.put("/admin/:id/status", requireAuth, requireAdmin, async (req, res) => {
  const orderId = req.params.id;
  const { Status } = req.body; // Trạng thái mới: 'Đang giao', 'Đã giao', 'Đã hủy'

  // Đảm bảo trạng thái hợp lệ
  const validStatuses = ["Chờ xử lý", "Đang giao", "Đã giao", "Đã hủy"];
  if (!validStatuses.includes(Status)) {
    return res.status(400).json({ message: "Trạng thái không hợp lệ." });
  }

  try {
    const [result] = await pool.query(
      `UPDATE Orders SET Status = ? WHERE OrderID = ?`,
      [Status, orderId]
    );

    if (result.affectedRows === 0) {
      return res
        .status(404)
        .json({ success: false, message: "Không tìm thấy đơn hàng." });
    }
    res.status(200).json({
      success: true,
      message: `Cập nhật trạng thái đơn hàng ${orderId} thành ${Status} thành công.`,
    });
  } catch (error) {
    console.error("Lỗi khi cập nhật trạng thái đơn hàng:", error);
    res.status(500).json({ error: "Lỗi server" });
  }
});

// ----------------------------------------------------------------
// [CUSTOMER] Xử lý Thanh toán cho Đơn hàng (Cần xác thực)
// POST /api/orders/pay
// ----------------------------------------------------------------
router.post("/pay", requireAuth, async (req, res) => {
  const userId = req.user.userId;
  const { orderId, paymentMethod } = req.body;
  let connection;

  if (!orderId || !paymentMethod) {
    return res
      .status(400)
      .json({ message: "Thiếu Order ID và Phương thức thanh toán." });
  }

  try {
    connection = await pool.getConnection();
    await connection.beginTransaction();

    // 1. Xác minh Đơn hàng và Lấy tổng tiền
    const [orderRows] = await connection.query(
      "SELECT TotalAmount, Status, PaymentMethod FROM Orders WHERE OrderID = ? AND UserID = ?",
      [orderId, userId]
    );

    if (orderRows.length === 0) {
      await connection.rollback();
      return res.status(404).json({
        message: "Không tìm thấy đơn hàng hoặc đơn hàng không thuộc về bạn.",
      });
    }

    const order = orderRows[0];

    // KIỂM TRA QUAN TRỌNG: Chỉ cho phép thanh toán khi đang chờ thanh toán online
    if (order.Status !== "AWAITING_PAYMENT") {
      await connection.rollback();
      return res.status(400).json({
        message: `Đơn hàng đã ở trạng thái: ${order.Status}. Chỉ đơn hàng AWAITING_PAYMENT mới có thể thanh toán online.`,
      });
    }

    // KIỂM TRA PHƯƠNG THỨC: Đảm bảo khách hàng thanh toán bằng phương thức đã chọn
    if (order.PaymentMethod.toUpperCase() !== paymentMethod.toUpperCase()) {
      await connection.rollback();
      return res.status(400).json({
        message: `Phương thức thanh toán đã chọn là ${order.PaymentMethod}. Vui lòng sử dụng đúng phương thức.`,
      });
    }

    let transactionStatus = "Failed"; // Mặc định là Failed
    let newOrderStatus = "AWAITING_PAYMENT";

    // 2. Xử lý logic theo Phương thức Thanh toán
    switch (paymentMethod.toUpperCase()) {
      case "MOMO":
      case "BANK TRANSFER":
        // Ở đây: Tích hợp và gọi API Momo/Bank.
        // Giả định giao dịch thành công:
        transactionStatus = "Thành công";
        newOrderStatus = "PROCESSING"; // Bắt đầu xử lý đơn hàng
        break;
      default:
        await connection.rollback();
        return res.status(400).json({
          message:
            "Phương thức thanh toán không hợp lệ cho API này (Chỉ chấp nhận MOMO/BANK TRANSFER).",
        });
    }

    // 3. Tạo bản ghi Giao dịch
    await connection.query(
      `INSERT INTO Payment_Transactions 
     (OrderID, PaymentMethod, Amount, Status) 
     VALUES (?, ?, ?, ?)`, // <-- THAY TransactionStatus thành Status
      [orderId, paymentMethod, order.TotalAmount, transactionStatus] // Giữ nguyên tên biến JS
    );

    // 4. Cập nhật trạng thái Đơn hàng
    await connection.query("UPDATE Orders SET Status = ? WHERE OrderID = ?", [
      newOrderStatus,
      orderId,
    ]);

    await connection.commit();

    res.status(200).json({
      success: true,
      message: `Thanh toán ${paymentMethod} thành công. Đơn hàng chuyển sang trạng thái: ${newOrderStatus}.`,
      transactionStatus: transactionStatus,
    });
  } catch (error) {
    if (connection) await connection.rollback();
    console.error("Lỗi khi xử lý thanh toán:", error);

    // THAY DÒNG NÀY (Để thấy lỗi SQL thực sự):
    console.error("--- DEBUG PAY ERROR: Lỗi chi tiết SQL:", error.message);
    console.error("DEBUG STACK:", error); // In ra toàn bộ lỗi
    res.status(500).json({ error: "Lỗi server khi thanh toán" });
  } finally {
    if (connection) connection.release();
  }
});
module.exports = router;
