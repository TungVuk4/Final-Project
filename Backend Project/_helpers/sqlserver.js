const sql = require("mssql");
require("dotenv").config();

const sqlConfig = {
    user: process.env.USER_SA,
    password: process.env.PASS_SA,
    database: process.env.DATABASE2,
    server: process.env.SERVER,
    options: {
        encrypt: false,
        trustServerCertificate: true,
    },
};


const getData = async (sqlstr) => {
    try {
        let pool = await sql.connect(sqlConfig)
        let result = await pool.request()
            .query(sqlstr);

        if (result.recordset.length > 0) {
            return result.recordset;
        } else {
            return false
        }

    } catch (err) {
        console.log('Error: ', err)
        return false
    }
}

const insertData = async (sqlstr) => {
    try {
        let pool = await sql.connect(sqlConfig)
        let result = await pool.request()
            .query(sqlstr);

        if (result.rowsAffected.length > 0) {
            return true;
        } else {
            return false;
        }


    } catch (err) {
        console.log('Error: ', err)
        return false
    }
}

const deleteData = async (sqlstr) => {
    try {
        let pool = await sql.connect(sqlConfig)
        let result = await pool.request()
            .query(sqlstr);

        if (result.rowsAffected.length > 0) {
            return true;
        } else {
            return false;
        }


    } catch (err) {
        console.log('Error: ', err)
        return false
    }
}

const getValue = async (sqlstr) => {
    try {
        let pool = await sql.connect(sqlConfig)
        let result = await pool.request()
            .query(sqlstr);

        if (result.recordset.length === 1) {
            return result.recordset[0];
        } else {
            return false
        }

    } catch (err) {
        console.log('Error: ', err)
        return false
    }
}

module.exports = { getData, insertData, deleteData, getValue }