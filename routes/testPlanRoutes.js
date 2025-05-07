const express = require("express");
const router = express.Router();
const {
  createTestPlan,
  getTestPlans,
  getTestPlan,
} = require("../controllers/testPlanController");

// Routes for test plans
router.route("/").post(createTestPlan).get(getTestPlans);

router.route("/:id").get(getTestPlan);

module.exports = router;
