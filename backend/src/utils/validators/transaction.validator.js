const Joi = require('joi');

const createTransactionSchema = Joi.object({
  amount: Joi.number().positive().precision(2).required(),
  description: Joi.string().max(200).allow('', null),
  date: Joi.string().isoDate().required(),
  type: Joi.string().valid('income', 'expense').required(),
  categoryId: Joi.number().integer().positive().allow(null, '')
});

const updateTransactionSchema = Joi.object({
  amount: Joi.number().positive().precision(2),
  description: Joi.string().max(200).allow('', null),
  date: Joi.string().isoDate(),
  type: Joi.string().valid('income', 'expense'),
  categoryId: Joi.number().integer().positive().allow(null, '')
}).min(1);

module.exports = { createTransactionSchema, updateTransactionSchema };
