const Joi = require('joi');

const validateJobIdParam = (req, res, next) => {
  const schema = Joi.object({
    jobId: Joi.string().required().messages({
      'any.required': 'jobId param is required',
      'string.empty': 'jobId cannot be empty',
    }),
  });

  const { error } = schema.validate({ jobId: req.params.jobId });
  if (error) {
    return res.status(400).json({
      status: 'failed',
      message: error.details[0].message,
    });
  }
  next();
};

module.exports = { validateJobIdParam };