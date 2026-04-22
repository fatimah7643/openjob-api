const pool = require('../database/pool');

const getProfile = async (req, res, next) => {
  try {
    const user_id = req.user.id;

    const result = await pool.query(
      'SELECT id, name, email, role, created_at, updated_at FROM "users" WHERE id = $1',
      [user_id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        status: 'failed',
        message: 'User not found',
      });
    }

    return res.status(200).json({
      status: 'success',
      data: { ...result.rows[0] },
    });
  } catch (err) {
    next(err);
  }
};

const getMyApplications = async (req, res, next) => {
  try {
    const user_id = req.user.id;

    const result = await pool.query(
      `SELECT 
        a.id, a.user_id, a.job_id, a.status, a.created_at, a.updated_at,
        j.title as job_title,
        j.description as job_description,
        j.location_type,
        j.location_city,
        j.job_type,
        j.experience_level,
        j.salary_min,
        j.salary_max,
        c.name as company_name
       FROM "applications" a
       LEFT JOIN "jobs" j ON a.job_id = j.id
       LEFT JOIN "companies" c ON j.company_id = c.id
       WHERE a.user_id = $1
       ORDER BY a.created_at DESC`,
      [user_id]
    );

    return res.status(200).json({
      status: 'success',
      data: { applications: result.rows },
    });
  } catch (err) {
    next(err);
  }
};

const getMyBookmarks = async (req, res, next) => {
  try {
    const user_id = req.user.id;

    const result = await pool.query(
      `SELECT b.*, j.title as job_title, j.location_city, j.job_type, j.salary_min, j.salary_max,
        c.name as company_name
       FROM "bookmarks" b
       LEFT JOIN "jobs" j ON b.job_id = j.id
       LEFT JOIN "companies" c ON j.company_id = c.id
       WHERE b.user_id = $1
       ORDER BY b.created_at DESC`,
      [user_id]
    );

    return res.status(200).json({
      status: 'success',
      data: { bookmarks: result.rows },
    });
  } catch (err) {
    next(err);
  }
};

module.exports = { getProfile, getMyApplications, getMyBookmarks };