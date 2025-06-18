const testCaseController = require("../controllers/testCaseController");
const TestCase = require("../models/TestCase");
const Project = require("../models/Project");
const ActivityLog = require("../models/ActivityLog");
const ExcelJS = require("exceljs");

jest.mock("../models/TestCase");
jest.mock("../models/Project");
jest.mock("../models/ActivityLog");
jest.mock("exceljs");
jest.mock("../controllers/recentActivity", () => ({
  createActivity: jest.fn(),
}));
jest.mock("../validations/TestCaseValidation", () => ({
  testCaseSchema: {
    validate: jest.fn(),
  },
}));
jest.mock("../middleware/errorHandler", () => ({
  AppError: jest
    .fn()
    .mockImplementation((msg, code) => ({ message: msg, code })),
}));
jest.mock("../constants/constants", () => ({
  authController: { requestBody: "Request body required" },
  ERROR_MESSAGES: {
    PROJECT_NOT_FOUND: "Project not found",
    TESTCASE_NOT_FOUND: "Test case not found",
    UPDATED_BY_REQUIRED: "updatedBy is required",
  },
  SUCCESS_MESSAGES: {
    TESTCASE_DELETED: "Test case deleted successfully",
  },
}));

describe("testCaseController", () => {
  let req, res, next;

  beforeEach(() => {
    req = {
      body: {},
      params: {},
      query: {},
      user: { _id: "user1", name: "User One" },
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      setHeader: jest.fn(),
      end: jest.fn(),
    };
    next = jest.fn();
    jest.clearAllMocks();
  });

  describe("createTestCase", () => {
    it("should return 400 if request body is missing", async () => {
      req.body = null;
      await testCaseController.createTestCase(req, res, next);
      expect(next).toHaveBeenCalled();
    });

    it("should return 400 if validation fails", async () => {
      require("../validations/TestCaseValidation").testCaseSchema.validate.mockReturnValue(
        {
          error: { details: [{ message: "Title required" }] },
        }
      );
      req.body = {};
      await testCaseController.createTestCase(req, res, next);
      expect(next).toHaveBeenCalled();
    });

    it("should return error if project not found", async () => {
      require("../validations/TestCaseValidation").testCaseSchema.validate.mockReturnValue(
        {
          error: null,
          value: { projectId: "pid", createdBy: "user1", title: "t" },
        }
      );
      Project.findById.mockResolvedValue(null);
      await testCaseController.createTestCase(req, res, next);
      expect(next).toHaveBeenCalled();
    });

    it("should create test case and return 201", async () => {
      require("../validations/TestCaseValidation").testCaseSchema.validate.mockReturnValue(
        {
          error: null,
          value: { projectId: "pid", createdBy: "user1", title: "t" },
        }
      );
      Project.findById.mockResolvedValue({ testCases: [], save: jest.fn() });
      TestCase.countDocuments.mockResolvedValue(0);
      TestCase.mockImplementation(function (data) {
        return {
          ...data,
          save: jest
            .fn()
            .mockResolvedValue({ ...data, _id: "tid", title: "t" }),
        };
      });
      ActivityLog.create.mockResolvedValue({});
      await testCaseController.createTestCase(req, res, next);
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalled();
    });
  });

  describe("getTestCases", () => {
    it("should return test cases", async () => {
      TestCase.aggregate.mockResolvedValue([{ _id: "1" }]);
      await testCaseController.getTestCases(req, res);
      expect(res.json).toHaveBeenCalledWith([{ _id: "1" }]);
    });

    it("should handle errors", async () => {
      TestCase.aggregate.mockRejectedValue(new Error("fail"));
      await testCaseController.getTestCases(req, res);
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: "fail" });
    });
  });

  describe("getTestCaseById", () => {
    it("should return test case", async () => {
      TestCase.findById.mockReturnValue({
        populate: jest.fn().mockResolvedValue({ _id: "1" }),
      });
      req.params.id = "1";
      await testCaseController.getTestCaseById(req, res);
      expect(res.json).toHaveBeenCalledWith({ _id: "1" });
    });

    it("should return 404 if not found", async () => {
      TestCase.findById.mockReturnValue({
        populate: jest.fn().mockResolvedValue(null),
      });
      req.params.id = "1";
      await testCaseController.getTestCaseById(req, res);
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ error: "Test case not found" });
    });

    it("should handle errors", async () => {
      TestCase.findById.mockReturnValue({
        populate: jest.fn().mockRejectedValue(new Error("fail")),
      });
      req.params.id = "1";
      await testCaseController.getTestCaseById(req, res);
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: "fail" });
    });
  });

  describe("updateTestCase", () => {
    it("should return 400 if updatedBy missing", async () => {
      req.body = {};
      await testCaseController.updateTestCase(req, res);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ error: "updatedBy is required" });
    });

    it("should return 404 if project not found", async () => {
      req.body = { updatedBy: "user1", projectId: "pid" };
      Project.findById.mockResolvedValue(null);
      await testCaseController.updateTestCase(req, res);
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ error: "Project not found" });
    });

    it("should return 404 if test case not found", async () => {
      req.body = { updatedBy: "user1" };
      TestCase.findByIdAndUpdate.mockResolvedValue(null);
      await testCaseController.updateTestCase(req, res);
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ error: "Test case not found" });
    });

    it("should update and return test case", async () => {
      req.body = { updatedBy: "user1" };
      TestCase.findByIdAndUpdate.mockReturnValue({
        populate: jest
          .fn()
          .mockResolvedValue({ _id: "1", title: "t", module: "m" }),
      });
      ActivityLog.create.mockResolvedValue({});
      await testCaseController.updateTestCase(req, res);
      expect(res.json).toHaveBeenCalled();
    });

    it("should handle errors", async () => {
      req.body = { updatedBy: "user1" };
      TestCase.findByIdAndUpdate.mockReturnValue({
        populate: jest.fn().mockRejectedValue(new Error("fail")),
      });
      await testCaseController.updateTestCase(req, res);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ error: "fail" });
    });
  });

  describe("deleteTestCase", () => {
    it("should return 404 if not found", async () => {
      TestCase.findById.mockResolvedValue(null);
      req.params.id = "1";
      await testCaseController.deleteTestCase(req, res);
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ error: "Test case not found" });
    });

    it("should delete and return success", async () => {
      const testCase = {
        _id: "1",
        projectId: "pid",
        deleteOne: jest.fn().mockResolvedValue(),
      };
      TestCase.findById.mockResolvedValue(testCase);
      Project.updateOne.mockResolvedValue();
      req.params.id = "1";
      await testCaseController.deleteTestCase(req, res);
      expect(res.json).toHaveBeenCalledWith({
        message: "Test case deleted successfully",
      });
    });

    it("should handle errors", async () => {
      TestCase.findById.mockRejectedValue(new Error("fail"));
      req.params.id = "1";
      await testCaseController.deleteTestCase(req, res);
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: "fail" });
    });
  });

  describe("downloadTestCasesExcel", () => {
    it("should download excel with test cases", async () => {
      const mockTestCases = [
        {
          testCaseId: "TC-0001",
          title: "Test 1",
          projectId: { name: "Project 1" },
          module: "Module 1",
          description: "Desc",
          preRequisite: "Pre",
          steps: "Steps",
          expectedResult: "Result",
          priority: "High",
          automationStatus: "Automated",
          status: "Active",
          script: "Script",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];
      TestCase.find.mockReturnValue({
        populate: jest.fn().mockReturnThis(),
        sort: jest.fn().mockResolvedValue(mockTestCases),
      });
      const mockWorksheet = {
        addRow: jest.fn(),
        getRow: jest.fn().mockReturnValue({ font: {} }),
      };
      const mockWorkbook = {
        addWorksheet: jest.fn().mockReturnValue(mockWorksheet),
        xlsx: { write: jest.fn().mockResolvedValue() },
      };
      ExcelJS.Workbook.mockImplementation(() => mockWorkbook);

      await testCaseController.downloadTestCasesExcel(req, res);
      expect(res.setHeader).toHaveBeenCalledWith(
        "Content-Type",
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
      );
      expect(res.setHeader).toHaveBeenCalledWith(
        "Content-Disposition",
        "attachment; filename=test-cases.xlsx"
      );
      expect(res.end).toHaveBeenCalled();
    });

    it("should handle errors", async () => {
      TestCase.find.mockImplementation(() => {
        throw new Error("fail");
      });
      await testCaseController.downloadTestCasesExcel(req, res);
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: "fail" });
    });
  });
});
