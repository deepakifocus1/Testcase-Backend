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
const JiraIssue = require("../models/JiraIssues"); // Add this import

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

    const issueKey = await createIssue(payload);

    if (!issueKey) {
      throw new AppError(ERROR_MESSAGES.FAILED_ISSUE_CREATION, 500);
    }

    const jiraIssue = new JiraIssue({
      projectKey: payload.projectKey,
      issueKey: issueKey,
      testCase: payload.testCase,
      issueType: payload.issueType,
      summary: payload.summary,
      Description: payload.Description,
    });

    await jiraIssue.save();

    return res.status(201).json({
      status: STATUS_MESSAGE.SUCCESS,
      message: SUCCESS_MESSAGES.ISSUE_CREATED,
      data: { projectKey: issueKey },
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

//FETCH ISSUES FROM DATABASE
const fetchIssuesFromDb = async (req, res) => {
  try {
    const issues = await JiraIssue.find();
    if (!issues) throw new AppError(ERROR_MESSAGES.SERVER_ERROR, 500);
    res.status(200).json({
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
//FETCH ISSUES BY ID FROM DATABASE
const fetchIssueByIdFromDb = async (req, res) => {
  try {
    const issueKey = req.params.id;
    const issue = await JiraIssue.find({ issueKey }).populate({
      path: "testCase",
      populate: {
        path: "projectId",
        model: "Project",
      },
    });
    if (!issue) throw new AppError(ERROR_MESSAGES.ISSUE_NOT_FOUND, 404);
    res.status(200).json({
      success: true,
      message: SUCCESS_MESSAGES.ISSUE_FETCHED,
      data: { issue },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: ERROR_MESSAGES.SERVER_ERROR,
      error: error.message,
    });
  }
};

module.exports = {
  createProjectInJira,
  createIssueInJira,
  updateIssueInJira,
  fetchIssuesFromDb,
  fetchIssueByIdFromDb,
};
