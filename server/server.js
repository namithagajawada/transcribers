const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const Task = require("./models/Task");
const User = require("./models/User");

const app = express();
app.use(cors());
app.use(express.json());

mongoose.connect("mongodb://127.0.0.1:27017/scribeconnect")
  .then(() => console.log("MongoDB Connected"))
  .catch((err) => console.log(err));

// CREATE TASK
app.post("/create-task", async (req, res) => {
  const task = new Task(req.body);
  await task.save();
  res.json(task);
});

// SMART MATCHING
app.post("/match", async (req, res) => {
  const { language, type } = req.body;

  const assistants = await User.find({ role: "assistant" });

  const scored = assistants.map((a) => {
    let score = 0;

    if (a.languages.includes(language)) score += 0.3;
    if (a.skills.includes(type)) score += 0.3;

    score += (a.rating / 5) * 0.2;
    score += Math.min(a.completedTasks / 100, 1) * 0.2;

    return { ...a._doc, score };
  });

  scored.sort((a, b) => b.score - a.score);

  res.json(scored.slice(0, 3));
});
app.post("/assign-task", async (req, res) => {
  const { taskId, assistantId } = req.body;

  try {
    const updatedTask = await Task.findByIdAndUpdate(
      taskId,
      {
        assignedTo: assistantId,
        status: "assigned",
      },
      { new: true }
    );

    res.json(updatedTask);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Assignment failed" });
  }
});
app.get("/tasks", async (req, res) => {
  try {
    const tasks = await Task.find().populate("assignedTo");
    res.json(tasks);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to fetch tasks" });
  }
});

app.listen(5000, () => console.log("Server running on port 5000"));

