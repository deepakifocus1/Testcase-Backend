const TestRun = require("../models/TestRun");

// Create a new test run
exports.createTestRun = async (req, res) => {
  try {
    const testRun = new TestRun(req.body);
    const savedTestRun = await testRun.save();
    await savedTestRun.populate("testCases", "");
    res.status(201).json(savedTestRun);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Get all test runs
exports.getTestRuns = async (req, res) => {
  try {
    const testRuns = await TestRun.find().populate("testCases", "");
    res.json(testRuns);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get a single test run by ID
exports.getTestRunById = async (req, res) => {
  try {
    const testRun = await TestRun.findById(req.params.id).populate(
      "testCases",
      ""
    );
    if (!testRun) return res.status(404).json({ error: "Test run not found" });
    res.json(testRun);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Update a test run
exports.updateTestRun = async (req, res) => {
  try {
    const updated = await TestRun.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    }).populate("testCases", "");
    if (!updated) return res.status(404).json({ error: "Test run not found" });
    res.json(updated);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Delete a test run
exports.deleteTestRun = async (req, res) => {
  try {
    const testRun = await TestRun.findByIdAndDelete(req.params.id);
    if (!testRun) return res.status(404).json({ error: "Test run not found" });
    res.json({ message: "Test run deleted" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
