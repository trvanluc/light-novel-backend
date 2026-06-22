const express = require('express');
const router = express.Router();
const validate = require('../middlewares/validate');
const { createOrderSchema } = require('../validations/schemas');

const { 
  createOrder, 
  getMyOrders, 
  getOrderById, 
  cancelOrder,
  requestReturn
} = require('../controllers/orderController');

const { protect } = require('../middlewares/auth');

router.post('/', protect, validate(createOrderSchema), createOrder);
router.get('/', protect, getMyOrders);
router.get('/:id', protect, getOrderById);
router.put('/:id/cancel', protect, cancelOrder);
router.put(
  '/:id/request-return',
  protect,
  requestReturn
);
module.exports = router;