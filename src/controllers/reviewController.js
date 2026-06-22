
const prisma = require('../config/database');

// ====================== CREATE REVIEW ======================
const createReview = async (req, res) => {
  try {
    const { bookId, rating, comment } = req.body;

    if (!bookId || !rating || rating < 1 || rating > 5) {
      return res.status(400).json({ 
        success: false, 
        message: "Rating phải từ 1 đến 5" 
      });
    }

    // Kiểm tra sách tồn tại
    const book = await prisma.book.findUnique({ where: { id: Number(bookId) } });
    if (!book) {
      return res.status(404).json({ success: false, message: "Không tìm thấy sách" });
    }

    // Kiểm tra user đã mua sách chưa (tùy chọn - có thể bỏ nếu muốn cho phép review tự do)
    const hasPurchased = await prisma.orderItem.findFirst({
      where: {
        bookId: Number(bookId),
        order: { userId: req.user.id, status: 'DELIVERED' }
      }
    });

    // Nếu muốn bắt buộc phải mua mới được review thì uncomment dòng dưới
    if (!hasPurchased) return res.status(400).json({ success: false, message: "Bạn phải mua sách mới được đánh giá" });

    // Kiểm tra đã review chưa
    const existingReview = await prisma.review.findUnique({
      where: {
        userId_bookId: {
          userId: req.user.id,
          bookId: Number(bookId)
        }
      }
    });

    let review;
    if (existingReview) {
      // Update review cũ
      review = await prisma.review.update({
        where: { id: existingReview.id },
        data: { rating, comment }
      });
    } else {
      // Tạo review mới
      review = await prisma.review.create({
        data: {
          userId: req.user.id,
          bookId: Number(bookId),
          rating,
          comment
        },
        include: {
          user: { select: { id: true, name: true, avatar: true } }
        }
      });
    }

    // Cập nhật rating trung bình của sách (tùy chọn)
    const allReviews = await prisma.review.findMany({
      where: { bookId: Number(bookId) }
    });

    const avgRating = allReviews.length > 0 
      ? allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length 
      : 0;

    await prisma.book.update({
      where: { id: Number(bookId) },
      data: { rating: parseFloat(avgRating.toFixed(1)) }
    });

    res.status(201).json({
      success: true,
      message: existingReview ? "Cập nhật đánh giá thành công" : "Đánh giá thành công",
      data: review
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ====================== GET REVIEWS BY BOOK ======================
const getReviewsByBook = async (req, res) => {
  try {
    const { bookId } = req.params;
    const reviews = await prisma.review.findMany({
      where: { bookId: Number(bookId) },
      include: {
        user: { select: { id: true, name: true, avatar: true } }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json({ success: true, data: reviews });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ====================== GET MY REVIEWS ======================
const getMyReviews = async (req, res) => {
  try {
    const reviews = await prisma.review.findMany({
      where: { userId: req.user.id },
      include: {
        book: { select: { id: true, title: true, image: true } }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json({ success: true, data: reviews });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  createReview,
  getReviewsByBook,
  getMyReviews
};