const pool = require('../database/pool');
const generateId = require('../utils/idGenerator');
const genarateId = require('../utils/idGenerator');

const addCategory = async (req, res, next) => {
    try {
        const { name } = req.body;
        const id = generateId();

        await pool.query(
            'INSERT INTO "categories" (id, name) VALUES ($1, $2)',
            [id, name]
        );

        return res.status(201).json({
            status: 'success',
            message: 'Category created successfully',
            data: { id: id },
        });
    }catch (err) {
        next(err);
    }
};

const getAllCategories = async (req, res, next) => {
  try {
    const result = await pool.query(
      'SELECT * FROM "categories" ORDER BY created_at DESC'
    );

    return res.status(200).json({
      status: 'success',
      data: { categories: result.rows },
    });
  } catch (err) {
    next(err);
  }
};

const getCategoryById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      'SELECT * FROM "categories" WHERE id = $1',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        status: 'failed',
        message: 'Category not found',
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

const updateCategory = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name } = req.body;

    const result = await pool.query(
      'SELECT * FROM "categories" WHERE id = $1',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        status: 'failed',
        message: 'Category not found',
      });
    }

    await pool.query(
      'UPDATE "categories" SET name = $1, updated_at = NOW() WHERE id = $2',
      [name, id]
    );

    return res.status(200).json({
      status: 'success',
      message: 'Category updated successfully',
    });
  } catch (err) {
    next(err);
  }
};

const deleteCategory = async (req, res, next) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      'SELECT * FROM "categories" WHERE id = $1',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        status: 'failed',
        message: 'Category not found',
      });
    }

    await pool.query('DELETE FROM "categories" WHERE id = $1', [id]);

    return res.status(200).json({
      status: 'success',
      message: 'Category deleted successfully',
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  addCategory,
  getAllCategories,
  getCategoryById,
  updateCategory,
  deleteCategory,
};