const jwt = require("jsonwebtoken");

const sql = require("mssql");

require("dotenv").config();

const sqlConfig = {
  user: process.env.USER_SA,
  password: process.env.PASS_SA,
  database: process.env.DATABASE,
  server: process.env.SERVER,
  options: {
    encrypt: false,
    trustServerCertificate: true,
  },
};

const secret = process.env.SECRET;

module.exports = {
  checkLogin,
};

async function checkLogin({ username, password, os, uniqueid }) {
  try {
    let pool = await sql.connect(sqlConfig);
    let result1 = await pool
      .request()
      .input("ht", sql.NVarChar, username)
      .input("matkhau", sql.NVarChar, password)
      .query(
        "SELECT idns, hoten,  email, tendonvi, gioitinh, iddv, nhomcv_phieugiaoviec as nhomcv  FROM vw_ns_pq_weblogin3 WHERE active_mobile = 1 AND ht=@ht COLLATE Latin1_General_CS_AS AND convert(nvarchar(50), convert(nvarchar(50), decryptbypassphrase('udc',[mk]))) = @matkhau COLLATE Latin1_General_CS_AS"
      );
    //Kiểm tra đúng username và password hay không?
    if (result1.recordset.length > 0) {
      //Lấy idns
      const idns = result1.recordset[0].idns;

      //Kiểm tra trường hợp đúng user và đúng thiết bị
      let result2 = await pool
        .request()
        .input("idns", sql.Int, idns)
        .input("uniqueid", sql.NVarChar, uniqueid)
        .query(
          "select userid from ns_mobile_session where userid = @idns AND uniqueid=@uniqueid COLLATE Latin1_General_CS_AS"
        );

      if (result2.recordset.length > 0) {
        const token = jwt.sign({ sub: idns }, secret);
        const ketqua = {
          success: true,
          user: result1.recordset[0],
          token: token,
        };
        return ketqua;
      }

      //Kiểm tra trường hợp user chưa từng đăng nhập
      let result3 = await pool
        .request()
        .input("idns", sql.Int, idns)
        .input("uniqueid", sql.NVarChar, uniqueid)
        .query(
          "select userid from ns_mobile_session where userid = @idns OR uniqueid=@uniqueid COLLATE Latin1_General_CS_AS"
        );

      if (result3.recordset.length <= 0) {
        const token = jwt.sign({ sub: idns }, secret);
        const ketqua = {
          success: true,
          user: result1.recordset[0],
          token: token,
        };

        //Thêm vào bảng Session
        await pool
          .request()
          .input("userid", sql.Int, idns)
          .input("os", sql.NVarChar, os)
          .input("uniqueid", sql.NVarChar, uniqueid)
          .query(
            "INSERT INTO  ns_mobile_session(userid,os,uniqueid) VALUES (@userid,@os,@uniqueid)"
          );

        return ketqua;
      }

      const error = {
        error: true,
        message:
          "Mỗi Tài khoản chỉ được sử dụng trên 1 thiết bị duy nhất. Liên hệ admin: phuong.udc@gmail.com",
      };
      return error;
    } else {
      const error = {
        error: true,
        message:
          "Sai thông tin đăng nhập hoặc tài khoản không có quyền truy cập ứng dụng",
      };
      return error;
    }
  } catch (err) {
    throw err;
  }
}
