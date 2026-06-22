

  const jwt = require('jsonwebtoken');
  const prisma = require('../config/database');

  
  const protect = async (req, res, next) => {
    console.log('AUTH HEADER:', req.headers.authorization);
    try {
      let token;
      if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        token = req.headers.authorization.split(' ')[1];
      }

      if (!token) {
        return res.status(401).json({ success: false, message: "Không có token, vui lòng đăng nhập" });
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = await prisma.user.findUnique({ where: { id: decoded.id } });
      next();
    } catch (error) {
      res.status(401).json({ success: false, message: "Token không hợp lệ" });
    }
  };

  const adminOnly = (req, res, next) => {
    if (req.user && req.user.role === 'ADMIN') {
      next();
    } else {
      res.status(403).json({ success: false, message: "Chỉ Admin mới có quyền truy cập" });
    }
  };

  module.exports = { protect, adminOnly };