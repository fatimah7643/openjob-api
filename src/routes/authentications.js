const express = require('express');
const router = express.Router();
const { login, refreshToken, logout } = require('../handlers/authenticationsHandler');
const { validateLogin, validateRefreshToken } = require('../validators/authenticationsValidator');

router.post('/', validateLogin, login);
router.put('/', validateRefreshToken, refreshToken);
router.delete('/', validateRefreshToken, logout);

module.exports = router;