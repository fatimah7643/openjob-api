const bcrypt = require('bcrypt');
const pool = require('../database/pool');
const generateId = require('../utils/idGenerator');

const addUser = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    
    const checkEmail = await pool.query(
      'SELECT id FROM "users" WHERE email = $1',
      [email]
    );
    if (checkEmail.rows.length > 0) {
      return res.status(400).json({
        status: 'failed',
        message: 'Email already registered',
      });
    }

    const id = generateId();
    const hashedPassword = await bcrypt.hash(password, 10);

    await pool.query(
      'INSERT INTO "users" (id, name, email, password) VALUES ($1, $2, $3, $4)',
      [id, name, email, hashedPassword]
    );

    return res.status(201).json({
      status: 'success',
      message: 'User registered successfully',
      data: { id: id },
    });
  } catch (err) {
    next(err);
  }
};

const getUserById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      'SELECT id, name, email, created_at, updated_at FROM "users" WHERE id = $1',
      [id]
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

module.exports = { addUser, getUserById };