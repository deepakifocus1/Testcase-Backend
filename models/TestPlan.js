const mongoose = require("mongoose");

// Define the testCaseSchema first
const testCaseSchema = new mongoose.Schema(
  {
    title: String,
    userStory: String,
    testCaseId: String,
    description: String,
    preRequisite: String,
    steps: String,
    expectedResult: String,
    status: String,
    priority: String,
    automationStatus: String,
    module: String,
    projectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Project",
    },
  },
  { timestamps: true }
);

// Define the testRunSchema using testCaseSchema
const testRunSchema = new mongoose.Schema({
  module: {
    type: [testCaseSchema],
  },
  browser: {
    type: String,
  },
  osType: {
    type: String,
  },
  assignedTo: {
    type: String,
  },
});

const TestPlanSchema = new mongoose.Schema({
  name: {
    type: String,
  },
  subHeading: {
    type: String,
  },
  description: {
    type: String,
  },
  dueDateFrom: {
    type: Date,
  },
  dueDateTo: {
    type: Date,
  },
  testRun: [testRunSchema],
});

module.exports = mongoose.model("TestPlan", TestPlanSchema);
