const express = require('express');
const router = express.Router();
const validate = require('../middlewares/validate');
const { addToCartSchema, updateCartItemSchema } = require('../validations/schemas');

const { 
  getCart, 
  addToCart, 
  updateCartItem, 
  removeFromCart, 
  clearCart 
} = require('../controllers/cartController');

const { protect } = require('../middlewares/auth');

router.get('/', protect, getCart);
router.post('/add', protect, validate(addToCartSchema), addToCart);
router.put('/update/:bookId', protect, validate(updateCartItemSchema), updateCartItem);
router.delete('/remove/:bookId', protect, removeFromCart);
router.delete('/clear', protect, clearCart);

module.exports = router;