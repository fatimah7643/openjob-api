const express = require('express');
const router = express.Router();
const {
  addCategory,
  getAllCategories,
  getCategoryById,
  updateCategory,
  deleteCategory,
} = require('../handlers/categoriesHandler');
const { validateCategory } = require('../validators/categoriesValidator');
const authMiddleware = require('../middlewares/authMiddleware');

// Public
router.get('/', getAllCategories);
router.get('/:id', getCategoryById);

// Protected
router.post('/', authMiddleware, validateCategory, addCategory);
router.put('/:id', authMiddleware, validateCategory, updateCategory);
router.delete('/:id', authMiddleware, deleteCategory);

module.exports = router;