const prisma = require('../config/database');

// ====================== GET CART ======================
const getCart = async (req, res) => {
  try {
    let cart = await prisma.cart.findUnique({
      where: { userId: req.user.id },
      include: {
        items: {
          include: {
            book: {
              select: {
                id: true,
                title: true,
                slug: true,
                price: true,
                image: true,
                stock: true,
                author: { select: { name: true } }
              }
            }
          }
        }
      }
    });

    if (!cart) {
      cart = await prisma.cart.create({
        data: { userId: req.user.id },
        include: { items: true }
      });
    }

    const totalItems = cart.items.reduce((sum, item) => sum + item.quantity, 0);
    const totalPrice = cart.items.reduce((sum, item) => sum + item.quantity * item.book.price, 0);

    res.json({
      success: true,
      data: {
        id: cart.id,
        items: cart.items,
        totalItems,
        totalPrice
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ====================== ADD TO CART ======================
const addToCart = async (req, res) => {
  try {
    const { bookId, quantity = 1 } = req.body;

    if (!bookId) {
      return res.status(400).json({ success: false, message: "bookId là bắt buộc" });
    }

    // Kiểm tra sách tồn tại và còn hàng
    const book = await prisma.book.findUnique({ where: { id: bookId } });
    if (!book) {
      return res.status(404).json({ success: false, message: "Không tìm thấy sách" });
    }
    if (book.stock < quantity) {
      return res.status(400).json({ success: false, message: "Sách không đủ số lượng" });
    }

    let cart = await prisma.cart.findUnique({ where: { userId: req.user.id } });

    if (!cart) {
      cart = await prisma.cart.create({ data: { userId: req.user.id } });
    }

    const existingItem = await prisma.cartItem.findFirst({
      where: { cartId: cart.id, bookId }
    });

    if (existingItem) {
      const newQuantity = existingItem.quantity + quantity;
      if (newQuantity > book.stock) {
        return res.status(400).json({ success: false, message: "Vượt quá số lượng tồn kho" });
      }

      await prisma.cartItem.update({
        where: { id: existingItem.id },
        data: { quantity: newQuantity }
      });
    } else {
      await prisma.cartItem.create({
        data: { cartId: cart.id, bookId, quantity }
      });
    }

    res.json({ success: true, message: "Đã thêm vào giỏ hàng" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ====================== UPDATE QUANTITY ======================
const updateCartItem = async (req, res) => {
  try {
    const { bookId } = req.params;
    const { quantity } = req.body;

    if (!quantity || quantity < 1) {
      return res.status(400).json({ success: false, message: "Số lượng phải lớn hơn 0" });
    }

    const cart = await prisma.cart.findUnique({ where: { userId: req.user.id } });
    if (!cart) {
      return res.status(404).json({ success: false, message: "Giỏ hàng không tồn tại" });
    }

    const cartItem = await prisma.cartItem.findFirst({
      where: { cartId: cart.id, bookId: Number(bookId) }
    });

    if (!cartItem) {
      return res.status(404).json({ success: false, message: "Sản phẩm không có trong giỏ hàng" });
    }

    // Kiểm tra stock
    const book = await prisma.book.findUnique({ where: { id: Number(bookId) } });
    if (quantity > book.stock) {
      return res.status(400).json({ success: false, message: "Vượt quá số lượng tồn kho" });
    }

    await prisma.cartItem.update({
      where: { id: cartItem.id },
      data: { quantity }
    });

    res.json({ success: true, message: "Cập nhật số lượng thành công" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ====================== REMOVE ITEM ======================
const removeFromCart = async (req, res) => {
  try {
    const { bookId } = req.params;

    const cart = await prisma.cart.findUnique({ where: { userId: req.user.id } });
    if (!cart) {
      return res.status(404).json({ success: false, message: "Giỏ hàng không tồn tại" });
    }

    await prisma.cartItem.deleteMany({
      where: { cartId: cart.id, bookId: Number(bookId) }
    });

    res.json({ success: true, message: "Đã xóa sản phẩm khỏi giỏ hàng" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ====================== CLEAR CART ======================
const clearCart = async (req, res) => {
  try {
    const cart = await prisma.cart.findUnique({ where: { userId: req.user.id } });
    if (!cart) {
      return res.status(404).json({ success: false, message: "Giỏ hàng không tồn tại" });
    }

    await prisma.cartItem.deleteMany({
      where: { cartId: cart.id }
    });

    res.json({ success: true, message: "Đã xóa toàn bộ giỏ hàng" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getCart,
  addToCart,
  updateCartItem,
  removeFromCart,
  clearCart
};