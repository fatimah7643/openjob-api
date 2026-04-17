const Joi = require('joi');

const validateAddApplication = (req, res, next) => {
  const schema = Joi.object({
    job_id: Joi.string().required().messages({
      'any.required': 'job_id is required',
      'string.empty': 'job_id cannot be empty',
    }),
  });

  const { error } = schema.validate(req.body);
  if (error) {
    return res.status(400).json({
      status: 'fail',
      message: error.details[0].message,
    });
  }
  next();
};

const validateUpdateApplication = (req, res, next) => {
  const schema = Joi.object({
    status: Joi.string()
      .valid('pending', 'reviewed', 'accepted', 'rejected')
      .required()
      .messages({
        'any.required': 'status is required',
        'any.only': 'status must be one of: pending, reviewed, accepted, rejected',
      }),
  });

  const { error } = schema.validate(req.body);
  if (error) {
    return res.status(400).json({
      status: 'fail',
      message: error.details[0].message,
    });
  }
  next();
};

module.exports = { validateAddApplication, validateUpdateApplication };