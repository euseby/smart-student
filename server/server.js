const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
require("dotenv").config();

const app = express();

const allowedOrigins = [
  'http://localhost:5173',
  'https://smart-student-qpse5p64w-eusebys-projects.vercel.app',
  'https://smart-student.vercel.app'
];

app.use(cors({
  origin: function(origin, callback) {
    if (!origin || allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));

app.use(express.json());

// Routes
const authRoutes = require("./routes/auth");
const taskRoutes = require("./routes/tasks"); 
const transactionRoutes = require("./routes/transactionRoutes");

app.use("/auth", authRoutes);
app.use("/tasks", taskRoutes); 
app.use("/transactions", transactionRoutes);

// Conectare la MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("✅ Connected to MongoDB"))
  .catch(err => console.log("❌ MongoDB error:", err));

app.get("/", (req, res) => {
  res.send("Smart Student API - Server is running 🚀");
});

// Pornire server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running at http://localhost:${PORT}`));

