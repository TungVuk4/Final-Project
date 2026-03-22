const pool = require('./dbpool/db');

async function run() {
  try {
    try {
      // Vì bảng reviews đã có sẵn nên ta sẽ dùng ALTER TABLE để thêm cột GuestName
      console.log("Altering Reviews table to add GuestName...");
      await pool.query(`
        ALTER TABLE reviews 
        ADD COLUMN GuestName VARCHAR(255) NULL AFTER UserID;
      `);
      console.log("Added GuestName column successfully.");
    } catch (e) {
      if (e.code === 'ER_DUP_FIELDNAME') {
        console.log("GuestName column already exists.");
      } else {
        throw e;
      }
    }
    
    console.log("Creating Notifications table...");
    await pool.query(`
      CREATE TABLE IF NOT EXISTS Notifications (
        NotificationID INT AUTO_INCREMENT PRIMARY KEY,
        Type VARCHAR(50) DEFAULT 'SYSTEM',
        Message TEXT NOT NULL,
        IsRead BOOLEAN DEFAULT FALSE,
        CreatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    
    const [tables] = await pool.query('SHOW TABLES');
    console.log('Tables:', tables);
    process.exit(0);
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
}
run();
