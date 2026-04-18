const Joi = require('joi');

const createUserSchema = Joi.object({
    name: Joi.string().required(),
    email: Joi.string().email().required(),
    password: Joi.string().min(6).required(),
    role: Joi.string().valid('user', 'admin').default('user'),
});

const validateCreateUser = (req, res, next) => {
    const { error } = createUserSchema.validate(req.body);
    if (error) {
        return res.status(400).json({
            status: 'failed',
            message: error.details[0].message,
        });
    }
    next();
};

module.exports = { validateCreateUser};