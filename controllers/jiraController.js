const {
  createProject,
  createIssue,
  getIssues,
} = require("../services/jiraServices");

//CREATE PROJECT CONTROLLER
const createProjectInJira = async (req, res) => {
  try {
    const { projectName, projectKey } = req.body;

    if (!projectName || !projectKey) {
      return res.status(400).json({
        success: false,
        message: "Project name or the project key is missing",
      });
    }

    const key = await createProject({ projectName, projKey: projectKey });

    if (!key) {
      return res.status(500).json({
        success: false,
        message: "Failed to create project in Jira",
      });
    }

    console.log(`Created project with key: ${key}`);

    return res.status(201).json({
      success: true,
      message: "Project created successfully",
      data: { projectKey: key },
    });
  } catch (error) {
    console.error("Error creating Jira project:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error while creating project",
      error: error.message,
    });
  }
};

//CREATE ISSUE CONTROLLER
const createIssueInJira = async (req, res) => {
  try {
    const payload = req.body;
    if (!payload) {
      return res.status(400).json({
        success: false,
        message: "body is required",
      });
    }

    const key = await createIssue(payload);

    if (!key) {
      return res.status(500).json({
        success: false,
        message: "Failed to create Issue in Jira",
      });
    }

    console.log(`Created Issue with key: ${key}`);

    return res.status(201).json({
      success: true,
      message: "Issue created successfully",
      data: { projectKey: key },
    });
  } catch (error) {
    console.error("Error creating Jira Issue:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error while creating Issue",
      error: error.message,
    });
  }
};

//FETCH ALL ISSUES CONTROLLER
const fetchIssuesFromJira = async (req, res) => {
  try {
    const issues = await getIssues();
    return res.status(200).json({
      success: true,
      message: "Issue Fetched successfully",
      data: { issues },
    });
  } catch (error) {
    console.error("Error Fetching Jira Issues:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error while fetching Issue",
      error: error.message,
    });
  }
};

//UPDATE ISSUE CONTROLLER
const updateIssueInJira = async (req, res) => {};

module.exports = { createProjectInJira, createIssueInJira, updateIssueInJira };
