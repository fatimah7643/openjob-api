const pool = require('../database/pool');
const generateId = require('../utils/idGenerator');

const addJob = async (req, res, next) => {
  try {
    const { title, description, location_type, location_city, salary_min, salary_max, is_salary_visible, job_type, experience_level, status, company_id, category_id } = req.body;
    const id = generateId();

    const company = await pool.query('SELECT id FROM "companies" WHERE id = $1', [company_id]);
    if (company.rows.length === 0) {
      return res.status(400).json({ status: 'failed', message: 'Company not found' });
    }

    await pool.query(
      `INSERT INTO "jobs" (id, title, description, location_type, location_city, salary_min, salary_max, is_salary_visible, job_type, experience_level, status, company_id, category_id)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)`,
      [id, title, description, location_type, location_city, salary_min, salary_max, is_salary_visible, job_type, experience_level, status, company_id, category_id]
    );

    return res.status(201).json({
      status: 'success',
      message: 'Job created successfully',
      data: { id },
    });
  } catch (err) {
    next(err);
  }
};

const getAllJobs = async (req, res, next) => {
  try {
    const { title, 'company-name': companyName } = req.query;

    let query = `
      SELECT j.id, j.title, j.description, j.location_type, j.location_city,
             j.salary_min, j.salary_max, j.job_type, j.experience_level,
             j.status, j.company_id, j.category_id, c.name as company_name
      FROM "jobs" j
      LEFT JOIN "companies" c ON j.company_id = c.id
      LEFT JOIN "categories" cat ON j.category_id = cat.id
      WHERE 1=1
    `;
    const params = [];

    if (title) {
      params.push(`%${title}%`);
      query += ` AND j.title ILIKE $${params.length}`;
    }

    if (companyName) {
      params.push(`%${companyName}%`);
      query += ` AND c.name ILIKE $${params.length}`;
    }

    query += ' ORDER BY j.created_at DESC';

    const result = await pool.query(query, params);
    return res.status(200).json({ status: 'success', data: { jobs: result.rows } });
  } catch (err) {
    next(err);
  }
};

const getJobById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      `SELECT j.id, j.title, j.description, j.location_type, j.location_city,
              j.salary_min, j.salary_max, j.job_type, j.experience_level,
              j.status, j.company_id, j.category_id, c.name as company_name
       FROM "jobs" j
       LEFT JOIN "companies" c ON j.company_id = c.id
       WHERE j.id = $1`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ status: 'failed', message: 'Job not found' });
    }

    return res.status(200).json({ status: 'success', data: { ...result.rows[0] } });
  } catch (err) {
    next(err);
  }
};

const getJobsByCompanyId = async (req, res, next) => {
  try {
    const { companyId } = req.params;
    const result = await pool.query(
      'SELECT * FROM "jobs" WHERE company_id = $1 ORDER BY created_at DESC',
      [companyId]
    );
    return res.status(200).json({ status: 'success', data: { jobs: result.rows } });
  } catch (err) {
    next(err);
  }
};

const getJobsByCategoryId = async (req, res, next) => {
  try {
    const { categoryId } = req.params;
    const result = await pool.query(
      'SELECT * FROM "jobs" WHERE category_id = $1 ORDER BY created_at DESC',
      [categoryId]
    );
    return res.status(200).json({ status: 'success', data: { jobs: result.rows } });
  } catch (err) {
    next(err);
  }
};

const updateJob = async (req, res, next) => {
  try {
    const { id } = req.params;

    const check = await pool.query('SELECT * FROM "jobs" WHERE id = $1', [id]);
    if (check.rows.length === 0) {
      return res.status(404).json({ status: 'failed', message: 'Job not found' });
    }

   
    const existing = check.rows[0];
    const {
      title = existing.title,
      description = existing.description,
      location_type = existing.location_type,
      location_city = existing.location_city,
      salary_min = existing.salary_min,
      salary_max = existing.salary_max,
      is_salary_visible = existing.is_salary_visible,
      job_type = existing.job_type,
      experience_level = existing.experience_level,
      status = existing.status,
      company_id = existing.company_id,
      category_id = existing.category_id,
    } = req.body;

    await pool.query(
      `UPDATE "jobs" SET title=$1, description=$2, location_type=$3, location_city=$4,
       salary_min=$5, salary_max=$6, is_salary_visible=$7, job_type=$8,
       experience_level=$9, status=$10, company_id=$11, category_id=$12, updated_at=NOW()
       WHERE id=$13`,
      [title, description, location_type, location_city, salary_min, salary_max,
       is_salary_visible, job_type, experience_level, status, company_id, category_id, id]
    );

    return res.status(200).json({ status: 'success', message: 'Job updated successfully' });
  } catch (err) {
    next(err);
  }
};

const deleteJob = async (req, res, next) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      'SELECT * FROM "jobs" WHERE id = $1',
      [id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({
        status: 'failed',
        message: 'Job not found',
      });
    }

    await pool.query('DELETE FROM "jobs" WHERE id = $1', [id]);

    return res.status(200).json({
      status: 'success',
      message: 'Job deleted successfully',
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  addJob,
  getAllJobs,
  getJobById,
  getJobsByCompanyId,
  getJobsByCategoryId,
  updateJob,
  deleteJob,
};