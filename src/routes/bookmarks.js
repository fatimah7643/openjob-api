const express = require('express');
const router = express.Router();
const { getAllBookmarks } = require('../handlers/bookmarksHandler');
const authMiddleware = require('../middlewares/authMiddleware');


router.get('/', authMiddleware, getAllBookmarks);

module.exports = router;