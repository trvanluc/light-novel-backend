const prisma = require('../config/database');
const { successResponse, errorResponse, notFoundResponse } = require('../utils/response');

// ====================== GET ALL BOOKS (PUBLIC - RẤT QUAN TRỌNG) ======================
const getAllBooks = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 12,
      search,
      category,
      author,
      minPrice,
      maxPrice,
      sort = 'newest',
      tag
    } = req.query;

    const skip = (Number(page) - 1) * Number(limit);

    // Xây dựng orderBy
    let orderBy = { createdAt: 'desc' };
    switch (sort) {
      case 'price_asc':  orderBy = { price: 'asc' }; break;
      case 'price_desc': orderBy = { price: 'desc' }; break;
      case 'popular':    orderBy = { rating: 'desc' }; break;
      case 'name_asc':   orderBy = { title: 'asc' }; break;
    }

    // Xây dựng where clause
    const where = {
      ...(search && {
        OR: [
          { title: { contains: search, mode: 'insensitive' } },
          { description: { contains: search, mode: 'insensitive' } }
        ]
      }),
      ...(category && { category: { name: category } }),
      ...(author && { author: { name: author } }),
      ...(minPrice && { price: { gte: Number(minPrice) } }),
      ...(maxPrice && { price: { lte: Number(maxPrice) } }),
      ...(tag && { tags: { some: { name: tag } } })
    };

    const [books, total] = await Promise.all([
      prisma.book.findMany({
        where,
        include: {
          author: { select: { id: true, name: true } },
          category: { select: { id: true, name: true } },
          tags: { select: { id: true, name: true } }
        },
        skip,
        take: Number(limit),
        orderBy
      }),
      prisma.book.count({ where })
    ]);

    return successResponse(res, {
      books,
      pagination: {
        total,
        page: Number(page),
        limit: Number(limit),
        totalPages: Math.ceil(total / limit)
      },
      filters: { search, category, author, minPrice, maxPrice, sort, tag }
    });

  } catch (error) {
    return errorResponse(res, error.message);
  }
};

// ====================== GET BOOK DETAIL ======================
const getBookById = async (req, res) => {
  try {
    const { id } = req.params;

    const book = await prisma.book.findUnique({
      where: { id: Number(id) },
      include: {
        author: true,
        category: true,
        publisher: true,
        tags: true,
        reviews: {
          include: {
            user: { select: { id: true, name: true, avatar: true } }
          },
          orderBy: { createdAt: 'desc' },
          take: 8
        }
      }
    });

    if (!book) return notFoundResponse(res, "Không tìm thấy sách");

    // Sách liên quan
    const relatedBooks = await prisma.book.findMany({
      where: {
        id: { not: book.id },
        OR: [
          { categoryId: book.categoryId },
          { tags: { some: { id: { in: book.tags.map(t => t.id) } } } }
        ]
      },
      include: {
        author: { select: { name: true } },
        category: { select: { name: true } }
      },
      take: 6
    });

    return successResponse(res, { book, relatedBooks });
  } catch (error) {
    return errorResponse(res, error.message);
  }
};

// ====================== GET BOOK BY SLUG ======================
const getBookBySlug = async (req, res) => {
  try {
    const { slug } = req.params;

    const book = await prisma.book.findUnique({
      where: { slug },
      include: {
        author: true,
        category: true,
        publisher: true,
        tags: true,
        reviews: {
          include: { user: { select: { name: true, avatar: true } } },
          take: 10
        }
      }
    });

    if (!book) return notFoundResponse(res, "Không tìm thấy sách");
    
    const relatedBooks = await prisma.book.findMany({
      where: {
        id: { not: book.id },
        categoryId: book.categoryId
      },
      include: {
        author: true
      },
      take: 6
    });

    return successResponse(res, {
      book,
      relatedBooks
    });
    
  } catch (error) {
    return errorResponse(res, error.message);
  }
};

// ====================== FEATURED / NEW ARRIVALS ======================
const getFeaturedBooks = async (req, res) => {
  try {
    const books = await prisma.book.findMany({
      where: { stock: { gt: 0 } },
      include: { author: true, category: true },
      orderBy: { rating: 'desc' },
      take: 8
    });
    return successResponse(res, books, "Sách nổi bật");
  } catch (error) {
    return errorResponse(res, error.message);
  }
};

const getNewArrivals = async (req, res) => {
  try {
    const books = await prisma.book.findMany({
      include: { author: true, category: true },
      orderBy: { createdAt: 'desc' },
      take: 10
    });
    return successResponse(res, books, "Sách mới về");
  } catch (error) {
    return errorResponse(res, error.message);
  }
};

module.exports = {
  getAllBooks,
  getBookById,
  getBookBySlug,
  getFeaturedBooks,
  getNewArrivals
};