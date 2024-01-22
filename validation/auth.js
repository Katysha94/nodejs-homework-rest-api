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

module.exports = { userSchema };
