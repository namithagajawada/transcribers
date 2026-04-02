const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema({
  taskId:     { type: mongoose.Schema.Types.ObjectId, ref: "Task", required: true },
  senderId:   { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  senderName: { type: String, required: true },
  senderRole: { type: String, enum: ["client", "assistant"], required: true },
  text:       { type: String, required: true },
}, { timestamps: true });

module.exports = mongoose.model("Message", messageSchema);