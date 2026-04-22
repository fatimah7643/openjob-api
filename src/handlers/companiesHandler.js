const pool = require('../database/pool');
const generateId = require('../utils/idGenerator');
const redis = require('../utils/redisClient');

const CACHE_TTL = 3600; // 1 jam

const addCompany = async (req, res, next) => {
  try {
    const { name, description, address, location } = req.body;
    const userId = req.user.id;
    const id = generateId();

    await pool.query(
      'INSERT INTO "companies" (id, name, description, address, location, user_id) VALUES ($1, $2, $3, $4, $5, $6)',
      [id, name, description, address, location, userId]
    );

    return res.status(201).json({
      status: 'success',
      message: 'Company created successfully',
      data: { id: id },
    });
  } catch (err) {
    next(err);
  }
};

const getAllCompanies = async (req, res, next) => {
  try {
    const result = await pool.query(
      'SELECT id, name, description, address, location, user_id FROM "companies" ORDER BY created_at DESC'
    );
    return res.status(200).json({ status: 'success', data: { companies: result.rows } });
  } catch (err) {
    next(err);
  }
};

const getCompanyById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const cacheKey = `company:${id}`;

    const cached = await redis.get(cacheKey);
    if (cached) {
      return res.status(200).set('X-Data-Source', 'cache').json({
        status: 'success',
        data: JSON.parse(cached),
      });
    }

    const result = await pool.query(
      'SELECT id, name, description, address, location, user_id FROM "companies" WHERE id = $1',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ status: 'failed', message: 'Company not found' });
    }

    const company = result.rows[0];
    await redis.setex(cacheKey, CACHE_TTL, JSON.stringify(company));

    return res
      .status(200)
      .set('X-Data-Source', 'database') 
      .json({
        status: 'success',
        data: { ...company },
      });
  } catch (err) {
    next(err);
  }
};

const updateCompany = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, description, address, location } = req.body;

    const check = await pool.query('SELECT * FROM "companies" WHERE id = $1', [id]);
    if (check.rows.length === 0) {
      return res.status(404).json({ status: 'failed', message: 'Company not found' });
    }

    await pool.query(
      'UPDATE "companies" SET name=$1, description=$2, address=$3, location=$4, updated_at=NOW() WHERE id=$5',
      [name, description, address, location, id]
    );

   
    await redis.del(`company:${id}`);

    return res.status(200).json({ status: 'success', message: 'Company updated successfully' });
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
        status: 'failed',
        message: 'Company not found',
      });
    }

    await pool.query('DELETE FROM "companies" WHERE id = $1', [id]);

    await redis.del(`company:${id}`);

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