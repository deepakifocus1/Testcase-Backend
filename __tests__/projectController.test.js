const projectController = require("../controllers/projectController");
const Project = require("../models/Project");
const TestCase = require("../models/TestCase");
const { AppError } = require("../middleware/errorHandler");
const { projectSchema } = require("../validations/ProjectValidationJoi");
const { ERROR_MESSAGES, SUCCESS_MESSAGES } = require("../constants/constants");
const { createActivity } = require("../controllers/recentActivity");

// filepath: c:\Users\iFocus\Desktop\TEST-CASE-MANAGER\Testcase-Backend\__tests__\projectController.test.js

jest.mock("../models/Project");
jest.mock("../models/TestCase");
jest.mock("../controllers/recentActivity");
jest.mock("../validations/ProjectValidationJoi", () => ({
  projectSchema: { validate: jest.fn() },
}));
jest.mock("../constants/constants", () => ({
  ERROR_MESSAGES: {
    PROJECT_NOT_FOUND: "Project not found",
    TESTCASE_NOT_FOUND: "Test case not found",
  },
  SUCCESS_MESSAGES: {
    PROJECT_DELETED: "Project deleted successfully",
    TESTCASE_ADDED_PROJECT: "Test case added to project",
  },
  authController: { requestBody: "Request body missing" },
}));

describe("projectController", () => {
  let req, res, next;

  beforeEach(() => {
    req = { body: {}, params: {}, user: { _id: "user1" } };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    next = jest.fn();
    jest.clearAllMocks();
  });

  describe("createProject", () => {
    it("should return 400 if req.body is missing", async () => {
      req.body = null;
      await projectController.createProject(req, res, next);
      expect(next).toHaveBeenCalledWith(expect.any(AppError));
    });

    it("should return 400 if validation fails", async () => {
      projectSchema.validate.mockReturnValue({
        error: { details: [{ message: "Name is required" }] },
      });
      await projectController.createProject(req, res, next);
      expect(next).toHaveBeenCalledWith(expect.any(AppError));
    });

    it("should create and return a project", async () => {
      projectSchema.validate.mockReturnValue({
        error: null,
        value: { name: "P1" },
      });
      const saveMock = jest.fn().mockResolvedValue({ _id: "p1", name: "P1" });
      Project.mockImplementation(() => ({ save: saveMock }));
      await projectController.createProject(req, res, next);
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({ _id: "p1", name: "P1" });
      expect(createActivity).toHaveBeenCalled();
    });
  });

  describe("getProjects", () => {
    it("should return all projects", async () => {
      Project.find.mockReturnValue({
        populate: jest.fn().mockReturnThis(),
        populate: jest.fn().mockReturnThis(),
        populate: jest.fn().mockResolvedValue([{ name: "P1" }]),
      });
      await projectController.getProjects(req, res);
      expect(res.json).toHaveBeenCalledWith([{ name: "P1" }]);
    });

    it("should handle errors", async () => {
      Project.find.mockImplementation(() => {
        throw new Error("DB error");
      });
      await projectController.getProjects(req, res);
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: expect.any(String) });
    });
  });

  describe("getProjectById", () => {
    it("should return a project by id", async () => {
      req.params.id = "p1";
      Project.findById.mockReturnValue({
        populate: jest.fn().mockResolvedValue({ _id: "p1", name: "P1" }),
      });
      await projectController.getProjectById(req, res);
      expect(res.json).toHaveBeenCalledWith({ _id: "p1", name: "P1" });
    });

    it("should return 404 if project not found", async () => {
      req.params.id = "p1";
      Project.findById.mockReturnValue({
        populate: jest.fn().mockResolvedValue(null),
      });
      await projectController.getProjectById(req, res);
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        error: ERROR_MESSAGES.PROJECT_NOT_FOUND,
      });
    });

    it("should handle errors", async () => {
      req.params.id = "p1";
      Project.findById.mockReturnValue({
        populate: jest.fn().mockRejectedValue(new Error("DB error")),
      });
      await projectController.getProjectById(req, res);
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: expect.any(String) });
    });
  });

  describe("updateProject", () => {
    it("should update and return a project", async () => {
      req.params.id = "p1";
      req.body = { name: "Updated" };
      Project.findByIdAndUpdate.mockResolvedValue({
        _id: "p1",
        name: "Updated",
      });
      await projectController.updateProject(req, res);
      expect(res.json).toHaveBeenCalledWith({ _id: "p1", name: "Updated" });
      expect(createActivity).toHaveBeenCalled();
    });

    it("should return 404 if project not found", async () => {
      req.params.id = "p1";
      Project.findByIdAndUpdate.mockResolvedValue(null);
      await projectController.updateProject(req, res);
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        error: ERROR_MESSAGES.PROJECT_NOT_FOUND,
      });
    });

    it("should handle errors", async () => {
      req.params.id = "p1";
      Project.findByIdAndUpdate.mockRejectedValue(new Error("DB error"));
      await projectController.updateProject(req, res);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ error: expect.any(String) })
      );
    });
  });

  describe("deleteProject", () => {
    it("should delete a project and update test cases", async () => {
      req.params.id = "p1";
      const deleteOneMock = jest.fn().mockResolvedValue();
      Project.findById.mockResolvedValue({
        _id: "p1",
        deleteOne: deleteOneMock,
      });
      TestCase.updateMany.mockResolvedValue();
      await projectController.deleteProject(req, res);
      expect(TestCase.updateMany).toHaveBeenCalled();
      expect(deleteOneMock).toHaveBeenCalled();
      expect(res.json).toHaveBeenCalledWith({
        message: SUCCESS_MESSAGES.PROJECT_DELETED,
      });
    });

    it("should return 404 if project not found", async () => {
      req.params.id = "p1";
      Project.findById.mockResolvedValue(null);
      await projectController.deleteProject(req, res);
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        error: ERROR_MESSAGES.PROJECT_NOT_FOUND,
      });
    });

    it("should handle errors", async () => {
      req.params.id = "p1";
      Project.findById.mockRejectedValue(new Error("DB error"));
      await projectController.deleteProject(req, res);
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: expect.any(String) });
    });
  });

  describe("addTestCaseToProject", () => {
    it("should add a test case to a project", async () => {
      req.params.id = "p1";
      req.body = { testCaseId: "t1" };
      const saveTestCaseMock = jest.fn().mockResolvedValue();
      const saveProjectMock = jest.fn().mockResolvedValue();
      Project.findById.mockResolvedValue({
        _id: "p1",
        testCases: [],
        save: saveProjectMock,
      });
      TestCase.findById.mockResolvedValue({
        _id: "t1",
        save: saveTestCaseMock,
      });
      await projectController.addTestCaseToProject(req, res);
      expect(saveTestCaseMock).toHaveBeenCalled();
      expect(saveProjectMock).toHaveBeenCalled();
      expect(res.json).toHaveBeenCalledWith({
        message: SUCCESS_MESSAGES.TESTCASE_ADDED_PROJECT,
        project: expect.any(Object),
      });
    });

    it("should return 404 if project not found", async () => {
      req.params.id = "p1";
      req.body = { testCaseId: "t1" };
      Project.findById.mockResolvedValue(null);
      await projectController.addTestCaseToProject(req, res);
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        error: ERROR_MESSAGES.PROJECT_NOT_FOUND,
      });
    });

    it("should return 404 if test case not found", async () => {
      req.params.id = "p1";
      req.body = { testCaseId: "t1" };
      Project.findById.mockResolvedValue({ _id: "p1", testCases: [] });
      TestCase.findById.mockResolvedValue(null);
      await projectController.addTestCaseToProject(req, res);
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        error: ERROR_MESSAGES.TESTCASE_NOT_FOUND,
      });
    });

    it("should handle errors", async () => {
      req.params.id = "p1";
      req.body = { testCaseId: "t1" };
      Project.findById.mockRejectedValue(new Error("DB error"));
      await projectController.addTestCaseToProject(req, res);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ error: expect.any(String) });
    });
  });
});
