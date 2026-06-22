const express = require('express');
const router = express.Router();

const {
  getAllBooks,
  getBookById,
  getBookBySlug,
  getFeaturedBooks,
  getNewArrivals
} = require('../controllers/bookController');

const adminController = require('../controllers/adminController');
const { protect, adminOnly } = require('../middlewares/auth');
const validate = require('../middlewares/validate');

const { createBookSchema } = require('../validations/schemas');


// Public routes
router.get('/', getAllBooks);
router.get('/featured', getFeaturedBooks);
router.get('/new-arrivals', getNewArrivals);
router.get('/slug/:slug', getBookBySlug);
router.get('/:id', getBookById);


// Admin routes
router.post('/', protect, adminOnly, validate(createBookSchema), adminController.createBookAdmin);
router.put('/:id', protect, adminOnly, adminController.updateBookAdmin);
router.delete('/:id', protect, adminOnly, adminController.deleteBookAdmin);

module.exports = router;