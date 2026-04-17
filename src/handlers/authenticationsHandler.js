const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const pool = require('../database/pool');
const generateId = require('../utils/idGenerator');

// LOGIN
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Cek user ada
    const result = await pool.query(
      'SELECT * FROM "users" WHERE email = $1',
      [email]
    );
    if (result.rows.length === 0) {
      return res.status(401).json({
        status: 'fail',
        message: 'Invalid email or password',
      });
    }

    const user = result.rows[0];

    // Cek password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({
        status: 'fail',
        message: 'Invalid email or password',
      });
    }

    // Generate tokens
    const accessToken = jwt.sign(
      { id: user.id },
      process.env.ACCESS_TOKEN_KEY,
      { expiresIn: '3h' }
    );

    const refreshToken = jwt.sign(
      { id: user.id },
      process.env.REFRESH_TOKEN_KEY
    );

    // Simpan refresh token ke DB
    const id = generateId();
    await pool.query(
      'INSERT INTO "authentications" (id, refresh_token, user_id) VALUES ($1, $2, $3)',
      [id, refreshToken, user.id]
    );

    return res.status(200).json({
      status: 'success',
      message: 'Login successful',
      data: { accessToken, refreshToken },
    });
  } catch (err) {
    next(err);
  }
};

// REFRESH TOKEN
const refreshToken = async (req, res, next) => {
  try {
    const { refreshToken } = req.body;

    // Cek refresh token ada di DB
    const result = await pool.query(
      'SELECT * FROM "authentications" WHERE refresh_token = $1',
      [refreshToken]
    );
    if (result.rows.length === 0) {
      return res.status(400).json({
        status: 'fail',
        message: 'Refresh token not found',
      });
    }

    // Verifikasi refresh token
    let decoded;
    try {
      decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_KEY);
    } catch (err) {
      return res.status(400).json({
        status: 'fail',
        message: 'Invalid refresh token',
      });
    }

    // Generate access token baru
    const accessToken = jwt.sign(
      { id: decoded.id },
      process.env.ACCESS_TOKEN_KEY,
      { expiresIn: '3h' }
    );

    return res.status(200).json({
      status: 'success',
      message: 'Access token refreshed',
      data: { accessToken },
    });
  } catch (err) {
    next(err);
  }
};

// LOGOUT
const logout = async (req, res, next) => {
  try {
    const { refreshToken } = req.body;

    // Cek refresh token ada di DB
    const result = await pool.query(
      'SELECT * FROM "authentications" WHERE refresh_token = $1',
      [refreshToken]
    );
    if (result.rows.length === 0) {
      return res.status(400).json({
        status: 'fail',
        message: 'Refresh token not found',
      });
    }

    // Hapus refresh token dari DB
    await pool.query(
      'DELETE FROM "authentications" WHERE refresh_token = $1',
      [refreshToken]
    );

    return res.status(200).json({
      status: 'success',
      message: 'Logout successful',
    });
  } catch (err) {
    next(err);
  }
};

module.exports = { login, refreshToken, logout };