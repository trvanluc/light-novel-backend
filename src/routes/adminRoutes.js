const express = require('express');
const router = express.Router();
const validate = require('../middlewares/validate');
const { 
  createBookSchema, 
  categorySchema, 
  authorSchema, 
  tagSchema 
} = require('../validations/schemas');

const adminController = require('../controllers/adminController');
const { protect, adminOnly } = require('../middlewares/auth');

// Public
router.get('/categories', adminController.getCategories);
router.get('/authors', adminController.getAuthors);
router.get('/tags', adminController.getTags);
router.get('/publishers', adminController.getPublishers);

// Admin Only
router.post('/books', protect, adminOnly, validate(createBookSchema), adminController.createBookAdmin);
router.put('/books/:id', protect, adminOnly, adminController.updateBookAdmin);
router.delete('/books/:id', protect, adminOnly, adminController.deleteBookAdmin);

router.post('/categories', protect, adminOnly, validate(categorySchema), adminController.createCategory);
router.put('/categories/:id', protect, adminOnly, adminController.updateCategory);
router.delete('/categories/:id', protect, adminOnly, adminController.deleteCategory);

router.post('/authors', protect, adminOnly, validate(authorSchema), adminController.createAuthor);
router.put('/authors/:id', protect, adminOnly, adminController.updateAuthor);
router.delete('/authors/:id', protect, adminOnly, adminController.deleteAuthor);

router.post('/tags', protect, adminOnly, validate(tagSchema), adminController.createTag);
router.post('/publishers', protect, adminOnly, adminController.createPublisher);

router.get(
  '/dashboard-stats',
  protect,
  adminOnly,
  adminController.getDashboardStats
);

// Order & User Management
router.get('/books', protect, adminOnly, adminController.getAllBooksAdmin);
router.get('/orders', protect, adminOnly, adminController.getAllOrdersAdmin);
router.put('/orders/:id/status', protect, adminOnly, adminController.updateOrderStatus);
router.get('/users', protect, adminOnly, adminController.getAllUsersAdmin);
router.put('/users/:id/role', protect, adminOnly, adminController.updateUserRole);

router.put(
  '/orders/:id/approve-return',
  protect,
  adminOnly,
  adminController.approveReturn
);

router.put(
  '/orders/:id/reject-return',
  protect,
  adminOnly,
  adminController.rejectReturn
);

module.exports = router;