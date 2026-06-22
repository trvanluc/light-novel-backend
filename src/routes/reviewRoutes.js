const express = require('express');
const router = express.Router();
const validate = require('../middlewares/validate');
const { createReviewSchema } = require('../validations/schemas');

const { 
  createReview, 
  getReviewsByBook, 
  getMyReviews 
} = require('../controllers/reviewController');

const { protect } = require('../middlewares/auth');

router.post('/', protect, validate(createReviewSchema), createReview);
router.get('/book/:bookId', getReviewsByBook);
router.get('/my-reviews', protect, getMyReviews);

module.exports = router;