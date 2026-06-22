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


const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server đang chạy tại: http://localhost:${PORT}`);
});