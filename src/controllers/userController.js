

const prisma = require('../config/database');
const bcrypt = require('bcryptjs');

// ====================== GET PROFILE ======================
const getProfile = async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: {
        id: true,
        name: true,
        email: true,
        avatar: true,
        phone: true,
        address: true,
        role: true,
        createdAt: true
      }
    });

    if (!user) {
      return res.status(404).json({ success: false, message: "Không tìm thấy user" });
    }

    res.json({ success: true, data: user });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ====================== UPDATE PROFILE ======================
const updateProfile = async (req, res) => {
  try {
    const { name, avatar, phone, address } = req.body;

    const updatedUser = await prisma.user.update({
      where: { id: req.user.id },
      data: {
        name,
        avatar,
        phone,
        address
      },
      select: {
        id: true,
        name: true,
        email: true,
        avatar: true,
        phone: true,
        address: true,
        role: true
      }
    });

    res.json({
      success: true,
      message: "Cập nhật thông tin cá nhân thành công",
      data: updatedUser
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ====================== CHANGE PASSWORD ======================
const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ success: false, message: "Vui lòng nhập đầy đủ mật khẩu" });
    }

    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: { password: true }
    });

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({ success: false, message: "Mật khẩu hiện tại không đúng" });
    }

    const hashedNewPassword = await bcrypt.hash(newPassword, 10);

    await prisma.user.update({
      where: { id: req.user.id },
      data: { password: hashedNewPassword }
    });

    res.json({ success: true, message: "Đổi mật khẩu thành công" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getProfile,
  updateProfile,
  changePassword
};