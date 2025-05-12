const express = require("express");
const router = express.Router();
const {
  createTestCase,
  getTestCases,
  getTestCaseById,
  updateTestCase,
  deleteTestCase,
  downloadTestCasesExcel,
} = require("../controllers/testCaseController");
const upload = require("../middleware/multer");
const { uploadTestCases } = require("../controllers/uploadController");
const { isAuthenticated } = require("../middleware/authMiddleware");

// Routes
router.post("/", isAuthenticated, createTestCase); // Create
router.post("/upload", upload.single("file"), uploadTestCases);
router.get("/download", downloadTestCasesExcel);
router.get("/", getTestCases); // Get all or by module
router.get("/:id", getTestCaseById); // Get by ID
router.put("/:id", isAuthenticated, updateTestCase); // Update
router.delete("/:id", deleteTestCase); // Delete

module.exports = router;
