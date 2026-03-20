/**
 * seed-admin.js
 * -------------------------------------------------------
 * Chạy một lần để tạo 3 tài khoản Admin cố định vào DB.
 * Lệnh: node seed-admin.js
 * -------------------------------------------------------
 */
require("dotenv").config();
const bcrypt = require("bcryptjs");
const pool = require("./dbpool/db");

// -------------------------------------------------------
// ⚙️  DANH SÁCH 3 ADMIN CỐ ĐỊNH — chỉnh sửa thông tin tại đây
// -------------------------------------------------------
const ADMIN_ACCOUNTS = [
  {
    FullName: "Admin Chính",
    Email: "admin1@fashionstyle.com",
    Password: "Admin@123",
    Address: "Hà Nội, Việt Nam",
    PhoneNumber: "0900000001",
  },
  {
    FullName: "Admin Kho",
    Email: "admin2@fashionstyle.com",
    Password: "Admin@456",
    Address: "Hồ Chí Minh, Việt Nam",
    PhoneNumber: "0900000002",
  },
  {
    FullName: "Admin Vận Hành",
    Email: "admin3@fashionstyle.com",
    Password: "Admin@789",
    Address: "Đà Nẵng, Việt Nam",
    PhoneNumber: "0900000003",
  },
];

async function seedAdmins() {
  let connection;
  try {
    connection = await pool.getConnection();
    console.log("✅ Kết nối DB thành công!\n");

    for (const admin of ADMIN_ACCOUNTS) {
      // Kiểm tra email đã tồn tại chưa
      const [existing] = await connection.query(
        "SELECT UserID, Role FROM Users WHERE Email = ?",
        [admin.Email]
      );

      if (existing.length > 0) {
        const existingRole = existing[0].Role;
        if (existingRole === "Admin") {
          console.log(`⚠️  Bỏ qua: ${admin.Email} — đã là Admin (ID: ${existing[0].UserID})`);
        } else {
          // Đã tồn tại nhưng không phải Admin → cập nhật Role
          await connection.query(
            "UPDATE Users SET Role = 'Admin' WHERE Email = ?",
            [admin.Email]
          );
          console.log(`🔄 Cập nhật Role → Admin: ${admin.Email}`);
        }
        continue;
      }

      // Hash mật khẩu
      const salt = await bcrypt.genSalt(10);
      const passwordHash = await bcrypt.hash(admin.Password, salt);

      // Insert tài khoản Admin
      const [result] = await connection.query(
        `INSERT INTO Users (FullName, Email, PasswordHash, Address, PhoneNumber, Role)
         VALUES (?, ?, ?, ?, ?, 'Admin')`,
        [admin.FullName, admin.Email, passwordHash, admin.Address, admin.PhoneNumber]
      );

      console.log(`✅ Đã tạo Admin: ${admin.Email}  (ID: ${result.insertId})`);
    }

    console.log("\n🎉 Hoàn tất! 3 tài khoản Admin đã sẵn sàng.");
    console.log("=".repeat(50));
    console.log("Thông tin đăng nhập:");
    ADMIN_ACCOUNTS.forEach((a) => {
      console.log(`  📧 ${a.Email}  🔑 ${a.Password}`);
    });
    console.log("=".repeat(50));
  } catch (error) {
    console.error("❌ Lỗi khi seed admin:", error.message);
    process.exit(1);
  } finally {
    if (connection) connection.release();
    process.exit(0);
  }
}

seedAdmins();
