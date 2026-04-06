
// const mongoose = require("mongoose");

// const userSchema = new mongoose.Schema({
//   // ── Core ─────────────────────────────────────
//   name:     { type: String, required: true },
//   email:    { type: String, required: true, unique: true, lowercase: true, trim: true },
//   password: { type: String, required: true },
//   role:     { type: String, enum: ["client", "assistant"], required: true },

//   // ── Assistant-specific ────────────────────────
//   skills:    { type: [String], default: [] },
//   languages: { type: [String], default: [] },

//   // ── Profile ───────────────────────────────────
//   bio: { type: String, default: "" },

//   // ── Stats (used in /match scoring) ───────────
//   rating:         { type: Number, default: 0, min: 0, max: 5 },
//   completedTasks: { type: Number, default: 0 },

// }, { timestamps: true }); // adds createdAt + updatedAt automatically

// module.exports = mongoose.model("User", userSchema);

const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  // ── Core ──────────────────────────────────────────────
  name:     { type: String, required: true },
  email:    { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, required: true },
  role:     { type: String, enum: ["client", "assistant"], required: true },

  // ── Demographics (both roles) ─────────────────────────
  gender: { type: String, enum: ["male", "female", "non-binary", "prefer not to say", ""], default: "" },
  age:    { type: Number, default: null },

  // ── Profile ───────────────────────────────────────────
  bio: { type: String, default: "" },

  // ── Assistant-specific ────────────────────────────────
  skills:    { type: [String], default: [] },
  languages: { type: [String], default: [] },

  // Work experience (years)
  workExperience: { type: Number, default: 0 },

  // Previous works: array of { title, description, year }
  previousWorks: {
    type: [{
      title:       String,
      description: String,
      year:        Number,
    }],
    default: [],
  },

  // ── Verification ──────────────────────────────────────
  verificationDocs:   { type: [String], default: [] }, // file paths
  verificationStatus: { type: String, enum: ["unverified", "pending", "verified", "rejected"], default: "unverified" },
  isVerified:         { type: Boolean, default: false },

  // ── Stats ─────────────────────────────────────────────
  rating:         { type: Number, default: 0, min: 0, max: 5 },
  reviewCount:    { type: Number, default: 0 },
  completedTasks: { type: Number, default: 0 },

}, { timestamps: true });

module.exports = mongoose.model("User", userSchema);