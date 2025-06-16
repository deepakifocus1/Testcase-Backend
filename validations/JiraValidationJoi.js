const Joi = require("joi");

const jiraProjectSchema = Joi.object({
  projectName: Joi.string().required().messages({
    "any.required": "Project Name is required.",
    "string.empty": "Project Name cannot be empty.",
  }),
  projectKey: Joi.string().required().messages({
    "any.required": "Project Key is required.",
    "string.empty": "Project Key cannot be empty.",
  }),
});

const jiraIssueSchema = Joi.object({
  summary: Joi.string().min(3).max(255).required().messages({
    "any.required": "summary is required.",
    "string.empty": "summary cannot be empty.",
  }),
  description: Joi.string().allow("").max(2000).messages({
    "any.required": "Description is required.",
    "string.empty": "Description cannot be empty.",
  }),
  projectKey: Joi.string().alphanum().min(2).max(10).required().messages({
    "any.required": "Project Key is required.",
    "string.empty": "Project Key cannot be empty.",
  }),
  issueType: Joi.string()
    .valid("Bug", "Task", "Story", "Epic")
    .required()
    .messages({
      "any.required": "Issue type is required.",
      "string.empty": "Project Key cannot be empty.",
    }),
});

module.exports = {
  jiraIssueSchema,
  jiraProjectSchema,
};
