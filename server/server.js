// const express = require("express");
// const mongoose = require("mongoose");
// const cors = require("cors");

// const Task = require("./models/Task");
// const User = require("./models/User");

// const app = express();
// app.use(cors());
// app.use(express.json());

// mongoose.connect("mongodb://127.0.0.1:27017/scribeconnect")
//   .then(() => console.log("MongoDB Connected"))
//   .catch((err) => console.log(err));

// // CREATE TASK
// app.post("/create-task", async (req, res) => {
//   const task = new Task(req.body);
//   await task.save();
//   res.json(task);
// });

// // SMART MATCHING
// app.post("/match", async (req, res) => {
//   const { language, type } = req.body;

//   const assistants = await User.find({ role: "assistant" });

//   const scored = assistants.map((a) => {
//     let score = 0;

//     if (a.languages.includes(language)) score += 0.3;
//     if (a.skills.includes(type)) score += 0.3;

//     score += (a.rating / 5) * 0.2;
//     score += Math.min(a.completedTasks / 100, 1) * 0.2;

//     return { ...a._doc, score };
//   });

//   scored.sort((a, b) => b.score - a.score);

//   res.json(scored.slice(0, 3));
// });
// app.post("/assign-task", async (req, res) => {
//   const { taskId, assistantId } = req.body;

//   try {
//     const updatedTask = await Task.findByIdAndUpdate(
//       taskId,
//       {
//         assignedTo: assistantId,
//         status: "assigned",
//       },
//       { new: true }
//     );

//     res.json(updatedTask);
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ error: "Assignment failed" });
//   }
// });
// app.get("/tasks", async (req, res) => {
//   try {
//     const tasks = await Task.find().populate("assignedTo");
//     res.json(tasks);
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ error: "Failed to fetch tasks" });
//   }
// });

// // SIGNUP
// // 🔥 SIGNUP
// app.post("/signup", async (req, res) => {
//   try {
//     const { name, email, password, role } = req.body;

//     const newUser = {
//       name,
//       email,
//       password,
//       role, // "client" or "assistant"
//     };

//     // ⚠️ TEMP: just return success (we'll add DB later)
//     res.json(newUser);

//   } catch (err) {
//     res.status(500).json({ error: "Signup failed" });
//   }
// });

// // 🔥 LOGIN
// app.post("/login", async (req, res) => {
//   try {
//     const { email, password } = req.body;

//     // ⚠️ TEMP: fake login success
//     res.json({
//       email,
//       role: "client", // later from DB
//     });

//   } catch (err) {
//     res.status(500).json({ error: "Login failed" });
//   }
// });

// app.listen(5000, () => console.log("Server running on port 5000"));





// const express = require("express");
// const mongoose = require("mongoose");
// const cors = require("cors");
// const bcrypt = require("bcryptjs");

// const Task = require("./models/Task");
// const User = require("./models/User");

// const app = express();
// app.use(cors());
// app.use(express.json());

// mongoose.connect("mongodb://127.0.0.1:27017/scribeconnect")
//   .then(() => console.log("MongoDB Connected"))
//   .catch((err) => console.log(err));

// // ── CREATE TASK ──────────────────────────────────────────
// app.post("/create-task", async (req, res) => {
//   try {
//     const task = new Task(req.body);
//     await task.save();
//     res.json(task);
//   } catch (err) {
//     res.status(500).json({ error: "Failed to create task" });
//   }
// });

// // ── SMART MATCHING ───────────────────────────────────────
// app.post("/match", async (req, res) => {
//   try {
//     const { language, type } = req.body;
//     const assistants = await User.find({ role: "assistant" });

//     const scored = assistants.map((a) => {
//       let score = 0;
//       if (a.languages?.includes(language)) score += 0.3;
//       if (a.skills?.includes(type))        score += 0.3;
//       score += ((a.rating || 0) / 5) * 0.2;
//       score += Math.min((a.completedTasks || 0) / 100, 1) * 0.2;
//       return { ...a._doc, score };
//     });

//     scored.sort((a, b) => b.score - a.score);
//     res.json(scored.slice(0, 3));
//   } catch (err) {
//     res.status(500).json({ error: "Matching failed" });
//   }
// });

// // ── ASSIGN TASK ──────────────────────────────────────────
// app.post("/assign-task", async (req, res) => {
//   try {
//     const { taskId, assistantId } = req.body;
//     const updatedTask = await Task.findByIdAndUpdate(
//       taskId,
//       { assignedTo: assistantId, status: "assigned" },
//       { new: true }
//     );
//     res.json(updatedTask);
//   } catch (err) {
//     res.status(500).json({ error: "Assignment failed" });
//   }
// });

// // ── GET TASKS ────────────────────────────────────────────
// app.get("/tasks", async (req, res) => {
//   try {
//     const tasks = await Task.find().populate("assignedTo");
//     res.json(tasks);
//   } catch (err) {
//     res.status(500).json({ error: "Failed to fetch tasks" });
//   }
// });

// // ── SIGNUP ───────────────────────────────────────────────
// app.post("/signup", async (req, res) => {
//   try {
//     const { name, email, password, role } = req.body;

//     // 1. Check all fields are present
//     if (!name || !email || !password || !role) {
//       return res.status(400).json({ error: "All fields are required" });
//     }

//     // 2. Check if account already exists
//     const existing = await User.findOne({ email });
//     if (existing) {
//       return res.status(409).json({ error: "An account with this email already exists" });
//     }

//     // 3. Hash the password
//     const hashedPassword = await bcrypt.hash(password, 10);

//     // 4. Save user to DB
//     const newUser = new User({ name, email, password: hashedPassword, role });
//     await newUser.save();

//     res.status(201).json({ message: "Signup successful" });

//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ error: "Signup failed" });
//   }
// });

// // ── LOGIN ────────────────────────────────────────────────
// app.post("/login", async (req, res) => {
//   try {
//     const { email, password } = req.body;

//     // 1. Check fields
//     if (!email || !password) {
//       return res.status(400).json({ error: "Email and password are required" });
//     }

//     // 2. Find user in DB
//     const user = await User.findOne({ email });
//     if (!user) {
//       return res.status(404).json({ error: "No account found with this email" });
//     }

//     // 3. Compare password with hashed one
//     const isMatch = await bcrypt.compare(password, user.password);
//     if (!isMatch) {
//       return res.status(401).json({ error: "Incorrect password" });
//     }

//     // 4. Return user info (never return the password)
//     res.json({
//       message: "Login successful",
//       name: user.name,
//       email: user.email,
//       role: user.role,
//     });

//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ error: "Login failed" });
//   }
// });

// app.listen(5000, () => console.log("Server running on port 5000"));



const express  = require("express");
const mongoose = require("mongoose");
const cors     = require("cors");
const bcrypt   = require("bcryptjs");

const Task    = require("./models/Task");
const User    = require("./models/User");
const Message = require("./models/Message");

const app = express();
app.use(cors());
app.use(express.json());

mongoose.connect("mongodb://127.0.0.1:27017/scribeconnect")
  .then(() => console.log("MongoDB Connected"))
  .catch((err) => console.log(err));

// ══════════════════════════════════════════════
//  AUTH
// ══════════════════════════════════════════════

app.post("/signup", async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    if (!name || !email || !password || !role)
      return res.status(400).json({ error: "All fields are required" });

    const existing = await User.findOne({ email });
    if (existing)
      return res.status(409).json({ error: "An account with this email already exists" });

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({ name, email, password: hashedPassword, role });
    await newUser.save();

    res.status(201).json({ message: "Signup successful" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Signup failed" });
  }
});

app.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password)
      return res.status(400).json({ error: "Email and password are required" });

    const user = await User.findOne({ email });
    if (!user)
      return res.status(404).json({ error: "No account found with this email" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      return res.status(401).json({ error: "Incorrect password" });

    res.json({ _id: user._id, name: user.name, email: user.email, role: user.role });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Login failed" });
  }
});

// ══════════════════════════════════════════════
//  USER / PROFILE
// ══════════════════════════════════════════════

app.get("/users/:id", async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select("-password");
    if (!user) return res.status(404).json({ error: "User not found" });
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch user" });
  }
});

app.put("/users/:id", async (req, res) => {
  try {
    const { name, bio, skills, languages } = req.body;
    const updated = await User.findByIdAndUpdate(
      req.params.id,
      { name, bio, skills, languages },
      { new: true }
    ).select("-password");
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: "Profile update failed" });
  }
});

// ══════════════════════════════════════════════
//  TASKS
// ══════════════════════════════════════════════

app.post("/create-task", async (req, res) => {
  try {
    const task = new Task(req.body);
    await task.save();
    res.json(task);
  } catch (err) {
    res.status(500).json({ error: "Failed to create task" });
  }
});

app.get("/tasks", async (req, res) => {
  try {
    const tasks = await Task.find().populate("assignedTo", "name email");
    res.json(tasks);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch tasks" });
  }
});

// Tasks for a specific client
app.get("/tasks/client/:clientId", async (req, res) => {
  try {
    const tasks = await Task.find({ clientId: req.params.clientId })
      .populate("assignedTo", "name email bio rating")
      .sort({ createdAt: -1 });
    res.json(tasks);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch client tasks" });
  }
});

// Pending (unassigned) tasks — for assistants to browse
app.get("/tasks/pending", async (req, res) => {
  try {
    const tasks = await Task.find({ status: "pending" }).sort({ createdAt: -1 });
    res.json(tasks);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch pending tasks" });
  }
});

// Tasks assigned to a specific assistant
app.get("/tasks/assistant/:assistantId", async (req, res) => {
  try {
    const tasks = await Task.find({ assignedTo: req.params.assistantId })
      .sort({ createdAt: -1 });
    res.json(tasks);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch assistant tasks" });
  }
});

// Smart matching
app.post("/match", async (req, res) => {
  try {
    const { language, type } = req.body;
    const assistants = await User.find({ role: "assistant" }).select("-password");

    const scored = assistants.map((a) => {
      let score = 0;
      if (a.languages?.includes(language)) score += 0.3;
      if (a.skills?.includes(type))        score += 0.3;
      score += ((a.rating || 0) / 5) * 0.2;
      score += Math.min((a.completedTasks || 0) / 100, 1) * 0.2;
      return { ...a._doc, score };
    });

    scored.sort((a, b) => b.score - a.score);
    res.json(scored.slice(0, 3));
  } catch (err) {
    res.status(500).json({ error: "Matching failed" });
  }
});

// Client assigns assistant
app.post("/assign-task", async (req, res) => {
  try {
    const { taskId, assistantId } = req.body;
    const task = await Task.findByIdAndUpdate(
      taskId,
      { assignedTo: assistantId, status: "assigned" },
      { new: true }
    ).populate("assignedTo", "name email");
    res.json(task);
  } catch (err) {
    res.status(500).json({ error: "Assignment failed" });
  }
});

// Assistant self-accepts a pending task
app.patch("/tasks/:id/accept", async (req, res) => {
  try {
    const { assistantId } = req.body;
    const task = await Task.findByIdAndUpdate(
      req.params.id,
      { assignedTo: assistantId, status: "assigned" },
      { new: true }
    ).populate("assignedTo", "name");
    res.json(task);
  } catch (err) {
    res.status(500).json({ error: "Failed to accept task" });
  }
});

// Mark task completed
app.patch("/tasks/:id/complete", async (req, res) => {
  try {
    const task = await Task.findByIdAndUpdate(
      req.params.id,
      { status: "completed" },
      { new: true }
    );
    res.json(task);
  } catch (err) {
    res.status(500).json({ error: "Failed to complete task" });
  }
});

// ══════════════════════════════════════════════
//  CHAT / MESSAGES
// ══════════════════════════════════════════════

app.post("/messages", async (req, res) => {
  try {
    const { taskId, senderId, senderName, senderRole, text } = req.body;
    if (!taskId || !senderId || !text)
      return res.status(400).json({ error: "Missing required fields" });

    const msg = new Message({ taskId, senderId, senderName, senderRole, text });
    await msg.save();
    res.json(msg);
  } catch (err) {
    res.status(500).json({ error: "Failed to send message" });
  }
});

app.get("/messages/:taskId", async (req, res) => {
  try {
    const messages = await Message.find({ taskId: req.params.taskId })
      .sort({ createdAt: 1 });
    res.json(messages);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch messages" });
  }
});

app.listen(5000, () => console.log("Server running on port 5000"));