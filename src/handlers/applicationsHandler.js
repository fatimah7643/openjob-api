const pool = require('../database/pool');
const generateId = require('../utils/idGenerator');

// POST /applications — apply for a job
const addApplication = async (req, res, next) => {
  try {
    const { job_id } = req.body;
    const user_id = req.user.id; // dari JWT via authMiddleware
    const id = generateId();

    // Cek job ada
    const job = await pool.query('SELECT * FROM "jobs" WHERE id = $1', [job_id]);
    if (job.rows.length === 0) {
      return res.status(404).json({ status: 'failed', message: 'Job not found' });
    }

    // Cek sudah apply belum
    const existing = await pool.query(
      'SELECT * FROM "applications" WHERE user_id = $1 AND job_id = $2',
      [user_id, job_id]
    );
    if (existing.rows.length > 0) {
      return res.status(400).json({ status: 'failed', message: 'Already applied to this job' });
    }

    await pool.query(
      'INSERT INTO "applications" (id, user_id, job_id, status) VALUES ($1, $2, $3, $4)',
      [id, user_id, job_id, 'pending']
    );

    return res.status(201).json({
      status: 'success',
      message: 'Application submitted successfully',
      data: { id: id },
    });
  } catch (err) {
    next(err);
  }
};

// GET /applications — list all (admin/protected)
const getAllApplications = async (req, res, next) => {
  try {
    const result = await pool.query(
      `SELECT a.*, u.name as user_name, j.title as job_title
       FROM "applications" a
       LEFT JOIN "users" u ON a.user_id = u.id
       LEFT JOIN "jobs" j ON a.job_id = j.id
       ORDER BY a.created_at DESC`
    );
    return res.status(200).json({ status: 'success', data: { applications: result.rows } });
  } catch (err) {
    next(err);
  }
};

// GET /applications/:id
const getApplicationById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      `SELECT a.*, u.name as user_name, j.title as job_title
       FROM "applications" a
       LEFT JOIN "users" u ON a.user_id = u.id
       LEFT JOIN "jobs" j ON a.job_id = j.id
       WHERE a.id = $1`,
      [id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ status: 'failed', message: 'Application not found' });
    }
    return res.status(200).json({ status: 'success', data: { ...result.rows[0] } });
  } catch (err) {
    next(err);
  }
};

// GET /applications/user/:userId
const getApplicationsByUserId = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const result = await pool.query(
      `SELECT a.*, j.title as job_title
       FROM "applications" a
       LEFT JOIN "jobs" j ON a.job_id = j.id
       WHERE a.user_id = $1 ORDER BY a.created_at DESC`,
      [userId]
    );
    return res.status(200).json({ status: 'success', data: { applications: result.rows } });
  } catch (err) {
    next(err);
  }
};

// GET /applications/job/:jobId
const getApplicationsByJobId = async (req, res, next) => {
  try {
    const { jobId } = req.params;
    const result = await pool.query(
      `SELECT a.*, u.name as user_name
       FROM "applications" a
       LEFT JOIN "users" u ON a.user_id = u.id
       WHERE a.job_id = $1 ORDER BY a.created_at DESC`,
      [jobId]
    );
    return res.status(200).json({ status: 'success', data: { applications: result.rows } });
  } catch (err) {
    next(err);
  }
};

// PUT /applications/:id — update status
const updateApplicationStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const result = await pool.query('SELECT * FROM "applications" WHERE id = $1', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ status: 'failed', message: 'Application not found' });
    }

    await pool.query(
      'UPDATE "applications" SET status = $1, updated_at = NOW() WHERE id = $2',
      [status, id]
    );

    return res.status(200).json({ status: 'success', message: 'Application status updated' });
  } catch (err) {
    next(err);
  }
};

// DELETE /applications/:id
const deleteApplication = async (req, res, next) => {
  try {
    const { id } = req.params;
    const result = await pool.query('SELECT * FROM "applications" WHERE id = $1', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ status: 'failed', message: 'Application not found' });
    }
    await pool.query('DELETE FROM "applications" WHERE id = $1', [id]);
    return res.status(200).json({ status: 'success', message: 'Application deleted' });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  addApplication,
  getAllApplications,
  getApplicationById,
  getApplicationsByUserId,
  getApplicationsByJobId,
  updateApplicationStatus,
  deleteApplication,
};