  
const prisma = require('../config/database');

// ====================== BOOK MANAGEMENT ======================
const getAllBooksAdmin = async (req, res) => {
  const { page = 1, limit = 20, search } = req.query;
  const skip = (page - 1) * limit;

  const books = await prisma.book.findMany({
    where: search ? { title: { contains: search, mode: 'insensitive' } } : {},
    include: { author: true, category: true, publisher: true },
    skip: Number(skip),
    take: Number(limit),
    orderBy: { createdAt: 'desc' }
  });

  const total = await prisma.book.count();
  res.json({ success: true, data: books, pagination: { total, page: Number(page), limit: Number(limit) } });
};

const createBookAdmin = async (req, res) => {
  const { title, slug, description, price, image, stock, authorId, categoryId, publisherId, pageCount } = req.body;
  
  const book = await prisma.book.create({
    data: { title, slug, description, price, image, stock, authorId, categoryId, publisherId, pageCount },
    include: { author: true, category: true }
  });
  res.status(201).json({ success: true, message: "Tạo sách thành công", data: book });
};

const updateBookAdmin = async (req, res) => {
  const { id } = req.params;
  const data = req.body;
  const book = await prisma.book.update({
    where: { id: Number(id) },
    data,
    include: { author: true, category: true }
  });
  res.json({ success: true, message: "Cập nhật sách thành công", data: book });
};

const deleteBookAdmin = async (req, res) => {
  const { id } = req.params;
  await prisma.book.delete({ where: { id: Number(id) } });
  res.json({ success: true, message: "Xóa sách thành công" });
};

// ====================== ORDER MANAGEMENT ======================
const getAllOrdersAdmin = async (req, res) => {
  const orders = await prisma.order.findMany({
    include: {
      user: { select: { id: true, name: true, email: true } },
      items: { include: { book: { select: { title: true } } } }
    },
    orderBy: { createdAt: 'desc' }
  });
  res.json({ success: true, data: orders });
};

const updateOrderStatus = async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

const updateData = {
  status
};

if (status === 'DELIVERED') {
  updateData.deliveredAt = new Date();
}

const order = await prisma.order.update({
  where: {
    id: Number(id)
  },
  data: updateData
});
  res.json({ success: true, message: "Cập nhật trạng thái đơn hàng thành công", data: order });
};

const approveReturn = async (req, res) => {
  const { id } = req.params;

  const order = await prisma.order.update({
    where: {
      id: Number(id)
    },
    data: {
      status: 'RETURNED'
    }
  });

  res.json({
    success: true,
    data: order
  });
};

const rejectReturn = async (req, res) => {
  const { id } = req.params;

  const order = await prisma.order.update({
    where: {
      id: Number(id)
    },
    data: {
      status: 'RETURN_REJECTED'
    }
  });

  res.json({
    success: true,
    data: order
  });
};

// ====================== USER MANAGEMENT ======================
const getAllUsersAdmin = async (req, res) => {
  const users = await prisma.user.findMany({
    select: { id: true, name: true, email: true, role: true, avatar: true, createdAt: true },
    orderBy: { createdAt: 'desc' }
  });
  res.json({ success: true, data: users });
};

const updateUserRole = async (req, res) => {
  const { id } = req.params;
  const { role } = req.body;

  const user = await prisma.user.update({
    where: { id: Number(id) },
    data: { role }
  });
  res.json({ success: true, message: "Cập nhật vai trò thành công", data: user });
};

const getCategories = async (req, res) => {
  const categories = await prisma.category.findMany({ orderBy: { name: 'asc' } });
  res.json({ success: true, data: categories });
};

const createCategory = async (req, res) => {
  const { name } = req.body;
  const category = await prisma.category.create({ data: { name } });
  res.status(201).json({ success: true, message: "Tạo thể loại thành công", data: category });
};

const updateCategory = async (req, res) => {
  const { id } = req.params;
  const { name } = req.body;
  const category = await prisma.category.update({
    where: { id: Number(id) },
    data: { name }
  });
  res.json({ success: true, message: "Cập nhật thành công", data: category });
};

const deleteCategory = async (req, res) => {
  const { id } = req.params;
  await prisma.category.delete({ where: { id: Number(id) } });
  res.json({ success: true, message: "Xóa thể loại thành công" });
};

// ====================== AUTHOR ======================
const getAuthors = async (req, res) => {
  const authors = await prisma.author.findMany({ orderBy: { name: 'asc' } });
  res.json({ success: true, data: authors });
};

const createAuthor = async (req, res) => {
  const { name, bio } = req.body;
  const author = await prisma.author.create({ data: { name, bio } });
  res.status(201).json({ success: true, message: "Tạo tác giả thành công", data: author });
};

const updateAuthor = async (req, res) => {
  const { id } = req.params;
  const { name, bio } = req.body;
  const author = await prisma.author.update({
    where: { id: Number(id) },
    data: { name, bio }
  });
  res.json({ success: true, message: "Cập nhật tác giả thành công", data: author });
};

const deleteAuthor = async (req, res) => {
  const { id } = req.params;
  await prisma.author.delete({ where: { id: Number(id) } });
  res.json({ success: true, message: "Xóa tác giả thành công" });
};

// ====================== TAG ======================
const getTags = async (req, res) => {
  const tags = await prisma.tag.findMany({ orderBy: { name: 'asc' } });
  res.json({ success: true, data: tags });
};

const createTag = async (req, res) => {
  const { name } = req.body;
  const tag = await prisma.tag.create({ data: { name } });
  res.status(201).json({ success: true, message: "Tạo tag thành công", data: tag });
};

// ====================== PUBLISHER ======================
const getPublishers = async (req, res) => {
  const publishers = await prisma.publisher.findMany({ orderBy: { name: 'asc' } });
  res.json({ success: true, data: publishers });
};

const createPublisher = async (req, res) => {
  const { name } = req.body;
  const publisher = await prisma.publisher.create({ data: { name } });
  res.status(201).json({ success: true, message: "Tạo nhà xuất bản thành công", data: publisher });
};

// ====================== DASHBOARD STATS ======================
const getDashboardStats = async (req, res) => {
  try {
    const [
      totalBooks,
      totalOrders,
      totalUsers,
      deliveredOrders,
      pendingOrders,
      shippingOrders,
      cancelledOrders,
      revenueResult
    ] = await Promise.all([
      prisma.book.count(),

      prisma.order.count(),

      prisma.user.count(),

      prisma.order.count({
        where: { status: 'DELIVERED' }
      }),

      prisma.order.count({
        where: { status: 'PENDING' }
      }),

      prisma.order.count({
        where: { status: 'SHIPPING' }
      }),

      prisma.order.count({
        where: { status: 'CANCELLED' }
      }),

      prisma.order.aggregate({
        where: {
          status: 'DELIVERED'
        },
        _sum: {
          totalAmount: true
        }
      })
    ]);

    res.json({
      success: true,
      data: {
        totalBooks,
        totalOrders,
        totalUsers,

        deliveredOrders,
        pendingOrders,
        shippingOrders,
        cancelledOrders,

        totalRevenue:
          revenueResult._sum.totalAmount || 0
      }
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};


module.exports = {
  // Books
  getAllBooksAdmin,
  createBookAdmin,
  updateBookAdmin,
  deleteBookAdmin,
  // Orders
  getAllOrdersAdmin,
  updateOrderStatus,
  // Users
  getAllUsersAdmin,
  updateUserRole,
  // Category
  getCategories, createCategory, updateCategory, deleteCategory,
  // Author
  getAuthors, createAuthor, updateAuthor, deleteAuthor,
  // Tag
  getTags, createTag,
  // Publisher
  getPublishers, createPublisher,

  getDashboardStats,
  approveReturn,
  rejectReturn,

};