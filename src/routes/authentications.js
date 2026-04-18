const express = require('express');
const router = express.Router();
const { login, refreshToken, logout } = require('../handlers/authenticationsHandler');
const { validateLogin, validateRefreshToken } = require('../validators/authenticationsValidator');
const authMiddleware = require('../middlewares/authMiddleware');

router.post('/', validateLogin, login);
router.put('/', validateRefreshToken, refreshToken);
router.delete('/', authMiddleware, validateRefreshToken, logout);

module.exports = router;