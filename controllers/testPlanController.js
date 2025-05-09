const TestPlan = require("../models/TestPlan");
const asyncHandler = require("express-async-handler");
const { createActivity } = require("../controllers/recentActivity");

// @desc    Create a new test plan
// @route   POST /api/testplans
// @access  Private
const createTestPlan = asyncHandler(async (req, res) => {
  const { name, subHeading, description, dueDateFrom, dueDateTo, testRun } =
    req.body;

  // Validate required fields
  if (!name) {
    res.status(400);
    throw new Error("Please add a name for the test plan");
  }

  // Create test plan
  const testPlan = await TestPlan.create({
    name,
    subHeading,
    description,
    dueDateFrom,
    dueDateTo,
    testRun: testRun || [],
  });
  if (testPlan) {
    const activityPayload = {
      createdBy: req.user.name,
      activityModule: "Test Plan",
      activity: testPlan.name,
    };
    createActivity(activityPayload);
    res.status(201).json({
      success: true,
      data: testPlan,
    });
  } else {
    res.status(400);
    throw new Error("Invalid test plan data");
  }
});

// @desc    Get all test plans
// @route   GET /api/testplans
// @access  Private
const getTestPlans = asyncHandler(async (req, res) => {
  const testPlans = await TestPlan.find({});

  res.status(200).json({
    success: true,
    count: testPlans.length,
    data: testPlans,
  });
});

// @desc    Get single test plan
// @route   GET /api/testplans/:id
// @access  Private
const getTestPlan = asyncHandler(async (req, res) => {
  const testPlan = await TestPlan.findById(req.params.id);

  if (!testPlan) {
    res.status(404);
    throw new Error("Test plan not found");
  }

  res.status(200).json({
    success: true,
    data: testPlan,
  });
});

// @desc    Update test plan
// @route   PUT /api/testplans/:testPlanId/testrun/:testRunId/module/:moduleId
// @access  Private
const updateTestPlanModuleStatus = asyncHandler(async (req, res) => {
  const { testPlanId, testRunId, moduleId } = req.params;
  const { status } = req.body;

  // Validate input
  if (!status) {
    res.status(400);
    throw new Error("Status is required");
  }

  // Find the test plan
  const testPlan = await TestPlan.findById(testPlanId);

  if (!testPlan) {
    res.status(404);
    throw new Error("Test plan not found");
  }

  // Find the test run
  const testRun = testPlan.testRun.id(testRunId);

  if (!testRun) {
    res.status(404);
    throw new Error("Test run not found");
  }

  // Find the module
  const module = testRun.module.id(moduleId);

  if (!module) {
    res.status(404);
    throw new Error("Module not found");
  }

  // Update the status
  module.status = status;

  // Save the updated test plan
  await testPlan.save();

  res.status(200).json({
    success: true,
    data: testPlan,
  });
});

module.exports = {
  createTestPlan,
  getTestPlans,
  getTestPlan,
  updateTestPlanModuleStatus,
};
