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
// [CUSTOMER] Lấy danh sách đơn hàng của chính mình
// GET /api/orders/my-orders
// ----------------------------------------------------------------
router.get("/my-orders", requireAuth, async (req, res) => {
  const userId = req.user.userId;
  try {
    const [orders] = await pool.query(
      `SELECT o.OrderID, o.OrderDate, o.TotalAmount, o.Status, o.ShippingAddress, o.PaymentMethod
       FROM Orders o
       WHERE o.UserID = ?
       ORDER BY o.OrderDate DESC`,
      [userId]
    );
    res.status(200).json({ success: true, data: orders });
  } catch (error) {
    console.error("Lỗi lấy đơn hàng của user:", error);
    res.status(500).json({ error: "Lỗi server khi lấy đơn hàng" });
  }
});

// ----------------------------------------------------------------
// [CUSTOMER] Xem chi tiết 1 đơn hàng của mình
// GET /api/orders/my-orders/:id
// ----------------------------------------------------------------
router.get("/my-orders/:id", requireAuth, async (req, res) => {
  const userId = req.user.userId;
  const orderId = req.params.id;
  try {
    // Lấy thông tin đơn hàng, kiểm tra phải thuộc user này
    const [orderRows] = await pool.query(
      `SELECT o.OrderID, o.OrderDate, o.TotalAmount, o.Status, o.ShippingAddress, o.PaymentMethod
       FROM Orders o
       WHERE o.OrderID = ? AND o.UserID = ?`,
      [orderId, userId]
    );
    if (orderRows.length === 0) {
      return res.status(404).json({ success: false, message: "Không tìm thấy đơn hàng." });
    }
    const order = orderRows[0];

    // Lấy danh sách sản phẩm trong đơn (dùng đúng cột Price theo schema)
    const [items] = await pool.query(
      `SELECT od.Quantity, od.Price as UnitPrice, p.ProductName, COALESCE(p.DiscountPercent, 0) as DiscountPercent,
              (SELECT FileName FROM Image WHERE ProductID = p.ProductID LIMIT 1) as image
       FROM OrderDetails od
       JOIN Products p ON od.ProductID = p.ProductID
       WHERE od.OrderID = ?`,
      [orderId]
    );

    res.status(200).json({ success: true, data: { ...order, items } });
  } catch (error) {
    console.error("Lỗi lấy chi tiết đơn hàng:", error.message, error.sqlMessage || "");
    res.status(500).json({ error: "Lỗi server khi lấy chi tiết đơn hàng", detail: error.message });
  }
});


// ----------------------------------------------------------------
// [CUSTOMER] Đặt hàng (Checkout) - SỬ DỤNG TRANSACTION
// POST /api/orders/checkout
// ----------------------------------------------------------------
router.post("/checkout", requireAuth, async (req, res) => {
  const userId = req.user.userId;
  let connection;
  const { ShippingAddress, PromotionCode, PaymentMethod, cartItems } = req.body;

  if (!ShippingAddress || !PaymentMethod || !cartItems || cartItems.length === 0) {
    return res.status(400).json({ error: "Vui lòng cung cấp đủ thông tin nhận hàng và giỏ hàng." });
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

    // 1. Lấy Cart ID (chỉ để dọn dẹp sau khi xong)
    const [cartRows] = await connection.query(
      "SELECT CartID FROM Shopping_Carts WHERE UserID = ?",
      [userId]
    );
    const cartId = cartRows[0]?.CartID;

    // 2. Tính toán tổng tiền
    let totalAmount = 0;
    for (let i = 0; i < cartItems.length; i++) {
        const [prodRows] = await connection.query(
          'SELECT Price, COALESCE(DiscountPercent, 0) AS DiscountPercent FROM Products WHERE ProductID = ?',
          [cartItems[i].ProductID]
        );
        if (prodRows.length === 0) {
          console.error(`[CHECKOUT] Sản phẩm ID ${cartItems[i].ProductID} không tồn tại trong DB`);
          await connection.rollback();
          return res.status(400).json({ message: `Sản phẩm trong giỏ hàng không còn tồn tại (ID: ${cartItems[i].ProductID}). Vui lòng làm mới giỏ hàng.` });
        }
        const basePrice = prodRows[0].Price;
        const discountPct = prodRows[0].DiscountPercent || 0;
        // Giá sau khi giảm của sản phẩm
        cartItems[i].Price = discountPct > 0
          ? Math.round(basePrice * (1 - discountPct / 100))
          : basePrice;
        totalAmount += cartItems[i].Quantity * cartItems[i].Price;
    }

    let discount = 0;
    let promotionId = null;

    // 3. Xử lý Khuyến mãi (PromotionCode)
    if (PromotionCode) {
        console.log(`[CHECKOUT] User ${userId} đang dùng mã: ${PromotionCode}`);

        // Bước 1: Check mã dùng 1 lần trong bảng promotions_code
        const [singleUseRows] = await connection.query(
          `SELECT pc.CodeID, pc.PromotionID, p.DiscountPercent 
           FROM promotions_code pc
           JOIN Promotions p ON pc.PromotionID = p.PromotionID
           WHERE pc.CodeValue = ? AND pc.IsUsed = 0 
           AND (pc.AssignedToUserID IS NULL OR pc.AssignedToUserID = ?)
           AND p.IsActive = 1 AND p.StartDate <= CURDATE() AND p.EndDate >= CURDATE()`,
          [PromotionCode, userId]
        );

        console.log(`[CHECKOUT] Kết quả tìm mã single-use: ${singleUseRows.length} hàng`);

        if (singleUseRows.length > 0) {
          // ✅ Tìm thấy mã hợp lệ dùng 1 lần
          discount = singleUseRows[0].DiscountPercent / 100;
          promotionId = singleUseRows[0].PromotionID;
          await connection.query("UPDATE promotions_code SET IsUsed = 1 WHERE CodeID = ?", [singleUseRows[0].CodeID]);
          // Cập nhật UserVouchers để mã biến mất khỏi hồ sơ user (nếu có bản ghi)
          await connection.query(
            "UPDATE UserVouchers SET IsUsed = 1 WHERE UserID = ? AND PromotionID = ?",
            [userId, singleUseRows[0].PromotionID]
          );
          console.log(`[CHECKOUT] ✅ Áp dụng mã single-use, giảm ${singleUseRows[0].DiscountPercent}%`);
        } else {
          // Bước 2: Kiểm tra xem mã có phải là mã đã dùng rồi không
          const [alreadyUsed] = await connection.query(
            `SELECT pc.CodeID FROM promotions_code pc
             WHERE pc.CodeValue = ? AND pc.IsUsed = 1`,
            [PromotionCode]
          );
          if (alreadyUsed.length > 0) {
            console.log(`[CHECKOUT] ❌ Mã single-use đã được sử dụng rồi`);
            await connection.rollback();
            return res.status(400).json({ message: "Mã khuyến mãi này đã được sử dụng rồi!" });
          }

          // Bước 3: Fallback - kiểm tra trong bảng Promotions (mã chung theo chiến dịch)
          const [promoRows] = await connection.query(
              "SELECT PromotionID, DiscountPercent FROM Promotions WHERE Code = ? AND IsActive = 1 AND StartDate <= CURDATE() AND EndDate >= CURDATE()",
              [PromotionCode]
          );
          console.log(`[CHECKOUT] Kết quả tìm mã Promotions chung: ${promoRows.length} hàng`);

          if (promoRows.length > 0) {
              const promoId = promoRows[0].PromotionID;
              
              // Kiểm tra user đã dùng mã này chưa (trong UserVouchers)
              const [userVoucher] = await connection.query(
                  "SELECT IsUsed FROM UserVouchers WHERE UserID = ? AND PromotionID = ?",
                  [userId, promoId]
              );
              
              if (userVoucher.length > 0 && userVoucher[0].IsUsed === 1) {
                  console.log(`[CHECKOUT] ❌ UserVouchers.IsUsed = 1 cho user này`);
                  await connection.rollback();
                  return res.status(400).json({ message: "Mã khuyến mãi này bạn đã sử dụng, mỗi mã chỉ dùng được 1 lần!" });
              }
              
              // Kiểm tra đơn hàng trước chưa dùng mã này
              const [orderUsed] = await connection.query(
                  "SELECT OrderID FROM Orders WHERE UserID = ? AND PromotionID = ? AND Status != 'CANCELLED'",
                  [userId, promoId]
              );
              if (orderUsed.length > 0) {
                  console.log(`[CHECKOUT] ❌ Đã có đơn hàng #${orderUsed[0].OrderID} dùng promotionId ${promoId}`);
                  await connection.rollback();
                  return res.status(400).json({ message: "Mã khuyến mãi này bạn đã sử dụng cho đơn hàng trước đó!" });
              }

              discount = promoRows[0].DiscountPercent / 100;
              promotionId = promoId;
              console.log(`[CHECKOUT] ✅ Áp dụng mã chung, giảm ${promoRows[0].DiscountPercent}%`);
              
              // Cập nhật UserVouchers nếu có bản ghi
              if (userVoucher.length > 0) {
                  await connection.query(
                      "UPDATE UserVouchers SET IsUsed = 1 WHERE UserID = ? AND PromotionID = ?",
                      [userId, promotionId]
                  );
              }
          } else {
              console.log(`[CHECKOUT] ❌ Không tìm thấy mã "${PromotionCode}" ở bất kỳ đâu`);
              await connection.rollback();
              return res.status(400).json({ message: "Mã khuyến mãi không hợp lệ hoặc đã hết hạn." });
          }
        }
    }

    // 4. Tính TotalWithTax: Subtotal + 10% Tax - PromoDiscount
    const tax = totalAmount * 0.1;
    const discountAmount = totalAmount * discount;
    const finalAmount = Math.max(0, Math.round(totalAmount + tax - discountAmount));

    // 5. Thiết lập Trạng thái Đơn hàng ban đầu
    let initialStatus;
    if (PaymentMethod.toUpperCase() === "COD") {
      initialStatus = "PENDING_COD"; 
    } else if (PaymentMethod.toUpperCase() === "BANK TRANSFER") {
      initialStatus = "PENDING_BANK"; // Đã thanh toán qua bank, chờ Admin duyệt
    } else {
      initialStatus = "AWAITING_PAYMENT";
    }

    // 6. Tạo Đơn hàng mới (Orders)
    const [orderResult] = await connection.query(
      `INSERT INTO Orders (UserID, TotalAmount, Status, ShippingAddress, PaymentMethod)
             VALUES (?, ?, ?, ?, ?)`,
      [
        userId,
        finalAmount,
        initialStatus,
        ShippingAddress,
        PaymentMethod,
      ]
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

    // 8. Xóa giỏ hàng (Cart_Items) nếu có
    if (cartId) {
      await connection.query("DELETE FROM Cart_Items WHERE CartID = ?", [cartId]);
    }

    // 9. Trừ tồn kho và cảnh báo hết hàng
    for (const item of cartItems) {
      await connection.query('UPDATE Products SET StockQuantity = StockQuantity - ? WHERE ProductID = ?', [item.Quantity, item.ProductID]);
      const [stockCheck] = await connection.query('SELECT ProductName, StockQuantity FROM Products WHERE ProductID = ?', [item.ProductID]);
      if (stockCheck[0] && stockCheck[0].StockQuantity <= 0) {
        await connection.query('INSERT INTO Notifications (Type, Message, ProductID) VALUES (?, ?, ?)', 
          ['OUT_OF_STOCK', `Sản phẩm ${stockCheck[0].ProductName} đã hết hàng. Vui lòng nhập thêm!`, item.ProductID]
        );
      }
    }

    // 10. Ghi nhận giao dịch thanh toán vào payment_transactions (nếu không phải COD)
    if (PaymentMethod.toUpperCase() !== "COD") {
      let paymentStatus = "Đang chờ";
      let displayMethod = PaymentMethod;
      
      if (PaymentMethod.toUpperCase() === "BANK TRANSFER") {
        paymentStatus = "Thành công"; // Form đã giả lập khách xác nhận thanh toán
        displayMethod = "Chuyển khoản";
      }

      const txnCode = `TXN${Date.now().toString().slice(-6)}${Math.floor(Math.random() * 100)}`;
      
      try {
        await connection.query(
          "INSERT INTO payment_transactions (OrderID, PaymentMethod, TransactionCode, Amount, Status) VALUES (?, ?, ?, ?, ?)",
          [orderId, displayMethod, txnCode, finalAmount, paymentStatus]
        );
      } catch (err) {
        console.warn("Lỗi ghi payment_transactions:", err.message);
      }
    }

    await connection.commit();

    // Trả response ngay — email gửi nền (fire-and-forget)
    res.status(201).json({
      success: true,
      message: "Đặt hàng thành công.",
      orderId: orderId,
      status: initialStatus,
    });

    // 📧 Gửi email thông báo đến Admin Vận Hành (Admin 3) — ASYNC, không chṻ
    let customerName = "Khách hàng";
    let customerEmail = "";
    pool.query("SELECT FullName, Email FROM Users WHERE UserID = ?", [userId])
      .then(([userRows]) => {
        customerName = userRows[0]?.FullName || "Khách hàng";
        customerEmail = userRows[0]?.Email || "";

        return transporter.sendMail({
          from: process.env.EMAIL_USER,
          to: process.env.EMAIL_USER, // Thay "admin3@fashionstyle.com" bằng email thật để tránh bị bounce lại
          subject: `[FashionStyle] ⚠️ Đơn hàng mới #${orderId} cần xử lý`,
          html: `
            <div style="font-family:Arial,sans-serif;max-width:600px;">
              <h2 style="color:#059669;">📦 Có đơn hàng mới cần xử lý!</h2>
              <table style="width:100%;border-collapse:collapse;">
                <tr><td style="padding:8px;font-weight:bold;">Mã đơn:</td><td style="padding:8px;">#${orderId}</td></tr>
                <tr style="background:#f9fafb;"><td style="padding:8px;font-weight:bold;">Khách hàng:</td><td style="padding:8px;">${customerName} (${customerEmail})</td></tr>
                <tr><td style="padding:8px;font-weight:bold;">Tổng tiền:</td><td style="padding:8px;">${finalAmount.toLocaleString("vi-VN")} VNĐ</td></tr>
                <tr style="background:#f9fafb;"><td style="padding:8px;font-weight:bold;">Địa chỉ giao:</td><td style="padding:8px;">${ShippingAddress}</td></tr>
                <tr><td style="padding:8px;font-weight:bold;">Phương thức TT:</td><td style="padding:8px;">${PaymentMethod}</td></tr>
                <tr style="background:#f9fafb;"><td style="padding:8px;font-weight:bold;">Trạng thái:</td><td style="padding:8px;"><b>${initialStatus}</b></td></tr>
              </table>
              <p style="color:#6b7280;">👉 Vui lòng vào <a href="http://localhost:5174">Trang Admin</a> để lên đơn hàng.</p>
            </div>`,
        });
      })
      .then(() => {
        // Gửi email xác nhận cho khách (nếu có email)
        if (!customerEmail) return;
        return transporter.sendMail({
          from: process.env.EMAIL_USER,
          to: customerEmail,
          subject: `[FashionStyle] Xác nhận đặt hàng #${orderId}`,
          html: `<div style="font-family:Arial,sans-serif;max-width:600px;">
                  <h2 style="color:#059669;">Cảm ơn bạn đã mua sắm! 🎉</h2>
                  <p>Xin chào ${customerName},</p>
                  <p>Đơn hàng <b>#${orderId}</b> của bạn trị giá <b>${finalAmount.toLocaleString('vi-VN')} VNĐ</b> đã được tiếp nhận.</p>
                  <p style="background:#f3f4f6;padding:10px;">Giao đến: ${ShippingAddress}</p>
                  <p>Phương thức TT: <b>${PaymentMethod}</b></p>
                  <p>Trân trọng,<br/>FashionStyle Team</p>
                 </div>`,
        });
      })
      .catch((err) => console.warn("⚠️ Email gửi lỗi (nền):", err.message));
  } catch (error) {
    if (connection) await connection.rollback();
    console.error("❌ Lỗi khi checkout:", error.message, error.sqlMessage || "");
    res.status(500).json({ error: "Lỗi server", detail: error.message });
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
  const { ShippingAddress, PaymentMethod, PromotionCode, CustomerName, CustomerEmail, CustomerPhone, cartItems } = req.body;

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
    // Lấy giá + DiscountPercent từ DB để bảo mật — áp dụng discount trước khi tính
    for (let i = 0; i < cartItems.length; i++) {
      const [prodRows] = await connection.query(
        'SELECT Price, COALESCE(DiscountPercent, 0) AS DiscountPercent FROM Products WHERE ProductID = ?',
        [cartItems[i].ProductID]
      );
      if (prodRows.length === 0) throw new Error(`Sản phẩm ${cartItems[i].ProductID} không tồn tại`);
      const basePrice = prodRows[0].Price;
      const discountPct = prodRows[0].DiscountPercent || 0;
      // Lưu giá đã giảm vào OrderDetails
      cartItems[i].Price = discountPct > 0
        ? Math.round(basePrice * (1 - discountPct / 100))
        : basePrice;
      totalAmount += cartItems[i].Quantity * cartItems[i].Price;
    }

    let discount = 0;
    let promotionId = null;

    if (PromotionCode) {
        // Ưu tiên check mã dùng 1 lần (promotions_code)
        const [singleUseRows] = await connection.query(
          `SELECT pc.CodeID, pc.PromotionID, p.DiscountPercent 
           FROM promotions_code pc
           JOIN Promotions p ON pc.PromotionID = p.PromotionID
           WHERE pc.CodeValue = ? AND pc.IsUsed = 0 
           AND pc.AssignedToUserID IS NULL
           AND p.IsActive = 1 AND p.StartDate <= CURDATE() AND p.EndDate >= CURDATE()`,
          [PromotionCode]
        );

        if (singleUseRows.length > 0) {
            discount = singleUseRows[0].DiscountPercent / 100;
            promotionId = singleUseRows[0].PromotionID;
            await connection.query("UPDATE promotions_code SET IsUsed = 1 WHERE CodeID = ?", [singleUseRows[0].CodeID]);
        } else {
            // Fallback: Check mã chung (Promotions)
            const [promoRows] = await connection.query(
                "SELECT PromotionID, DiscountPercent FROM Promotions WHERE Code = ? AND IsActive = 1 AND StartDate <= CURDATE() AND EndDate >= CURDATE()",
                [PromotionCode]
            );
            if (promoRows.length > 0) {
                const promoId = promoRows[0].PromotionID;
                
                if (CustomerEmail) {
                    const [orderUsed] = await connection.query(
                        "SELECT OrderID FROM Orders WHERE GuestEmail = ? AND PromotionID = ? AND Status != 'CANCELLED'",
                        [CustomerEmail, promoId]
                    );
                    if (orderUsed.length > 0) {
                        await connection.rollback();
                        return res.status(400).json({ message: "Email này đã sử dụng mã khuyến mãi này rồi!" });
                    }
                }

                discount = promoRows[0].DiscountPercent / 100;
                promotionId = promoId;
            } else {
                await connection.rollback();
                return res.status(400).json({ message: "Mã khuyến mãi không hợp lệ hoặc đã hết hạn." });
            }
        }
    }

    const tax = totalAmount * 0.1;
    const discountAmount = totalAmount * discount;
    const finalAmount = Math.max(0, Math.round(totalAmount + tax - discountAmount));

    let initialStatus;
    if (PaymentMethod.toUpperCase() === "COD") {
      initialStatus = "PENDING_COD"; 
    } else if (PaymentMethod.toUpperCase() === "BANK TRANSFER") {
      initialStatus = "PENDING_BANK"; // Đã thanh toán qua bank, chờ Admin duyệt
    } else {
      initialStatus = "AWAITING_PAYMENT";
    }

    // Format địa chỉ gom chung tên và SĐT
    const finalAddress = `${CustomerName} - ${CustomerPhone} - ${ShippingAddress}`;

    const [orderResult] = await connection.query(
      `INSERT INTO Orders (UserID, TotalAmount, Status, ShippingAddress, PaymentMethod, GuestEmail, PromotionID) VALUES (NULL, ?, ?, ?, ?, ?, ?)`,
      [finalAmount, initialStatus, finalAddress, PaymentMethod, CustomerEmail, promotionId]
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
      await connection.query('UPDATE Products SET StockQuantity = StockQuantity - ? WHERE ProductID = ?', [item.Quantity, item.ProductID]);
      const [stockCheck] = await connection.query('SELECT ProductName, StockQuantity FROM Products WHERE ProductID = ?', [item.ProductID]);
      if (stockCheck[0] && stockCheck[0].StockQuantity <= 0) {
        await connection.query('INSERT INTO Notifications (Type, Message, ProductID) VALUES (?, ?, ?)', 
          ['OUT_OF_STOCK', `Sản phẩm ${stockCheck[0].ProductName} đã hết hàng. Vui lòng nhập thêm!`, item.ProductID]
        );
      }
    }

    // Ghi nhận giao dịch thanh toán vào payment_transactions (nếu không phải COD)
    if (PaymentMethod.toUpperCase() !== "COD") {
      let paymentStatus = "Đang chờ";
      let displayMethod = PaymentMethod;
      
      if (PaymentMethod.toUpperCase() === "BANK TRANSFER") {
        paymentStatus = "Thành công"; // Form đã giả lập khách xác nhận thanh toán
        displayMethod = "Chuyển khoản";
      }

      const txnCode = `TXN${Date.now().toString().slice(-6)}${Math.floor(Math.random() * 100)}`;
      
      try {
        await connection.query(
          "INSERT INTO payment_transactions (OrderID, PaymentMethod, TransactionCode, Amount, Status) VALUES (?, ?, ?, ?, ?)",
          [orderId, displayMethod, txnCode, finalAmount, paymentStatus]
        );
      } catch (err) {
        console.warn("Lỗi ghi payment_transactions guest:", err.message);
      }
    }

    await connection.commit();

    // 📧 Gửi email thông báo đơn mới (Cho Admin)
    try {
      await transporter.sendMail({
        from: process.env.EMAIL_USER,
        to: process.env.EMAIL_USER, // Thay "admin3@fashionstyle.com" bằng email thật để tránh bị bounce lại
        subject: `[FashionStyle] ⚠️ Đơn hàng GUEST mới #${orderId}`,
        html: `<p>Có đơn hàng mới từ Khách vãng lai: ${CustomerName} - ${CustomerPhone}</p><p>Tổng tiền: <b>${finalAmount.toLocaleString('vi-VN')} VNĐ</b></p><p>Địa chỉ: ${ShippingAddress}</p>`
      });
    } catch (e) { console.warn("Lỗi gửi mail GUEST to Admin", e.message); }

    // Trả response ngay — email gửi nền
    res.status(201).json({ success: true, message: "Đặt hàng thành công.", orderId, status: initialStatus });

    // Gửi email xác nhận cho Khách (fire-and-forget)
    if (CustomerEmail) {
      transporter.sendMail({
        from: process.env.EMAIL_USER,
        to: CustomerEmail,
        subject: `[FashionStyle] Xác nhận đặt hàng #${orderId}`,
        html: `<div style="font-family:Arial,sans-serif;max-width:600px;">
                <h2 style="color:#059669;">Cảm ơn bạn đã mua sắm! 🎉</h2>
                <p>Xin chào ${CustomerName},</p>
                <p>Đơn hàng <b>#${orderId}</b> trị giá <b>${finalAmount.toLocaleString('vi-VN')} VNĐ</b> đã được tiếp nhận. Chúng tôi sẽ sớm liên hệ qua số <b>${CustomerPhone}</b> để giao hàng đến <i>${ShippingAddress}</i>.</p>
               </div>`,
      }).catch(e => console.warn("⚠️ Email guest lỗi:", e.message));
    }
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

// [ADMIN 1 + 3] Lấy đơn hàng của 1 user cụ thể — dùng cho trang Users của Admin
// GET /api/orders/admin/user/:userId
router.get("/admin/user/:userId", requireAuth, requireAdminLevel3, async (req, res) => {
  const { userId } = req.params;
  try {
    const sql = `
      SELECT 
        o.OrderID, o.OrderDate, o.TotalAmount, o.Status, 
        o.ShippingAddress, o.PaymentMethod,
        COUNT(od.ProductID) AS itemCount
      FROM Orders o
      LEFT JOIN OrderDetails od ON o.OrderID = od.OrderID
      WHERE o.UserID = ?
      GROUP BY o.OrderID, o.OrderDate, o.TotalAmount, o.Status, 
               o.ShippingAddress, o.PaymentMethod
      ORDER BY o.OrderDate DESC
    `;
    const [orders] = await pool.query(sql, [userId]);
    res.status(200).json({ success: true, data: orders });
  } catch (error) {
    console.error("Lỗi khi lấy đơn hàng của user:", error);
    res.status(500).json({ error: "Lỗi server", detail: error.message });
  }
});

// [ADMIN 1 + 3] Xem tất cả đơn hàng — requireAdminLevel3
// GET /api/orders/admin
router.get("/admin", requireAuth, requireAdminLevel3, async (req, res) => {
  try {
    const sql = `
            SELECT o.*, u.FullName, u.Email, u.PhoneNumber
            FROM Orders o
            LEFT JOIN Users u ON o.UserID = u.UserID
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
  const { Action, Reason } = req.body;

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

    // Trả response ngay — email gửi nền (fire-and-forget)
    res.status(200).json({
      success: true,
      message: `Đơn hàng #${orderId} đã ${Action.toUpperCase() === "APPROVE" ? "được duyệt" : "bị từ chối"}.`,
      newStatus,
    });

    // 📧 Gửi email nền (không chặn response)
    const isApproved = Action.toUpperCase() === "APPROVE";
    pool.query(
      `SELECT o.*, u.FullName, u.Email FROM Orders o LEFT JOIN Users u ON o.UserID = u.UserID WHERE o.OrderID = ?`,
      [orderId]
    ).then(([orderRows]) => {
      const order = orderRows[0];
      const promises = [];
      if (order?.Email) {
        promises.push(transporter.sendMail({
          from: process.env.EMAIL_USER,
          to: order.Email,
          subject: isApproved
            ? `[FashionStyle] ✅ Đơn hàng #${orderId} đã được xác nhận!`
            : `[FashionStyle] ❌ Đơn hàng #${orderId} đã bị từ chối`,
          html: isApproved
            ? `<h3>Xin chào ${order.FullName}! 🎉</h3><p>Đơn hàng <b>#${orderId}</b> đã được <b style="color:green;">xác nhận</b> và đang được chuẩn bị giao.</p>`
            : `<h3>Xin chào ${order.FullName},</h3><p>Rất tiếc! Đơn hàng <b>#${orderId}</b> đã bị <b style="color:red;">từ chối</b>. Lý do: <i>${Reason || "Không có lý do cụ thể"}</i>.</p>`,
        }));
      }
      promises.push(transporter.sendMail({
        from: process.env.EMAIL_USER,
        to: process.env.EMAIL_USER, // Thay "admin3@fashionstyle.com" bằng email thật để tránh bị bounce lại
        subject: `[FashionStyle] Đơn #${orderId} → ${isApproved ? "ĐÃ DUYỆT ✅" : "Bị TỪ CHỐI ❌"}`,
        html: `<p>Đơn hàng <b>#${orderId}</b> vừa được Admin Chính <b>${isApproved ? "duyệt" : "từ chối"}</b>.</p>${Reason ? `<p>Lý do: ${Reason}</p>` : ""}<p>Trạng thái mới: <b>${newStatus}</b></p>`,
      }));
      return Promise.all(promises);
    }).catch(err => console.warn("⚠️ Email duyệt đơn lỗi (nền):", err.message));

    // 📝 Ghi log (fire-and-forget)
    const adminId = req.user.userId;
    pool.query(
      "INSERT INTO admin_activity_logs (AdminID, ActionType, TableName, Details) VALUES (?, ?, ?, ?)",
      [adminId, isApproved ? "APPROVE_ORDER" : "REJECT_ORDER", "Orders",
       `${isApproved ? "Duyệt" : "Từ chối"} đơn hàng #${orderId}${Reason ? `. Lý do: ${Reason}` : ""}`]
    ).catch(e => console.warn("⚠️ Ghi log lỗi:", e.message));

  } catch (error) {
    console.error("Lỗi khi duyệt đơn hàng:", error);
    res.status(500).json({ error: "Lỗi server" });
  }
});


// [ADMIN 1 + 3] Cập nhật trạng thái vận chuyển — requireAdminLevel3
// PUT /api/orders/admin/:id/status
router.put("/admin/:id/status", requireAuth, requireAdminLevel3, async (req, res) => {
  const orderId = req.params.id;
  const { Status, Reason } = req.body; // Trạng thái mới: 'Đang giao', 'Đã giao', 'Đã hủy'. Cho phép truyền thêm Reason nếu 'Đã hủy'

  // Đảm bảo trạng thái hợp lệ
  const validStatuses = ["Chờ xử lý", "Đang giao", "Đã giao", "Đã hủy", "Từ chối"];
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

    // Trả response ngay để không bị block / delay quá trình
    res.status(200).json({
      success: true,
      message: `Cập nhật trạng thái đơn hàng ${orderId} thành ${Status} thành công.`,
    });

    // 📧 Gửi email thông báo cho Khách hàng về cập nhật trạng thái
    pool.query(`SELECT o.GuestEmail, u.FullName, u.Email FROM Orders o LEFT JOIN Users u ON o.UserID = u.UserID WHERE o.OrderID = ?`, [orderId])
      .then(([orderRows]) => {
        const order = orderRows[0];
        const targetEmail = order?.Email || order?.GuestEmail;
        const targetName = order?.FullName || "Khách hàng";
        
        if (targetEmail) {
          let emailHtml = `<h3>Xin chào ${targetName},</h3><p>Đơn hàng <b>#${orderId}</b> của bạn vừa được cập nhật trạng thái thành: <b style="color:blue;">${Status}</b>.</p>`;
          if (Status === "Đã hủy" && Reason) {
            emailHtml += `<p>Lý do: <i>${Reason}</i></p>`;
          }
          emailHtml += `<p>Cảm ơn bạn đã đồng hành cùng FashionStyle!</p>`;

          return transporter.sendMail({
            from: process.env.EMAIL_USER,
            to: targetEmail,
            subject: `[FashionStyle] 📦 Cập nhật trạng thái đơn hàng #${orderId}`,
            html: emailHtml
          });
        }
      })
      .catch(err => console.warn("⚠️ Không gửi được email cập nhật trạng thái (nền):", err.message));

    // 📝 Ghi log hoạt động Admin
    try {
      const adminId = req.user.userId;
      let logDetails = `Cập nhật trạng thái đơn hàng #${orderId} thành: ${Status}`;
      if (Status === "Đã hủy" && Reason) {
        logDetails += ` (Lý do: ${Reason})`;
      }
      await pool.query(
        "INSERT INTO admin_activity_logs (AdminID, ActionType, TableName, Details) VALUES (?, ?, ?, ?)",
        [adminId, "UPDATE_STATUS", "Orders", logDetails]
      );
    } catch (logErr) {
      console.warn("⚠️ Không ghi được log cập nhật trạng thái:", logErr.message);
    }

  } catch (error) {
    console.error("Lỗi khi cập nhật trạng thái đơn hàng:", error);
    if (!res.headersSent) {
      res.status(500).json({ error: "Lỗi server" });
    }
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

// [ADMIN 1 + 3] Xóa đơn hàng — requireAdminLevel3
// DELETE /api/orders/admin/:id
router.delete("/admin/:id", requireAuth, requireAdminLevel3, async (req, res) => {
  const orderId = req.params.id;
  let connection;

  try {
    connection = await pool.getConnection();
    await connection.beginTransaction();

    // 1. Xóa chi tiết đơn hàng trước
    await connection.query("DELETE FROM OrderDetails WHERE OrderID = ?", [orderId]);

    // 2. Xóa đơn hàng
    const [result] = await connection.query("DELETE FROM Orders WHERE OrderID = ?", [orderId]);

    if (result.affectedRows === 0) {
      await connection.rollback();
      return res.status(404).json({ success: false, message: "Không tìm thấy đơn hàng để xóa." });
    }

    // 📝 Ghi log hoạt động Admin
    try {
      const adminId = req.user.userId;
      await connection.query(
        "INSERT INTO admin_activity_logs (AdminID, ActionType, TableName, Details) VALUES (?, ?, ?, ?)",
        [adminId, "DELETE_ORDER", "Orders", `Xóa vĩnh viễn đơn hàng #${orderId}`]
      );
    } catch (logErr) {
      console.warn("⚠️ Không ghi được log xóa đơn:", logErr.message);
    }

    await connection.commit();
    res.status(200).json({ success: true, message: `Đã xóa đơn hàng #${orderId} thành công.` });
  } catch (error) {
    if (connection) await connection.rollback();
    console.error("Lỗi khi xóa đơn hàng Admin:", error);
    res.status(500).json({ error: "Lỗi server khi xóa đơn hàng" });
  } finally {
    if (connection) connection.release();
  }
});

module.exports = router;
