const jwt = require('jsonwebtoken');

const authMiddleware = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({
      status: 'failed',
      message: 'Missing authentication',
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_KEY);
    req.user = decoded; // { id: userId }
    next();
  } catch (err) {
    return res.status(401).json({
      status: 'failed',
      message: 'Invalid or expired token',
    });
  }
};

module.exports = authMiddleware;