const pool = require("./dbpool/db");

async function updateDatabase() {
  try {
    console.log("Đang kiểm tra cột DiscountPercent trong bảng Products...");
    
    // Thử thêm cột DiscountPercent
    const sql = `ALTER TABLE Products ADD COLUMN DiscountPercent INT DEFAULT 0;`;
    
    await pool.query(sql);
    console.log("✅ Đã thêm cột DiscountPercent vào bảng Products thành công!");
  } catch (error) {
    // Lỗi số 1060 là lỗi "Duplicate column name", nghĩa là cột đã tồn tại
    if (error.code === 'ER_DUP_FIELDNAME') {
      console.log("⚠️ Cột DiscountPercent đã tồn tại trong bảng Products. Bỏ qua bước này.");
    } else {
      console.error("❌ Lỗi khi cập nhật DB:", error);
    }
  } finally {
    process.exit(0);
  }
}

updateDatabase();
