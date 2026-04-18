const Joi = require('joi');

const companySchema = Joi.object({
  name: Joi.string().required(),
  description: Joi.string().allow('', null),
  location: Joi.string().required(),
  address: Joi.string().allow('', null),
});

const validateCompany = (req, res, next) => {
  const { error } = companySchema.validate(req.body);
  if (error) {
    return res.status(400).json({
      status: 'failed',
      message: error.details[0].message,
    });
  }
  next();
};

module.exports = { validateCompany };