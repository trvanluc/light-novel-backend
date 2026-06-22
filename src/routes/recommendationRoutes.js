const express = require('express');
const router = express.Router();
const { protect } = require('../middlewares/auth');
const { 
  getPersonalizedRecommendations, 
  getBecauseYouRead 
} = require('../controllers/recommendationController');

router.get('/personalized', protect, getPersonalizedRecommendations);
router.get('/because-you-read/:bookId', getBecauseYouRead);

module.exports = router;