const mongoose = require("mongoose");

const issueSchema = new mongoose.Schema({
  projectKey: {
    type: String,
  },
  issueKey: {
    type: String,
  },
  testCase: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "TestCase",
  },
  issueType: {
    type: String,
    enum: ["Bug", "Task", "Story"],
    required: true,
  },
  summary: {
    type: String,
  },
  Description: {
    type: String,
  },
});

module.exports = mongoose.model("JiraIssue", issueSchema);
