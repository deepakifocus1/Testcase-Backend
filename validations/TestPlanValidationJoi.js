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
  title: Joi.string().optional(),
  userStory: Joi.string().optional(),
  testCaseId: Joi.string().optional(),
  description: Joi.string().optional(),
  createdBy: Joi.string().optional(),
  preRequisite: Joi.string().optional(),
  steps: Joi.string().optional(),
  expectedResult: Joi.string().optional(),
  status: Joi.string().optional(),
  type: Joi.string().optional(),
  priority: Joi.string().optional(),
  automationStatus: Joi.string().optional(),
  actualResults: Joi.string().optional(),
  module: Joi.string().optional(),
  projectId: objectId.optional(),
});

const testRunSchema = Joi.object({
  module: Joi.array().items(testCaseSchema).optional(),
  browser: Joi.string().optional(),
  osType: Joi.string().optional(),
  assignedTo: Joi.string().optional(),
});

const testPlanSchema = Joi.object({
  name: Joi.string().required().messages({
    "any.required": "Name is required",
    "string.empty": "Name is required",
  }),
  subHeading: Joi.string().required().messages({
    "any.required": "SubHeading is required",
    "string.empty": "SubHeading is required",
  }),
  createdBy: Joi.string().required().messages({
    "any.required": "CreatedBy is required",
    "string.empty": "CreatedBy is required",
    "any.invalid": "Invalid ObjectId for CreatedBy",
  }),
  description: Joi.string().optional(),
  dueDateFrom: Joi.date().required().messages({
    "any.required": "DueDateFrom is required",
    "date.base": "DueDateFrom must be a valid date",
  }),
  dueDateTo: Joi.date().required().messages({
    "any.required": "DueDateTo is required",
    "date.base": "DueDateTo must be a valid date",
  }),
  projectId: objectId.optional(),
  testRun: Joi.array().items(testRunSchema).optional(),
});

module.exports = { testPlanSchema };
