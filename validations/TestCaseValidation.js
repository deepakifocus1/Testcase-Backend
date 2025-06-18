const Joi = require("joi");
const mongoose = require("mongoose");

const objectId = Joi.string()
  .custom((value, helpers) => {
    if (!mongoose.Types.ObjectId.isValid(value)) {
      return helpers.error("any.invalid");
    }
    return value;
  }, "ObjectId Validation")
  .messages({
    "any.invalid": "Invalid ObjectId",
  });

const testCaseSchema = Joi.object({
  title: Joi.string().required().messages({
    "any.required": "Title is required",
    "string.empty": "Title is required",
  }),
  userStory: Joi.string().optional(),
  testCaseId: Joi.string().optional(),
  description: Joi.string().required().messages({
    "any.required": "Description is required",
    "string.empty": "Description is required",
  }),
  createdBy: Joi.string().optional(),
  preRequisite: Joi.string().required().messages({
    "any.required": "PreRequisite is required",
    "string.empty": "PreRequisite is required",
  }),
  type: Joi.string().required().messages({
    "any.required": "Type is required",
    "string.empty": "Type is required",
  }),
  steps: Joi.string().required().messages({
    "any.required": "Steps are required",
    "string.empty": "Steps are required",
  }),
  expectedResult: Joi.string().required().messages({
    "any.required": "Expected Result is required",
    "string.empty": "Expected Result is required",
  }),
  actualResult: Joi.string().optional(),
  status: Joi.string().default("Untested").optional(),
  priority: Joi.string().required().messages({
    "any.required": "Priority is required",
    "string.empty": "Priority is required",
  }),
  automationStatus: Joi.string().optional(),
  module: Joi.string().required().messages({
    "any.required": "Module is required",
    "string.empty": "Module is required",
  }),
  projectId: objectId.required().messages({
    "any.required": "Project is required",
    "string.empty": "Project is required",
    "any.invalid": "Invalid ObjectId",
  }),
});

module.exports = { testCaseSchema };
