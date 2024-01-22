const Joi = require("joi");

const subList = ["starter", "pro", "business"];

const userSchema = Joi.object({
  password: Joi.string()
    .required()
    .messages({ "any.required": "Please, create a password" }),
  email: Joi.string().email().required().messages({
    "any.required": "Please, create an email",
    "string.email": "Invalid email format",
  }),
  subscription: Joi.string().valid(...subList),
});

const subscriptionSchema = Joi.object({
  subscription: Joi.string().valid("starter", "pro", "business"),
});

module.exports = { userSchema, subscriptionSchema };
