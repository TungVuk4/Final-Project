const mysql = require('mysql2/promise');
const dbConfig = {
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'fashionstyledb'
};

async function migrate() {
    let connection;
    try {
        connection = await mysql.createConnection(dbConfig);
        console.log("Checking and migrating columns...");
        
        // Add SpecificCode to UserVouchers if not exists
        try {
            await connection.query("ALTER TABLE UserVouchers ADD COLUMN SpecificCode VARCHAR(50) NULL;");
            console.log("Added SpecificCode to UserVouchers");
        } catch (e) {
            if (e.code === 'ER_DUP_COLUMN_NAME') console.log("SpecificCode already exists in UserVouchers");
            else throw e;
        }

        // Add AssignedToUserID to promotions_code if not exists
        try {
            await connection.query("ALTER TABLE promotions_code ADD COLUMN AssignedToUserID INT NULL;");
            console.log("Added AssignedToUserID to promotions_code");
            
            // Add Foreign Key for AssignedToUserID
            await connection.query("ALTER TABLE promotions_code ADD CONSTRAINT fk_assigned_user FOREIGN KEY (AssignedToUserID) REFERENCES Users(UserID) ON DELETE SET NULL;");
            console.log("Added foreign key to AssignedToUserID");
        } catch (e) {
            if (e.code === 'ER_DUP_COLUMN_NAME' || e.code === 'ER_FK_DUP_NAME') console.log("AssignedToUserID or FK already exists");
            else throw e;
        }

        console.log("Migration successful!");
    } catch (err) {
        console.error("Migration failed:", err);
    } finally {
        if (connection) await connection.end();
    }
}

migrate();
