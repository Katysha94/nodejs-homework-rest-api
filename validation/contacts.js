const Joi = require("joi");

const contactSchema = Joi.object({
  name: Joi.string()
    .required()
    .messages({ "any.required": "missing required name field" }),
  email: Joi.string()
    .required()
    .messages({ "any.required": "missing required email field" }),
  phone: Joi.string()
    .required()
    .messages({ "any.required": "missing required phone field" }),
  favorite: Joi.boolean(),
});

const updateSchema = Joi.object({
  name: Joi.string().messages({
    "any.required": "missing fields",
  }),
  email: Joi.string().messages({
    "any.required": "missing fields",
  }),
  phone: Joi.string().messages({
    "any.required": "missing fields",
  }),
});

const updateFavoriteSchema = Joi.object({
  favorite: Joi.boolean().required(),
});
module.exports = { contactSchema, updateSchema, updateFavoriteSchema };
