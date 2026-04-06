const mongoose = require("mongoose");

const reviewSchema = new mongoose.Schema({
  taskId:      { type: mongoose.Schema.Types.ObjectId, ref: "Task", required: true },
  clientId:    { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  assistantId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  clientName:  { type: String, required: true },
  rating:      { type: Number, required: true, min: 1, max: 5 },
  comment:     { type: String, default: "" },
}, { timestamps: true });

// One review per task
reviewSchema.index({ taskId: 1, clientId: 1 }, { unique: true });

module.exports = mongoose.model("Review", reviewSchema);