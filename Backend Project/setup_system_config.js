const mysql = require('mysql2/promise');

(async () => {
  const pool = await mysql.createPool({ host: 'localhost', user: 'root', password: '', database: 'fashionstyledb' });

  try {
    // Lấy dữ liệu hiện tại trước khi drop
    let existingRows = [];
    try {
      const [rows] = await pool.query('SELECT config_key, config_value FROM system_config');
      existingRows = rows;
    } catch {}

    // Recreate bảng với khóa ngoại updated_by → Users(UserID)
    await pool.query(`DROP TABLE IF EXISTS system_config`);
    console.log('Dropped old system_config');

    await pool.query(`
      CREATE TABLE system_config (
        config_key   VARCHAR(64)  NOT NULL,
        config_value TINYINT(1)   NOT NULL DEFAULT 0,
        updated_at   TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        updated_by   INT(11)      NULL DEFAULT NULL COMMENT 'Admin UserID người cập nhật',
        CONSTRAINT pk_system_config PRIMARY KEY (config_key),
        CONSTRAINT fk_sysconfig_user FOREIGN KEY (updated_by)
          REFERENCES Users(UserID)
          ON DELETE SET NULL
          ON UPDATE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
    console.log('Created system_config (với FK → Users)');

    // Insert lại dữ liệu (giữ giá trị cũ nếu có)
    const defaults = [
      ['maintenance_mode',   0],
      ['telegram_alerts',    1],
      ['close_registration', 0],
    ];

    for (const [key, defaultVal] of defaults) {
      const existing = existingRows.find(r => r.config_key === key);
      const val = existing ? existing.config_value : defaultVal;
      await pool.query(
        `INSERT INTO system_config (config_key, config_value) VALUES (?, ?)`,
        [key, val]
      );
    }
    console.log('Inserted 3 config rows');

    // Verify
    const [rows] = await pool.query('SELECT * FROM system_config');
    console.log('\nDữ liệu hiện tại:');
    rows.forEach(r => console.log(`  ${r.config_key.padEnd(25)} = ${r.config_value}  (updated_by: ${r.updated_by ?? 'NULL'})`));

    console.log('\n✅ Hoàn tất! Khóa ngoại: system_config.updated_by → Users.UserID');
  } catch (e) {
    console.error('Lỗi:', e.message);
  }

  await pool.end();
  process.exit(0);
})();
