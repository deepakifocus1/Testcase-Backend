const Project = require("../models/Project");
const TestCase = require("../models/TestCase");

// Create a new project
exports.createProject = async (req, res) => {
  try {
    const project = new Project(req.body);
    const savedProject = await project.save();
    res.status(201).json(savedProject);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Get all projects
exports.getProjects = async (req, res) => {
  try {
    const projects = await Project.find().populate(
      "testCases",
      "title testCaseId status"
    );
    res.json(projects);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get a single project by ID
exports.getProjectById = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id).populate(
      "testCases",
      "title testCaseId status"
    );
    if (!project) return res.status(404).json({ error: "Project not found" });
    res.json(project);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Update a project
exports.updateProject = async (req, res) => {
  try {
    const updated = await Project.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    if (!updated) return res.status(404).json({ error: "Project not found" });
    res.json(updated);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Delete a project
exports.deleteProject = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ error: "Project not found" });
    // Remove projectId from associated test cases
    await TestCase.updateMany(
      { projectId: project._id },
      { $unset: { projectId: "" } }
    );
    await project.deleteOne();
    res.json({ message: "Project deleted" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Add a test case to a project
exports.addTestCaseToProject = async (req, res) => {
  try {
    const { testCaseId } = req.body; // Expect MongoDB _id of test case
    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ error: "Project not found" });
    const testCase = await TestCase.findById(testCaseId);
    if (!testCase)
      return res.status(404).json({ error: "Test case not found" });
    // Update test case's projectId
    testCase.projectId = project._id;
    await testCase.save();
    // Add test case to project's testCases array
    if (!project.testCases.includes(testCaseId)) {
      project.testCases.push(testCaseId);
      await project.save();
    }
    res.json({ message: "Test case added to project", project });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};
