const mongoose = require("mongoose");

const taskSchema = new mongoose.Schema({
  description: String,
  type: String,
  language: String,
  deadline: String,
  clientId: String,
  assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  status: { type: String, default: "pending" }
});

module.exports = mongoose.model("Task", taskSchema);