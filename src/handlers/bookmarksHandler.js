const pool = require('../database/pool');
const generateId = require('../utils/idGenerator');

// POST /jobs/:jobId/bookmark — tambah bookmark
const addBookmark = async (req, res, next) => {
  try {
    const { jobId } = req.params;
    const user_id = req.user.id;
    const id = generateId();

    // Cek job ada
    const job = await pool.query('SELECT * FROM "jobs" WHERE id = $1', [jobId]);
    if (job.rows.length === 0) {
      return res.status(404).json({ status: 'failed', message: 'Job not found' });
    }

    // Cek sudah bookmark belum
    const existing = await pool.query(
      'SELECT * FROM "bookmarks" WHERE user_id = $1 AND job_id = $2',
      [user_id, jobId]
    );
    if (existing.rows.length > 0) {
      return res.status(400).json({ status: 'failed', message: 'Job already bookmarked' });
    }

    await pool.query(
      'INSERT INTO "bookmarks" (id, user_id, job_id) VALUES ($1, $2, $3)',
      [id, user_id, jobId]
    );

    return res.status(201).json({
      status: 'success',
      message: 'Job bookmarked successfully',
      data: { id: id },
    });
  } catch (err) {
    next(err);
  }
};

// GET /jobs/:jobId/bookmark/:id — get detail bookmark by id
const getBookmarkById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      `SELECT b.*, j.title as job_title
       FROM "bookmarks" b
       LEFT JOIN "jobs" j ON b.job_id = j.id
       WHERE b.id = $1`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ status: 'failed', message: 'Bookmark not found' });
    }

    return res.status(200).json({ status: 'success', data: { ...result.rows[0] } });
  } catch (err) {
    next(err);
  }
};

// DELETE /jobs/:jobId/bookmark — hapus bookmark by user + job
const deleteBookmark = async (req, res, next) => {
  try {
    const { jobId } = req.params;
    const user_id = req.user.id;

    const result = await pool.query(
      'SELECT * FROM "bookmarks" WHERE user_id = $1 AND job_id = $2',
      [user_id, jobId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ status: 'failed', message: 'Bookmark not found' });
    }

    await pool.query(
      'DELETE FROM "bookmarks" WHERE user_id = $1 AND job_id = $2',
      [user_id, jobId]
    );

    return res.status(200).json({ status: 'success', message: 'Bookmark deleted successfully' });
  } catch (err) {
    next(err);
  }
};

// GET /bookmarks — semua bookmark milik user yang login
const getAllBookmarks = async (req, res, next) => {
  try {
    const user_id = req.user.id;

    const result = await pool.query(
      `SELECT b.*, j.title as job_title, j.location_city, j.job_type, j.salary_min, j.salary_max
      FROM "bookmarks" b
      LEFT JOIN "jobs" j ON b.job_id = j.id
      WHERE b.user_id = $1
      ORDER BY b.created_at DESC`,
      [user_id]
    );

    return res.status(200).json({ status: 'success', data: { bookmarks: result.rows } });
  } catch (err) {
    next(err);
  }
};

module.exports = { addBookmark, getBookmarkById, deleteBookmark, getAllBookmarks };