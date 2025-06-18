const xlsx = require("xlsx");
const TestCase = require("../models/TestCase");
const Project = require("../models/Project");
const ActivityLog = require("../models/ActivityLog");
const { SUCCESS_MESSAGES, ERROR_MESSAGES } = require("../constants/constants");

const generateTestCaseId = async (startSequence) => {
  return `TC-${String(startSequence).padStart(4, "0")}`;
};

// Helper function to generate script
const generateScript = (testCase) => {
  const { testCaseId, steps, expectedResult } = testCase;
  return `Test Script for ${testCaseId}:
1. Execute steps: ${steps || "No steps provided"}
2. Verify: ${expectedResult || "No expected result provided"}`;
};

// Helper function to create activity
const createActivity = async ({
  createdBy,
  activityModule,
  activity,
  entityId,
  type,
}) => {
  await ActivityLog.create({
    action: type,
    entity: activityModule,
    entityId: activityModule === "Test Case" ? entityId : null,
    creatorName: createdBy,
    performedBy: createdBy,
    message: `${createdBy} ${type} ${activityModule.toLowerCase()} "${activity}"`,
    comment: activityModule,
  });
};

exports.uploadTestCases = async (req, res) => {
  try {
    if (!req.file)
      return res.status(400).json({ error: ERROR_MESSAGES.NO_FILE_UPLOADED });

    const workbook = xlsx.read(req.file.buffer, { type: "buffer" });
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    const data = xlsx.utils.sheet_to_json(sheet);

    const { module: moduleFromFrontend, projectId, createdBy } = req.body;

    if (!moduleFromFrontend || !projectId || !createdBy) {
      return res
        .status(400)
        .json({ error: ERROR_MESSAGES.MODULE_PROJECTID_REQ });
    }

    const project = await Project.findById(projectId);
    if (!project)
      return res.status(404).json({ error: ERROR_MESSAGES.PROJECT_NOT_FOUND });

    // Find the highest testCaseId in the testcases collection
    const lastTestCase = await TestCase.findOne()
      .sort({ testCaseId: -1 })
      .select("testCaseId");
    let nextSequence = 1; // Default if no test cases exist
    if (lastTestCase && lastTestCase.testCaseId) {
      const match = lastTestCase.testCaseId.match(/^TC-(\d+)$/);
      if (match) {
        nextSequence = parseInt(match[1], 10) + 1;
      }
    }

    // Generate testCaseIds sequentially for each row
    const formatted = [];
    for (const row of data) {
      const testCaseId = await generateTestCaseId(nextSequence);
      nextSequence += 1; // Increment for the next test case
      const script = generateScript({
        testCaseId,
        steps: row.steps,
        expectedResult: row.expectedResult,
      });

      formatted.push({
        title: row.title || "Untitled Test Case",
        userStory: row.userStory || "",
        testCaseId,
        description: row.description || "",
        createdBy,
        preRequisite: row.preRequisite || "",
        type: row.type || "Functional",
        steps: row.steps || "",
        expectedResult: row.expectedResult || "",
        actualResult: row.actualResult || "",
        status: row.status || "Untested",
        priority: row.priority || "Low",
        automationStatus: row.automationStatus || "No",
        module: moduleFromFrontend,
        projectId,
        script,
      });
    }

    const inserted = await TestCase.insertMany(formatted, { ordered: false });

    // Update project's testCases array
    project.testCases.push(...inserted.map((tc) => tc._id));
    await project.save();

    // Log activities for each inserted test case
    await Promise.all(
      inserted.map((testCase) =>
        ActivityLog.create({
          action: "created",
          entity: "TestCase",
          entityId: testCase._id,
          creatorName: createdBy,
          performedBy: createdBy,
          message: `${req.user.name} created test case "${testCase.title}"`,
          comment: testCase.module,
        })
      )
    );

    // Create activity log using createActivity helper
    await Promise.all(
      inserted.map((testCase) =>
        createActivity({
          createdBy: req.user._id,
          activityModule: "Test Case",
          activity: testCase.title,
          entityId: testCase._id,
          type: "created",
        })
      )
    );

    res.status(201).json({
      message: SUCCESS_MESSAGES.TESTCASE_UPLOADED,
      insertedCount: inserted.length,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
