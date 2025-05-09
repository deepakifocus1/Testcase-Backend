const express = require("express");
const router = express.Router();
const {
  createTestRun,
  getTestRuns,
  getTestRunById,
  updateTestRun,
  deleteTestRun,
} = require("../controllers/testRunController");
const { isAuthenticated } = require("../middleware/authMiddleware");

router.post("/", isAuthenticated, createTestRun);
router.get("/", getTestRuns);
router.get("/:id", getTestRunById);
router.put("/:id", updateTestRun);
router.delete("/:id", deleteTestRun);

module.exports = router;
