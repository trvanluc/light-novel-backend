const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const app = express();

// Middleware
app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true
}));
app.use(express.json());

// Routes
app.use('/api/v1/auth', require('./routes/authRoutes'));
app.use('/api/v1/books', require('./routes/bookRoutes'));
app.use('/api/v1/cart', require('./routes/cartRoutes'));
app.use('/api/v1/orders', require('./routes/orderRoutes'));
app.use('/api/v1/reviews', require('./routes/reviewRoutes'));
app.use('/api/v1/users', require('./routes/userRoutes'));
app.use('/api/v1/admin', require('./routes/adminRoutes'));
app.use('/api/v1/recommendations', require('./routes/recommendationRoutes'));

// Test route
app.get('/', (req, res) => {
  res.json({ 
    success: true, 
    message: "Light Novel Backend API đang chạy tốt! 🚀" 
  });
});

// ====================== GLOBAL ERROR HANDLER ======================
const errorHandler = require('./middlewares/errorHandler');
app.use(errorHandler);

// Xử lý route không tồn tại
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route không tồn tại'
  });
});



const prisma = require('./config/database');

async function startServer() {
  try {
    await prisma.$connect();
    console.log('✅ Database connected');

    app.listen(PORT, () => {
      console.log(`🚀 Server đang chạy tại: http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('❌ Database connection failed');
    console.error(error);
    process.exit(1);
  }
}

startServer();


console.log('1. Server file loaded');

const prisma = require('./config/database');

console.log('2. Prisma imported');

async function start() {
  console.log('3. Starting app');

  try {
    await prisma.$connect();
    console.log('4. Database connected');

    app.listen(PORT, '0.0.0.0', () => {
      console.log(`5. Server running on ${PORT}`);
    });
  } catch (e) {
    console.error('ERROR:', e);
  }
}

start();

const PORT = process.env.PORT || 8080;

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Server running on port ${PORT}`);
});