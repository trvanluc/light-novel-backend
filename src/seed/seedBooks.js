const prisma = require('../config/database');
const data = require('../../data.json'); // đặt file data.json vào thư mục gốc

async function seed() {
  console.log('🚀 Bắt đầu seed dữ liệu...');

  // 1. Seed Authors
  const authors = {};
  for (const book of data) {
    if (!authors[book.author]) {
      const author = await prisma.author.upsert({
        where: { name: book.author },
        update: {},
        create: { name: book.author, bio: `Tác giả của ${book.series || book.title}` }
      });
      authors[book.author] = author.id;
    }
  }

  // 2. Seed Categories (từ genres)
  const categories = {};
  for (const book of data) {
    for (const genre of book.genres || []) {
      if (!categories[genre]) {
        const cat = await prisma.category.upsert({
          where: { name: genre },
          update: {},
          create: { name: genre }
        });
        categories[genre] = cat.id;
      }
    }
  }

  // 3. Seed Tags
  const tagsMap = {};
  for (const book of data) {
    for (const tagName of book.tags || []) {
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

  // 4. Seed Books
  for (const book of data) {
    const slug = book.title
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9\s-]/g, "")
      .trim()
      .replace(/\s+/g, '-');

    const mainCategory = book.genres && book.genres.length > 0 ? book.genres[0] : "Fantasy";

    const newBook = await prisma.book.upsert({
      where: { slug },
      update: {},
      create: {
        title: book.title,
        slug,
        description: book.description,
        price: book.price,
        image: book.cover_image,
        stock: book.stock || 50,
        authorId: authors[book.author],
        categoryId: categories[mainCategory],
      }
    });

    // Thêm tags cho book
    if (book.tags && book.tags.length > 0) {
      await prisma.book.update({
        where: { id: newBook.id },
        data: {
          tags: {
            connect: book.tags.map(tagName => ({ id: tagsMap[tagName] }))
          }
        }
      });
    }
  }

  console.log('✅ Seed dữ liệu thành công! Tổng sách:', data.length);
}

module.exports = seed;