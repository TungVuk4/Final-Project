// routes/api/orders.js
const express = require("express");
const pool = require("../../dbpool/db");
const nodemailer = require("nodemailer");
const {
  requireAuth,
  requireAdmin,
  requireAdminLevel1,
  requireAdminLevel3,
} = require("../../middlewares/auth");
const router = express.Router();

// Nodemailer transporter (dùng chung với auth)
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
  tls: { rejectUnauthorized: false },
});

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

    // 9. Trừ tồn kho và cảnh báo hết hàng
    for (const item of cartItems) {
      await connection.query('UPDATE Products SET Stock = Stock - ? WHERE ProductID = ?', [item.Quantity, item.ProductID]);
      const [stockCheck] = await connection.query('SELECT ProductName, Stock FROM Products WHERE ProductID = ?', [item.ProductID]);
      if (stockCheck[0] && stockCheck[0].Stock <= 0) {
        await connection.query('INSERT INTO Notifications (Type, Message, ProductID) VALUES (?, ?, ?)', 
          ['OUT_OF_STOCK', `Sản phẩm ${stockCheck[0].ProductName} đã hết hàng. Vui lòng nhập thêm!`, item.ProductID]
        );
      }
    }

    await connection.commit();

    // 📧 Gửi email thông báo đến Admin Vận Hành (Admin 3) khi có đơn hàng mới
    try {
      const [userRows] = await pool.query(
        "SELECT FullName, Email FROM Users WHERE UserID = ?",
        [userId]
      );
      const customerName = userRows[0]?.FullName || "Khách hàng";
      const customerEmail = userRows[0]?.Email || "";

      await transporter.sendMail({
        from: process.env.EMAIL_USER,
        to: "admin3@fashionstyle.com",
        subject: `[FashionStyle] ⚠️ Đơn hàng mới #${orderId} cần xử lý`,
        html: `
          <div style="font-family:Arial,sans-serif;max-width:600px;">
            <h2 style="color:#059669;">📦 Có đơn hàng mới cần xử lý!</h2>
            <table style="width:100%;border-collapse:collapse;">
              <tr><td style="padding:8px;font-weight:bold;">Mã đơn hàng:</td><td style="padding:8px;">#${orderId}</td></tr>
              <tr style="background:#f9fafb;"><td style="padding:8px;font-weight:bold;">Khách hàng:</td><td style="padding:8px;">${customerName} (${customerEmail})</td></tr>
              <tr><td style="padding:8px;font-weight:bold;">Tổng tiền:</td><td style="padding:8px;">${finalAmount.toLocaleString("vi-VN")} VNĐ</td></tr>
              <tr style="background:#f9fafb;"><td style="padding:8px;font-weight:bold;">Địa chỉ giao:</td><td style="padding:8px;">${ShippingAddress}</td></tr>
              <tr><td style="padding:8px;font-weight:bold;">Phương thức TT:</td><td style="padding:8px;">${PaymentMethod}</td></tr>
              <tr style="background:#f9fafb;"><td style="padding:8px;font-weight:bold;">Trạng thái:</td><td style="padding:8px;"><b>${initialStatus}</b></td></tr>
            </table>
            <br/>
            <p style="color:#6b7280;">👉 Vui lòng vào <a href="http://localhost:5174">Trang Admin</a> để lên đơn hàng và chờ Admin Chính duyệt.</p>
          </div>
        `,
      });
    } catch (mailErr) {
      console.warn("⚠️  Không gửi được email thông báo Admin3:", mailErr.message);
    }

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
// [GUEST] Đặt hàng không cần đăng nhập (Guest Checkout)
// POST /api/orders/guest-checkout
// ----------------------------------------------------------------
router.post("/guest-checkout", async (req, res) => {
  let connection;
  const { ShippingAddress, PaymentMethod, CustomerName, CustomerEmail, CustomerPhone, cartItems } = req.body;

  if (!ShippingAddress || !PaymentMethod || !cartItems || cartItems.length === 0 || !CustomerName || !CustomerPhone) {
    return res.status(400).json({ message: "Vui lòng cung cấp đủ thông tin nhận hàng và giỏ hàng." });
  }

  const validMethods = ["COD", "MOMO", "BANK TRANSFER"];
  if (!validMethods.includes(PaymentMethod.toUpperCase())) {
    return res.status(400).json({ message: "Phương thức thanh toán không hợp lệ." });
  }

  try {
    connection = await pool.getConnection();
    await connection.beginTransaction();

    let totalAmount = 0;
    // Lấy thông tin giá hiện tại từ database để bảo mật
    for (let i = 0; i < cartItems.length; i++) {
      const [prodRows] = await connection.query('SELECT Price FROM Products WHERE ProductID = ?', [cartItems[i].ProductID]);
      if (prodRows.length === 0) throw new Error(`Sản phẩm ${cartItems[i].ProductID} không tồn tại`);
      cartItems[i].Price = prodRows[0].Price;
      totalAmount += cartItems[i].Quantity * cartItems[i].Price;
    }

    let initialStatus = PaymentMethod.toUpperCase() === "COD" ? "PENDING_COD" : "AWAITING_PAYMENT";

    // Format địa chỉ gom chung tên và SĐT
    const finalAddress = `${CustomerName} - ${CustomerPhone} - ${ShippingAddress}`;

    const [orderResult] = await connection.query(
      `INSERT INTO Orders (UserID, TotalAmount, Status, ShippingAddress, PaymentMethod) VALUES (NULL, ?, ?, ?, ?)`,
      [totalAmount, initialStatus, finalAddress, PaymentMethod]
    );
    const orderId = orderResult.insertId;

    const orderDetailsValues = cartItems.map((item) => [
      orderId, item.ProductID, item.Quantity, item.Price
    ]);

    await connection.query(
      `INSERT INTO OrderDetails (OrderID, ProductID, Quantity, Price) VALUES ?`,
      [orderDetailsValues]
    );

    // Trừ tồn kho và cảnh báo hết hàng
    for (const item of cartItems) {
      await connection.query('UPDATE Products SET Stock = Stock - ? WHERE ProductID = ?', [item.Quantity, item.ProductID]);
      const [stockCheck] = await connection.query('SELECT ProductName, Stock FROM Products WHERE ProductID = ?', [item.ProductID]);
      if (stockCheck[0] && stockCheck[0].Stock <= 0) {
        await connection.query('INSERT INTO Notifications (Type, Message, ProductID) VALUES (?, ?, ?)', 
          ['OUT_OF_STOCK', `Sản phẩm ${stockCheck[0].ProductName} đã hết hàng. Vui lòng nhập thêm!`, item.ProductID]
        );
      }
    }

    await connection.commit();

    // 📧 Gửi email thông báo đơn mới (Cho Admin)
    try {
      await transporter.sendMail({
        from: process.env.EMAIL_USER,
        to: "admin3@fashionstyle.com",
        subject: `[FashionStyle] ⚠️ Đơn hàng GUEST mới #${orderId}`,
        html: `<p>Có đơn hàng mới từ Khách vãng lai: ${CustomerName} - ${CustomerPhone}</p><p>Tổng tiền: <b>${totalAmount.toLocaleString('vi-VN')} VNĐ</b></p><p>Địa chỉ: ${ShippingAddress}</p>`
      });
    } catch (e) { console.warn("Lỗi gửi mail GUEST to Admin", e.message); }

    // Gửi email xác nhận cho Khách
    if (CustomerEmail) {
       try {
         await transporter.sendMail({
            from: process.env.EMAIL_USER,
            to: CustomerEmail,
            subject: `[FashionStyle] Xác nhận đặt hàng #${orderId}`,
            html: `<div style="font-family:Arial,sans-serif;max-width:600px;">
                    <h2 style="color:#059669;">Cảm ơn bạn đã mua sắm! 🎉</h2>
                    <p>Xin chào ${CustomerName},</p>
                    <p>Đơn hàng <b>#${orderId}</b> của bạn trị giá <b>${totalAmount.toLocaleString('vi-VN')} VNĐ</b> đã được tiếp nhận. 
                    Chúng tôi sẽ sớm liên hệ qua số điện thoại <b>${CustomerPhone}</b> để giao hàng đến địa chỉ <i>${ShippingAddress}</i>.</p>
                   </div>`
         });
       } catch (e) { console.warn("Lỗi gửi mail GUEST to Khách", e.message); }
    }

    res.status(201).json({ success: true, message: "Đặt hàng thành công.", orderId, status: initialStatus });
  } catch (error) {
    if (connection) await connection.rollback();
    console.error("Lỗi guest checkout:", error);
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

// [ADMIN 1 + 3] Xem tất cả đơn hàng — requireAdminLevel3
// GET /api/orders/admin
router.get("/admin", requireAuth, requireAdminLevel3, async (req, res) => {
  try {
    const sql = `
            SELECT o.*, u.FullName, u.Email, u.PhoneNumber
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

// [ADMIN 1 ONLY] Duyệt / Từ chối đơn hàng — requireAdminLevel1
// PUT /api/orders/admin/:id/approve
router.put("/admin/:id/approve", requireAuth, requireAdminLevel1, async (req, res) => {
  const orderId = req.params.id;
  const { Action, Reason } = req.body; // Action: 'APPROVE' | 'REJECT'

  if (!Action || !["APPROVE", "REJECT"].includes(Action.toUpperCase())) {
    return res.status(400).json({ message: "Action phải là 'APPROVE' hoặc 'REJECT'." });
  }

  try {
    const newStatus = Action.toUpperCase() === "APPROVE" ? "PROCESSING" : "CANCELLED";
    const [result] = await pool.query(
      "UPDATE Orders SET Status = ? WHERE OrderID = ?",
      [newStatus, orderId]
    );
    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: "Không tìm thấy đơn hàng." });
    }

    // Lấy thông tin đơn hàng để gửi email
    const [orderRows] = await pool.query(
      `SELECT o.*, u.FullName, u.Email FROM Orders o JOIN Users u ON o.UserID = u.UserID WHERE o.OrderID = ?`,
      [orderId]
    );
    const order = orderRows[0];

    // 📧 Gửi email cho khách hàng
    if (order?.Email) {
      const isApproved = Action.toUpperCase() === "APPROVE";
      try {
        await transporter.sendMail({
          from: process.env.EMAIL_USER,
          to: order.Email,
          subject: isApproved
            ? `[FashionStyle] ✅ Đơn hàng #${orderId} đã được xác nhận!`
            : `[FashionStyle] ❌ Đơn hàng #${orderId} đã bị từ chối`,
          html: isApproved
            ? `<h3>Xin chào ${order.FullName}! 🎉</h3><p>Đơn hàng <b>#${orderId}</b> của bạn đã được <b style="color:green;">xác nhận</b> và đang được Admin chuẩn bị giao.</p>`
            : `<h3>Xin chào ${order.FullName},</h3><p>Rất tiếc! Đơn hàng <b>#${orderId}</b> đã bị <b style="color:red;">từ chối</b>. Lý do: <i>${Reason || "Không có lý do cụ thể"}</i>.</p><p>Bạn có thể liên hệ chúng tôi để được hỗ trợ.</p>`,
        });
      } catch (mailErr) {
        console.warn("⚠️  Không gửi được email cho khách:", mailErr.message);
      }
    }

    // 📧 Thông báo cho Admin 3 kết quả duyệt
    try {
      await transporter.sendMail({
        from: process.env.EMAIL_USER,
        to: "admin3@fashionstyle.com",
        subject: `[FashionStyle] Đơn #${orderId} → ${Action.toUpperCase() === "APPROVE" ? "ĐÃ DUYỆT ✅" : "BỊ TỪ CHỐI ❌"}`,
        html: `<p>Đơn hàng <b>#${orderId}</b> vừa được Admin Chính <b>${Action.toUpperCase() === "APPROVE" ? "duyệt" : "từ chối"}</b>.</p>${Reason ? `<p>Lý do: ${Reason}</p>` : ""}<p>Trạng thái mới: <b>${newStatus}</b></p>`,
      });
    } catch (mailErr) {
      console.warn("⚠️  Không gửi được email cho Admin3:", mailErr.message);
    }

    res.status(200).json({
      success: true,
      message: `Đơn hàng #${orderId} đã ${Action.toUpperCase() === "APPROVE" ? "được duyệt" : "bị từ chối"}.`,
      newStatus,
    });
  } catch (error) {
    console.error("Lỗi khi duyệt đơn hàng:", error);
    res.status(500).json({ error: "Lỗi server" });
  }
});

// [ADMIN 1 + 3] Cập nhật trạng thái vận chuyển — requireAdminLevel3
// PUT /api/orders/admin/:id/status
router.put("/admin/:id/status", requireAuth, requireAdminLevel3, async (req, res) => {
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

// ----------------------------------------------------------------
// [ADMIN 1 + 3] Lay lich su don hang cua 1 user cu the
// GET /api/orders/admin/user/:userID
// ----------------------------------------------------------------
router.get('/admin/user/:userID', requireAuth, requireAdmin, async (req, res) => {
  const { userID } = req.params;
  try {
    const [orders] = await pool.query(
      `SELECT o.OrderID, o.TotalAmount, o.Status, o.PaymentMethod,
              o.ShippingAddress, o.OrderDate as CreatedAt,
              COUNT(od.ProductID) as itemCount
       FROM orders o
       LEFT JOIN orderdetails od ON o.OrderID = od.OrderID
       WHERE o.UserID = ?
       GROUP BY o.OrderID
       ORDER BY o.OrderDate DESC`,
      [userID]
    );
    res.status(200).json({ success: true, data: orders });
  } catch (error) {
    console.error('Loi lay orders theo user:', error.message);
    res.status(500).json({ error: 'Loi server: ' + error.message });
  }
});
module.exports = router;
