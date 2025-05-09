const express = require("express");
const { getAllRecentActivities } = require("../controllers/recentActivity");
const router = express.Router();

router.get("/", getAllRecentActivities);
module.exports = router;
