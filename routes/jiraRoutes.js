const express = require("express");
const router = express.Router();
const {
  createProjectInJira,
  createIssueInJira,
  fetchIssuesFromDb,
  fetchIssueByIdFromDb,
} = require("../controllers/jiraController");
const { getIssues } = require("../services/jiraServices");

// Routes
router.post("/projects", createProjectInJira);
router.route("/issues").post(createIssueInJira).get(fetchIssuesFromDb);
//router.get("/get-issues", fetchIssuesFromDb);
router.get("/issues/:id", fetchIssueByIdFromDb);
module.exports = router;
