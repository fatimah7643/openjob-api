const express = require('express');
const router = express.Router();
const { addUser, getUserById } = require('../handlers/usersHandler');
const { validateCreateUser } = require('../validators/usersValidator');

router.post('/', validateCreateUser, addUser);
router.get('/:id', getUserById);

module.exports = router;