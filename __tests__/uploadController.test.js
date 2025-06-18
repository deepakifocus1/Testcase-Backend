const xlsx = require("xlsx");
const TestCase = require("../models/TestCase");
const Project = require("../models/Project");
const ActivityLog = require("../models/ActivityLog");
const uploadController = require("../controllers/uploadController");
const { SUCCESS_MESSAGES, ERROR_MESSAGES } = require("../constants/constants");

jest.mock("xlsx");
jest.mock("../models/TestCase");
jest.mock("../models/Project");
jest.mock("../models/ActivityLog");

describe("uploadController.uploadTestCases", () => {
  let req, res, projectMock;

  beforeEach(() => {
    req = {
      file: { buffer: Buffer.from("dummy") },
      body: {
        module: "Module1",
        projectId: "proj1",
        createdBy: "user1",
      },
      user: { _id: "user1", name: "Test User" },
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    projectMock = {
      testCases: [],
      save: jest.fn().mockResolvedValue(true),
    };
    jest.clearAllMocks();
  });

  it("should return 400 if no file is uploaded", async () => {
    req.file = null;
    await uploadController.uploadTestCases(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      error: ERROR_MESSAGES.NO_FILE_UPLOADED,
    });
  });

  it("should return 400 if required fields are missing", async () => {
    req.body = {};
    await uploadController.uploadTestCases(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      error: ERROR_MESSAGES.MODULE_PROJECTID_REQ,
    });
  });

  it("should return 404 if project not found", async () => {
    xlsx.read.mockReturnValue({
      SheetNames: ["Sheet1"],
      Sheets: { Sheet1: {} },
    });
    xlsx.utils = { sheet_to_json: jest.fn().mockReturnValue([{ title: "A" }]) };
    Project.findById.mockResolvedValue(null);

    await uploadController.uploadTestCases(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({
      error: ERROR_MESSAGES.PROJECT_NOT_FOUND,
    });
  });

  it("should upload test cases and update project", async () => {
    // Mock xlsx
    xlsx.read.mockReturnValue({
      SheetNames: ["Sheet1"],
      Sheets: { Sheet1: {} },
    });
    xlsx.utils = {
      sheet_to_json: jest.fn().mockReturnValue([
        { title: "A", steps: "step1", expectedResult: "result1" },
        { title: "B", steps: "step2", expectedResult: "result2" },
      ]),
    };

    // Mock Project
    Project.findById.mockResolvedValue(projectMock);

    // Mock TestCase
    TestCase.findOne.mockResolvedValue(null); // No previous test case
    TestCase.insertMany.mockResolvedValue([
      { _id: "tc1", title: "A", module: "Module1" },
      { _id: "tc2", title: "B", module: "Module1" },
    ]);

    // Mock ActivityLog
    ActivityLog.create.mockResolvedValue(true);

    await uploadController.uploadTestCases(req, res);

    expect(TestCase.insertMany).toHaveBeenCalled();
    expect(projectMock.save).toHaveBeenCalled();
    expect(ActivityLog.create).toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith({
      message: SUCCESS_MESSAGES.TESTCASE_UPLOADED,
      insertedCount: 2,
    });
  });

  it("should handle errors and return 500", async () => {
    xlsx.read.mockImplementation(() => {
      throw new Error("fail");
    });
    await uploadController.uploadTestCases(req, res);
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ error: "fail" });
  });
});
