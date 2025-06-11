const mongoose = require("mongoose");

// Define the testCaseSchema first
const testCaseSchema = new mongoose.Schema(
  {
    title: String,
    userStory: String,
    testCaseId: String,
    description: String,
    createdBy: { type: String },
    preRequisite: String,
    steps: String,
    expectedResult: String,
    status: String,
    type: String,
    priority: String,
    automationStatus: String,
    actualResults: String,
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

const TestPlanSchema = new mongoose.Schema(
  {
    name: {
      type: String,
    },
    subHeading: {
      type: String,
    },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    description: {
      type: String,
    },
    dueDateFrom: {
      type: Date,
    },
    dueDateTo: {
      type: Date,
    },
    projectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Project",
    },

    testRun: [testRunSchema],
  },
  { timestamps: true }
);

module.exports = mongoose.model("TestPlan", TestPlanSchema);
