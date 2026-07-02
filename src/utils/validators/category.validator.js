const Joi = require('joi');

const createCategorySchema = Joi.object({
  name: Joi.string().min(1).max(50).required(),
  type: Joi.string().valid('income', 'expense').required()
});

const updateCategorySchema = Joi.object({
  name: Joi.string().min(1).max(50).optional(),
  type: Joi.string().valid('income', 'expense').optional()
}).min(1);

module.exports = { createCategorySchema, updateCategorySchema };
