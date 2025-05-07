const TestPlan = require("../models/TestPlan");
const asyncHandler = require("express-async-handler");

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

module.exports = {
  createTestPlan,
  getTestPlans,
  getTestPlan,
};
