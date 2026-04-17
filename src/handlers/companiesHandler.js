const pool = require('../database/pool');
const generateId = require('../utils/idGenerator');

const addCompany = async (req, res, next) => {
  try {
    const { name, description, address } = req.body;
    const userId = req.user.id;
    const id = generateId();

    await pool.query(
      'INSERT INTO "companies" (id, name, description, address, user_id) VALUES ($1, $2, $3, $4, $5)',
      [id, name, description, address, userId]
    );

    return res.status(201).json({
      status: 'success',
      message: 'Company created successfully',
      data: { companyId: id },
    });
  } catch (err) {
    next(err);
  }
};

const getAllCompanies = async (req, res, next) => {
  try {
    const result = await pool.query(
      'SELECT * FROM "companies" ORDER BY created_at DESC'
    );

    return res.status(200).json({
      status: 'success',
      data: { companies: result.rows },
    });
  } catch (err) {
    next(err);
  }
};

const getCompanyById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      'SELECT * FROM "companies" WHERE id = $1',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        status: 'fail',
        message: 'Company not found',
      });
    }

    return res.status(200).json({
      status: 'success',
      data: { company: result.rows[0] },
    });
  } catch (err) {
    next(err);
  }
};

const updateCompany = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, description, address } = req.body;

    const result = await pool.query(
      'SELECT * FROM "companies" WHERE id = $1',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        status: 'fail',
        message: 'Company not found',
      });
    }

    await pool.query(
      'UPDATE "companies" SET name = $1, description = $2, address = $3, updated_at = NOW() WHERE id = $4',
      [name, description, address, id]
    );

    return res.status(200).json({
      status: 'success',
      message: 'Company updated successfully',
    });
  } catch (err) {
    next(err);
  }
};

const deleteCompany = async (req, res, next) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      'SELECT * FROM "companies" WHERE id = $1',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        status: 'fail',
        message: 'Company not found',
      });
    }

    await pool.query('DELETE FROM "companies" WHERE id = $1', [id]);

    return res.status(200).json({
      status: 'success',
      message: 'Company deleted successfully',
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  addCompany,
  getAllCompanies,
  getCompanyById,
  updateCompany,
  deleteCompany,
};