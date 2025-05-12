const mongoose = require("mongoose");
const recentActivitySchema = new mongoose.Schema(
  {
    createdBy: String,
    activityModule: String,
    activity: String,
    type: String,
  },
  { timestamps: true }
);

module.exports = mongoose.model("RecentActivity", recentActivitySchema);
