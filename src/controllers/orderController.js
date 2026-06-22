const prisma = require('../config/database');

// ====================== CREATE ORDER ======================
const createOrder = async (req, res) => {
  try {
    const { shippingAddress, paymentMethod = "cod", note } = req.body;

    // Lấy giỏ hàng của user
    const cart = await prisma.cart.findUnique({
      where: { userId: req.user.id },
      include: { 
        items: { 
          include: { book: true } 
        } 
      }
    });

    if (!cart || cart.items.length === 0) {
      return res.status(400).json({ success: false, message: "Giỏ hàng trống" });
    }

    // Tính tổng tiền
    let totalAmount = 0;
    const orderItemsData = [];

    for (const item of cart.items) {
      if (item.book.stock < item.quantity) {
        return res.status(400).json({ 
          success: false, 
          message: `Sách "${item.book.title}" không đủ số lượng` 
        });
      }
      totalAmount += item.book.price * item.quantity;

      orderItemsData.push({
        bookId: item.bookId,
        quantity: item.quantity,
        price: item.book.price
      });
    }

    // Tạo Order
    const order = await prisma.order.create({
      data: {
        userId: req.user.id,
        totalAmount,
        paymentMethod,
        shippingAddress: shippingAddress || req.user.address,
        note,
        items: {
          create: orderItemsData
        }
      },
      include: {
        items: {
          include: { book: { select: { title: true, image: true } } }
        }
      }
    });

    // Cập nhật stock sách
    for (const item of cart.items) {
      await prisma.book.update({
        where: { id: item.bookId },
        data: { stock: { decrement: item.quantity } }
      });
    }

    // Xóa giỏ hàng sau khi đặt hàng
    await prisma.cartItem.deleteMany({ where: { cartId: cart.id } });

    res.status(201).json({
      success: true,
      message: "Đặt hàng thành công",
      data: order
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ====================== GET MY ORDERS ======================
const getMyOrders = async (req, res) => {
  try {
    const orders = await prisma.order.findMany({
      where: { userId: req.user.id },
      include: {
        items: {
          include: {
            book: {
              select: {
                id: true,
                title: true,
                image: true,
                price: true,
                reviews: {
                  where: {
                    userId: req.user.id
                  },
                  select: {
                    id: true
                  }
                }
              }
            }
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json({ success: true, data: orders });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ====================== GET ORDER DETAIL ======================
const getOrderById = async (req, res) => {
  try {
    const order = await prisma.order.findFirst({
      where: { 
        id: Number(req.params.id),
        userId: req.user.id 
      },
      include: {
        items: {
          include: { 
            book: { 
              select: { id: true, title: true, image: true, price: true, author: true } 
            } 
          }
        }
      }
    });

    if (!order) {
      return res.status(404).json({ success: false, message: "Không tìm thấy đơn hàng" });
    }

    res.json({ success: true, data: order });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ====================== CANCEL ORDER ======================
const cancelOrder = async (req, res) => {
  try {
    const order = await prisma.order.findFirst({
      where: { 
        id: Number(req.params.id),
        userId: req.user.id,
        status: 'PENDING'
      }
    });

    if (!order) {
      return res.status(400).json({ 
        success: false, 
        message: "Không thể hủy đơn hàng này" 
      });
    }

    // Hoàn lại stock (nếu cần)
    const items = await prisma.orderItem.findMany({
      where: { orderId: order.id },
      include: { book: true }
    });

    for (const item of items) {
      await prisma.book.update({
        where: { id: item.bookId },
        data: { stock: { increment: item.quantity } }
      });
    }

    await prisma.order.update({
      where: { id: order.id },
      data: { status: 'CANCELLED' }
    });

    res.json({ success: true, message: "Đã hủy đơn hàng thành công" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const requestReturn = async (req, res) => {
  try {
    const { reason } = req.body;

    const order = await prisma.order.findFirst({
      where: {
        id: Number(req.params.id),
        userId: req.user.id,
        status: 'DELIVERED'
      }
    });

    if (!order) {
      return res.status(400).json({
        success: false,
        message: 'Đơn hàng không hợp lệ'
      });
    }

    const deliveredDate = new Date(order.deliveredAt);
    const now = new Date();

    const diffDays =
      (now - deliveredDate) /
      (1000 * 60 * 60 * 24);

    if (diffDays > 3) {
      return res.status(400).json({
        success: false,
        message: 'Đã quá thời hạn trả hàng'
      });
    }

    await prisma.order.update({
      where: {
        id: order.id
      },
      data: {
        status: 'RETURN_REQUESTED',
        returnReason: reason,
        returnRequestAt: new Date()
      }
    });

    res.json({
      success: true,
      message: 'Yêu cầu trả hàng đã được gửi'
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

module.exports = {
  createOrder,
  getMyOrders,
  getOrderById,
  cancelOrder,
  requestReturn
};