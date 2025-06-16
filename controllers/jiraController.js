const {
  authController,
  ERROR_MESSAGES,
  STATUS_MESSAGE,
  SUCCESS_MESSAGES,
} = require("../constants/constants");
const {
  jiraProjectSchema,
  jiraIssueSchema,
} = require("../validations/JiraValidationJoi");
const { AppError } = require("../middleware/errorHandler");
const {
  createProject,
  createIssue,
  getIssues,
} = require("../services/jiraServices");

//CREATE PROJECT CONTROLLER
const createProjectInJira = async (req, res, next) => {
  try {
    if (!req.body) {
      throw new AppError(authController.requestBody, 400);
    }
    const { error, value: payload } = jiraProjectSchema.validate(req.body, {
      abortEarly: false,
    });

    if (error) {
      const errorMessage = error.details
        .map((detail) => detail.message)
        .join(", ");
      throw new AppError(errorMessage, 400);
    }

    const { projectName, projectKey } = payload;

    const key = await createProject({ projectName, projKey: projectKey });

    if (!key) {
      throw new AppError(ERROR_MESSAGES.FAILED_PROJECT_CREATION, 500);
    }

    return res.status(201).json({
      status: STATUS_MESSAGE.SUCCESS,
      message: SUCCESS_MESSAGES.PROJECT_CREATED,
      data: { projectKey: key },
    });
  } catch (error) {
    next(error);
  }
};

//CREATE ISSUE CONTROLLER
const createIssueInJira = async (req, res, next) => {
  try {
    if (!req.body) {
      throw new AppError(authController.requestBody, 400);
    }
    const { error, value: payload } = jiraIssueSchema.validate(req.body, {
      abortEarly: false,
    });

    if (error) {
      const errorMessage = error.details
        .map((detail) => detail.message)
        .join(", ");
      throw new AppError(errorMessage, 400);
    }

    const key = await createIssue(payload);

    if (!key) {
      throw new AppError(ERROR_MESSAGES.FAILED_PROJECT_CREATION, 500);
    }

    return res.status(201).json({
      status: STATUS_MESSAGE.SUCCESS,
      message: SUCCESS_MESSAGES.ISSUE_CREATED,
      data: { projectKey: key },
    });
  } catch (error) {
    next(error);
  }
};

//FETCH ALL ISSUES CONTROLLER
const fetchIssuesFromJira = async (req, res) => {
  try {
    const issues = await getIssues();
    return res.status(200).json({
      success: true,
      message: SUCCESS_MESSAGES.ISSUE_FETCHED,
      data: { issues },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: ERROR_MESSAGES.SERVER_ERROR,
      error: error.message,
    });
  }
};

//UPDATE ISSUE CONTROLLER
const updateIssueInJira = async (req, res) => {};

module.exports = { createProjectInJira, createIssueInJira, updateIssueInJira };
