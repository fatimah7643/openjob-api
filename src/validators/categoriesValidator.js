const Joi = require('joi');

const categorySchema = Joi.object({
    name: Joi.string().required(),
});

const validateCategory = (req, res, next) => {
    const { error } = categorySchema.validate(req.body);
    if (error) {
        return res.status(400).json({
            status: 'fail',
            message: error.detail[0].message,
        });
    }
    next();
};

module.exports = { validateCategory };