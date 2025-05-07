const express = require("express");
const {
  isAuthenticated,
  isAuthorized,
} = require("../middleware/authMiddleware");
const { getAllUsers } = require("../controllers/userController");

const router = express.Router();

router.get("/", isAuthenticated, getAllUsers);

module.exports = router;
