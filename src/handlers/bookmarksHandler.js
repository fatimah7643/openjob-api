const pool = require('../database/pool');
const generateId = require('../utils/idGenerator');
const redis = require('../utils/redisClient');

const CACHE_TTL = 3600; 

const addBookmark = async (req, res, next) => {
  try {
    const { jobId } = req.params;
    const user_id = req.user.id;
    const id = generateId();

    const job = await pool.query('SELECT * FROM "jobs" WHERE id = $1', [jobId]);
    if (job.rows.length === 0) {
      return res.status(404).json({ status: 'failed', message: 'Job not found' });
    }

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

    // Invalidate cache bookmarks user
    await redis.del(`bookmarks:user:${user_id}`);

    return res.status(201).json({
      status: 'success',
      message: 'Job bookmarked successfully',
      data: { id: id },
    });
  } catch (err) {
    next(err);
  }
};

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

    // Invalidate cache bookmarks user
    await redis.del(`bookmarks:user:${user_id}`);

    return res.status(200).json({ status: 'success', message: 'Bookmark deleted successfully' });
  } catch (err) {
    next(err);
  }
};

const getAllBookmarks = async (req, res, next) => {
  try {
    const user_id = req.user.id;
    const cacheKey = `bookmarks:user:${user_id}`;

    const cached = await redis.get(cacheKey);
    if (cached) {
      return res.status(200).set('X-Data-Source', 'cache').json({
        status: 'success',
        data: JSON.parse(cached),
      });
    }

    const result = await pool.query(
      `SELECT 
        b.id, b.user_id, b.job_id, b.created_at,
        j.title as job_title,
        j.description as job_description,
        j.location_type,
        j.location_city,
        j.salary_min,
        j.salary_max,
        j.is_salary_visible,
        j.job_type,
        j.experience_level,
        j.status as job_status,
        j.company_id,
        j.category_id,
        j.created_at as job_created_at,
        j.updated_at as job_updated_at
       FROM "bookmarks" b
       LEFT JOIN "jobs" j ON b.job_id = j.id
       WHERE b.user_id = $1
       ORDER BY b.created_at DESC`,
      [user_id]
    );

    const data = { bookmarks: result.rows };
    await redis.setex(cacheKey, CACHE_TTL, JSON.stringify(data));

    return res
    .status(200)
    .set('X-Data-Source', 'database')
    .json({ status: 'success', data });
  } catch (err) {
    next(err);
  }
};

module.exports = { addBookmark, getBookmarkById, deleteBookmark, getAllBookmarks };