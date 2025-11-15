const mongoose = require("mongoose");

// Definim structura unui Task
const taskSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true  // task-ul trebuie să aibă titlu
  },
  dueDate: {
    type: Date,
    required: true  // fiecare task trebuie să aibă deadline
  },
  category: {
    type: String,
    enum: ["study", "exam", "project", "personal", "other"], // optional
    default: "other"
  },
  completed: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Exportăm modelul pentru a-l folosi în rute
module.exports = mongoose.model("Task", taskSchema);
