const express = require("express");
const { isAuthenticated } = require("../middleware/authMiddleware");
const { getAllUsers, updateUser } = require("../controllers/userController");

const router = express.Router();

router.get("/", isAuthenticated, getAllUsers);
router.put("/:userId", isAuthenticated, updateUser);

module.exports = router;
