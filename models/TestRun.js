const mongoose = require("mongoose");

const testRunSchema = new mongoose.Schema(
  {
    name: { type: String },
    description: String,
    assignedTo: { type: String },
    module: { type: String },
    dueDateFrom: { type: Date },
    dueDateTo: { type: Date },
    testCases: {
      type: [{ type: mongoose.Schema.Types.ObjectId, ref: "TestCase" }],
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("TestRun", testRunSchema);
