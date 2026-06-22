const validate = (schema) => (req, res, next) => {
  try {
    schema.parse(req.body);
    next();
  } catch (error) {
    if (error.name === 'ZodError') {
      return res.status(400).json({
        success: false,
        message: "Dữ liệu đầu vào không hợp lệ",
        errors: error.errors ? error.errors.map(err => ({
          field: err.path.join('.'),
          message: err.message
        })) : []
      });
    }

    // Lỗi khác
    return res.status(400).json({
      success: false,
      message: "Dữ liệu không hợp lệ",
      error: error.message
    });
  }
};

module.exports = validate;