const express = require('express');
const router = express.Router();
const {
  uploadDocument,
  getAllDocuments,
  getDocumentById,
  serveDocument,
  deleteDocument,
} = require('../handlers/documentsHandler');
const authMiddleware = require('../middlewares/authMiddleware');
const upload = require('../utils/uploadMiddleware');

// Public
router.get('/', getAllDocuments);
router.get('/:id/file', serveDocument); 
router.get('/:id', getDocumentById);

// Protected
router.post('/', authMiddleware, (req, res, next) => {
  upload.single('document')(req, res, (err) => {
    if (err) return next(err); // ⬅️ teruskan error multer ke errorHandler
    next();
  });
}, uploadDocument);
router.delete('/:id', authMiddleware, deleteDocument);

module.exports = router;