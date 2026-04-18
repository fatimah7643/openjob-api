const Joi = require('joi');

const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required(),
});

const refreshTokenSchema = Joi.object({
  refreshToken: Joi.string().required(),
});

const validateLogin = (req, res, next) => {
  const { error } = loginSchema.validate(req.body);
  if (error) {
    return res.status(400).json({
      status: 'failed',
      message: error.details[0].message,
    });
  }
  next();
};

const validateRefreshToken = (req, res, next) => {
  const { error } = refreshTokenSchema.validate(req.body);
  if (error) {
    return res.status(400).json({
      status: 'failed',
      message: error.details[0].message,
    });
  }
  next();
};

module.exports = { validateLogin, validateRefreshToken };