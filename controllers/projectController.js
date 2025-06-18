const Project = require("../models/Project");
const TestCase = require("../models/TestCase");
const { createActivity } = require("../controllers/recentActivity");
const { AppError } = require("../middleware/errorHandler");
const {
  authController,
  ERROR_MESSAGES,
  SUCCESS_MESSAGES,
} = require("../constants/constants");
const { projectSchema } = require("../validations/ProjectValidationJoi");

// Create a new project
exports.createProject = async (req, res, next) => {
  try {
    if (!req.body) {
      throw new AppError(authController.requestBody, 400);
    }
    const { error, value: payload } = projectSchema.validate(req.body, {
      abortEarly: false,
    });

    if (error) {
      const errorMessage = error.details
        .map((detail) => detail.message)
        .join(", ");
      throw new AppError(errorMessage, 400);
    }

    const project = new Project(payload);
    const savedProject = await project.save();
    if (savedProject) {
      createActivity({
        createdBy: req.user._id,
        activityModule: "Project",
        activity: savedProject.name,
        type: "created",
      });
    }
    res.status(201).json(savedProject);
  } catch (error) {
    next(error);
  }
};

// Get all projects
exports.getProjects = async (req, res) => {
  try {
    const projects = await Project.find()
      .populate("testCases")
      .populate("assignedTo")
      .populate("createdBy");
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
    if (!project)
      return res.status(404).json({ error: ERROR_MESSAGES.PROJECT_NOT_FOUND });
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
    if (!updated)
      return res.status(404).json({ error: ERROR_MESSAGES.PROJECT_NOT_FOUND });
    if (updated) {
      console.log(updated);
      createActivity({
        createdBy: req.user._id,
        activityModule: "Project",
        activity: updated.name,
        type: "updated",
      });
    }
    res.json(updated);
  } catch (error) {
    res.status(400).json({ error: error.message, stack: error.stack });
  }
};

// Delete a project
exports.deleteProject = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project)
      return res.status(404).json({ error: ERROR_MESSAGES.PROJECT_NOT_FOUND });
    // Remove projectId from associated test cases
    await TestCase.updateMany(
      { projectId: project._id },
      { $unset: { projectId: "" } }
    );
    await project.deleteOne();
    res.json({ message: SUCCESS_MESSAGES.PROJECT_DELETED });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Add a test case to a project
exports.addTestCaseToProject = async (req, res) => {
  try {
    const { testCaseId } = req.body;
    const project = await Project.findById(req.params.id);
    if (!project)
      return res.status(404).json({ error: ERROR_MESSAGES.PROJECT_NOT_FOUND });
    const testCase = await TestCase.findById(testCaseId);
    if (!testCase)
      return res.status(404).json({ error: ERROR_MESSAGES.TESTCASE_NOT_FOUND });

    testCase.projectId = project._id;
    await testCase.save();

    if (!project.testCases.includes(testCaseId)) {
      project.testCases.push(testCaseId);
      await project.save();
    }

    res.json({ message: SUCCESS_MESSAGES.TESTCASE_ADDED_PROJECT, project });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};
