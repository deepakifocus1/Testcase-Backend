const TestRun = require("../models/TestRun");
const { createActivity } = require("../controllers/recentActivity");
// Create a new test run
exports.createTestRun = async (req, res) => {
  try {
    const payload = req.body;
    const currentUserId = req.user._id;
    const testRun = new TestRun({ ...payload, createdBy: currentUserId });
    const savedTestRun = await testRun.save();
    const data = await savedTestRun.populate("testCases", "");
    if (data) {
      const activityPayload = {
        createdBy: req.user.name,
        activityModule: "Test Run",
        activity: data.name,
        type: "created",
      };

      createActivity(activityPayload);
    }
    res.status(201).json(savedTestRun);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Get all test runs
exports.getTestRuns = async (req, res) => {
  try {
    const testRuns = await TestRun.find()
      .populate("assignedTo")
      .populate("testCases", "")
      .populate("createdBy");
    res.json(testRuns);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get a single test run by ID
exports.getTestRunById = async (req, res) => {
  try {
    const testRun = await TestRun.findById(req.params.id)
      .populate("testCases", "")
      .populate("assignedTo");
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
    if (updated) {
      createActivity({
        createdBy: req.user.name,
        activityModule: "Test Run",
        activity: updated.name,
        type: "updated",
      });
    }
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
