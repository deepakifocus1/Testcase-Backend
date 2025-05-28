const mongoose = require("mongoose");

const testRunSchema = new mongoose.Schema(
  {
    name: { type: String },
    description: String,
    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    module: { type: String },
    projectId: { type: String },
    dueDateFrom: { type: Date },
    dueDateTo: { type: Date },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    testCases: {
      type: [{ type: mongoose.Schema.Types.ObjectId, ref: "TestCase" }],
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("TestRun", testRunSchema);
