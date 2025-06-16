const Joi = require("joi");
const mongoose = require("mongoose");

// Helper function to validate MongoDB ObjectId
const isValidObjectId = (value, helpers) => {
  if (!mongoose.Types.ObjectId.isValid(value)) {
    return helpers.error("any.invalid");
  }
  return value;
};

// Email regex pattern
const emailRegex = /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/;

// Password regex pattern - at least 8 characters with at least one uppercase, one lowercase, one number, and one special character
const passwordRegex =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{8,}$/;

// User schema for registration
const userSchema = Joi.object({
  name: Joi.string().required(),
  email: Joi.string()
    .trim()
    .lowercase()
    .pattern(emailRegex)
    .required()
    .messages({
      "string.pattern.base": "Please provide a valid email address",
    }),
  password: Joi.string().pattern(passwordRegex).optional().messages({
    "string.pattern.base":
      "Password must be at least 8 characters long and include at least one uppercase letter, one lowercase letter, one number, and one special character (!@#$%^&*)",
  }),
  role: Joi.string().required(),
  jobTitle: Joi.string().optional(),
  timeZone: Joi.string().optional(),
  language: Joi.string().optional(),
  team: Joi.string().optional(),
  isApproved: Joi.boolean().default(false).optional(),
  accountCreatedBy: Joi.string()
    .custom(isValidObjectId, "MongoDB ObjectId Validation")
    .optional()
    .messages({
      "any.invalid": "Invalid ObjectId for accountCreatedBy",
    }),
  projects: Joi.array()
    .items(
      Joi.string()
        .custom(isValidObjectId, "MongoDB ObjectId Validation")
        .messages({
          "any.invalid": "Invalid ObjectId for project",
        })
    )
    .optional(),
});

// Login schema
const loginSchema = Joi.object({
  email: Joi.string()
    .trim()
    .lowercase()
    .pattern(emailRegex)
    .required()
    .messages({
      "string.pattern.base": "Please provide a valid email address",
    }),
  password: Joi.string().required(),
});

module.exports = { userSchema, loginSchema };
