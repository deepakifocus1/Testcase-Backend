// backend/server.js
const express = require("express");
const testCaseRoutes = require("./routes/testCaseRoutes");
const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");
const projectRoutes = require("./routes/projectRoutes");
const testPlanRoutes = require("./routes/testPlanRoutes");
const { globalErrorHandler } = require("./middleware/errorHandler");
const testRunRoutes = require("./routes/testRunRoutes");
const mongoose = require("mongoose");
const cors = require("cors");

require("dotenv").config();

const app = express();
const PORT = 5000;

// Middlewares
app.use(cors());
app.use(express.json());

// Routes
app.use("/api/projects", projectRoutes);
app.use("/api/testcases", testCaseRoutes);
app.use("/api/test-runs", testRunRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/test-plan", testPlanRoutes);

app.use(globalErrorHandler);
// MongoDB connection
mongoose
  .connect(process.env.MONGO_URI, {})
  .then(() => {
    console.log("MongoDB connected");
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  })
  .catch((err) => console.error("DB connection error:", err));
