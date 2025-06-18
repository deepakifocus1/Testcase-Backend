const { AppError } = require("../middleware/errorHandler");
const constants = require("../constants/constants");
const jiraServices = require("../services/jiraServices");
const validations = require("../validations/JiraValidationJoi");

const {
  createProjectInJira,
  createIssueInJira,
} = require("../controllers/jiraController");

jest.mock("../services/jiraServices");
jest.mock("../validations/JiraValidationJoi");
jest.mock("../constants/constants", () => ({
  authController: { requestBody: "Request body missing" },
  ERROR_MESSAGES: {
    FAILED_PROJECT_CREATION: "Failed to create project",
    SERVER_ERROR: "Server error",
  },
  STATUS_MESSAGE: { SUCCESS: "success" },
  SUCCESS_MESSAGES: {
    PROJECT_CREATED: "Project created",
    ISSUE_CREATED: "Issue created",
    ISSUE_FETCHED: "Issues fetched",
  },
}));

describe("jiraController", () => {
  let req, res, next;

  beforeEach(() => {
    req = { body: {} };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    next = jest.fn();
    jest.clearAllMocks();
  });

  describe("createProjectInJira", () => {
    it("should return 201 and projectKey on success", async () => {
      req.body = { projectName: "Test", projectKey: "TST" };
      validations.jiraProjectSchema = {
        validate: jest.fn().mockReturnValue({ error: null, value: req.body }),
      };
      jiraServices.createProject.mockResolvedValue("TST");

      await createProjectInJira(req, res, next);

      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({
        status: "success",
        message: "Project created",
        data: { projectKey: "TST" },
      });
    });

    it("should call next with AppError if req.body is missing", async () => {
      req.body = undefined;
      await createProjectInJira(req, res, next);
      expect(next).toHaveBeenCalledWith(expect.any(AppError));
    });

    it("should call next with AppError if validation fails", async () => {
      validations.jiraProjectSchema = {
        validate: jest.fn().mockReturnValue({
          error: { details: [{ message: "Invalid" }] },
          value: {},
        }),
      };
      await createProjectInJira(req, res, next);
      expect(next).toHaveBeenCalledWith(expect.any(AppError));
    });

    it("should call next with AppError if createProject returns falsy", async () => {
      req.body = { projectName: "Test", projectKey: "TST" };
      validations.jiraProjectSchema = {
        validate: jest.fn().mockReturnValue({ error: null, value: req.body }),
      };
      jiraServices.createProject.mockResolvedValue(null);

      await createProjectInJira(req, res, next);
      expect(next).toHaveBeenCalledWith(expect.any(AppError));
    });
  });

  describe("createIssueInJira", () => {
    it("should return 201 and projectKey on success", async () => {
      req.body = { summary: "Issue", projectKey: "TST" };
      validations.jiraIssueSchema = {
        validate: jest.fn().mockReturnValue({ error: null, value: req.body }),
      };
      jiraServices.createIssue.mockResolvedValue("TST-1");

      await createIssueInJira(req, res, next);

      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({
        status: "success",
        message: "Issue created",
        data: { projectKey: "TST-1" },
      });
    });

    it("should call next with AppError if req.body is missing", async () => {
      req.body = undefined;
      await createIssueInJira(req, res, next);
      expect(next).toHaveBeenCalledWith(expect.any(AppError));
    });

    it("should call next with AppError if validation fails", async () => {
      validations.jiraIssueSchema = {
        validate: jest.fn().mockReturnValue({
          error: { details: [{ message: "Invalid" }] },
          value: {},
        }),
      };
      await createIssueInJira(req, res, next);
      expect(next).toHaveBeenCalledWith(expect.any(AppError));
    });

    it("should call next with AppError if createIssue returns falsy", async () => {
      req.body = { summary: "Issue", projectKey: "TST" };
      validations.jiraIssueSchema = {
        validate: jest.fn().mockReturnValue({ error: null, value: req.body }),
      };
      jiraServices.createIssue.mockResolvedValue(null);

      await createIssueInJira(req, res, next);
      expect(next).toHaveBeenCalledWith(expect.any(AppError));
    });
  });
});
