const prisma = require('../config/database');

// ==================== CONTENT-BASED FILTERING ====================
const getPersonalizedRecommendations = async (req, res) => {
  try {
    const userId = req.user.id;
    const limit = parseInt(req.query.limit) || 10;

    // Lấy sách user đã tương tác
    const userBehaviors = await prisma.userBehavior.findMany({
      where: { userId },
      include: { book: { include: { tags: true, category: true } } }
    });

    // Sách user đã mua
    const purchasedBooks = await prisma.orderItem.findMany({
      where: {
        order: {
          userId,
          status: 'DELIVERED'
        }
      },
      select: {
        bookId: true
      }
    });

    // Sách user đã review
    const reviewedBooks = await prisma.review.findMany({
      where: { userId },
      select: {
        bookId: true
      }
    });

    if (userBehaviors.length === 0) {
      // User mới → trả sách nổi bật
      const totalBooks = await prisma.book.count();

      const randomSkip = Math.max(
        0,
        Math.floor(Math.random() * Math.max(1, totalBooks - limit))
      );

      const popular = await prisma.book.findMany({
        include: {
          author: true,
          category: true
        },
        orderBy: {
          rating: 'desc'
        },
        skip: randomSkip,
        take: limit
      });
    }

    const excludedBookIds = [
      ...new Set([
        ...purchasedBooks.map(b => b.bookId),
        ...reviewedBooks.map(b => b.bookId)
      ])
    ];

    

    const allBooks = await prisma.book.findMany({
      where: {
        id: {
          notIn: excludedBookIds
        }
      },
      include: {
        tags: true,
        author: true,
        category: true
      }
    });

    const scoredBooks = allBooks.map(book => {
      let score = 0;

      userBehaviors.forEach(behavior => {
        const userBook = behavior.book;
        if (!userBook) return;

        let weight = 1;

        switch (behavior.action) {
          case 'PURCHASE':
            weight = 5;
            break;

          case 'ADD_TO_CART':
            weight = 3;
            break;

          case 'VIEW':
            weight = 1;
            break;

          default:
            weight = 1;
        }

        // cùng thể loại
        if (userBook.categoryId === book.categoryId) {
          score += 6 * weight;
        }

        // cùng tác giả
        if (userBook.authorId === book.authorId) {
          score += 4 * weight;
        }

        // cùng tag
        const commonTags = book.tags.filter(tag =>
          userBook.tags.some(ubTag => ubTag.id === tag.id)
        ).length;

        score += commonTags * 3 * weight;
      });

      score += (book.rating || 0) * 2;

      return {
        ...book,
        score
      };
    });

    scoredBooks.sort((a, b) => b.score - a.score);

    const topBooks = scoredBooks
      .filter(book => book.score > 0)
      .slice(0, 20);

    topBooks.sort(() => Math.random() - 0.5);

    res.json({
      success: true,
      data: topBooks.slice(0, limit),
      type: "hybrid-content-based"
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ==================== BECAUSE YOU READ ====================
const getBecauseYouRead = async (req, res) => {
  try {
    const { bookId } = req.params;
    const limit = 6;

    const targetBook = await prisma.book.findUnique({
      where: { id: Number(bookId) },
      include: { tags: true, category: true }
    });

    if (!targetBook) return res.status(404).json({ success: false, message: "Book not found" });

    const similarBooks = await prisma.book.findMany({
      where: {
        id: { not: Number(bookId) },
        OR: [
          { categoryId: targetBook.categoryId },
          { tags: { some: { id: { in: targetBook.tags.map(t => t.id) } } } }
        ]
      },
      include: { author: true, category: true },
      take: limit
    });

    res.json({ success: true, data: similarBooks });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getPersonalizedRecommendations,
  getBecauseYouRead
};