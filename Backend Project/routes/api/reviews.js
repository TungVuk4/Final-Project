const express = require('express');
const router = express.Router();
const pool = require('../../dbpool/db');

// Lấy danh sách đánh giá của 1 sản phẩm
router.get('/product/:id', async (req, res) => {
  try {
    const productId = req.params.id;
    const [reviews] = await pool.query(`
      SELECT r.*, u.FullName as UserFullName, u.Avatar 
      FROM Reviews r
      LEFT JOIN Users u ON r.UserID = u.UserID
      WHERE r.ProductID = ?
      ORDER BY r.CreatedAt DESC
    `, [productId]);

    // Xử lý dữ liệu hiển thị (kết hợp GuestName và UserFullName)
    const formattedReviews = reviews.map(r => ({
      ReviewID: r.ReviewID,
      ProductID: r.ProductID,
      UserID: r.UserID,
      AuthorName: r.UserID ? r.UserFullName : r.GuestName,
      Avatar: r.Avatar || null, // Có thể frontend tự render avatar chữ cái
      Rating: r.Rating,
      Comment: r.Comment,
      CreatedAt: r.CreatedAt
    }));

    res.json({ success: true, count: formattedReviews.length, data: formattedReviews });
  } catch (error) {
    console.error('Lỗi khi lấy đánh giá:', error);
    res.status(500).json({ success: false, message: 'Lỗi server khi lấy đánh giá' });
  }
});

// Thêm mới 1 đánh giá (Có thể là User đang đăng nhập hoặc Guest)
router.post('/', async (req, res) => {
  try {
    const { ProductID, UserID, GuestName, Rating, Comment } = req.body;
    
    // Validate
    if (!ProductID || !Rating) {
      return res.status(400).json({ success: false, message: 'Thiếu thông tin ProductID hoặc Rating' });
    }
    if (Rating < 1 || Rating > 5) {
      return res.status(400).json({ success: false, message: 'Rating phải từ 1 đến 5' });
    }
    if (!UserID && !GuestName) {
      return res.status(400).json({ success: false, message: 'Cần có UserID hoặc GuestName' });
    }

    const [result] = await pool.query(`
      INSERT INTO Reviews (ProductID, UserID, GuestName, Rating, Comment)
      VALUES (?, ?, ?, ?, ?)
    `, [ProductID, UserID || null, GuestName || null, Rating, Comment || '']);

    res.status(201).json({ 
      success: true, 
      message: 'Thêm đánh giá thành công',
      data: {
        ReviewID: result.insertId,
        ProductID,
        UserID: UserID || null,
        GuestName: GuestName || null,
        Rating,
        Comment
      }
    });
  } catch (error) {
    console.error('Lỗi khi thêm đánh giá:', error);
    res.status(500).json({ success: false, message: 'Lỗi server khi thêm đánh giá' });
  }
});

module.exports = router;
