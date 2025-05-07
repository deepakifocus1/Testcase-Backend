const express = require("express");
const { isAuthenticated } = require("../middleware/authMiddleware");
const { getAllUsers, updateUser } = require("../controllers/userController");

const router = express.Router();

router.get("/", getAllUsers);
router.put("/:userId", updateUser);

module.exports = router;
