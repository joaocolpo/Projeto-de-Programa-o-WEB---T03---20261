const Joi = require('joi');

const updateUserSchema = Joi.object({
  name: Joi.string().min(2).max(50).optional(),
  email: Joi.string().email().optional()
}).min(1);

module.exports = { updateUserSchema };
