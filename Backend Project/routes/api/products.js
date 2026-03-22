const express = require("express");
const router = express.Router();
const mysql = require("mysql2");
require("dotenv").config();
const pool = require("../../dbpool/db");
const { requireAuth, requireAdmin, requireAdminLevel2 } = require("../../middlewares/auth");

const multer = require("multer");
const path = require("path");
// Định nghĩa nơi lưu trữ file
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // Đảm bảo thư mục 'uploads/product_images' tồn tại
    cb(null, "uploads/product_images");
  },
  filename: (req, file, cb) => {
    // SỬA: Đặt tên file là timestamp_originalname.ext (An toàn hơn)
    cb(
      null,
      Date.now() + "-" + file.originalname // Sửa thành tên file an toàn
    );
  },
});

const upload = multer({ storage: storage });

// ----------------------------------------------------------------
// [PUBLIC] Tìm kiếm Sản phẩm
// GET /api/products/search?query=áo thun
// ----------------------------------------------------------------
router.get("/search", async (req, res) => {
  const searchQuery = req.query.query; // Lấy từ khóa tìm kiếm từ query param

  if (!searchQuery) {
    return res
      .status(400)
      .json({ message: "Vui lòng cung cấp từ khóa tìm kiếm (query)." });
  }

  try {
    // Sử dụng %...% để tìm kiếm các sản phẩm có chứa từ khóa
    const searchPattern = `%${searchQuery}%`;

    const [rows] = await pool.query(
      `SELECT p.ProductID, p.ProductName, p.Price, p.DiscountPercent, c.CategoryName 
             FROM Products p 
             LEFT JOIN Categories c ON p.CategoryID = c.CategoryID 
             WHERE p.ProductName LIKE ? OR p.Description LIKE ?`, // THÊM p. cho rõ ràng
      [searchPattern, searchPattern]
    );

    res.status(200).json({
      success: true,
      data: rows,
      count: rows.length,
    });
  } catch (error) {
    console.error("Lỗi khi tìm kiếm sản phẩm:", error);
    res.status(500).json({ error: "Lỗi server khi tìm kiếm." });
  }
});
// Áp dụng cho tất cả các route dưới

// ----------------------------------------------------------------
// [PUBLIC] Lấy danh sách sản phẩm (có thể thêm filter/pagination)
// GET /api/products
// ----------------------------------------------------------------
router.get("/", async (req, res) => {
  const { category, query } = req.query;
  try {
    let sql = `
            SELECT 
              p.ProductID as id, 
              p.ProductName as title, 
              p.Price as price, 
              p.StockQuantity as stock, 
              c.CategoryName as category,
              0 as popularity,
              IFNULL((SELECT FileName FROM Image WHERE ProductID = p.ProductID LIMIT 1), 'default.jpg') as image
            FROM Products p
            LEFT JOIN Categories c ON p.CategoryID = c.CategoryID
            WHERE 1=1
        `;
    const params = [];

    if (category) {
      // So khớp slug: Chuyển 'Special Edition' -> 'special-edition' để so với query
      sql += " AND LOWER(REPLACE(c.CategoryName, ' ', '-')) = ? ";
      params.push(category.toLowerCase());
    }

    if (query) {
      sql += " AND (p.ProductName LIKE ? OR p.Description LIKE ?) ";
      params.push(`%${query}%`, `%${query}%`);
    }

    const [rows] = await pool.query(sql, params);
    res.status(200).json(rows); 
  } catch (error) {
    console.error("Lỗi khi lấy danh sách sản phẩm:", error);
    res.status(500).json({ error: "Lỗi server khi lấy dữ liệu" });
  }
});

router.get(
  "/getProducts_Admin",
  requireAuth,
  requireAdmin,
  async (req, res) => {
    const { categoryID, colorID, query, minPrice, maxPrice } = req.query;
    try {
      let sql = `
            SELECT p.ProductID, p.ProductName, p.Price, p.StockQuantity, p.DiscountPercent, c.CategoryName
            FROM Products p
            LEFT JOIN Categories c ON p.CategoryID = c.CategoryID
            WHERE 1=1
        `;
      const params = [];

      if (categoryID && categoryID !== "all") {
        sql += " AND p.CategoryID = ?";
        params.push(categoryID);
      }

      if (query) {
        sql += " AND (p.ProductName LIKE ? OR p.Description LIKE ?)";
        params.push(`%${query}%`, `%${query}%`);
      }

      if (minPrice !== undefined && maxPrice !== undefined) {
        sql += " AND p.Price BETWEEN ? AND ?";
        params.push(minPrice, maxPrice);
      }

      // Nếu muốn lọc theo màu sắc (ColorID), chúng ta cần Join với bảng product_colors
      if (colorID && colorID !== "all") {
        sql += " AND p.ProductID IN (SELECT ProductID FROM product_colors WHERE ColorID = ?)";
        params.push(colorID);
      }

      const [rows] = await pool.query(sql, params);

      // Lấy danh sách màu của từng sản phẩm để gửi về Frontend (Optionally)
      for (let row of rows) {
        const [colors] = await pool.query(
          "SELECT c.ColorName, c.HexCode FROM product_colors pc JOIN colors c ON pc.ColorID = c.ColorID WHERE pc.ProductID = ?",
          [row.ProductID]
        );
        row.colors = colors;
        const [imgs] = await pool.query(
          "SELECT FileName FROM Image WHERE ProductID = ? LIMIT 1",
          [row.ProductID]
        );
        row.firstImage = imgs.length > 0 ? imgs[0].FileName : null;
      }

      res.status(200).json({ success: true, data: rows });
    } catch (error) {
      console.error("Lỗi khi lấy danh sách sản phẩm Admin:", error);
      res.status(500).json({ error: "Lỗi server khi lấy dữ liệu" });
    }
  }
);

// ----------------------------------------------------------------
// [ADMIN 1 + 2] Upload ảnh sản phẩm
// POST /api/products/upload-image
// ----------------------------------------------------------------
router.post(
  "/upload-image",
  requireAuth,
  requireAdminLevel2,
  upload.single("image"),
  async (req, res) => {
    if (!req.file) {
      return res.status(400).json({ success: false, message: "Không có file nào được upload." });
    }
    const fileName = req.file.filename;
    res.status(200).json({ success: true, fileName, message: "Upload ảnh thành công." });
  }
);


// GET /api/products/:id
// ----------------------------------------------------------------
router.get("/:id", async (req, res) => {
  const productID = req.params.id;
  try {
    // 1. Lấy thông tin cơ bản
    const [productRows] = await pool.query(
      `SELECT 
              p.ProductID as id, 
              p.ProductName as title, 
              p.Price as price, 
              p.StockQuantity as stock, 
              c.CategoryName as category,
              p.Description as description,
              0 as popularity,
              IFNULL((SELECT FileName FROM Image WHERE ProductID = p.ProductID LIMIT 1), 'default.jpg') as image
             FROM Products p 
             LEFT JOIN Categories c ON p.CategoryID = c.CategoryID 
             WHERE p.ProductID = ?`,
      [productID]
    );

    if (productRows.length === 0) {
      return res
        .status(404)
        .json({ success: false, message: "Không tìm thấy sản phẩm." });
    }
    const product = productRows[0];

    // 2. Lấy kích cỡ và tồn kho
    const [sizeRows] = await pool.query(
      `SELECT NameSize, StockQuantity FROM Product_Sizes WHERE ProductID = ?`,
      [productID]
    );

    // 3. Lấy hình ảnh (Trả về mảng tên file chuỗi)
    const [imageRows] = await pool.query(
      `SELECT FileName FROM Image WHERE ProductID = ?`,
      [productID]
    );

    // 4. Lấy đánh giá (chỉ 5 cái gần nhất)
    const [reviewRows] = await pool.query(
      `SELECT u.FullName, r.GuestName, r.Rating, r.Comment, r.CreatedAt 
             FROM Reviews r 
             LEFT JOIN Users u ON r.UserID = u.UserID 
             WHERE r.ProductID = ? 
             ORDER BY r.CreatedAt DESC LIMIT 5`,
      [productID]
    );

    product.sizes = sizeRows;
    product.images = imageRows.map((img) => img.FileName);
    product.reviews = reviewRows.map(r => ({
      author: r.FullName || r.GuestName || 'Khách',
      rating: r.Rating,
      comment: r.Comment,
      date: r.CreatedAt
    }));

    return res.status(200).json(product); // Trả Object trực tiếp
  } catch (error) {
    console.error("Lỗi khi lấy chi tiết sản phẩm:", error);
    return res.status(500).json({ error: "Lỗi server khi lấy dữ liệu" });
  }
});

// [ADMIN 1 + 2] Thêm sản phẩm — requireAdminLevel2 (Admin Chính + Admin Kho)
// POST /api/products
router.post("/", requireAuth, requireAdminLevel2, async (req, res) => {
  const {
    ProductName,
    Description,
    Price,
    StockQuantity,
    CategoryID,
    Sizes,
    Images,
    DiscountPercent
  } = req.body;
  let connection;

  if (ProductName === undefined || Price === undefined || CategoryID === undefined) {
    return res
      .status(400)
      .json({ message: "Thiếu thông tin cơ bản của sản phẩm (Tên, Giá, hoặc Danh mục)." });
  }

  try {
    // Bắt đầu TRANSACTION
    connection = await pool.getConnection();
    await connection.beginTransaction();

    // 1. Thêm vào Products
    const [productResult] = await connection.query(
      `INSERT INTO Products (ProductName, Description, Price, StockQuantity, CategoryID, DiscountPercent) 
             VALUES (?, ?, ?, ?, ?, ?)`,
      [ProductName, Description, Price, StockQuantity, CategoryID, DiscountPercent || 0]
    );
    const productID = productResult.insertId;

    // 2. Thêm vào Product_Sizes (nếu có)
    if (Sizes && Sizes.length > 0) {
      const sizeValues = Sizes.map((s) => [
        productID,
        s.NameSize,
        s.StockQuantity,
      ]);
      await connection.query(
        `INSERT INTO Product_Sizes (ProductID, NameSize, StockQuantity) VALUES ?`,
        [sizeValues]
      );
    }

    // 3. Thêm vào Image (nếu có)
    if (Images && Images.length > 0) {
      const imageValues = Images.map((img) => [productID, img.FileName]);
      await connection.query(
        `INSERT INTO Image (ProductID, FileName) VALUES ?`,
        [imageValues]
      );
    }

    // COMMIT TRANSACTION
    await connection.commit();
    res
      .status(201)
      .json({ success: true, message: "Thêm sản phẩm thành công.", productID });
  } catch (error) {
    if (connection) {
      await connection.rollback(); // ROLLBACK nếu có lỗi
    }
    console.error("Lỗi khi thêm sản phẩm (Transaction Rollback):", error);
    res.status(500).json({ error: "Lỗi server khi thêm dữ liệu" });
  } finally {
    if (connection) connection.release();
  }
});

// [ADMIN 1 + 2] Cập nhật sản phẩm — requireAdminLevel2
// PUT /api/products/:id
router.put("/:id", requireAuth, requireAdminLevel2, async (req, res) => {
  const productID = req.params.id;
  const {
    ProductName,
    Description,
    Price,
    StockQuantity,
    CategoryID,
    Sizes,
    Images,
    DiscountPercent
  } = req.body;
  let connection;

  if (ProductName === undefined || Price === undefined || CategoryID === undefined) {
    return res
      .status(400)
      .json({ message: "Thiếu thông tin cơ bản để cập nhật (Tên, Giá, hoặc Danh mục)." });
  }

  try {
    connection = await pool.getConnection();
    await connection.beginTransaction();

    // 1. Cập nhật bảng Products
    await connection.query(
      `UPDATE Products SET ProductName=?, Description=?, Price=?, StockQuantity=?, CategoryID=?, DiscountPercent=? WHERE ProductID=?`,
      [ProductName, Description, Price, StockQuantity, CategoryID, DiscountPercent || 0, productID]
    );

    // 2. Cập nhật Product_Sizes (Xóa cũ, chèn mới)
    await connection.query(`DELETE FROM Product_Sizes WHERE ProductID = ?`, [
      productID,
    ]);
    if (Sizes && Sizes.length > 0) {
      const sizeValues = Sizes.map((s) => [
        productID,
        s.NameSize,
        s.StockQuantity,
      ]);
      await connection.query(
        `INSERT INTO Product_Sizes (ProductID, NameSize, StockQuantity) VALUES ?`,
        [sizeValues]
      );
    }

    // 3. Cập nhật Image (Xóa cũ, chèn mới)
    await connection.query(`DELETE FROM Image WHERE ProductID = ?`, [
      productID,
    ]);
    if (Images && Images.length > 0) {
      const imageValues = Images.map((img) => [productID, img.FileName]);
      await connection.query(
        `INSERT INTO Image (ProductID, FileName) VALUES ?`,
        [imageValues]
      );
    }

    await connection.commit();
    res
      .status(200)
      .json({ success: true, message: "Cập nhật sản phẩm thành công." });
  } catch (error) {
    if (connection) await connection.rollback();
    console.error("Lỗi khi cập nhật sản phẩm:", error);
    res.status(500).json({ error: "Lỗi server khi cập nhật dữ liệu" });
  } finally {
    if (connection) connection.release();
  }
});

// [ADMIN 1 + 2] Xóa sản phẩm — requireAdminLevel2
// DELETE /api/products/:id
router.delete("/:id", requireAuth, requireAdminLevel2, async (req, res) => {
  const productID = req.params.id;
  let connection;

  try {
    // Xóa sản phẩm sẽ tự động xóa các ràng buộc khóa ngoại (ví dụ: Product_Sizes, Image)
    // Dựa trên cấu hình ON DELETE CASCADE trong CSDL (nếu bạn có)
    // Nếu không có ON DELETE CASCADE, bạn phải xóa thủ công các bảng liên quan:
    // Product_Sizes, Image, Cart_Items, OrderDetails, Reviews, Product_Costs TRƯỚC

    connection = await pool.getConnection();

    // KIỂM TRA QUYỀN XÓA DÀNH CHO ADMIN 2
    const [userRows] = await connection.query("SELECT Email, CanDeleteProduct FROM Users WHERE UserID = ?", [req.user.userId]);
    const user = userRows[0];
    if (user && user.Email === 'admin2@fashionstyle.com' && !user.CanDeleteProduct) {
         connection.release();
         return res.status(403).json({ success: false, message: "Admin 1 chưa cấp quyền XÓA sản phẩm cho bạn!" });
    }

    await connection.beginTransaction();

    // Xóa các dữ liệu phụ thuộc (Ví dụ nếu không có ON DELETE CASCADE)
    await connection.query("DELETE FROM Product_Costs WHERE ProductID = ?", [
      productID,
    ]);
    await connection.query("DELETE FROM Reviews WHERE ProductID = ?", [
      productID,
    ]);
    await connection.query("DELETE FROM OrderDetails WHERE ProductID = ?", [
      productID,
    ]);
    await connection.query("DELETE FROM Cart_Items WHERE ProductID = ?", [
      productID,
    ]);
    await connection.query("DELETE FROM Product_Sizes WHERE ProductID = ?", [
      productID,
    ]);
    await connection.query("DELETE FROM Image WHERE ProductID = ?", [
      productID,
    ]);

    const [result] = await connection.query(
      "DELETE FROM Products WHERE ProductID = ?",
      [productID]
    );

    await connection.commit();

    if (result.affectedRows === 0) {
      return res
        .status(404)
        .json({ success: false, message: "Không tìm thấy sản phẩm để xóa." });
    }
    res
      .status(200)
      .json({ success: true, message: "Xóa sản phẩm thành công." });
  } catch (error) {
    if (connection) await connection.rollback();
    console.error("Lỗi khi xóa sản phẩm:", error);
    res.status(500).json({ error: "Lỗi server khi xóa dữ liệu" });
  } finally {
    if (connection) connection.release();
  }
});

// [ADMIN 1 + 2] Upload hình ảnh — requireAdminLevel2
// POST /api/products/:productId/upload-image
router.post(
  "/:productId/upload-image",
  requireAuth,
  requireAdminLevel2,
  upload.array("images", 5),
  async (req, res) => {
    const productId = req.params.productId;

    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ message: "Không tìm thấy file hình ảnh." });
    }

    try {
      const fileNames = req.files.map((file) => [productId, file.filename]);

      // 1. Thêm tên file vào bảng Image
      const sql = `INSERT INTO Image (ProductID, FileName) VALUES ?`;
      await pool.query(sql, [fileNames]);

      res.status(201).json({
        success: true,
        message: "Upload và cập nhật hình ảnh thành công.",
        files: req.files.map((f) => f.filename),
      });
    } catch (error) {
      console.error("Lỗi khi upload và lưu DB:", error);
      res.status(500).json({ error: "Lỗi server khi xử lý file" });
    }
  }
);

// ----------------------------------------------------------------
// [CUSTOMER] Đánh giá Sản phẩm
// POST /api/products/:id/review
// ----------------------------------------------------------------
router.post("/:id/review", requireAuth, async (req, res) => {
  const productId = req.params.id; // Lấy ID sản phẩm từ URL
  const userId = req.user.userId; // Lấy UserID từ Token (Sau khi qua requireAuth)
  const { rating, comment } = req.body;
  let connection;

  if (!rating || rating < 1 || rating > 5) {
    return res.status(400).json({
      message: "Vui lòng cung cấp điểm đánh giá hợp lệ (từ 1 đến 5).",
    });
  }

  try {
    connection = await pool.getConnection();
    await connection.beginTransaction();

    // 1. Kiểm tra Sản phẩm có tồn tại không
    const [productRows] = await connection.query(
      "SELECT ProductID FROM Products WHERE ProductID = ?",
      [productId]
    );
    if (productRows.length === 0) {
      await connection.rollback();
      return res.status(404).json({ message: "Không tìm thấy sản phẩm này." });
    }

    // 2. Kiểm tra người dùng đã đánh giá sản phẩm này chưa (Tránh đánh giá trùng lặp)
    const [existingReview] = await connection.query(
      "SELECT ReviewID FROM Reviews WHERE UserID = ? AND ProductID = ?",
      [userId, productId]
    );

    if (existingReview.length > 0) {
      await connection.rollback();
      return res.status(400).json({
        message:
          "Bạn đã đánh giá sản phẩm này rồi. Vui lòng chỉnh sửa đánh giá cũ.",
      });
    }

    // 3. Chèn đánh giá mới vào bảng Reviews và LƯU KẾT QUẢ (ĐÃ SỬA LỖI)
    const [reviewResult] = await connection.query(
      "INSERT INTO Reviews (ProductID, UserID, Rating, Comment) VALUES (?, ?, ?, ?)",
      [productId, userId, rating, comment]
    );

    // Lấy ID của bản ghi đánh giá vừa tạo
    const reviewId = reviewResult.insertId;

    await connection.commit();

    res.status(201).json({
      success: true,
      message: "Đánh giá của bạn đã được gửi thành công!",
      reviewId: reviewId, // <--- ĐÃ SỬA LỖI ReferenceError
    });
  } catch (error) {
    if (connection) await connection.rollback();
    console.error("Lỗi khi gửi đánh giá:", error);
    res.status(500).json({ error: "Lỗi server khi xử lý đánh giá." });
  } finally {
    if (connection) connection.release();
  }
});

module.exports = router;
