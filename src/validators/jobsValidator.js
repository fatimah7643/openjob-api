const Joi = require('joi');

const jobSchema = Joi.object({
  title: Joi.string().required(),
  description: Joi.string().allow('', null),
  location_type: Joi.string().allow('', null),
  location_city: Joi.string().allow('', null),
  salary_min: Joi.number().allow(null),
  salary_max: Joi.number().allow(null),
  is_salary_visible: Joi.boolean().allow(null),
  job_type: Joi.string().allow('', null),
  experience_level: Joi.string().allow('', null),
  status: Joi.string().allow('', null),
  company_id: Joi.string().required(),
  category_id: Joi.string().allow('', null),
});

const validateJob = (req, res, next) => {
  const { error } = jobSchema.validate(req.body);
  if (error) {
    return res.status(400).json({
      status: 'failed',
      message: error.details[0].message,
    });
  }
  next();
};

const validateUpdateJob = (req, res, next) => {
  const schema = Joi.object({
    title: Joi.string(),
    description: Joi.string().allow('', null),
    location_type: Joi.string().allow('', null),
    location_city: Joi.string().allow('', null),
    salary_min: Joi.number().allow(null),
    salary_max: Joi.number().allow(null),
    is_salary_visible: Joi.boolean().allow(null),
    job_type: Joi.string().allow('', null),
    experience_level: Joi.string().allow('', null),
    status: Joi.string().allow('', null),
    company_id: Joi.string(),
    category_id: Joi.string().allow('', null),
  });

  const { error } = schema.validate(req.body);
  if (error) {
    return res.status(400).json({
      status: 'failed',
      message: error.details[0].message,
    });
  }
  next();
};

module.exports = { validateJob, validateUpdateJob };