// const mongoose = require("mongoose");

// const testCaseSchema = new mongoose.Schema(
//   {
//     testCaseId: { type: String, required: true, unique: true },
//     description: String,
//     preRequisite: String,
//     steps: String,
//     expectedResult: String,
//     priority: { type: String, enum: ["Low", "Medium", "High"] },
//     automationStatus: { type: String, enum: ["Yes", "No"] },
//     module: { type: String, required: true },
//   },
//   { timestamps: true }
// );

// module.exports = mongoose.model("TestCase", testCaseSchema);

const mongoose = require("mongoose");

const testCaseSchema = new mongoose.Schema(
  {
    title: { type: String },
    userStory: { type: String },
    testCaseId: { type: String, unique: true },
    description: String,
    preRequisite: String,
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
