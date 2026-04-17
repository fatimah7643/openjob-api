const express = require('express');
const router = express.Router();
const {
  addJob,
  getAllJobs,
  getJobById,
  getJobsByCompanyId,
  getJobsByCategoryId,
  updateJob,
  deleteJob,
} = require('../handlers/jobsHandler');
const { validateJob } = require('../validators/jobsValidator');
const authMiddleware = require('../middlewares/authMiddleware');
const { 
    addBookmark, 
    getBookmarkById, 
    deleteBookmark 
} = require('../handlers/bookmarksHandler');
const { validateJobIdParam } = require('../validators/bookmarksValidator');



// Public
router.get('/', getAllJobs);
router.get('/company/:companyId', getJobsByCompanyId);
router.get('/category/:categoryId', getJobsByCategoryId);
router.get('/:id', getJobById);

// Protected
router.post('/', authMiddleware, validateJob, addJob);
router.put('/:id', authMiddleware, validateJob, updateJob);
router.delete('/:id', authMiddleware, deleteJob);
router.post('/:jobId/bookmark', authMiddleware, validateJobIdParam ,addBookmark);
router.get('/:jobId/bookmark/:id', authMiddleware, getBookmarkById);
router.delete('/:jobId/bookmark', authMiddleware, validateJobIdParam ,deleteBookmark);

module.exports = router;