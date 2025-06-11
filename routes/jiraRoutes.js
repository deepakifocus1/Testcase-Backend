const express = require("express");
const router = express.Router();
const {
  createProjectInJira,
  createIssueInJira,
} = require("../controllers/jiraController");
const { getIssues } = require("../services/jiraServices");

// Routes
router.post("/projects", createProjectInJira);
router.route("/issues").post(createIssueInJira).get(getIssues);

module.exports = router;
