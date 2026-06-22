const prisma = require('../config/database');

async function seedUserBehavior() {
  console.log('🚀 Đang seed UserBehavior...');

  // Lấy tất cả users và books
  const users = await prisma.user.findMany({ select: { id: true } });
  const books = await prisma.book.findMany({ select: { id: true } });

  if (users.length === 0 || books.length === 0) {
    console.log('❌ Chưa có user hoặc book để seed');
    return;
  }

  const behaviors = [];
  const actions = ['VIEW', 'ADD_TO_CART', 'PURCHASE', 'RATE'];

  // Tạo dữ liệu hành vi cho mỗi user
  for (const user of users) {
    // Mỗi user tương tác với 15-30 sách ngẫu nhiên
    const numInteractions = Math.floor(Math.random() * 16) + 15;

    for (let i = 0; i < numInteractions; i++) {
      const randomBook = books[Math.floor(Math.random() * books.length)];
      const randomAction = actions[Math.floor(Math.random() * actions.length)];
      
      // Tạo timestamp ngẫu nhiên trong 30 ngày gần đây
      const daysAgo = Math.floor(Math.random() * 30);
      const timestamp = new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000);

      behaviors.push({
        userId: user.id,
        bookId: randomBook.id,
        action: randomAction,
        timestamp
      });
    }
  }

  // Xóa dữ liệu cũ và seed mới
  await prisma.userBehavior.deleteMany();
  
  await prisma.userBehavior.createMany({
    data: behaviors
  });

  console.log(`✅ Đã seed ${behaviors.length} UserBehavior records thành công!`);
  console.log(`   - Users: ${users.length}`);
  console.log(`   - Books: ${books.length}`);
}

module.exports = seedUserBehavior;