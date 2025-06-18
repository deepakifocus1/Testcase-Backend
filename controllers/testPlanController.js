const TestPlan = require("../models/TestPlan");
const asyncHandler = require("express-async-handler");
const { createActivity } = require("../controllers/recentActivity");
const { testPlanSchema } = require("../validations/TestPlanValidationJoi");
const { AppError } = require("../middleware/errorHandler");
const { authController, ERROR_MESSAGES } = require("../constants/constants");

//CREATE PLAN
const createTestPlan = asyncHandler(async (req, res, next) => {
  try {
    if (!req.body) {
      throw new AppError(authController.requestBody, 400);
    }

    const { error, value: payload } = testPlanSchema.validate(req.body, {
      abortEarly: false,
      stripUnknown: true,
    });

    if (error) {
      const errorMessage = error.details
        .map((detail) => detail.message)
        .join(", ");
      throw new AppError(errorMessage, 400);
    }

    const {
      name,
      subHeading,
      description,
      dueDateFrom,
      dueDateTo,
      projectId,
      testRun,
    } = payload;

    const testPlan = await TestPlan.create({
      name,
      subHeading,
      description,
      dueDateFrom,
      dueDateTo,
      createdBy: req.user._id,
      projectId,
      testRun: testRun || [],
    });

    if (!testPlan) {
      throw new AppError(ERROR_MESSAGES.INVALID_DATA, 400);
    }

    const activityPayload = {
      createdBy: req.user.name,
      activityModule: "Test Plan",
      activity: testPlan.name,
      type: "created",
    };

    createActivity(activityPayload);

    res.status(201).json({
      success: true,
      data: testPlan,
    });
  } catch (err) {
    next(err);
  }
});

//GET PLANS
const getTestPlans = asyncHandler(async (req, res) => {
  const testPlans = await TestPlan.find({}).populate("createdBy");

  res.status(200).json({
    success: true,
    count: testPlans.length,
    data: testPlans,
  });
});

//GET PLANS BY ID
const getTestPlan = asyncHandler(async (req, res) => {
  const testPlan = await TestPlan.findById(req.params.id);

  if (!testPlan) {
    res.status(404);
    throw new Error(ERROR_MESSAGES.PLAN_NOT_FOUND);
  }

  res.status(200).json({
    success: true,
    data: testPlan,
  });
});

//UPDATE PLAN MODULE STATUS
const updateTestPlanModuleStatus = asyncHandler(async (req, res) => {
  const { testPlanId, testRunId, moduleId } = req.params;
  const testCaseData = req.body;

  if (!testCaseData || Object.keys(testCaseData).length === 0) {
    res.status(400);
    throw new Error(ERROR_MESSAGES.TESTCASE_DATA_REQUIRED);
  }

  const testPlan = await TestPlan.findById(testPlanId);

  if (!testPlan) {
    res.status(404);
    throw new Error(ERROR_MESSAGES.PLAN_NOT_FOUND);
  }

  const testRun = testPlan.testRun.id(testRunId);

  if (!testRun) {
    res.status(404);
    throw new Error(ERROR_MESSAGES.TESTRUN_NOT_FOUND);
  }

  const module = testRun.module.id(moduleId);

  if (!module) {
    res.status(404);
    throw new Error(ERROR_MESSAGES.MODULE_NOT_FOUND);
  }

  Object.assign(module, testCaseData);

  const response = await testPlan.save();
  if (response) {
    createActivity({
      createdBy: req.user._id,
      activityModule: "Test Plan",
      activity: response.name,
      type: "updated",
    });
  }

  res.status(200).json({
    success: true,
    data: [testPlan, testRun],
  });
});

//GET TEST PLAN RUN
const getTestPlanRun = async (req, res) => {
  const testRuns = await TestPlan.findById(req.params.id);
  if (!testRuns) {
    res.status(404);
    throw new Error(ERROR_MESSAGES.PLAN_NOT_FOUND);
  }
  res.status(200).json({
    success: true,
    data: testRuns.testRun,
  });
};

//GET TESTCASE BY ID
const getTestCaseById = asyncHandler(async (req, res) => {
  const { testPlanId, testRunId, moduleId } = req.params;

  if (!testPlanId || !testRunId || !moduleId) {
    throw new Error(ERROR_MESSAGES.TESTPLAN_RUN_MODULE_ID, 400);
  }

  const testPlan = await TestPlan.findById(testPlanId);

  if (!testPlan) {
    throw new Error(ERROR_MESSAGES.PLAN_NOT_FOUND, 404);
  }

  const testRun = testPlan.testRun.id(testRunId);

  if (!testRun) {
    throw new Error(ERROR_MESSAGES.TESTRUN_NOT_FOUND, 404);
  }

  const module = testRun.module.id(moduleId);

  if (!module) {
    throw new AppError(ERROR_MESSAGES.TESTCASE_NOT_FOUND, 404);
  }

  res.status(200).json({
    success: true,
    data: module,
  });
});

module.exports = {
  createTestPlan,
  getTestPlans,
  getTestPlan,
  updateTestPlanModuleStatus,
  getTestPlanRun,
  getTestCaseById,
};
