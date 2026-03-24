const express = require("express");
const pool = require("../../dbpool/db");
const { requireAuth, requireAdminLevel1 } = require("../../middlewares/auth");
const router = express.Router();

// GET /api/system-config — Lấy toàn bộ cấu hình hệ thống (Admin 1 only)
router.get("/", requireAuth, requireAdminLevel1, async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT config_key, config_value FROM system_config");
    const config = {};
    rows.forEach(r => { config[r.config_key] = r.config_value === 1; });
    res.json({ success: true, data: config });
  } catch (error) {
    console.error("Lỗi đọc system config:", error);
    res.status(500).json({ error: "Lỗi server" });
  }
});

// PUT /api/system-config — Cập nhật 1 cấu hình (Admin 1 only)
// Body: { key: "maintenance_mode", value: true/false }
router.put("/", requireAuth, requireAdminLevel1, async (req, res) => {
  const { key, value } = req.body;
  const allowedKeys = ["maintenance_mode", "telegram_alerts", "close_registration"];
  if (!allowedKeys.includes(key)) {
    return res.status(400).json({ error: "Config key không hợp lệ." });
  }
  try {
    await pool.query(
      "UPDATE system_config SET config_value = ? WHERE config_key = ?",
      [value ? 1 : 0, key]
    );
    res.json({ success: true, message: `Đã cập nhật ${key} = ${value}` });
  } catch (error) {
    console.error("Lỗi cập nhật system config:", error);
    res.status(500).json({ error: "Lỗi server" });
  }
});

// GET /api/system-config/public — Endpoint công khai cho Web chính kiểm tra trạng thái
router.get("/public", async (req, res) => {
  try {
    const [rows] = await pool.query(
      "SELECT config_key, config_value FROM system_config WHERE config_key IN ('maintenance_mode', 'close_registration')"
    );
    const config = {};
    rows.forEach(r => { config[r.config_key] = r.config_value === 1; });
    res.json({ success: true, data: config });
  } catch (error) {
    res.status(500).json({ error: "Lỗi server" });
  }
});

module.exports = router;
