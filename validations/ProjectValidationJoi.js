const Joi = require("joi");
const mongoose = require("mongoose");

// Custom Joi validator for ObjectId
const objectId = Joi.string().custom((value, helpers) => {
  if (!mongoose.Types.ObjectId.isValid(value)) {
    return helpers.error("any.invalid");
  }
  return value;
}, "ObjectId Validation");

const projectSchema = Joi.object({
  name: Joi.string().min(1).required().messages({
    "string.empty": "Project name is required",
    "any.required": "Project name is required",
  }),
  description: Joi.string().optional(),
  projectType: Joi.string().optional(),
  assignedTo: Joi.string(),
  testCases: Joi.array().items(objectId).optional(),
  createdBy: objectId.optional(),
});

module.exports = { projectSchema, objectId };
