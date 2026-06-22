
const prisma = require('../config/database');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const generateTokens = (user) => {
  const accessToken = jwt.sign(
    { id: user.id, email: user.email, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );

  const refreshToken = jwt.sign(
    { id: user.id },
    process.env.REFRESH_TOKEN_SECRET,
    { expiresIn: process.env.REFRESH_TOKEN_EXPIRES_IN || '30d' }
  );

  return { accessToken, refreshToken };
};

// ====================== REGISTER ======================
const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: "Vui lòng nhập đầy đủ thông tin" });
    }

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ success: false, message: "Email đã tồn tại" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: { name, email, password: hashedPassword },
      select: { id: true, name: true, email: true, role: true, avatar: true, phone: true, address: true }
    });

    const { accessToken, refreshToken } = generateTokens(user);

    res.status(201).json({
      success: true,
      message: "Đăng ký tài khoản thành công",
      data: { user, accessToken, refreshToken }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ====================== LOGIN ======================
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await prisma.user.findUnique({ 
      where: { email },
      select: { id: true, name: true, email: true, role: true, phone: true, address: true, avatar: true, password: true }
    });

    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ success: false, message: "Email hoặc mật khẩu không đúng" });
    }

    const { accessToken, refreshToken } = generateTokens(user);

    // Loại password trước khi trả về
    delete user.password;

    res.json({
      success: true,
      message: "Đăng nhập thành công",
      data: { user, accessToken, refreshToken }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ====================== REFRESH TOKEN ======================
const refreshToken = async (req, res) => {
  try {
    const { refreshToken: token } = req.body;

    if (!token) {
      return res.status(401).json({ success: false, message: "Refresh token không tồn tại" });
    }

    const decoded = jwt.verify(token, process.env.REFRESH_TOKEN_SECRET);
    
    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      select: { id: true, name: true, email: true, role: true, avatar: true }
    });

    if (!user) {
      return res.status(401).json({ success: false, message: "User không tồn tại" });
    }

    const { accessToken, refreshToken: newRefreshToken } = generateTokens(user);

    res.json({
      success: true,
      message: "Refresh token thành công",
      data: { accessToken, refreshToken: newRefreshToken }
    });
  } catch (error) {
    res.status(401).json({ success: false, message: "Refresh token không hợp lệ hoặc đã hết hạn" });
  }
};

// ====================== GET ME ======================
const getMe = async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: { 
        id: true, 
        name: true, 
        email: true, 
        role: true, 
        avatar: true,
        phone: true,
        address: true,
        createdAt: true 
      }
    });

    res.json({ success: true, data: user });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ====================== LOGOUT ======================
const logout = async (req, res) => {
  // Hiện tại chỉ xóa token ở client-side
  // Nếu muốn blacklist refresh token thì cần thêm bảng TokenBlacklist sau
  res.json({ success: true, message: "Đăng xuất thành công" });
};

module.exports = { register, login, refreshToken, getMe, logout };