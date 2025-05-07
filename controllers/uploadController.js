const xlsx = require("xlsx");
const TestCase = require("../models/TestCase");

exports.uploadTestCases = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: "No file uploaded" });

    const workbook = xlsx.read(req.file.buffer, { type: "buffer" });
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    const data = xlsx.utils.sheet_to_json(sheet);

    const moduleFromFrontend = req.body.module;

    if (!moduleFromFrontend) {
      return res.status(400).json({ error: "Module name is required" });
    }

    const formatted = data.map((row) => ({
      testCaseId: row.testCaseId,
      description: row.description || "",
      preRequisite: row.preRequisite || "",
      steps: row.steps || "",
      expectedResult: row.expectedResult || "",
      priority: row.priority || "Low",
      automationStatus: row.automationStatus || "No",
      module: moduleFromFrontend,
    }));

    const inserted = await TestCase.insertMany(formatted, { ordered: false });

    res.status(201).json({
      message: "Test cases uploaded",
      insertedCount: inserted.length,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
