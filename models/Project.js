const mongoose = require("mongoose");

const projectSchema = new mongoose.Schema(
  {
    name: { type: String },
    description: String,
    projectType: {
      type: String,
    },
    assignedTo: {
      type: [String],
    },
    testCases: [{ type: mongoose.Schema.Types.ObjectId, ref: "TestCase" }],
  },
  { timestamps: true }
);

module.exports = mongoose.model("Project", projectSchema);
