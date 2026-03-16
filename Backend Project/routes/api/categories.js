const express = require("express");
const router = express.Router();
const pool = require("../../dbpool/db");

// =========================================================================
// [PUBLIC/ADMIN] LẤY DANH SÁCH TẤT CẢ DANH MỤC
// GET /api/categories/getCategories
// =========================================================================
router.get("/getCategories", async (req, res) => {
  try {
    // 1. Định nghĩa câu lệnh SQL lấy toàn bộ dữ liệu từ bảng categories
    const sqlString = `
        SELECT * FROM categories
    `;

    // 2. Thực thi truy vấn bằng pool.query (trả về mảng [rows, fields])
    const [rows] = await pool.query(sqlString);

    // 3. Kiểm tra nếu có dữ liệu trả về
    if (rows.length > 0) {
      return res.status(200).json({
        success: true,
        data: rows, // Trả về danh sách danh mục
      });
    } else {
      // Trường hợp bảng trống
      return res.status(400).json({
        success: false,
        data: [],
      });
    }
  } catch (error) {
    console.error("Lỗi khi lấy danh mục:", error);
    return res.status(500).json({ error: "Lỗi server khi lấy dữ liệu" });
  }
});

// =========================================================================
// [ADMIN] THÊM DANH MỤC MỚI
// POST /api/categories/addCategory
// =========================================================================
router.post("/addCategory", async (req, res) => {
  try {
    // 1. Lấy dữ liệu tên danh mục từ Body của Request
    const { CategoryName } = req.body;

    // 2. Validate: Kiểm tra xem người dùng có nhập tên danh mục không
    if (!CategoryName) {
      return res.status(400).json({
        success: false,
        message: "CategoryName không được để trống.",
      });
    }

    // 3. Câu lệnh SQL để chèn dữ liệu mới vào bảng
    const sqlString = `
        INSERT INTO categories (CategoryName)
        VALUES (?)
    `;

    // 4. Thực thi truy vấn với tham số an toàn (?) để tránh SQL Injection
    const [result] = await pool.query(sqlString, [CategoryName]);

    // 5. Kiểm tra nếu chèn thành công (affectedRows > 0)
    if (result.affectedRows > 0) {
      return res.status(201).json({
        success: true,
        message: "Thêm danh mục thành công.",
        categoryId: result.insertId, // Trả về ID của danh mục vừa tạo
      });
    } else {
      return res.status(400).json({
        success: false,
        message: "Thêm danh mục thất bại.",
      });
    }
  } catch (error) {
    console.error("Lỗi khi thêm danh mục:", error);
    // Xử lý lỗi trùng lặp tên danh mục (Nếu cột CategoryName là UNIQUE)
    if (error.code === "ER_DUP_ENTRY") {
      return res.status(400).json({
        error: "Tên danh mục đã tồn tại. Vui lòng chọn tên khác.",
      });
    }
    return res.status(500).json({ error: "Lỗi server khi thêm dữ liệu" });
  }
});

// =========================================================================
// [ADMIN] CẬP NHẬT TÊN DANH MỤC THEO ID
// PUT /api/categories/updateCategory/:id
// =========================================================================
router.put("/updateCategory/:id", async (req, res) => {
  try {
    // 1. Lấy ID từ tham số trên URL (:id)
    const categoryId = req.params.id;
    // 2. Lấy tên mới từ Body
    const { CategoryName } = req.body;

    // 3. Validate dữ liệu đầu vào
    if (!CategoryName) {
      return res.status(400).json({
        success: false,
        message: "CategoryName không được để trống.",
      });
    }

    // 4. Câu lệnh SQL cập nhật dữ liệu dựa trên ID
    const sqlString = `
        UPDATE categories
        SET CategoryName = ?
        WHERE categoryid = ?
    `;

    const [result] = await pool.query(sqlString, [CategoryName, categoryId]);

    // 5. Kiểm tra kết quả cập nhật
    if (result.affectedRows > 0) {
      // result.changedRows > 0 nghĩa là dữ liệu thực sự có thay đổi so với cũ
      if (result.changedRows > 0) {
        return res.status(200).json({
          success: true,
          message: "Cập nhật danh mục thành công.",
        });
      } else {
        return res.status(200).json({
          success: true,
          message:
            "Không có thay đổi nào được thực hiện (dữ liệu trùng với cũ).",
        });
      }
    } else {
      // Không tìm thấy ID tương ứng trong database
      return res.status(404).json({
        success: false,
        message: `Không tìm thấy danh mục với ID: ${categoryId}.`,
      });
    }
  } catch (error) {
    console.error("Lỗi khi sửa danh mục:", error);
    if (error.code === "ER_DUP_ENTRY") {
      return res.status(400).json({
        error: "Tên danh mục mới đã tồn tại. Vui lòng chọn tên khác.",
      });
    }
    return res.status(500).json({ error: "Lỗi server khi sửa dữ liệu" });
  }
});

// =========================================================================
// [ADMIN] XÓA DANH MỤC THEO ID
// DELETE /api/categories/deleteCategory/:id
// =========================================================================
router.delete("/deleteCategory/:id", async (req, res) => {
  try {
    // 1. Lấy ID danh mục cần xóa từ URL
    const categoryId = req.params.id;

    // 2. Câu lệnh SQL xóa bản ghi
    const sqlString = `
        DELETE FROM categories
        WHERE categoryid = ?
    `;

    const [result] = await pool.query(sqlString, [categoryId]);

    // 3. Kiểm tra xem có bản ghi nào bị xóa không
    if (result.affectedRows > 0) {
      return res.status(200).json({
        success: true,
        message: "Xóa danh mục thành công.",
      });
    } else {
      return res.status(404).json({
        success: false,
        message: `Không tìm thấy danh mục với ID: ${categoryId} để xóa.`,
      });
    }
  } catch (error) {
    console.error("Lỗi khi xóa danh mục:", error);
    // Xử lý lỗi ràng buộc khóa ngoại (ví dụ: danh mục đang có sản phẩm thuộc về nó)
    if (error.code === "ER_ROW_IS_REFERENCED_2") {
      return res.status(400).json({
        error:
          "Không thể xóa danh mục này vì nó đang chứa sản phẩm. Hãy xóa hoặc chuyển sản phẩm trước.",
      });
    }
    return res.status(500).json({ error: "Lỗi server khi xóa dữ liệu" });
  }
});

module.exports = router;
