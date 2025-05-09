const express = require("express");
const router = express.Router();
const { isAuthenticated } = require("../middleware/authMiddleware");
const {
  createTestPlan,
  getTestPlans,
  getTestPlan,
  updateTestPlanModuleStatus,
} = require("../controllers/testPlanController");

// Routes for test plans
router.route("/").post(isAuthenticated, createTestPlan).get(getTestPlans);

router.route("/:id").get(getTestPlan);
router.put("/:testPlanId/:testRunId/:moduleId", updateTestPlanModuleStatus);
module.exports = router;
