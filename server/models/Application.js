const mongoose = require("mongoose");

const applicationSchema = new mongoose.Schema({
  taskId:      { type: mongoose.Schema.Types.ObjectId, ref: "Task",   required: true },
  assistantId: { type: mongoose.Schema.Types.ObjectId, ref: "User",   required: true },
  clientId:    { type: mongoose.Schema.Types.ObjectId, ref: "User",   required: true },
  message:     { type: String, default: "" },   // optional cover note from transcriber
  status:      { type: String, enum: ["pending", "accepted", "declined"], default: "pending" },
}, { timestamps: true });

// Prevent duplicate applications
applicationSchema.index({ taskId: 1, assistantId: 1 }, { unique: true });

module.exports = mongoose.model("Application", applicationSchema);