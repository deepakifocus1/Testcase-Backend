const mongoose = require("mongoose");
const recentActivitySchema = new mongoose.Schema(
  {
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    activityModule: String,
    activity: String,
    type: String,
  },
  { timestamps: true }
);

module.exports = mongoose.model("RecentActivity", recentActivitySchema);
