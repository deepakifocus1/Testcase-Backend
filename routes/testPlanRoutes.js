const express = require("express");
const router = express.Router();
const { isAuthenticated } = require("../middleware/authMiddleware");
const {
  createTestPlan,
  getTestPlans,
  getTestPlan,
  updateTestPlanModuleStatus,
  getTestPlanRun,
  getTestCaseById,
} = require("../controllers/testPlanController");

// Routes for test plans
router.route("/").post(isAuthenticated, createTestPlan).get(getTestPlans);

router.get("/testPlanRun/:id", getTestPlanRun);
router.route("/:id").get(getTestPlan);
router.put(
  "/:testPlanId/:testRunId/:moduleId",
  isAuthenticated,
  updateTestPlanModuleStatus
);
router.get("/:testPlanId/:testRunId/:moduleId", getTestCaseById);
module.exports = router;
