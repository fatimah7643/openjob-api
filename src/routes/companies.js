const express = require('express');
const router = express.Router();
const {
  addCompany,
  getAllCompanies,
  getCompanyById,
  updateCompany,
  deleteCompany,
} = require('../handlers/companiesHandler');
const { validateCompany } = require('../validators/companiesValidator');
const authMiddleware = require('../middlewares/authMiddleware');

// Public
router.get('/', getAllCompanies);
router.get('/:id', getCompanyById);

// Protected
router.post('/', authMiddleware, validateCompany, addCompany);
router.put('/:id', authMiddleware, validateCompany, updateCompany);
router.delete('/:id', authMiddleware, deleteCompany);

module.exports = router;