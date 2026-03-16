const fs = require("fs");
const path = require("path");
const pool = require("./dbpool/db");
const stringSimilarity = require("string-similarity");

// --- BƯỚC 1: BẠN ĐIỀN CÁC FILE LỖI VÀO ĐÂY ---
// Cú pháp: "tên_file_bị_lỗi": ID_sản_phẩm_tương_ứng
const manualMap = {
  "23CMCW.TA002.2.avif": 101,
  "24CMCW.SM007_-_Xam_7.avif": 139,
  "24CMCW.TN001_-_XAM.avif": 109,
  "24CMCW.TT001.5_1.avif": 162,
  "24CMHU.BX023_-_Xanh_Coban_3D.avif": 114,
  "24CMHU.GN001_-DEN.avif": 112,
  "tat-tt-firm-compression-sock-Trang_7.avif": 291,
  "TAT_BONG_DA_CO_CAOIMG_9710.avif": 291,
  "tui-untility-duffle-size-vua-18l-den-2_71.avif": 299,
  "tui_trong_gym-3.avif": 301,
  "_CMM6590.avif": 125,
  "thumbccxcbUntitled-2_copy.avif": 186,
  // TẬP TIN CUỐI CÙNG ĐÃ ĐƯỢC THÊM VÀO ĐÂY:
  "short-nam-6inch-pickleball-smash-shot-cut-_8 copy.avif": 259,
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
      .filter((f) => !f.startsWith("."));
    const [products] = await pool.query(
      "SELECT ProductID, ProductName FROM Products"
    );

    const imageValues = [];
    console.log(`--- Đang xử lý ${files.length} ảnh bằng bản Final Sync ---`);

    const productData = products.map((p) => ({
      id: p.ProductID,
      name: p.ProductName,
      normName: normalize(p.ProductName),
    }));

    files.forEach((file) => {
      let bestMatch = null;
      let highestScore = 0;

      // 1. ƯU TIÊN KIỂM TRA TRONG MANUAL MAP TRƯỚC
      if (manualMap[file]) {
        const foundInMap = productData.find((p) => p.id === manualMap[file]);
        if (foundInMap) {
          bestMatch = foundInMap;
          highestScore = 1.0;
          console.log(`⭐ [Gán thủ công] "${file}" -> ${bestMatch.name}`);
        }
      }

      // 2. NẾU KHÔNG CÓ TRONG MAP, DÙNG THUẬT TOÁN CŨ
      if (!bestMatch) {
        const fileBase = file.split(".")[0];
        const fileNorm = normalize(fileBase);

        const matches = stringSimilarity.findBestMatch(
          fileNorm,
          productData.map((p) => p.normName)
        );
        if (matches.bestMatch.rating > 0.3) {
          bestMatch = productData[matches.bestMatchIndex];
          highestScore = matches.bestMatch.rating;
          console.log(
            `✅ [Khớp ${Math.round(highestScore * 100)}%] "${file}" -> ${
              bestMatch.name
            }`
          );
        }
      }

      if (bestMatch) {
        imageValues.push([bestMatch.id, file]);
      } else {
        console.log(`❌ Không thể khớp: "${file}"`);
      }
    });

    if (imageValues.length > 0) {
      await pool.query("DELETE FROM Image");
      const sql = `INSERT INTO Image (ProductID, FileName) VALUES ?`;
      await pool.query(sql, [imageValues]);
      console.log(
        `\n🎉 HOÀN TẤT TUYỆT ĐỐI: Đã gán ${imageValues.length}/${files.length} ảnh.`
      );
    }
  } catch (err) {
    console.error("❌ Lỗi:", err.message);
  } finally {
    process.exit();
  }
}

finalUltraSync();
