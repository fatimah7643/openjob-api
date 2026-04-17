const express = require('express');
const router = express.Router();
const {
  addApplication,
  getAllApplications,
  getApplicationById,
  getApplicationsByUserId,
  getApplicationsByJobId,
  updateApplicationStatus,
  deleteApplication,
} = require('../handlers/applicationsHandler');
const authMiddleware = require('../middlewares/authMiddleware');
const { validateAddApplication, validateUpdateApplication } = require('../validators/applicationsValidator');

// Protected
router.post('/', authMiddleware, validateAddApplication, addApplication);
router.get('/', authMiddleware, getAllApplications);
router.get('/user/:userId', authMiddleware, getApplicationsByUserId);
router.get('/job/:jobId', authMiddleware, getApplicationsByJobId);
router.get('/:id', authMiddleware, getApplicationById);
router.put('/:id', authMiddleware, validateUpdateApplication, updateApplicationStatus);
router.delete('/:id', authMiddleware, deleteApplication);

module.exports = router;