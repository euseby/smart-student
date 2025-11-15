const express = require("express");
const router = express.Router();
const Task = require("../models/Task");

// ============================
// GET - toate task-urile
// ============================
router.get("/", async (req, res) => {
  try {
    const tasks = await Task.find().sort({ createdAt: -1 }); 
    res.json(tasks);
  } catch (err) {
    res.status(500).json({ error: "Eroare la aducerea task-urilor" });
  }
});

// ============================
// POST - adaugă un task nou
// ============================
router.post("/", async (req, res) => {
  try {
    const newTask = new Task(req.body);
    const saved = await newTask.save();
    res.json(saved);
  } catch (err) {
    res.status(400).json({ error: "Eroare la crearea task-ului" });
  }
});

// ============================
// PUT - actualizare task
// ============================
router.put("/:id", async (req, res) => {
  try {
    const updated = await Task.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true } // returnează task-ul actualizat
    );
    res.json(updated);
  } catch (err) {
    res.status(400).json({ error: "Eroare la actualizare" });
  }
});

// ============================
// DELETE - ștergere task
// ============================
router.delete("/:id", async (req, res) => {
  try {
    await Task.findByIdAndDelete(req.params.id);
    res.json({ message: "Task șters" });
  } catch (err) {
    res.status(400).json({ error: "Eroare la ștergere" });
  }
});

module.exports = router;