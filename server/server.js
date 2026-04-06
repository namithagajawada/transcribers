// require("dotenv").config();
// const express  = require("express");
// const mongoose = require("mongoose");
// const cors     = require("cors");
// const bcrypt   = require("bcryptjs");
// const multer   = require("multer");
// const path     = require("path");
// const fs       = require("fs");

// const Task         = require("./models/Task");
// const User         = require("./models/User");
// const Message      = require("./models/Message");
// const Application  = require("./models/Application");
// const Review       = require("./models/Review");
// const Notification = require("./models/Notification");

// const app = express();
// app.use(cors());
// app.use(express.json());

// // Serve uploaded verification docs
// const uploadsDir = path.join(__dirname, "uploads");
// if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir);
// app.use("/uploads", express.static(uploadsDir));

// mongoose.connect("mongodb://127.0.0.1:27017/scribeconnect")
//   .then(() => console.log("MongoDB Connected"))
//   .catch((err) => console.log(err));

// // ── Multer (verification docs) ────────────────────────
// const storage = multer.diskStorage({
//   destination: (req, file, cb) => cb(null, uploadsDir),
//   filename:    (req, file, cb) => cb(null, `${Date.now()}-${file.originalname}`),
// });
// const upload = multer({
//   storage,
//   limits: { fileSize: 5 * 1024 * 1024 }, // 5MB per file
//   fileFilter: (req, file, cb) => {
//     const allowed = [".pdf", ".jpg", ".jpeg", ".png"];
//     const ext = path.extname(file.originalname).toLowerCase();
//     if (allowed.includes(ext)) cb(null, true);
//     else cb(new Error("Only PDF/JPG/PNG allowed"));
//   },
// });

// // ── Helper: create a notification ─────────────────────
// const notify = async (userId, type, title, body, refId = "") => {
//   try {
//     await Notification.create({ userId, type, title, body, refId });
//   } catch (err) {
//     console.error("Notification error:", err.message);
//   }
// };

// // ══════════════════════════════════════════════════════
// //  AUTH
// // ══════════════════════════════════════════════════════

// app.post("/signup", async (req, res) => {
//   try {
//     const { name, email, password, role } = req.body;
//     if (!name || !email || !password || !role)
//       return res.status(400).json({ error: "All fields are required" });

//     const existing = await User.findOne({ email });
//     if (existing)
//       return res.status(409).json({ error: "An account with this email already exists" });

//     const hashed = await bcrypt.hash(password, 10);
//     const user = new User({ name, email, password: hashed, role });
//     await user.save();
//     res.status(201).json({ message: "Signup successful" });
//   } catch (err) {
//     res.status(500).json({ error: "Signup failed" });
//   }
// });

// app.post("/login", async (req, res) => {
//   try {
//     const { email, password } = req.body;
//     if (!email || !password)
//       return res.status(400).json({ error: "Email and password are required" });

//     const user = await User.findOne({ email });
//     if (!user)
//       return res.status(404).json({ error: "No account found with this email" });

//     const isMatch = await bcrypt.compare(password, user.password);
//     if (!isMatch)
//       return res.status(401).json({ error: "Incorrect password" });

//     res.json({ _id: user._id, name: user.name, email: user.email, role: user.role });
//   } catch (err) {
//     res.status(500).json({ error: "Login failed" });
//   }
// });

// // ══════════════════════════════════════════════════════
// //  USER / PROFILE
// // ══════════════════════════════════════════════════════

// app.get("/users/:id", async (req, res) => {
//   try {
//     const user = await User.findById(req.params.id).select("-password");
//     if (!user) return res.status(404).json({ error: "User not found" });
//     res.json(user);
//   } catch (err) {
//     res.status(500).json({ error: "Failed to fetch user" });
//   }
// });

// app.put("/users/:id", async (req, res) => {
//   try {
//     const { name, bio, skills, languages, gender, age, workExperience, previousWorks } = req.body;
//     const updated = await User.findByIdAndUpdate(
//       req.params.id,
//       { name, bio, skills, languages, gender, age, workExperience, previousWorks },
//       { new: true }
//     ).select("-password");
//     res.json(updated);
//   } catch (err) {
//     res.status(500).json({ error: "Profile update failed" });
//   }
// });

// // Browse all verified/pending transcribers
// app.get("/transcribers", async (req, res) => {
//   try {
//     const { skill, language, search } = req.query;
//     const query = { role: "assistant" };
//     if (skill)    query.skills    = skill;
//     if (language) query.languages = language;
//     if (search)   query.name      = { $regex: search, $options: "i" };

//     const users = await User.find(query)
//       .select("-password")
//       .sort({ rating: -1, completedTasks: -1 });
//     res.json(users);
//   } catch (err) {
//     res.status(500).json({ error: "Failed to fetch transcribers" });
//   }
// });

// // Upload verification docs
// app.post("/users/:id/upload-docs", upload.array("docs", 5), async (req, res) => {
//   try {
//     const filePaths = req.files.map(f => `/uploads/${f.filename}`);
//     const user = await User.findByIdAndUpdate(
//       req.params.id,
//       {
//         $push: { verificationDocs: { $each: filePaths } },
//         verificationStatus: "pending",
//       },
//       { new: true }
//     ).select("-password");
//     res.json(user);
//   } catch (err) {
//     res.status(500).json({ error: "Upload failed" });
//   }
// });

// // Admin: get all transcribers (admin only)
// app.get("/admin/transcribers", async (req, res) => {
//   try {
//     const { adminPin } = req.query;
//     if (adminPin !== "scribe2026admin") return res.status(403).json({ error: "Unauthorized" });
//     const users = await User.find({ role: "assistant" }).select("-password").sort({ createdAt: -1 });
//     res.json(users);
//   } catch (err) { res.status(500).json({ error: "Failed" }); }
// });

// // Admin: verify a transcriber
// app.patch("/users/:id/verify", async (req, res) => {
//   try {
//     const { approve, adminPin } = req.body;
//     if (adminPin !== "scribe2026admin") return res.status(403).json({ error: "Unauthorized" });
//     const user = await User.findByIdAndUpdate(
//       req.params.id,
//       {
//         isVerified:         approve,
//         verificationStatus: approve ? "verified" : "rejected",
//       },
//       { new: true }
//     ).select("-password");

//     await notify(
//       user._id,
//       "verification",
//       approve ? "🎉 Verification Approved!" : "❌ Verification Declined",
//       approve
//         ? "Your profile has been verified. Clients can now see your verified badge!"
//         : "Your verification was declined. Please re-upload clearer documents.",
//     );
//     res.json(user);
//   } catch (err) {
//     res.status(500).json({ error: "Verification update failed" });
//   }
// });

// // ══════════════════════════════════════════════════════
// //  TASKS
// // ══════════════════════════════════════════════════════

// app.post("/create-task", async (req, res) => {
//   try {
//     const task = new Task(req.body);
//     await task.save();
//     res.json(task);
//   } catch (err) {
//     res.status(500).json({ error: "Failed to create task" });
//   }
// });

// app.get("/tasks/client/:clientId", async (req, res) => {
//   try {
//     const tasks = await Task.find({ clientId: req.params.clientId })
//       .populate("assignedTo", "name email bio rating isVerified verificationStatus")
//       .sort({ createdAt: -1 });
//     res.json(tasks);
//   } catch (err) {
//     res.status(500).json({ error: "Failed to fetch tasks" });
//   }
// });

// app.get("/tasks/pending", async (req, res) => {
//   try {
//     const tasks = await Task.find({ status: "pending" }).sort({ createdAt: -1 });
//     res.json(tasks);
//   } catch (err) {
//     res.status(500).json({ error: "Failed to fetch pending tasks" });
//   }
// });

// app.get("/tasks/assistant/:assistantId", async (req, res) => {
//   try {
//     const tasks = await Task.find({ assignedTo: req.params.assistantId })
//       .sort({ createdAt: -1 });
//     res.json(tasks);
//   } catch (err) {
//     res.status(500).json({ error: "Failed to fetch tasks" });
//   }
// });

// // Smart matching
// app.post("/match", async (req, res) => {
//   try {
//     const { language, type } = req.body;
//     const assistants = await User.find({ role: "assistant" }).select("-password");
//     const scored = assistants.map((a) => {
//       let score = 0;
//       if (a.languages?.includes(language)) score += 0.3;
//       if (a.skills?.includes(type))        score += 0.3;
//       score += ((a.rating || 0) / 5) * 0.2;
//       score += Math.min((a.completedTasks || 0) / 100, 1) * 0.1;
//       if (a.isVerified) score += 0.1; // verified boost
//       return { ...a._doc, score };
//     });
//     scored.sort((a, b) => b.score - a.score);
//     res.json(scored.slice(0, 3));
//   } catch (err) {
//     res.status(500).json({ error: "Matching failed" });
//   }
// });

// app.patch("/tasks/:id/complete", async (req, res) => {
//   try {
//     const task = await Task.findByIdAndUpdate(
//       req.params.id, { status: "completed" }, { new: true }
//     );
//     // Increment completedTasks for the assistant
//     if (task.assignedTo) {
//       await User.findByIdAndUpdate(task.assignedTo, { $inc: { completedTasks: 1 } });
//     }
//     // Notify assistant
//     if (task.assignedTo) {
//       await notify(task.assignedTo, "completed", "✅ Task Marked Complete", `A task has been marked complete: "${task.description?.slice(0, 50)}"`, String(task._id));
//     }
//     res.json(task);
//   } catch (err) {
//     res.status(500).json({ error: "Failed to complete task" });
//   }
// });

// // ══════════════════════════════════════════════════════
// //  APPLICATIONS (apply / accept / decline)
// // ══════════════════════════════════════════════════════

// // Transcriber applies to a task
// app.post("/applications", async (req, res) => {
//   try {
//     const { taskId, assistantId, message } = req.body;

//     const task = await Task.findById(taskId);
//     if (!task) return res.status(404).json({ error: "Task not found" });
//     if (task.status !== "pending") return res.status(400).json({ error: "Task is no longer open" });

//     const existing = await Application.findOne({ taskId, assistantId });
//     if (existing) return res.status(409).json({ error: "You already applied to this task" });

//     const app_ = new Application({ taskId, assistantId, clientId: task.clientId, message });
//     await app_.save();

//     const assistant = await User.findById(assistantId).select("name");
//     await notify(
//       task.clientId,
//       "application",
//       "🙋 New Application Received",
//       `${assistant?.name} applied to your task: "${task.description?.slice(0, 50)}"`,
//       String(taskId)
//     );

//     res.status(201).json(app_);
//   } catch (err) {
//     if (err.code === 11000) return res.status(409).json({ error: "Already applied" });
//     res.status(500).json({ error: "Application failed" });
//   }
// });

// // Get all applications for a task (for client)
// app.get("/applications/task/:taskId", async (req, res) => {
//   try {
//     const apps = await Application.find({ taskId: req.params.taskId })
//       .populate("assistantId", "name email bio rating skills languages isVerified verificationStatus workExperience age gender reviewCount")
//       .sort({ createdAt: -1 });
//     res.json(apps);
//   } catch (err) {
//     res.status(500).json({ error: "Failed to fetch applications" });
//   }
// });

// // Get all applications by an assistant
// app.get("/applications/assistant/:assistantId", async (req, res) => {
//   try {
//     const apps = await Application.find({ assistantId: req.params.assistantId })
//       .populate("taskId")
//       .sort({ createdAt: -1 });
//     res.json(apps);
//   } catch (err) {
//     res.status(500).json({ error: "Failed to fetch applications" });
//   }
// });

// // Client accepts an application
// app.patch("/applications/:id/accept", async (req, res) => {
//   try {
//     const application = await Application.findByIdAndUpdate(
//       req.params.id, { status: "accepted" }, { new: true }
//     ).populate("assistantId", "name");

//     // Assign task
//     await Task.findByIdAndUpdate(application.taskId, {
//       assignedTo: application.assistantId._id,
//       status: "assigned",
//     });

//     // Decline all other pending applications for this task
//     await Application.updateMany(
//       { taskId: application.taskId, _id: { $ne: req.params.id }, status: "pending" },
//       { status: "declined" }
//     );

//     // Notify the accepted transcriber
//     const task = await Task.findById(application.taskId);
//     await notify(
//       application.assistantId._id,
//       "accepted",
//       "🎉 Application Accepted!",
//       `Your application was accepted for: "${task?.description?.slice(0, 50)}"`,
//       String(application.taskId)
//     );

//     res.json(application);
//   } catch (err) {
//     res.status(500).json({ error: "Accept failed" });
//   }
// });

// // Client declines an application
// app.patch("/applications/:id/decline", async (req, res) => {
//   try {
//     const application = await Application.findByIdAndUpdate(
//       req.params.id, { status: "declined" }, { new: true }
//     ).populate("assistantId", "name");

//     const task = await Task.findById(application.taskId);
//     await notify(
//       application.assistantId._id,
//       "declined",
//       "Application Not Selected",
//       `Your application was not selected for: "${task?.description?.slice(0, 50)}"`,
//       String(application.taskId)
//     );
//     res.json(application);
//   } catch (err) {
//     res.status(500).json({ error: "Decline failed" });
//   }
// });

// // ══════════════════════════════════════════════════════
// //  REVIEWS
// // ══════════════════════════════════════════════════════

// app.post("/reviews", async (req, res) => {
//   try {
//     const { taskId, clientId, assistantId, clientName, rating, comment } = req.body;

//     const existing = await Review.findOne({ taskId, clientId });
//     if (existing) return res.status(409).json({ error: "Already reviewed this task" });

//     const task = await Task.findById(taskId);
//     if (!task || task.status !== "completed")
//       return res.status(400).json({ error: "Task must be completed before reviewing" });

//     const review = new Review({ taskId, clientId, assistantId, clientName, rating, comment });
//     await review.save();

//     // Recalculate assistant's average rating
//     const allReviews = await Review.find({ assistantId });
//     const avg = allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length;
//     await User.findByIdAndUpdate(assistantId, {
//       rating:      Math.round(avg * 10) / 10,
//       reviewCount: allReviews.length,
//     });

//     await notify(
//       assistantId,
//       "review",
//       "⭐ New Review Received",
//       `${clientName} gave you ${rating} star${rating !== 1 ? "s" : ""}: "${comment?.slice(0, 60)}"`,
//       String(taskId)
//     );

//     res.status(201).json(review);
//   } catch (err) {
//     if (err.code === 11000) return res.status(409).json({ error: "Already reviewed" });
//     res.status(500).json({ error: "Review failed" });
//   }
// });

// // Get all reviews for a transcriber
// app.get("/reviews/transcriber/:assistantId", async (req, res) => {
//   try {
//     const reviews = await Review.find({ assistantId: req.params.assistantId })
//       .sort({ createdAt: -1 });
//     res.json(reviews);
//   } catch (err) {
//     res.status(500).json({ error: "Failed to fetch reviews" });
//   }
// });

// // ══════════════════════════════════════════════════════
// //  NOTIFICATIONS
// // ══════════════════════════════════════════════════════

// app.get("/notifications/:userId", async (req, res) => {
//   try {
//     const notifications = await Notification.find({ userId: req.params.userId })
//       .sort({ createdAt: -1 })
//       .limit(30);
//     res.json(notifications);
//   } catch (err) {
//     res.status(500).json({ error: "Failed to fetch notifications" });
//   }
// });

// app.get("/notifications/unread-count/:userId", async (req, res) => {
//   try {
//     const count = await Notification.countDocuments({ userId: req.params.userId, read: false });
//     res.json({ count });
//   } catch (err) {
//     res.status(500).json({ error: "Failed to fetch count" });
//   }
// });

// app.patch("/notifications/:id/read", async (req, res) => {
//   try {
//     const n = await Notification.findByIdAndUpdate(req.params.id, { read: true }, { new: true });
//     res.json(n);
//   } catch (err) {
//     res.status(500).json({ error: "Failed to mark read" });
//   }
// });

// app.patch("/notifications/read-all/:userId", async (req, res) => {
//   try {
//     await Notification.updateMany({ userId: req.params.userId, read: false }, { read: true });
//     res.json({ success: true });
//   } catch (err) {
//     res.status(500).json({ error: "Failed to mark all read" });
//   }
// });

// // ══════════════════════════════════════════════════════
// //  MESSAGES (chat)
// // ══════════════════════════════════════════════════════

// app.post("/messages", async (req, res) => {
//   try {
//     const { taskId, senderId, senderName, senderRole, text, recipientId } = req.body;
//     if (!taskId || !senderId || !text)
//       return res.status(400).json({ error: "Missing required fields" });

//     const msg = new Message({ taskId, senderId, senderName, senderRole, text });
//     await msg.save();

//     // Notify the recipient
//     if (recipientId) {
//       await notify(
//         recipientId,
//         "message",
//         `💬 New message from ${senderName}`,
//         text.slice(0, 80),
//         String(taskId)
//       );
//     }

//     res.json(msg);
//   } catch (err) {
//     res.status(500).json({ error: "Failed to send message" });
//   }
// });

// app.get("/messages/:taskId", async (req, res) => {
//   try {
//     const messages = await Message.find({ taskId: req.params.taskId }).sort({ createdAt: 1 });
//     res.json(messages);
//   } catch (err) {
//     res.status(500).json({ error: "Failed to fetch messages" });
//   }
// });

// app.listen(5000, () => console.log("Server running on port 5000"));





// const express  = require("express");
// const mongoose = require("mongoose");
// const cors     = require("cors");
// const bcrypt   = require("bcryptjs");
// const multer   = require("multer");
// const path     = require("path");
// const fs       = require("fs");
// const Anthropic  = require("@anthropic-ai/sdk");

// const Task         = require("./models/Task");
// const User         = require("./models/User");
// const Message      = require("./models/Message");
// const Application  = require("./models/Application");
// const Review       = require("./models/Review");
// const Notification = require("./models/Notification");

// const app = express();
// app.use(cors());
// app.use(express.json());

// // Serve uploaded verification docs
// const uploadsDir = path.join(__dirname, "uploads");
// if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir);
// app.use("/uploads", express.static(uploadsDir));

// mongoose.connect("mongodb://127.0.0.1:27017/scribeconnect")
//   .then(() => console.log("MongoDB Connected"))
//   .catch((err) => console.log(err));

// const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

// // ── Multer (verification docs) ────────────────────────
// const storage = multer.diskStorage({
//   destination: (req, file, cb) => cb(null, uploadsDir),
//   filename:    (req, file, cb) => cb(null, `${Date.now()}-${file.originalname}`),
// });
// const upload = multer({
//   storage,
//   limits: { fileSize: 5 * 1024 * 1024 }, // 5MB per file
//   fileFilter: (req, file, cb) => {
//     const allowed = [".pdf", ".jpg", ".jpeg", ".png"];
//     const ext = path.extname(file.originalname).toLowerCase();
//     if (allowed.includes(ext)) cb(null, true);
//     else cb(new Error("Only PDF/JPG/PNG allowed"));
//   },
// });

// // ── Helper: create a notification ─────────────────────
// const notify = async (userId, type, title, body, refId = "") => {
//   try {
//     await Notification.create({ userId, type, title, body, refId });
//   } catch (err) {
//     console.error("Notification error:", err.message);
//   }
// };

// // ══════════════════════════════════════════════════════
// //  AUTH
// // ══════════════════════════════════════════════════════

// app.post("/signup", async (req, res) => {
//   try {
//     const { name, email, password, role } = req.body;
//     if (!name || !email || !password || !role)
//       return res.status(400).json({ error: "All fields are required" });

//     const existing = await User.findOne({ email });
//     if (existing)
//       return res.status(409).json({ error: "An account with this email already exists" });

//     const hashed = await bcrypt.hash(password, 10);
//     const user = new User({ name, email, password: hashed, role });
//     await user.save();
//     res.status(201).json({ message: "Signup successful" });
//   } catch (err) {
//     res.status(500).json({ error: "Signup failed" });
//   }
// });

// app.post("/login", async (req, res) => {
//   try {
//     const { email, password } = req.body;
//     if (!email || !password)
//       return res.status(400).json({ error: "Email and password are required" });

//     const user = await User.findOne({ email });
//     if (!user)
//       return res.status(404).json({ error: "No account found with this email" });

//     const isMatch = await bcrypt.compare(password, user.password);
//     if (!isMatch)
//       return res.status(401).json({ error: "Incorrect password" });

//     res.json({ _id: user._id, name: user.name, email: user.email, role: user.role });
//   } catch (err) {
//     res.status(500).json({ error: "Login failed" });
//   }
// });

// // ══════════════════════════════════════════════════════
// //  USER / PROFILE
// // ══════════════════════════════════════════════════════

// app.get("/users/:id", async (req, res) => {
//   try {
//     const user = await User.findById(req.params.id).select("-password");
//     if (!user) return res.status(404).json({ error: "User not found" });
//     res.json(user);
//   } catch (err) {
//     res.status(500).json({ error: "Failed to fetch user" });
//   }
// });

// app.put("/users/:id", async (req, res) => {
//   try {
//     const { name, bio, skills, languages, gender, age, workExperience, previousWorks } = req.body;
//     const updated = await User.findByIdAndUpdate(
//       req.params.id,
//       { name, bio, skills, languages, gender, age, workExperience, previousWorks },
//       { new: true }
//     ).select("-password");
//     res.json(updated);
//   } catch (err) {
//     res.status(500).json({ error: "Profile update failed" });
//   }
// });

// // Browse all verified/pending transcribers
// app.get("/transcribers", async (req, res) => {
//   try {
//     const { skill, language, search } = req.query;
//     const query = { role: "assistant" };
//     if (skill)    query.skills    = skill;
//     if (language) query.languages = language;
//     if (search)   query.name      = { $regex: search, $options: "i" };

//     const users = await User.find(query)
//       .select("-password")
//       .sort({ rating: -1, completedTasks: -1 });
//     res.json(users);
//   } catch (err) {
//     res.status(500).json({ error: "Failed to fetch transcribers" });
//   }
// });

// // Upload verification docs
// app.post("/users/:id/upload-docs", upload.array("docs", 5), async (req, res) => {
//   try {
//     const filePaths = req.files.map(f => `/uploads/${f.filename}`);
//     const user = await User.findByIdAndUpdate(
//       req.params.id,
//       {
//         $push: { verificationDocs: { $each: filePaths } },
//         verificationStatus: "pending",
//       },
//       { new: true }
//     ).select("-password");
//     res.json(user);
//   } catch (err) {
//     res.status(500).json({ error: "Upload failed" });
//   }
// });

// // Admin: get all transcribers (admin only)
// app.get("/admin/transcribers", async (req, res) => {
//   try {
//     const { adminPin } = req.query;
//     if (adminPin !== "scribe2026admin") return res.status(403).json({ error: "Unauthorized" });
//     const users = await User.find({ role: "assistant" }).select("-password").sort({ createdAt: -1 });
//     res.json(users);
//   } catch (err) { res.status(500).json({ error: "Failed" }); }
// });

// // Admin: verify a transcriber
// app.patch("/users/:id/verify", async (req, res) => {
//   try {
//     const { approve, adminPin } = req.body;
//     if (adminPin !== "scribe2026admin") return res.status(403).json({ error: "Unauthorized" });
//     const user = await User.findByIdAndUpdate(
//       req.params.id,
//       {
//         isVerified:         approve,
//         verificationStatus: approve ? "verified" : "rejected",
//       },
//       { new: true }
//     ).select("-password");

//     await notify(
//       user._id,
//       "verification",
//       approve ? "🎉 Verification Approved!" : "❌ Verification Declined",
//       approve
//         ? "Your profile has been verified. Clients can now see your verified badge!"
//         : "Your verification was declined. Please re-upload clearer documents.",
//     );
//     res.json(user);
//   } catch (err) {
//     res.status(500).json({ error: "Verification update failed" });
//   }
// });

// // ══════════════════════════════════════════════════════
// //  TASKS
// // ══════════════════════════════════════════════════════

// app.post("/create-task", async (req, res) => {
//   try {
//     const task = new Task(req.body);
//     await task.save();
//     res.json(task);
//   } catch (err) {
//     res.status(500).json({ error: "Failed to create task" });
//   }
// });

// app.get("/tasks/client/:clientId", async (req, res) => {
//   try {
//     const tasks = await Task.find({ clientId: req.params.clientId })
//       .populate("assignedTo", "name email bio rating isVerified verificationStatus")
//       .sort({ createdAt: -1 });
//     res.json(tasks);
//   } catch (err) {
//     res.status(500).json({ error: "Failed to fetch tasks" });
//   }
// });

// app.get("/tasks/pending", async (req, res) => {
//   try {
//     const tasks = await Task.find({ status: "pending" }).sort({ createdAt: -1 });
//     res.json(tasks);
//   } catch (err) {
//     res.status(500).json({ error: "Failed to fetch pending tasks" });
//   }
// });

// app.get("/tasks/assistant/:assistantId", async (req, res) => {
//   try {
//     const tasks = await Task.find({ assignedTo: req.params.assistantId })
//       .sort({ createdAt: -1 });
//     res.json(tasks);
//   } catch (err) {
//     res.status(500).json({ error: "Failed to fetch tasks" });
//   }
// });

// // Smart matching
// app.post("/match", async (req, res) => {
//   try {
//     const { language, type } = req.body;
//     const assistants = await User.find({ role: "assistant" }).select("-password");
//     const scored = assistants.map((a) => {
//       let score = 0;
//       if (a.languages?.includes(language)) score += 0.3;
//       if (a.skills?.includes(type))        score += 0.3;
//       score += ((a.rating || 0) / 5) * 0.2;
//       score += Math.min((a.completedTasks || 0) / 100, 1) * 0.1;
//       if (a.isVerified) score += 0.1; // verified boost
//       return { ...a._doc, score };
//     });
//     scored.sort((a, b) => b.score - a.score);
//     res.json(scored.slice(0, 3));
//   } catch (err) {
//     res.status(500).json({ error: "Matching failed" });
//   }
// });


// // ── AI MATCH: recommended transcribers for a client request ──
// app.post("/ai-match/transcribers", async (req, res) => {
//   try {
//     const { taskDescription, taskType, language, clientId } = req.body;
//     if (!taskDescription) return res.status(400).json({ error: "Task description required" });

//     const transcribers = await User.find({ role: "assistant" }).select("-password").lean();
//     if (!transcribers.length) return res.json([]);

//     const transcribersData = transcribers.map(t => ({
//       id:             t._id,
//       name:           t.name,
//       bio:            t.bio || "",
//       skills:         t.skills || [],
//       languages:      t.languages || [],
//       rating:         t.rating || 0,
//       reviewCount:    t.reviewCount || 0,
//       completedTasks: t.completedTasks || 0,
//       workExperience: t.workExperience || 0,
//       isVerified:     t.isVerified || false,
//       verificationStatus: t.verificationStatus || "unverified",
//     }));

//     const prompt = `You are an intelligent matching engine for ScribeConnect, a transcription platform.

// A client needs transcription help. Analyze the transcribers below and return the top 3 best matches.

// CLIENT REQUEST:
// - Description: "${taskDescription}"
// - Type: ${taskType || "general"}
// - Language: ${language || "English"}

// AVAILABLE TRANSCRIBERS:
// ${JSON.stringify(transcribersData, null, 2)}

// Return ONLY a valid JSON array (no markdown, no explanation outside JSON) with exactly up to 3 objects:
// [
//   {
//     "id": "<transcriber _id>",
//     "matchScore": <integer 0-100>,
//     "matchLabel": "<one of: Perfect Match | Strong Match | Good Match>",
//     "reason": "<2 sentences max explaining why this transcriber fits this specific request>",
//     "strengths": ["<strength 1>", "<strength 2>", "<strength 3 max>"]
//   }
// ]
// Sort by matchScore descending. Only include transcribers who are genuinely relevant.`;

//     const response = await anthropic.messages.create({
//       model:      "claude-sonnet-4-20250514",
//       max_tokens: 1000,
//       messages:   [{ role: "user", content: prompt }],
//     });

//     const rawText = response.content[0].text.trim();
//     const jsonText = rawText.replace(/^```json\n?|^```\n?|```$/gm, "").trim();
//     const matches = JSON.parse(jsonText);

//     // Attach full transcriber data back
//     const enriched = matches.map(m => {
//       const full = transcribersData.find(t => String(t.id) === String(m.id));
//       return { ...full, ...m };
//     });

//     res.json(enriched);
//   } catch (err) {
//     console.error("AI match error:", err.message);
//     res.status(500).json({ error: "AI matching failed" });
//   }
// });

// // ── AI MATCH: recommended tasks for a transcriber ──
// app.post("/ai-match/tasks", async (req, res) => {
//   try {
//     const { assistantId } = req.body;
//     if (!assistantId) return res.status(400).json({ error: "assistantId required" });

//     const assistant = await User.findById(assistantId).select("-password").lean();
//     if (!assistant) return res.status(404).json({ error: "Transcriber not found" });

//     const pendingTasks = await Task.find({ status: "pending" }).lean();
//     if (!pendingTasks.length) return res.json([]);

//     const assistantData = {
//       name:           assistant.name,
//       bio:            assistant.bio || "",
//       skills:         assistant.skills || [],
//       languages:      assistant.languages || [],
//       rating:         assistant.rating || 0,
//       workExperience: assistant.workExperience || 0,
//       completedTasks: assistant.completedTasks || 0,
//       isVerified:     assistant.isVerified || false,
//     };

//     const tasksData = pendingTasks.map(t => ({
//       id:          t._id,
//       description: t.description,
//       type:        t.type || "general",
//       language:    t.language || "English",
//       deadline:    t.deadline || "",
//     }));

//     const prompt = `You are an intelligent matching engine for ScribeConnect, a transcription platform.

// A transcriber is looking for work. Analyze the open tasks below and return the top 3 best matches for them.

// TRANSCRIBER PROFILE:
// ${JSON.stringify(assistantData, null, 2)}

// OPEN TASKS:
// ${JSON.stringify(tasksData, null, 2)}

// Return ONLY a valid JSON array (no markdown, no explanation outside JSON) with exactly up to 3 objects:
// [
//   {
//     "id": "<task _id>",
//     "matchScore": <integer 0-100>,
//     "matchLabel": "<one of: Perfect Fit | Great Fit | Good Fit>",
//     "reason": "<2 sentences max explaining why this task suits this transcriber's specific skills>",
//     "highlights": ["<highlight 1>", "<highlight 2>", "<highlight 3 max>"]
//   }
// ]
// Sort by matchScore descending. Only include tasks that genuinely match the transcriber's profile.`;

//     const response = await anthropic.messages.create({
//       model:      "claude-sonnet-4-20250514",
//       max_tokens: 1000,
//       messages:   [{ role: "user", content: prompt }],
//     });

//     const rawText = response.content[0].text.trim();
//     const jsonText = rawText.replace(/^```json\n?|^```\n?|```$/gm, "").trim();
//     const matches = JSON.parse(jsonText);

//     // Attach full task data back
//     const enriched = matches.map(m => {
//       const full = tasksData.find(t => String(t.id) === String(m.id));
//       return { ...full, ...m };
//     });

//     res.json(enriched);
//   } catch (err) {
//     console.error("AI task match error:", err.message);
//     res.status(500).json({ error: "AI matching failed" });
//   }
// });

// app.patch("/tasks/:id/complete", async (req, res) => {
//   try {
//     const task = await Task.findByIdAndUpdate(
//       req.params.id, { status: "completed" }, { new: true }
//     );
//     // Increment completedTasks for the assistant
//     if (task.assignedTo) {
//       await User.findByIdAndUpdate(task.assignedTo, { $inc: { completedTasks: 1 } });
//     }
//     // Notify assistant
//     if (task.assignedTo) {
//       await notify(task.assignedTo, "completed", "✅ Task Marked Complete", `A task has been marked complete: "${task.description?.slice(0, 50)}"`, String(task._id));
//     }
//     res.json(task);
//   } catch (err) {
//     res.status(500).json({ error: "Failed to complete task" });
//   }
// });

// // ══════════════════════════════════════════════════════
// //  APPLICATIONS (apply / accept / decline)
// // ══════════════════════════════════════════════════════

// // Transcriber applies to a task
// app.post("/applications", async (req, res) => {
//   try {
//     const { taskId, assistantId, message } = req.body;

//     const task = await Task.findById(taskId);
//     if (!task) return res.status(404).json({ error: "Task not found" });
//     if (task.status !== "pending") return res.status(400).json({ error: "Task is no longer open" });

//     const existing = await Application.findOne({ taskId, assistantId });
//     if (existing) return res.status(409).json({ error: "You already applied to this task" });

//     const app_ = new Application({ taskId, assistantId, clientId: task.clientId, message });
//     await app_.save();

//     const assistant = await User.findById(assistantId).select("name");
//     await notify(
//       task.clientId,
//       "application",
//       "🙋 New Application Received",
//       `${assistant?.name} applied to your task: "${task.description?.slice(0, 50)}"`,
//       String(taskId)
//     );

//     res.status(201).json(app_);
//   } catch (err) {
//     if (err.code === 11000) return res.status(409).json({ error: "Already applied" });
//     res.status(500).json({ error: "Application failed" });
//   }
// });

// // Get all applications for a task (for client)
// app.get("/applications/task/:taskId", async (req, res) => {
//   try {
//     const apps = await Application.find({ taskId: req.params.taskId })
//       .populate("assistantId", "name email bio rating skills languages isVerified verificationStatus workExperience age gender reviewCount")
//       .sort({ createdAt: -1 });
//     res.json(apps);
//   } catch (err) {
//     res.status(500).json({ error: "Failed to fetch applications" });
//   }
// });

// // Get all applications by an assistant
// app.get("/applications/assistant/:assistantId", async (req, res) => {
//   try {
//     const apps = await Application.find({ assistantId: req.params.assistantId })
//       .populate("taskId")
//       .sort({ createdAt: -1 });
//     res.json(apps);
//   } catch (err) {
//     res.status(500).json({ error: "Failed to fetch applications" });
//   }
// });

// // Client accepts an application
// app.patch("/applications/:id/accept", async (req, res) => {
//   try {
//     const application = await Application.findByIdAndUpdate(
//       req.params.id, { status: "accepted" }, { new: true }
//     ).populate("assistantId", "name");

//     // Assign task
//     await Task.findByIdAndUpdate(application.taskId, {
//       assignedTo: application.assistantId._id,
//       status: "assigned",
//     });

//     // Decline all other pending applications for this task
//     await Application.updateMany(
//       { taskId: application.taskId, _id: { $ne: req.params.id }, status: "pending" },
//       { status: "declined" }
//     );

//     // Notify the accepted transcriber
//     const task = await Task.findById(application.taskId);
//     await notify(
//       application.assistantId._id,
//       "accepted",
//       "🎉 Application Accepted!",
//       `Your application was accepted for: "${task?.description?.slice(0, 50)}"`,
//       String(application.taskId)
//     );

//     res.json(application);
//   } catch (err) {
//     res.status(500).json({ error: "Accept failed" });
//   }
// });

// // Client declines an application
// app.patch("/applications/:id/decline", async (req, res) => {
//   try {
//     const application = await Application.findByIdAndUpdate(
//       req.params.id, { status: "declined" }, { new: true }
//     ).populate("assistantId", "name");

//     const task = await Task.findById(application.taskId);
//     await notify(
//       application.assistantId._id,
//       "declined",
//       "Application Not Selected",
//       `Your application was not selected for: "${task?.description?.slice(0, 50)}"`,
//       String(application.taskId)
//     );
//     res.json(application);
//   } catch (err) {
//     res.status(500).json({ error: "Decline failed" });
//   }
// });

// // ══════════════════════════════════════════════════════
// //  REVIEWS
// // ══════════════════════════════════════════════════════

// app.post("/reviews", async (req, res) => {
//   try {
//     const { taskId, clientId, assistantId, clientName, rating, comment } = req.body;

//     const existing = await Review.findOne({ taskId, clientId });
//     if (existing) return res.status(409).json({ error: "Already reviewed this task" });

//     const task = await Task.findById(taskId);
//     if (!task || task.status !== "completed")
//       return res.status(400).json({ error: "Task must be completed before reviewing" });

//     const review = new Review({ taskId, clientId, assistantId, clientName, rating, comment });
//     await review.save();

//     // Recalculate assistant's average rating
//     const allReviews = await Review.find({ assistantId });
//     const avg = allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length;
//     await User.findByIdAndUpdate(assistantId, {
//       rating:      Math.round(avg * 10) / 10,
//       reviewCount: allReviews.length,
//     });

//     await notify(
//       assistantId,
//       "review",
//       "⭐ New Review Received",
//       `${clientName} gave you ${rating} star${rating !== 1 ? "s" : ""}: "${comment?.slice(0, 60)}"`,
//       String(taskId)
//     );

//     res.status(201).json(review);
//   } catch (err) {
//     if (err.code === 11000) return res.status(409).json({ error: "Already reviewed" });
//     res.status(500).json({ error: "Review failed" });
//   }
// });

// // Get all reviews for a transcriber
// app.get("/reviews/transcriber/:assistantId", async (req, res) => {
//   try {
//     const reviews = await Review.find({ assistantId: req.params.assistantId })
//       .sort({ createdAt: -1 });
//     res.json(reviews);
//   } catch (err) {
//     res.status(500).json({ error: "Failed to fetch reviews" });
//   }
// });

// // ══════════════════════════════════════════════════════
// //  NOTIFICATIONS
// // ══════════════════════════════════════════════════════

// app.get("/notifications/:userId", async (req, res) => {
//   try {
//     const notifications = await Notification.find({ userId: req.params.userId })
//       .sort({ createdAt: -1 })
//       .limit(30);
//     res.json(notifications);
//   } catch (err) {
//     res.status(500).json({ error: "Failed to fetch notifications" });
//   }
// });

// app.get("/notifications/unread-count/:userId", async (req, res) => {
//   try {
//     const count = await Notification.countDocuments({ userId: req.params.userId, read: false });
//     res.json({ count });
//   } catch (err) {
//     res.status(500).json({ error: "Failed to fetch count" });
//   }
// });

// app.patch("/notifications/:id/read", async (req, res) => {
//   try {
//     const n = await Notification.findByIdAndUpdate(req.params.id, { read: true }, { new: true });
//     res.json(n);
//   } catch (err) {
//     res.status(500).json({ error: "Failed to mark read" });
//   }
// });

// app.patch("/notifications/read-all/:userId", async (req, res) => {
//   try {
//     await Notification.updateMany({ userId: req.params.userId, read: false }, { read: true });
//     res.json({ success: true });
//   } catch (err) {
//     res.status(500).json({ error: "Failed to mark all read" });
//   }
// });

// // ══════════════════════════════════════════════════════
// //  MESSAGES (chat)
// // ══════════════════════════════════════════════════════

// app.post("/messages", async (req, res) => {
//   try {
//     const { taskId, senderId, senderName, senderRole, text, recipientId } = req.body;
//     if (!taskId || !senderId || !text)
//       return res.status(400).json({ error: "Missing required fields" });

//     const msg = new Message({ taskId, senderId, senderName, senderRole, text });
//     await msg.save();

//     // Notify the recipient
//     if (recipientId) {
//       await notify(
//         recipientId,
//         "message",
//         `💬 New message from ${senderName}`,
//         text.slice(0, 80),
//         String(taskId)
//       );
//     }

//     res.json(msg);
//   } catch (err) {
//     res.status(500).json({ error: "Failed to send message" });
//   }
// });

// app.get("/messages/:taskId", async (req, res) => {
//   try {
//     const messages = await Message.find({ taskId: req.params.taskId }).sort({ createdAt: 1 });
//     res.json(messages);
//   } catch (err) {
//     res.status(500).json({ error: "Failed to fetch messages" });
//   }
// });



// // ══════════════════════════════════════════════════════
// //  FILE ATTACHMENTS
// // ══════════════════════════════════════════════════════

// // Multer config for task files (audio, video, docs, transcripts)
// const taskFileStorage = multer.diskStorage({
//   destination: (req, file, cb) => {
//     const dir = path.join(__dirname, "task-files");
//     if (!fs.existsSync(dir)) fs.mkdirSync(dir);
//     cb(null, dir);
//   },
//   filename: (req, file, cb) => cb(null, `${Date.now()}-${file.originalname}`),
// });
// const taskUpload = multer({
//   storage: taskFileStorage,
//   limits: { fileSize: 50 * 1024 * 1024 }, // 50MB
//   fileFilter: (req, file, cb) => {
//     const allowed = [
//       ".mp3", ".mp4", ".wav", ".m4a", ".ogg", ".webm",  // audio/video
//       ".pdf", ".doc", ".docx", ".txt",                    // docs
//       ".jpg", ".jpeg", ".png",                            // images
//     ];
//     const ext = path.extname(file.originalname).toLowerCase();
//     if (allowed.includes(ext)) cb(null, true);
//     else cb(new Error("File type not allowed"));
//   },
// });
// app.use("/task-files", express.static(path.join(__dirname, "task-files")));

// // Client uploads input files to a task (audio/video/docs to be transcribed)
// app.post("/tasks/:id/upload-input", taskUpload.array("files", 10), async (req, res) => {
//   try {
//     const files = req.files.map(f => ({
//       filename:  f.originalname,
//       path:      `/task-files/${f.filename}`,
//       mimetype:  f.mimetype,
//     }));
//     const task = await Task.findByIdAndUpdate(
//       req.params.id,
//       { $push: { inputFiles: { $each: files } } },
//       { new: true }
//     );
//     res.json(task);
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ error: "Upload failed" });
//   }
// });

// // Transcriber uploads output files (completed transcript)
// app.post("/tasks/:id/upload-output", taskUpload.array("files", 5), async (req, res) => {
//   try {
//     const files = req.files.map(f => ({
//       filename:  f.originalname,
//       path:      `/task-files/${f.filename}`,
//       mimetype:  f.mimetype,
//     }));
//     const task = await Task.findByIdAndUpdate(
//       req.params.id,
//       { $push: { outputFiles: { $each: files } } },
//       { new: true }
//     );

//     // Notify client that files were delivered
//     await notify(
//       task.clientId,
//       "completed",
//       "📄 Transcript Delivered!",
//       `Your transcriber has uploaded the completed files for: "${task.description?.slice(0, 50)}"`,
//       String(task._id)
//     );

//     res.json(task);
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ error: "Upload failed" });
//   }
// });

// // Delete a file from a task
// app.delete("/tasks/:id/files", async (req, res) => {
//   try {
//     const { filePath, fileType } = req.body; // fileType: "input" | "output"
//     const field = fileType === "output" ? "outputFiles" : "inputFiles";

//     await Task.findByIdAndUpdate(req.params.id, {
//       $pull: { [field]: { path: filePath } }
//     });

//     // Delete physical file
//     const absPath = path.join(__dirname, filePath.replace("/task-files/", "task-files/"));
//     if (fs.existsSync(absPath)) fs.unlinkSync(absPath);

//     res.json({ success: true });
//   } catch (err) {
//     res.status(500).json({ error: "Delete failed" });
//   }
// });

// // ══════════════════════════════════════════════════════
// //  AI RECOMMENDATION ENGINE (Claude-powered)
// // ══════════════════════════════════════════════════════

// const Anthropic = require("@anthropic-ai/sdk");
// const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

// // Client task → recommend best transcribers
// app.post("/ai-recommend/transcribers", async (req, res) => {
//   try {
//     const { taskId } = req.body;
//     const task = await Task.findById(taskId);
//     if (!task) return res.status(404).json({ error: "Task not found" });

//     const transcribers = await User.find({ role: "assistant" }).select("-password");
//     if (transcribers.length === 0) return res.json([]);

//     const transcribersInfo = transcribers.map(t => ({
//       id: String(t._id),
//       name: t.name,
//       bio: t.bio || "No bio",
//       skills: t.skills || [],
//       languages: t.languages || [],
//       rating: t.rating || 0,
//       reviewCount: t.reviewCount || 0,
//       completedTasks: t.completedTasks || 0,
//       workExperience: t.workExperience || 0,
//       isVerified: t.isVerified || false,
//       verificationStatus: t.verificationStatus,
//     }));

//     const prompt = `You are an intelligent matching engine for ScribeConnect.

// Client transcription request:
// - Description: "${task.description}"
// - Type: ${task.type}
// - Language: ${task.language}
// - Deadline: ${task.deadline || "Not specified"}

// Available transcribers:
// ${JSON.stringify(transcribersInfo, null, 2)}

// Rank the top 3 best matches based on skills, languages, bio, experience and rating.
// Return ONLY a JSON array, no other text:
// [{"id":"<_id>","name":"<name>","matchScore":<0-100>,"reason":"<1-2 sentences why they match this task>"}]`;

//     const message = await anthropic.messages.create({
//       model: "claude-sonnet-4-20250514",
//       max_tokens: 800,
//       messages: [{ role: "user", content: prompt }],
//     });

//     const raw = message.content[0].text.trim().replace(/```json|```/g, "").trim();
//     const parsed = JSON.parse(raw);

//     const enriched = parsed.map(r => {
//       const full = transcribers.find(t => String(t._id) === String(r.id));
//       return {
//         ...r,
//         profile: full ? {
//           skills: full.skills, languages: full.languages,
//           rating: full.rating, reviewCount: full.reviewCount,
//           completedTasks: full.completedTasks, workExperience: full.workExperience,
//           isVerified: full.isVerified, verificationStatus: full.verificationStatus,
//           bio: full.bio,
//         } : {},
//       };
//     });
//     res.json(enriched);
//   } catch (err) {
//     console.error("AI recommend transcribers error:", err.message);
//     res.status(500).json({ error: "AI recommendation failed" });
//   }
// });

// // Transcriber profile → recommend best matching open tasks
// app.post("/ai-recommend/tasks", async (req, res) => {
//   try {
//     const { assistantId } = req.body;
//     const assistant = await User.findById(assistantId).select("-password");
//     if (!assistant) return res.status(404).json({ error: "Transcriber not found" });

//     const openTasks = await Task.find({ status: "pending" }).sort({ createdAt: -1 }).limit(20);
//     if (openTasks.length === 0) return res.json([]);

//     const tasksInfo = openTasks.map(t => ({
//       id: String(t._id),
//       description: t.description,
//       type: t.type,
//       language: t.language,
//       deadline: t.deadline || "Not specified",
//     }));

//     const prompt = `You are an intelligent matching engine for ScribeConnect.

// Transcriber profile:
// - Bio: ${assistant.bio || "No bio"}
// - Skills: ${(assistant.skills || []).join(", ") || "Not specified"}
// - Languages: ${(assistant.languages || []).join(", ") || "Not specified"}
// - Experience: ${assistant.workExperience || 0} years
// - Rating: ${assistant.rating || 0}/5 (${assistant.reviewCount || 0} reviews)

// Open client requests:
// ${JSON.stringify(tasksInfo, null, 2)}

// Rank the top 3 tasks that best match this transcriber's skills and language abilities.
// Return ONLY a JSON array, no other text:
// [{"id":"<_id>","description":"<desc>","type":"<type>","language":"<lang>","deadline":"<deadline>","matchScore":<0-100>,"reason":"<1-2 sentences why this task fits this transcriber>"}]`;

//     const message = await anthropic.messages.create({
//       model: "claude-sonnet-4-20250514",
//       max_tokens: 800,
//       messages: [{ role: "user", content: prompt }],
//     });

//     const raw = message.content[0].text.trim().replace(/```json|```/g, "").trim();
//     const parsed = JSON.parse(raw);
//     res.json(parsed);
//   } catch (err) {
//     console.error("AI recommend tasks error:", err.message);
//     res.status(500).json({ error: "AI recommendation failed" });
//   }
// });

// app.listen(5000, () => console.log("Server running on port 5000"));


const express  = require("express");
const mongoose = require("mongoose");
const cors     = require("cors");
const bcrypt   = require("bcryptjs");
const multer   = require("multer");
const path     = require("path");
const fs       = require("fs");

const Task         = require("./models/Task");
const User         = require("./models/User");
const Message      = require("./models/Message");
const Application  = require("./models/Application");
const Review       = require("./models/Review");
const Notification = require("./models/Notification");

const app = express();
app.use(cors());
app.use(express.json());

// Serve uploaded verification docs
const uploadsDir = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir);
app.use("/uploads", express.static(uploadsDir));

mongoose.connect("mongodb://127.0.0.1:27017/scribeconnect")
  .then(() => console.log("MongoDB Connected"))
  .catch((err) => console.log(err));


// ── Multer (verification docs) ────────────────────────
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadsDir),
  filename:    (req, file, cb) => cb(null, `${Date.now()}-${file.originalname}`),
});
const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB per file
  fileFilter: (req, file, cb) => {
    const allowed = [".pdf", ".jpg", ".jpeg", ".png"];
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowed.includes(ext)) cb(null, true);
    else cb(new Error("Only PDF/JPG/PNG allowed"));
  },
});

// ── Helper: create a notification ─────────────────────
const notify = async (userId, type, title, body, refId = "") => {
  try {
    await Notification.create({ userId, type, title, body, refId });
  } catch (err) {
    console.error("Notification error:", err.message);
  }
};

// ══════════════════════════════════════════════════════
//  AUTH
// ══════════════════════════════════════════════════════

app.post("/signup", async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    if (!name || !email || !password || !role)
      return res.status(400).json({ error: "All fields are required" });

    const existing = await User.findOne({ email });
    if (existing)
      return res.status(409).json({ error: "An account with this email already exists" });

    const hashed = await bcrypt.hash(password, 10);
    const user = new User({ name, email, password: hashed, role });
    await user.save();
    res.status(201).json({ message: "Signup successful" });
  } catch (err) {
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
    res.status(500).json({ error: "Login failed" });
  }
});

// ══════════════════════════════════════════════════════
//  USER / PROFILE
// ══════════════════════════════════════════════════════

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
    const { name, bio, skills, languages, gender, age, workExperience, previousWorks } = req.body;
    const updated = await User.findByIdAndUpdate(
      req.params.id,
      { name, bio, skills, languages, gender, age, workExperience, previousWorks },
      { new: true }
    ).select("-password");
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: "Profile update failed" });
  }
});

// Browse all verified/pending transcribers
app.get("/transcribers", async (req, res) => {
  try {
    const { skill, language, search } = req.query;
    const query = { role: "assistant" };
    if (skill)    query.skills    = skill;
    if (language) query.languages = language;
    if (search)   query.name      = { $regex: search, $options: "i" };

    const users = await User.find(query)
      .select("-password")
      .sort({ rating: -1, completedTasks: -1 });
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch transcribers" });
  }
});

// Upload verification docs
app.post("/users/:id/upload-docs", upload.array("docs", 5), async (req, res) => {
  try {
    const filePaths = req.files.map(f => `/uploads/${f.filename}`);
    const user = await User.findByIdAndUpdate(
      req.params.id,
      {
        $push: { verificationDocs: { $each: filePaths } },
        verificationStatus: "pending",
      },
      { new: true }
    ).select("-password");
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: "Upload failed" });
  }
});

// Admin: get all transcribers (admin only)
app.get("/admin/transcribers", async (req, res) => {
  try {
    const { adminPin } = req.query;
    if (adminPin !== "scribe2026admin") return res.status(403).json({ error: "Unauthorized" });
    const users = await User.find({ role: "assistant" }).select("-password").sort({ createdAt: -1 });
    res.json(users);
  } catch (err) { res.status(500).json({ error: "Failed" }); }
});

// Admin: verify a transcriber
app.patch("/users/:id/verify", async (req, res) => {
  try {
    const { approve, adminPin } = req.body;
    if (adminPin !== "scribe2026admin") return res.status(403).json({ error: "Unauthorized" });
    const user = await User.findByIdAndUpdate(
      req.params.id,
      {
        isVerified:         approve,
        verificationStatus: approve ? "verified" : "rejected",
      },
      { new: true }
    ).select("-password");

    await notify(
      user._id,
      "verification",
      approve ? "🎉 Verification Approved!" : "❌ Verification Declined",
      approve
        ? "Your profile has been verified. Clients can now see your verified badge!"
        : "Your verification was declined. Please re-upload clearer documents.",
    );
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: "Verification update failed" });
  }
});

// ══════════════════════════════════════════════════════
//  TASKS
// ══════════════════════════════════════════════════════

app.post("/create-task", async (req, res) => {
  try {
    const task = new Task(req.body);
    await task.save();
    res.json(task);
  } catch (err) {
    res.status(500).json({ error: "Failed to create task" });
  }
});

app.get("/tasks/client/:clientId", async (req, res) => {
  try {
    const tasks = await Task.find({ clientId: req.params.clientId })
      .populate("assignedTo", "name email bio rating isVerified verificationStatus")
      .sort({ createdAt: -1 });
    res.json(tasks);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch tasks" });
  }
});

app.get("/tasks/pending", async (req, res) => {
  try {
    const tasks = await Task.find({ status: "pending" }).sort({ createdAt: -1 });
    res.json(tasks);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch pending tasks" });
  }
});

app.get("/tasks/assistant/:assistantId", async (req, res) => {
  try {
    const tasks = await Task.find({ assignedTo: req.params.assistantId })
      .sort({ createdAt: -1 });
    res.json(tasks);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch tasks" });
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
      score += Math.min((a.completedTasks || 0) / 100, 1) * 0.1;
      if (a.isVerified) score += 0.1; // verified boost
      return { ...a._doc, score };
    });
    scored.sort((a, b) => b.score - a.score);
    res.json(scored.slice(0, 3));
  } catch (err) {
    res.status(500).json({ error: "Matching failed" });
  }
});


app.patch("/tasks/:id/complete", async (req, res) => {
  try {
    const task = await Task.findByIdAndUpdate(
      req.params.id, { status: "completed" }, { new: true }
    );
    // Increment completedTasks for the assistant
    if (task.assignedTo) {
      await User.findByIdAndUpdate(task.assignedTo, { $inc: { completedTasks: 1 } });
    }
    // Notify assistant
    if (task.assignedTo) {
      await notify(task.assignedTo, "completed", "✅ Task Marked Complete", `A task has been marked complete: "${task.description?.slice(0, 50)}"`, String(task._id));
    }
    res.json(task);
  } catch (err) {
    res.status(500).json({ error: "Failed to complete task" });
  }
});

// ══════════════════════════════════════════════════════
//  APPLICATIONS (apply / accept / decline)
// ══════════════════════════════════════════════════════

// Transcriber applies to a task
app.post("/applications", async (req, res) => {
  try {
    const { taskId, assistantId, message } = req.body;

    const task = await Task.findById(taskId);
    if (!task) return res.status(404).json({ error: "Task not found" });
    if (task.status !== "pending") return res.status(400).json({ error: "Task is no longer open" });

    const existing = await Application.findOne({ taskId, assistantId });
    if (existing) return res.status(409).json({ error: "You already applied to this task" });

    const app_ = new Application({ taskId, assistantId, clientId: task.clientId, message });
    await app_.save();

    const assistant = await User.findById(assistantId).select("name");
    await notify(
      task.clientId,
      "application",
      "🙋 New Application Received",
      `${assistant?.name} applied to your task: "${task.description?.slice(0, 50)}"`,
      String(taskId)
    );

    res.status(201).json(app_);
  } catch (err) {
    if (err.code === 11000) return res.status(409).json({ error: "Already applied" });
    res.status(500).json({ error: "Application failed" });
  }
});

// Get all applications for a task (for client)
app.get("/applications/task/:taskId", async (req, res) => {
  try {
    const apps = await Application.find({ taskId: req.params.taskId })
      .populate("assistantId", "name email bio rating skills languages isVerified verificationStatus workExperience age gender reviewCount")
      .sort({ createdAt: -1 });
    res.json(apps);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch applications" });
  }
});

// Get all applications by an assistant
app.get("/applications/assistant/:assistantId", async (req, res) => {
  try {
    const apps = await Application.find({ assistantId: req.params.assistantId })
      .populate("taskId")
      .sort({ createdAt: -1 });
    res.json(apps);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch applications" });
  }
});

// Client accepts an application
app.patch("/applications/:id/accept", async (req, res) => {
  try {
    const application = await Application.findByIdAndUpdate(
      req.params.id, { status: "accepted" }, { new: true }
    ).populate("assistantId", "name");

    // Assign task
    await Task.findByIdAndUpdate(application.taskId, {
      assignedTo: application.assistantId._id,
      status: "assigned",
    });

    // Decline all other pending applications for this task
    await Application.updateMany(
      { taskId: application.taskId, _id: { $ne: req.params.id }, status: "pending" },
      { status: "declined" }
    );

    // Notify the accepted transcriber
    const task = await Task.findById(application.taskId);
    await notify(
      application.assistantId._id,
      "accepted",
      "🎉 Application Accepted!",
      `Your application was accepted for: "${task?.description?.slice(0, 50)}"`,
      String(application.taskId)
    );

    res.json(application);
  } catch (err) {
    res.status(500).json({ error: "Accept failed" });
  }
});

// Client declines an application
app.patch("/applications/:id/decline", async (req, res) => {
  try {
    const application = await Application.findByIdAndUpdate(
      req.params.id, { status: "declined" }, { new: true }
    ).populate("assistantId", "name");

    const task = await Task.findById(application.taskId);
    await notify(
      application.assistantId._id,
      "declined",
      "Application Not Selected",
      `Your application was not selected for: "${task?.description?.slice(0, 50)}"`,
      String(application.taskId)
    );
    res.json(application);
  } catch (err) {
    res.status(500).json({ error: "Decline failed" });
  }
});

// ══════════════════════════════════════════════════════
//  REVIEWS
// ══════════════════════════════════════════════════════

app.post("/reviews", async (req, res) => {
  try {
    const { taskId, clientId, assistantId, clientName, rating, comment } = req.body;

    const existing = await Review.findOne({ taskId, clientId });
    if (existing) return res.status(409).json({ error: "Already reviewed this task" });

    const task = await Task.findById(taskId);
    if (!task || task.status !== "completed")
      return res.status(400).json({ error: "Task must be completed before reviewing" });

    const review = new Review({ taskId, clientId, assistantId, clientName, rating, comment });
    await review.save();

    // Recalculate assistant's average rating
    const allReviews = await Review.find({ assistantId });
    const avg = allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length;
    await User.findByIdAndUpdate(assistantId, {
      rating:      Math.round(avg * 10) / 10,
      reviewCount: allReviews.length,
    });

    await notify(
      assistantId,
      "review",
      "⭐ New Review Received",
      `${clientName} gave you ${rating} star${rating !== 1 ? "s" : ""}: "${comment?.slice(0, 60)}"`,
      String(taskId)
    );

    res.status(201).json(review);
  } catch (err) {
    if (err.code === 11000) return res.status(409).json({ error: "Already reviewed" });
    res.status(500).json({ error: "Review failed" });
  }
});

// Get all reviews for a transcriber
app.get("/reviews/transcriber/:assistantId", async (req, res) => {
  try {
    const reviews = await Review.find({ assistantId: req.params.assistantId })
      .sort({ createdAt: -1 });
    res.json(reviews);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch reviews" });
  }
});

// ══════════════════════════════════════════════════════
//  NOTIFICATIONS
// ══════════════════════════════════════════════════════

app.get("/notifications/:userId", async (req, res) => {
  try {
    const notifications = await Notification.find({ userId: req.params.userId })
      .sort({ createdAt: -1 })
      .limit(30);
    res.json(notifications);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch notifications" });
  }
});

app.get("/notifications/unread-count/:userId", async (req, res) => {
  try {
    const count = await Notification.countDocuments({ userId: req.params.userId, read: false });
    res.json({ count });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch count" });
  }
});

app.patch("/notifications/:id/read", async (req, res) => {
  try {
    const n = await Notification.findByIdAndUpdate(req.params.id, { read: true }, { new: true });
    res.json(n);
  } catch (err) {
    res.status(500).json({ error: "Failed to mark read" });
  }
});

app.patch("/notifications/read-all/:userId", async (req, res) => {
  try {
    await Notification.updateMany({ userId: req.params.userId, read: false }, { read: true });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: "Failed to mark all read" });
  }
});

// ══════════════════════════════════════════════════════
//  MESSAGES (chat)
// ══════════════════════════════════════════════════════

app.post("/messages", async (req, res) => {
  try {
    const { taskId, senderId, senderName, senderRole, text, recipientId } = req.body;
    if (!taskId || !senderId || !text)
      return res.status(400).json({ error: "Missing required fields" });

    const msg = new Message({ taskId, senderId, senderName, senderRole, text });
    await msg.save();

    // Notify the recipient
    if (recipientId) {
      await notify(
        recipientId,
        "message",
        `💬 New message from ${senderName}`,
        text.slice(0, 80),
        String(taskId)
      );
    }

    res.json(msg);
  } catch (err) {
    res.status(500).json({ error: "Failed to send message" });
  }
});

app.get("/messages/:taskId", async (req, res) => {
  try {
    const messages = await Message.find({ taskId: req.params.taskId }).sort({ createdAt: 1 });
    res.json(messages);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch messages" });
  }
});



// ══════════════════════════════════════════════════════
//  FILE ATTACHMENTS
// ══════════════════════════════════════════════════════

// Multer config for task files (audio, video, docs, transcripts)
const taskFileStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = path.join(__dirname, "task-files");
    if (!fs.existsSync(dir)) fs.mkdirSync(dir);
    cb(null, dir);
  },
  filename: (req, file, cb) => cb(null, `${Date.now()}-${file.originalname}`),
});
const taskUpload = multer({
  storage: taskFileStorage,
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB
  fileFilter: (req, file, cb) => {
    const allowed = [
      ".mp3", ".mp4", ".wav", ".m4a", ".ogg", ".webm",  // audio/video
      ".pdf", ".doc", ".docx", ".txt",                    // docs
      ".jpg", ".jpeg", ".png",                            // images
    ];
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowed.includes(ext)) cb(null, true);
    else cb(new Error("File type not allowed"));
  },
});
app.use("/task-files", express.static(path.join(__dirname, "task-files")));

// Client uploads input files to a task (audio/video/docs to be transcribed)
app.post("/tasks/:id/upload-input", taskUpload.array("files", 10), async (req, res) => {
  try {
    const files = req.files.map(f => ({
      filename:  f.originalname,
      path:      `/task-files/${f.filename}`,
      mimetype:  f.mimetype,
    }));
    const task = await Task.findByIdAndUpdate(
      req.params.id,
      { $push: { inputFiles: { $each: files } } },
      { new: true }
    );
    res.json(task);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Upload failed" });
  }
});

// Transcriber uploads output files (completed transcript)
app.post("/tasks/:id/upload-output", taskUpload.array("files", 5), async (req, res) => {
  try {
    const files = req.files.map(f => ({
      filename:  f.originalname,
      path:      `/task-files/${f.filename}`,
      mimetype:  f.mimetype,
    }));
    const task = await Task.findByIdAndUpdate(
      req.params.id,
      { $push: { outputFiles: { $each: files } } },
      { new: true }
    );

    // Notify client that files were delivered
    await notify(
      task.clientId,
      "completed",
      "📄 Transcript Delivered!",
      `Your transcriber has uploaded the completed files for: "${task.description?.slice(0, 50)}"`,
      String(task._id)
    );

    res.json(task);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Upload failed" });
  }
});

// Delete a file from a task
app.delete("/tasks/:id/files", async (req, res) => {
  try {
    const { filePath, fileType } = req.body; // fileType: "input" | "output"
    const field = fileType === "output" ? "outputFiles" : "inputFiles";

    await Task.findByIdAndUpdate(req.params.id, {
      $pull: { [field]: { path: filePath } }
    });

    // Delete physical file
    const absPath = path.join(__dirname, filePath.replace("/task-files/", "task-files/"));
    if (fs.existsSync(absPath)) fs.unlinkSync(absPath);

    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: "Delete failed" });
  }
});


app.listen(5000, () => console.log("Server running on port 5000"));