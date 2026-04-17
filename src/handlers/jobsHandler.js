const pool = require('../database/pool');
const generateId = require('../utils/idGenerator');

const addJob = async (req, res, next) => {
  try {
    const { title, description, location, salary, type, company_id, category_id } = req.body;
    const id = generateId();

    await pool.query(
      `INSERT INTO "jobs" (id, title, description, location, salary, type, company_id, category_id)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
      [id, title, description, location, salary, type, company_id, category_id]
    );

    return res.status(201).json({
      status: 'success',
      message: 'Job created successfully',
      data: { jobId: id },
    });
  } catch (err) {
    next(err);
  }
};

const getAllJobs = async (req, res, next) => {
  try {
    const { title, 'company-name': companyName } = req.query;

    let query = `
      SELECT j.*, c.name as company_name, cat.name as category_name
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

    return res.status(200).json({
      status: 'success',
      data: { jobs: result.rows },
    });
  } catch (err) {
    next(err);
  }
};

const getJobById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      `SELECT j.*, c.name as company_name, cat.name as category_name
       FROM "jobs" j
       LEFT JOIN "companies" c ON j.company_id = c.id
       LEFT JOIN "categories" cat ON j.category_id = cat.id
       WHERE j.id = $1`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        status: 'fail',
        message: 'Job not found',
      });
    }

    return res.status(200).json({
      status: 'success',
      data: { job: result.rows[0] },
    });
  } catch (err) {
    next(err);
  }
};

const getJobsByCompanyId = async (req, res, next) => {
  try {
    const { companyId } = req.params;

    const company = await pool.query(
      'SELECT * FROM "companies" WHERE id = $1',
      [companyId]
    );
    if (company.rows.length === 0) {
      return res.status(404).json({
        status: 'fail',
        message: 'Company not found',
      });
    }

    const result = await pool.query(
      'SELECT * FROM "jobs" WHERE company_id = $1 ORDER BY created_at DESC',
      [companyId]
    );

    return res.status(200).json({
      status: 'success',
      data: { jobs: result.rows },
    });
  } catch (err) {
    next(err);
  }
};

const getJobsByCategoryId = async (req, res, next) => {
  try {
    const { categoryId } = req.params;

    const category = await pool.query(
      'SELECT * FROM "categories" WHERE id = $1',
      [categoryId]
    );
    if (category.rows.length === 0) {
      return res.status(404).json({
        status: 'fail',
        message: 'Category not found',
      });
    }

    const result = await pool.query(
      'SELECT * FROM "jobs" WHERE category_id = $1 ORDER BY created_at DESC',
      [categoryId]
    );

    return res.status(200).json({
      status: 'success',
      data: { jobs: result.rows },
    });
  } catch (err) {
    next(err);
  }
};

const updateJob = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { title, description, location, salary, type, company_id, category_id } = req.body;

    const result = await pool.query(
      'SELECT * FROM "jobs" WHERE id = $1',
      [id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({
        status: 'fail',
        message: 'Job not found',
      });
    }

    await pool.query(
      `UPDATE "jobs" SET title=$1, description=$2, location=$3, salary=$4,
       type=$5, company_id=$6, category_id=$7, updated_at=NOW() WHERE id=$8`,
      [title, description, location, salary, type, company_id, category_id, id]
    );

    return res.status(200).json({
      status: 'success',
      message: 'Job updated successfully',
    });
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
        status: 'fail',
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