const testPlanController = require("../controllers/testPlanController");
const TestPlan = require("../models/TestPlan");
const { testPlanSchema } = require("../validations/TestPlanValidationJoi");
const { AppError } = require("../middleware/errorHandler");
const { ERROR_MESSAGES } = require("../constants/constants");
const { createActivity } = require("../controllers/recentActivity");

jest.mock("../models/TestPlan");
jest.mock("../controllers/recentActivity");
jest.mock("../validations/TestPlanValidationJoi", () => ({
  testPlanSchema: { validate: jest.fn() },
}));

describe("testPlanController", () => {
  let req, res, next;

  beforeEach(() => {
    req = {
      body: {},
      params: {},
      user: { _id: "user123", name: "Test User" },
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    next = jest.fn();
    jest.clearAllMocks();
  });

  describe("createTestPlan", () => {
    it("should create a test plan and return 201", async () => {
      req.body = {
        name: "Plan 1",
        subHeading: "Sub",
        description: "Desc",
        dueDateFrom: "2024-01-01",
        dueDateTo: "2024-01-02",
        projectId: "proj1",
        testRun: [],
      };
      testPlanSchema.validate.mockReturnValue({ error: null, value: req.body });
      TestPlan.create.mockResolvedValue({ ...req.body, _id: "planid" });

      await testPlanController.createTestPlan(req, res, next);

      expect(TestPlan.create).toHaveBeenCalledWith({
        ...req.body,
        createdBy: req.user._id,
        testRun: [],
      });
      expect(createActivity).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: expect.objectContaining({ name: "Plan 1" }),
      });
    });

    it("should handle validation error", async () => {
      testPlanSchema.validate.mockReturnValue({
        error: { details: [{ message: "Invalid" }] },
      });
      await testPlanController.createTestPlan(req, res, next);
      expect(next).toHaveBeenCalledWith(expect.any(AppError));
    });

    it("should handle missing body", async () => {
      req.body = null;
      await testPlanController.createTestPlan(req, res, next);
      expect(next).toHaveBeenCalledWith(expect.any(AppError));
    });

    it("should handle create failure", async () => {
      req.body = { name: "Plan" };
      testPlanSchema.validate.mockReturnValue({ error: null, value: req.body });
      TestPlan.create.mockResolvedValue(null);
      await testPlanController.createTestPlan(req, res, next);
      expect(next).toHaveBeenCalledWith(expect.any(AppError));
    });
  });

  describe("getTestPlans", () => {
    it("should return all test plans", async () => {
      TestPlan.find.mockReturnValue({
        populate: jest.fn().mockResolvedValue([{ _id: 1 }, { _id: 2 }]),
      });
      await testPlanController.getTestPlans(req, res);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        count: 2,
        data: [{ _id: 1 }, { _id: 2 }],
      });
    });
  });

  describe("getTestPlan", () => {
    it("should return a test plan by id", async () => {
      req.params.id = "planid";
      TestPlan.findById.mockResolvedValue({ _id: "planid" });
      await testPlanController.getTestPlan(req, res);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: { _id: "planid" },
      });
    });

    it("should handle not found", async () => {
      req.params.id = "planid";
      TestPlan.findById.mockResolvedValue(null);
      await expect(testPlanController.getTestPlan(req, res)).rejects.toThrow(
        ERROR_MESSAGES.PLAN_NOT_FOUND
      );
    });
  });

  describe("updateTestPlanModuleStatus", () => {
    it("should update module status", async () => {
      req.params = {
        testPlanId: "planid",
        testRunId: "runid",
        moduleId: "modid",
      };
      req.body = { status: "done" };
      const module = {};
      const testRun = { module: { id: jest.fn().mockReturnValue(module) } };
      const testPlan = {
        testRun: { id: jest.fn().mockReturnValue(testRun) },
        save: jest.fn().mockResolvedValue({ name: "Plan" }),
      };
      TestPlan.findById.mockResolvedValue(testPlan);

      await testPlanController.updateTestPlanModuleStatus(req, res);

      expect(module.status).toBe("done");
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: [testPlan, testRun],
      });
    });

    it("should handle missing testCaseData", async () => {
      req.body = {};
      await expect(
        testPlanController.updateTestPlanModuleStatus(req, res)
      ).rejects.toThrow(ERROR_MESSAGES.TESTCASE_DATA_REQUIRED);
    });

    it("should handle plan not found", async () => {
      req.body = { status: "done" };
      TestPlan.findById.mockResolvedValue(null);
      await expect(
        testPlanController.updateTestPlanModuleStatus(req, res)
      ).rejects.toThrow(ERROR_MESSAGES.PLAN_NOT_FOUND);
    });

    it("should handle testRun not found", async () => {
      req.body = { status: "done" };
      const testPlan = { testRun: { id: jest.fn().mockReturnValue(null) } };
      TestPlan.findById.mockResolvedValue(testPlan);
      await expect(
        testPlanController.updateTestPlanModuleStatus(req, res)
      ).rejects.toThrow(ERROR_MESSAGES.TESTRUN_NOT_FOUND);
    });

    it("should handle module not found", async () => {
      req.body = { status: "done" };
      const testRun = { module: { id: jest.fn().mockReturnValue(null) } };
      const testPlan = { testRun: { id: jest.fn().mockReturnValue(testRun) } };
      TestPlan.findById.mockResolvedValue(testPlan);
      await expect(
        testPlanController.updateTestPlanModuleStatus(req, res)
      ).rejects.toThrow(ERROR_MESSAGES.MODULE_NOT_FOUND);
    });
  });

  describe("getTestPlanRun", () => {
    it("should return test plan runs", async () => {
      req.params.id = "planid";
      TestPlan.findById.mockResolvedValue({ testRun: [{ id: 1 }] });
      await testPlanController.getTestPlanRun(req, res);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: [{ id: 1 }],
      });
    });

    it("should handle not found", async () => {
      req.params.id = "planid";
      TestPlan.findById.mockResolvedValue(null);
      await expect(testPlanController.getTestPlanRun(req, res)).rejects.toThrow(
        ERROR_MESSAGES.PLAN_NOT_FOUND
      );
    });
  });

  describe("getTestCaseById", () => {
    it("should return module by id", async () => {
      req.params = {
        testPlanId: "planid",
        testRunId: "runid",
        moduleId: "modid",
      };
      const module = { id: "modid" };
      const testRun = { module: { id: jest.fn().mockReturnValue(module) } };
      const testPlan = { testRun: { id: jest.fn().mockReturnValue(testRun) } };
      TestPlan.findById.mockResolvedValue(testPlan);

      await testPlanController.getTestCaseById(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: module,
      });
    });

    it("should handle missing params", async () => {
      req.params = {};
      await expect(
        testPlanController.getTestCaseById(req, res)
      ).rejects.toThrow();
    });

    it("should handle plan not found", async () => {
      req.params = {
        testPlanId: "planid",
        testRunId: "runid",
        moduleId: "modid",
      };
      TestPlan.findById.mockResolvedValue(null);
      await expect(
        testPlanController.getTestCaseById(req, res)
      ).rejects.toThrow(ERROR_MESSAGES.PLAN_NOT_FOUND);
    });

    it("should handle testRun not found", async () => {
      req.params = {
        testPlanId: "planid",
        testRunId: "runid",
        moduleId: "modid",
      };
      const testPlan = { testRun: { id: jest.fn().mockReturnValue(null) } };
      TestPlan.findById.mockResolvedValue(testPlan);
      await expect(
        testPlanController.getTestCaseById(req, res)
      ).rejects.toThrow(ERROR_MESSAGES.TESTRUN_NOT_FOUND);
    });

    it("should handle module not found", async () => {
      req.params = {
        testPlanId: "planid",
        testRunId: "runid",
        moduleId: "modid",
      };
      const testRun = { module: { id: jest.fn().mockReturnValue(null) } };
      const testPlan = { testRun: { id: jest.fn().mockReturnValue(testRun) } };
      TestPlan.findById.mockResolvedValue(testPlan);
      await expect(
        testPlanController.getTestCaseById(req, res)
      ).rejects.toThrow(ERROR_MESSAGES.TESTCASE_NOT_FOUND);
    });
  });
});
