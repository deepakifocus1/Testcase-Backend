const testRunController = require("../controllers/testRunController");
const TestRun = require("../models/TestRun");
const { testRunSchema } = require("../validations/TestRunValidations");
const { ERROR_MESSAGES, SUCCESS_MESSAGES } = require("../constants/constants");
const { createActivity } = require("../controllers/recentActivity");

jest.mock("../models/TestRun");
jest.mock("../controllers/recentActivity");
jest.mock("../validations/TestRunValidations", () => ({
  testRunSchema: { parse: jest.fn() },
}));

describe("testRunController", () => {
  let req, res;

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
    jest.clearAllMocks();
  });

  describe("createTestRun", () => {
    it("should create a test run and return 201", async () => {
      req.body = { name: "Run 1", testCases: [] };
      testRunSchema.parse.mockReturnValue(req.body);

      const savedTestRun = {
        ...req.body,
        createdBy: req.user._id,
        populate: jest.fn().mockResolvedValue({ ...req.body, name: "Run 1" }),
      };
      TestRun.mockImplementation(() => savedTestRun);
      savedTestRun.save = jest.fn().mockResolvedValue(savedTestRun);

      await testRunController.createTestRun(req, res);

      expect(testRunSchema.parse).toHaveBeenCalledWith(req.body);
      expect(savedTestRun.save).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(savedTestRun);
      expect(createActivity).toHaveBeenCalled();
    });

    it("should handle Zod validation error", async () => {
      const error = { name: "ZodError", errors: [{ message: "Invalid" }] };
      testRunSchema.parse.mockImplementation(() => {
        throw error;
      });

      await testRunController.createTestRun(req, res);

      expect(res.status).toHaveBeenCalledWith(422);
      expect(res.json).toHaveBeenCalledWith({ error: error.errors });
    });

    it("should handle other errors", async () => {
      const error = new Error("Some error");
      testRunSchema.parse.mockImplementation(() => {
        throw error;
      });

      await testRunController.createTestRun(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ error: error.message });
    });
  });

  describe("getTestRuns", () => {
    it("should return all test runs", async () => {
      const testRuns = [{ _id: 1 }, { _id: 2 }];
      const populateMock = jest.fn().mockReturnThis();
      const populateFinal = jest.fn().mockResolvedValue(testRuns);
      TestRun.find.mockReturnValue({
        populate: populateMock,
        populate: populateMock,
        populate: populateFinal,
      });

      await testRunController.getTestRuns(req, res);

      expect(res.json).toHaveBeenCalledWith(testRuns);
    });

    it("should handle errors", async () => {
      TestRun.find.mockImplementation(() => {
        throw new Error("DB error");
      });

      await testRunController.getTestRuns(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: "DB error" });
    });
  });

  describe("getTestRunById", () => {
    it("should return a test run by id", async () => {
      req.params.id = "runid";
      const testRun = { _id: "runid" };
      const populateMock = jest.fn().mockReturnThis();
      const populateFinal = jest.fn().mockResolvedValue(testRun);
      TestRun.findById.mockReturnValue({
        populate: populateMock,
        populate: populateFinal,
      });

      await testRunController.getTestRunById(req, res);

      expect(res.json).toHaveBeenCalledWith(testRun);
    });

    it("should handle not found", async () => {
      req.params.id = "runid";
      const populateMock = jest.fn().mockReturnThis();
      const populateFinal = jest.fn().mockResolvedValue(null);
      TestRun.findById.mockReturnValue({
        populate: populateMock,
        populate: populateFinal,
      });

      await testRunController.getTestRunById(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        error: ERROR_MESSAGES.TESTRUN_NOT_FOUND,
      });
    });

    it("should handle errors", async () => {
      req.params.id = "runid";
      TestRun.findById.mockImplementation(() => {
        throw new Error("DB error");
      });

      await testRunController.getTestRunById(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: "DB error" });
    });
  });

  describe("updateTestRun", () => {
    it("should update a test run", async () => {
      req.params.id = "runid";
      req.body = { name: "Updated Run" };
      testRunSchema.parse.mockReturnValue(req.body);
      const updated = { _id: "runid", name: "Updated Run" };
      const populateMock = jest.fn().mockResolvedValue(updated);
      TestRun.findByIdAndUpdate.mockReturnValue({
        populate: populateMock,
      });

      await testRunController.updateTestRun(req, res);

      expect(res.json).toHaveBeenCalledWith(updated);
      expect(createActivity).toHaveBeenCalled();
    });

    it("should handle not found", async () => {
      req.params.id = "runid";
      req.body = { name: "Updated Run" };
      testRunSchema.parse.mockReturnValue(req.body);
      const populateMock = jest.fn().mockResolvedValue(null);
      TestRun.findByIdAndUpdate.mockReturnValue({
        populate: populateMock,
      });

      await testRunController.updateTestRun(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        error: ERROR_MESSAGES.TESTRUN_NOT_FOUND,
      });
    });

    it("should handle Zod validation error", async () => {
      const error = { name: "ZodError", errors: [{ message: "Invalid" }] };
      testRunSchema.parse.mockImplementation(() => {
        throw error;
      });

      await testRunController.updateTestRun(req, res);

      expect(res.status).toHaveBeenCalledWith(422);
      expect(res.json).toHaveBeenCalledWith({ error: error.errors });
    });

    it("should handle other errors", async () => {
      const error = new Error("Some error");
      testRunSchema.parse.mockImplementation(() => {
        throw error;
      });

      await testRunController.updateTestRun(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ error: error.message });
    });
  });

  describe("deleteTestRun", () => {
    it("should delete a test run", async () => {
      req.params.id = "runid";
      TestRun.findByIdAndDelete.mockResolvedValue({ _id: "runid" });

      await testRunController.deleteTestRun(req, res);

      expect(res.json).toHaveBeenCalledWith({
        message: SUCCESS_MESSAGES.TESTRUN_DELETED,
      });
    });

    it("should handle not found", async () => {
      req.params.id = "runid";
      TestRun.findByIdAndDelete.mockResolvedValue(null);

      await testRunController.deleteTestRun(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        error: ERROR_MESSAGES.TESTRUN_NOT_FOUND,
      });
    });

    it("should handle errors", async () => {
      req.params.id = "runid";
      TestRun.findByIdAndDelete.mockImplementation(() => {
        throw new Error("DB error");
      });

      await testRunController.deleteTestRun(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: "DB error" });
    });
  });
});
