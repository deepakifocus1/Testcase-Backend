const mongoose = require("mongoose");

const testCaseSchema = new mongoose.Schema(
  {
    testCaseId: { type: String, required: true, unique: true },
    description: String,
    preRequisite: String,
    steps: String,
    expectedResult: String,
    priority: { type: String, enum: ["Low", "Medium", "High"] },
    automationStatus: { type: String, enum: ["Yes", "No"] },
    module: { type: String, required: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("TestCase", testCaseSchema);
