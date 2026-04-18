const express = require('express');
const router = express.Router();
const {
  getProfile,
  getMyApplications,
  getMyBookmarks,
} = require('../handlers/profileHandler');
const authMiddleware = require('../middlewares/authMiddleware');

// Semua protected
router.get('/', authMiddleware, getProfile);
router.get('/applications', authMiddleware, getMyApplications);
router.get('/bookmarks', authMiddleware, getMyBookmarks);

module.exports = router;