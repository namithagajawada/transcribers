// const mongoose = require("mongoose");

// // const userSchema = new mongoose.Schema({
// //   name: String,
// //   role: String, // client or assistant
// //   skills: [String],
// //   languages: [String],
// //   rating: { type: Number, default: 0 },
// //   completedTasks: { type: Number, default: 0 }
// // });
// const userSchema = new mongoose.Schema({
//   name: String,
//   email: String,
//   password: String,
//   role: String, // client or assistant

//   // Assistant specific
//   skills: [String],
//   languages: [String],

//   // Profile
//   bio: String,
// });

// module.exports = mongoose.model("User", userSchema);

const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  // ── Core ─────────────────────────────────────
  name:     { type: String, required: true },
  email:    { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, required: true },
  role:     { type: String, enum: ["client", "assistant"], required: true },

  // ── Assistant-specific ────────────────────────
  skills:    { type: [String], default: [] },
  languages: { type: [String], default: [] },

  // ── Profile ───────────────────────────────────
  bio: { type: String, default: "" },

  // ── Stats (used in /match scoring) ───────────
  rating:         { type: Number, default: 0, min: 0, max: 5 },
  completedTasks: { type: Number, default: 0 },

}, { timestamps: true }); // adds createdAt + updatedAt automatically

module.exports = mongoose.model("User", userSchema);