const mongoose = require("mongoose");

const activityLogSchema = new mongoose.Schema(
  {
    action: {
      type: String,
      enum: ["created", "updated"],
    },
    entity: {
      type: String,
    },
    entityId: {
      type: mongoose.Schema.Types.ObjectId,
      refPath: "entity",
    },
    message: {
      type: String,
    },
    performedBy: {
      type: String,
    },
    comment: {
      type: String,
    },
    creatorName: {
      type: String,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("ActivityLog", activityLogSchema);
