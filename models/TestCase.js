const mongoose = require("mongoose");

const testCaseSchema = new mongoose.Schema(
  {
    title: { type: String },
    userStory: { type: String },
    testCaseId: { type: String, unique: true },
    description: String,
    createdBy: { type: String, default: "John" },
    preRequisite: String,
    type: String,
    steps: String,
    expectedResult: String,
    status: String,
    priority: { type: String },
    automationStatus: { type: String },
    module: { type: String },
    projectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Project",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("TestCase", testCaseSchema);
