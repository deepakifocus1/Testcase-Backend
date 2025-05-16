const TestPlan = require("../models/TestPlan");
const asyncHandler = require("express-async-handler");
const { createActivity } = require("../controllers/recentActivity");

// @desc    Create a new test plan
// @route   POST /api/testplans
// @access  Private
const createTestPlan = asyncHandler(async (req, res) => {
  const {
    name,
    createdBy,
    subHeading,
    description,
    dueDateFrom,
    dueDateTo,
    projectId,
    testRun,
  } = req.body;

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
    createdBy,
    projectId,
    testRun: testRun || [],
  });
  if (testPlan) {
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
// const updateTestPlanModuleStatus = asyncHandler(async (req, res) => {
//   const { testPlanId, testRunId, moduleId } = req.params;
//   const { status } = req.body;

//   // Validate input
//   if (!status) {
//     res.status(400);
//     throw new Error("Status is required");
//   }

//   // Find the test plan
//   const testPlan = await TestPlan.findById(testPlanId);

//   if (!testPlan) {
//     res.status(404);
//     throw new Error("Test plan not found");
//   }

//   // Find the test run
//   const testRun = testPlan.testRun.id(testRunId);

//   if (!testRun) {
//     res.status(404);
//     throw new Error("Test run not found");
//   }

//   // Find the module
//   const module = testRun.module.id(moduleId);

//   if (!module) {
//     res.status(404);
//     throw new Error("Module not found");
//   }

//   // Update the status
//   module.status = status;

//   // Save the updated test plan
//   const response = await testPlan.save();
//   if (response) {
//     createActivity({
//       createdBy: req.user.name,
//       activityModule: "Test Plan",
//       activity: response.name,
//       type: "updated",
//     });
//   }

//   res.status(200).json({
//     success: true,
//     data: [testPlan, testRun],
//   });
// });

const updateTestPlanModuleStatus = asyncHandler(async (req, res) => {
  const { testPlanId, testRunId, moduleId } = req.params;
  const testCaseData = req.body; // Get all test case data from the request body

  // Validate input
  if (!testCaseData || Object.keys(testCaseData).length === 0) {
    res.status(400);
    throw new Error("Test case data is required");
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

  // Find the module (test case)
  const module = testRun.module.id(moduleId);

  if (!module) {
    res.status(404);
    throw new Error("Module not found");
  }

  // Update all fields of the test case with the provided data
  Object.assign(module, testCaseData);

  // Save the updated test plan
  const response = await testPlan.save();
  if (response) {
    createActivity({
      createdBy: req.user.name,
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

const getTestPlanRun = async (req, res) => {
  const testRuns = await TestPlan.findById(req.params.id);
  if (!testRuns) {
    res.status(404);
    throw new Error("Test plan not found");
  }
  res.status(200).json({
    success: true,
    data: testRuns.testRun,
  });
};

module.exports = {
  createTestPlan,
  getTestPlans,
  getTestPlan,
  updateTestPlanModuleStatus,
  getTestPlanRun,
};
