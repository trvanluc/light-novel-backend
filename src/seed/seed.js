const prisma = require('../config/database');
const bcrypt = require('bcryptjs');
const booksData = require('../../data.json');

async function main() {
  console.log('🚀 Bắt đầu Seed Data...');

  // ==================== 1. SEED USERS ====================
  const users = [
    {
      name: "Văn Lực (Admin)",
      email: "admin@lightnovel.com",
      password: "123456",
      role: "ADMIN"
    },
    {
      name: "Nguyễn Thị Test",
      email: "user1@lightnovel.com",
      password: "123456",
      role: "USER"
    },
    {
      name: "Trần Văn Test",
      email: "user2@lightnovel.com",
      password: "123456",
      role: "USER"
    },
    {
      name: "Lê Thị Test",
      email: "user3@lightnovel.com",
      password: "123456",
      role: "USER"
    }
  ];

  for (const u of users) {
    const hashedPassword = await bcrypt.hash(u.password, 10);
    await prisma.user.upsert({
      where: { email: u.email },
      update: {},
      create: {
        name: u.name,
        email: u.email,
        password: hashedPassword,
        role: u.role,
      }
    });
  }
  console.log('✅ Đã tạo Users');

  // ==================== 2. SEED AUTHORS, CATEGORIES, PUBLISHERS, TAGS ====================
  const authors = {};
  const categories = {};
  const publishers = {};
  const tagsMap = {};

  for (const book of booksData) {
    // Author
    if (book.author && !authors[book.author]) {
      const author = await prisma.author.upsert({
        where: { name: book.author },
        update: {},
        create: { name: book.author, bio: `Tác giả nổi tiếng của ${book.series || 'Light Novel'}` }
      });
      authors[book.author] = author.id;
    }

    // Category (lấy genre đầu tiên)
    const mainGenre = book.genres && book.genres.length > 0 ? book.genres[0] : "Fantasy";
    if (!categories[mainGenre]) {
      const cat = await prisma.category.upsert({
        where: { name: mainGenre },
        update: {},
        create: { name: mainGenre }
      });
      categories[mainGenre] = cat.id;
    }

    // Publisher
    if (book.publisher && !publishers[book.publisher]) {
      const pub = await prisma.publisher.upsert({
        where: { name: book.publisher },
        update: {},
        create: { name: book.publisher }
      });
      publishers[book.publisher] = pub.id;
    }

    // Tags
    if (book.tags) {
      for (const tagName of book.tags) {
        if (!tagsMap[tagName]) {
          const tag = await prisma.tag.upsert({
            where: { name: tagName },
            update: {},
            create: { name: tagName }
          });
          tagsMap[tagName] = tag.id;
        }
      }
    }
  }

  console.log('✅ Đã seed Authors, Categories, Publishers, Tags');

  // ==================== 3. SEED BOOKS ====================
  for (const book of booksData) {
    const slug = book.title
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9\s-]/g, "")
      .trim()
      .replace(/\s+/g, '-');

    const mainGenre = book.genres && book.genres.length > 0 ? book.genres[0] : "Fantasy";

    const newBook = await prisma.book.upsert({
      where: { slug },
      update: {},
      create: {
        title: book.title,
        slug,
        description: book.description,
        price: book.price,
        image: book.cover_image || null,
        stock: book.stock || 50,
        pageCount: book.page_count,
        rating: book.rating,
        authorId: authors[book.author],
        categoryId: categories[mainGenre],
        publisherId: publishers[book.publisher] || null,
      }
    });

    // Connect Tags
    if (book.tags && book.tags.length > 0) {
      await prisma.book.update({
        where: { id: newBook.id },
        data: {
          tags: {
            connect: book.tags.map(tagName => ({ id: tagsMap[tagName] })).filter(Boolean)
          }
        }
      });
    }
  }

  console.log(`✅ Đã seed ${booksData.length} Light Novel thành công!`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });