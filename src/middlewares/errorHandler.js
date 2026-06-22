

const errorHandler = (err, req, res, next) => {
  console.error(`❌ Error: ${err.message}`);
  console.error(err.stack);

  // Lỗi từ Zod Validation
  if (err.name === 'ZodError') {
    return res.status(400).json({
      success: false,
      message: "Dữ liệu đầu vào không hợp lệ",
      errors: err.errors.map(e => ({
        field: e.path.join('.'),
        message: e.message
      }))
    });
  }

  // Lỗi Prisma (ví dụ: record not found, unique constraint...)
  if (err.code) {
    if (err.code === 'P2002') {
      return res.status(409).json({
        success: false,
        message: "Dữ liệu đã tồn tại (vi phạm unique constraint)"
      });
    }
    if (err.code === 'P2025') {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy dữ liệu"
      });
    }
  }

  // Lỗi JWT
  if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
    return res.status(401).json({
      success: false,
      message: "Phiên đăng nhập không hợp lệ hoặc đã hết hạn"
    });
  }

  // Lỗi mặc định
  const statusCode = err.statusCode || 500;
  res.status(statusCode).json({
    success: false,
    message: err.message || "Đã xảy ra lỗi máy chủ",
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
};

module.exports = errorHandler;