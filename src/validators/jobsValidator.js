const Joi = require('joi');

const jobSchema = Joi.object({
  title: Joi.string().required(),
  description: Joi.string().allow('', null),
  location: Joi.string().allow('', null),
  salary: Joi.string().allow('', null),
  type: Joi.string().allow('', null),
  company_id: Joi.string().required(),
  category_id: Joi.string().required(),
});

const validateJob = (req, res, next) => {
  const { error } = jobSchema.validate(req.body);
  if (error) {
    return res.status(400).json({
      status: 'fail',
      message: error.details[0].message,
    });
  }
  next();
};

module.exports = { validateJob };