const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: String,
  role: String, // client or assistant
  skills: [String],
  languages: [String],
  rating: { type: Number, default: 0 },
  completedTasks: { type: Number, default: 0 }
});

module.exports = mongoose.model("User", userSchema);