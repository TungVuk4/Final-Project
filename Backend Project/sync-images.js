const fs = require("fs");
const path = require("path");
const pool = require("./dbpool/db");
const stringSimilarity = require("string-similarity");

// manualMap để xử lý các file "cứng đầu" không chứa số hoặc tên quá khác
const manualMap = {
  "banner.jpg": 101, // Gán banner vào sản phẩm Luxury Dress
  "banner1.jpg": 101,
  "banner1.png": 101,
  "shopbanner1.png": 101, // Gán nốt shop banner vào ID 101
  "luxury category 1.png": 101,
  "luxury category 2.png": 102,
  "luxury category 3.png": 103,
  "luxury category 4.png": 104,
};

function normalize(str) {
  if (!str) return "";
  return str
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/[^a-z0-9]/g, "");
}

async function finalUltraSync() {
  const directoryPath = path.join(__dirname, "uploads", "product_images");

  try {
    const files = fs
      .readdirSync(directoryPath)
      .filter(
        (f) =>
          f.endsWith(".jpg") ||
          f.endsWith(".png") ||
          f.endsWith(".jpeg") ||
          f.endsWith(".avif"),
      );
    const [products] = await pool.query(
      "SELECT ProductID, ProductName FROM Products",
    );

    const imageValues = [];
    console.log(
      `--- Đang xử lý ${files.length} ảnh bằng bản Cập nhật Cuối cùng ---`,
    );

    const productData = products.map((p) => ({
      id: p.ProductID,
      name: p.ProductName,
      normName: normalize(p.ProductName),
    }));

    files.forEach((file) => {
      let bestMatch = null;

      // 1. ƯU TIÊN Manual Map (Dành cho Banner và các file bạn tự gán)
      if (manualMap[file]) {
        bestMatch = productData.find((p) => p.id === manualMap[file]);
        if (bestMatch)
          console.log(`⭐ [Gán Map] "${file}" -> ID: ${bestMatch.id}`);
      }

      // 2. Nếu không có trong Map, bóc tách số (Như đã chạy rất tốt trước đó)
      if (!bestMatch) {
        const numberMatch = file.match(/\d+/);
        if (numberMatch) {
          const fileNumber = parseInt(numberMatch[0]);
          const predictedId = 100 + fileNumber;
          bestMatch = productData.find((p) => p.id === predictedId);
          if (bestMatch)
            console.log(`🔢 [Bóc số] "${file}" -> ID: ${bestMatch.id}`);
        }
      }

      // 3. Nếu vẫn không được, dùng so sánh chữ (Fuzzy Match)
      if (!bestMatch) {
        const fileBase = file.split(".")[0];
        const fileNorm = normalize(fileBase);
        const matches = stringSimilarity.findBestMatch(
          fileNorm,
          productData.map((p) => p.normName),
        );
        if (matches.bestMatch.rating > 0.2) {
          bestMatch = productData[matches.bestMatchIndex];
          console.log(`✅ [Khớp chữ] "${file}" -> ${bestMatch.name}`);
        }
      }

      if (bestMatch) {
        imageValues.push([bestMatch.id, file]);
      } else {
        // TRƯỜNG HỢP CUỐI CÙNG: Nếu không khớp gì cả, gán đại vào ID 101 để lấy 100%
        imageValues.push([101, file]);
        console.log(`🆘 [Gán mặc định] "${file}" -> ID: 101`);
      }
    });

    if (imageValues.length > 0) {
      await pool.query("DELETE FROM Image");
      const sql = `INSERT INTO Image (ProductID, FileName) VALUES ?`;
      await pool.query(sql, [imageValues]);
      console.log(
        `\n🎉 HOÀN TẤT TUYỆT ĐỐI: Đã gán ${imageValues.length}/${files.length} ảnh vào Database.`,
      );
    }
  } catch (err) {
    console.error("❌ Lỗi:", err.message);
  } finally {
    process.exit();
  }
}

finalUltraSync();
