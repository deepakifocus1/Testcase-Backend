const mongoose = require("mongoose");
const TestCase = require("./TestCase");

const testRunSchema = new mongoose.Schema(
  {
    name: { type: String },
    description: String,
    assignTo: { type: String },
    testCases: {
      type: [{ type: mongoose.Schema.Types.ObjectId, ref: "TestCase" }],
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("TestRun", testRunSchema);
