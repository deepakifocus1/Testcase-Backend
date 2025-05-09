const TestCase = require("../models/TestCase");
const Project = require("../models/Project");
const ExcelJS = require("exceljs");
const ActivityLog = require("../models/ActivityLog");

// Helper function to generate testCaseId
const generateTestCaseId = async () => {
  const count = await TestCase.countDocuments();
  return `TC-${String(count + 1).padStart(4, "0")}`;
};

// Helper function to generate script
const generateScript = (testCase) => {
  const { testCaseId, steps, expectedResult } = testCase;
  return `Test Script for ${testCaseId}:
1. Execute steps: ${steps || "No steps provided"}
2. Verify: ${expectedResult || "No expected result provided"}`;
};

// Download test cases as Excel
exports.downloadTestCasesExcel = async (req, res) => {
  try {
    const { module, projectId } = req.query;
    const query = {};
    if (module) query.module = { $regex: `^${module}`, $options: "i" };
    if (projectId) query.projectId = projectId;

    // Get test cases with optional filtering
    const testCases = await TestCase.find(query)
      .populate("projectId", "name")
      .sort({ createdAt: -1 });

    // Create workbook and worksheet
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Test Cases");

    // Define columns
    worksheet.columns = [
      { header: "Test Case ID", key: "testCaseId", width: 15 },
      { header: "Title", key: "title", width: 20 },
      { header: "Project", key: "projectName", width: 20 }, // New field
      { header: "Module", key: "module", width: 20 },
      { header: "Description", key: "description", width: 40 },
      { header: "Pre-Requisite", key: "preRequisite", width: 30 },
      { header: "Steps", key: "steps", width: 50 },
      { header: "Expected Result", key: "expectedResult", width: 40 },
      { header: "Priority", key: "priority", width: 10 },
      { header: "Automation Status", key: "automationStatus", width: 15 },
      { header: "Status", key: "status", width: 15 },
      { header: "Script", key: "script", width: 50 },
      { header: "Created At", key: "createdAt", width: 20 },
      { header: "Updated At", key: "updatedAt", width: 20 },
    ];

    // Add rows
    testCases.forEach((testCase) => {
      worksheet.addRow({
        testCaseId: testCase.testCaseId,
        title: testCase.title,
        projectName: testCase.projectId?.name || "N/A", // Populated project name
        module: testCase.module,
        description: testCase.description,
        preRequisite: testCase.preRequisite,
        steps: testCase.steps,
        expectedResult: testCase.expectedResult,
        priority: testCase.priority,
        automationStatus: testCase.automationStatus,
        status: testCase.status,
        script: testCase.script,
        createdAt: testCase.createdAt,
        updatedAt: testCase.updatedAt,
      });
    });

    // Style the header row
    worksheet.getRow(1).font = { bold: true };

    // Set response headers
    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );
    res.setHeader(
      "Content-Disposition",
      "attachment; filename=test-cases.xlsx"
    );

    // Write to response
    await workbook.xlsx.write(res);
    res.end();
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.createTestCase = async (req, res) => {
  try {
    const { title, projectId, createdBy } = req.body;
    if (!title || !projectId || !createdBy) {
      return res
        .status(400)
        .json({ error: "Title, Project ID, and CreatedBy are required" });
    }

    const project = await Project.findById(projectId);
    if (!project) return res.status(404).json({ error: "Project not found" });

    const testCaseId = await generateTestCaseId();
    const script = generateScript({ ...req.body, testCaseId });

    const testCase = new TestCase({ ...req.body, testCaseId, script });
    const savedTestCase = await testCase.save();

    project.testCases.push(savedTestCase._id);
    await project.save();

    // ✅ Log the activity
    await ActivityLog.create({
      action: "created",
      entity: "TestCase",
      entityId: savedTestCase._id,
      performedBy: createdBy,
      message: `${createdBy} created test case "${savedTestCase.title}"`,
      comment: `${savedTestCase.module}`,
    });

    res.status(201).json(savedTestCase);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Create a new test case
// exports.createTestCase = async (req, res) => {
//   try {
//     // Ensure title and projectId are provided
//     if (!req.body.title) {
//       return res.status(400).json({ error: "Title is required" });
//     }
//     if (!req.body.projectId) {
//       return res.status(400).json({ error: "Project ID is required" });
//     }
//     // Validate projectId
//     const project = await Project.findById(req.body.projectId);
//     if (!project) return res.status(404).json({ error: "Project not found" });
//     // Generate testCaseId
//     const testCaseId = await generateTestCaseId();
//     // Generate script
//     const testCaseData = { ...req.body, testCaseId };
//     const script = generateScript(testCaseData);
//     // Add testCaseId and script to req.body
//     testCaseData.script = script;
//     const testCase = new TestCase(testCaseData);
//     const savedTestCase = await testCase.save();
//     // Add test case to project's testCases array
//     project.testCases.push(savedTestCase._id);
//     await project.save();
//     res.status(201).json(savedTestCase);
//   } catch (error) {
//     res.status(400).json({ error: error.message });
//   }
// };

// Get all test cases (filtered by module or projectId)
// exports.getTestCases = async (req, res) => {
//   try {
//     const testCases = await TestCase.find();
//     res.json(testCases);
//   } catch (error) {
//     res.status(500).json({ error: error.message });
//   }
// };

exports.getTestCases = async (req, res) => {
  try {
    const testCases = await TestCase.aggregate([
      {
        $lookup: {
          from: "activitylogs", // collection name (not model name)
          localField: "_id",
          foreignField: "entityId",
          as: "activityLogs",
          pipeline: [
            { $match: { entity: "TestCase" } }, // only logs for TestCase
            { $sort: { createdAt: -1 } }, // optional: newest first
          ],
        },
      },
    ]);
    res.json(testCases);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get a single test case by ID
exports.getTestCaseById = async (req, res) => {
  try {
    const testCase = await TestCase.findById(req.params.id).populate(
      "projectId",
      "name"
    );
    if (!testCase)
      return res.status(404).json({ error: "Test case not found" });
    res.json(testCase);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Update a test case
exports.updateTestCase = async (req, res) => {
  try {
    // Prevent updating testCaseId and script
    const updateData = { ...req.body };
    delete updateData.testCaseId;
    delete updateData.script;
    // Validate projectId if provided
    if (updateData.projectId) {
      const project = await Project.findById(updateData.projectId);
      if (!project) return res.status(404).json({ error: "Project not found" });
    }
    const updated = await TestCase.findByIdAndUpdate(
      req.params.id,
      updateData,
      {
        new: true,
      }
    ).populate("projectId", "name");
    if (!updated) return res.status(404).json({ error: "Test case not found" });
    res.json(updated);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Delete a test case
exports.deleteTestCase = async (req, res) => {
  try {
    const testCase = await TestCase.findById(req.params.id);
    if (!testCase)
      return res.status(404).json({ error: "Test case not found" });
    // Remove test case from project's testCases array
    await Project.updateOne(
      { _id: testCase.projectId },
      { $pull: { testCases: testCase._id } }
    );
    await testCase.deleteOne();
    res.json({ message: "Test case deleted" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
