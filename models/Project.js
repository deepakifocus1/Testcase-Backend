const mongoose = require("mongoose");

const projectSchema = new mongoose.Schema(
  {
    name: { type: String },
    description: String,
    projectType: {
      type: String,
    },
    assignedTo: {
      type: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    },
    testCases: [{ type: mongoose.Schema.Types.ObjectId, ref: "TestCase" }],
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Project", projectSchema);
