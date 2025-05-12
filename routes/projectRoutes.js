const express = require("express");
const router = express.Router();
const {
  createProject,
  getProjects,
  getProjectById,
  updateProject,
  deleteProject,
  addTestCaseToProject,
} = require("../controllers/projectController");
const { isAuthenticated } = require("../middleware/authMiddleware");

// Routes
router.post("/", isAuthenticated, createProject); // Create
router.get("/", getProjects); // Get all
router.get("/:id", getProjectById); // Get by ID
router.put("/:id", isAuthenticated, updateProject); // Update
router.delete("/:id", deleteProject); // Delete
router.post("/:id/test-cases", addTestCaseToProject); // Add test case to project

module.exports = router;
