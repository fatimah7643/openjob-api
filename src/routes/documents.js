const express = require('express');
const router = express.Router();
const {
  uploadDocument,
  getAllDocuments,
  getDocumentById,
  deleteDocument,
} = require('../handlers/documentsHandler');
const authMiddleware = require('../middlewares/authMiddleware');
const upload = require('../utils/uploadMiddleware');

// Public
router.get('/', getAllDocuments);
router.get('/:id', getDocumentById);

// Protected
router.post('/', authMiddleware, upload.single('document'), uploadDocument);
router.delete('/:id', authMiddleware, deleteDocument);

module.exports = router;