const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema({
  userId:  { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  type:    { type: String, required: true },   // "application", "accepted", "declined", "message", "review", "completed"
  title:   { type: String, required: true },
  body:    { type: String, required: true },
  read:    { type: Boolean, default: false },
  refId:   { type: String, default: "" },      // taskId or applicationId for deep linking
}, { timestamps: true });

module.exports = mongoose.model("Notification", notificationSchema);